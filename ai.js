// Smart Meal AI endpoint for Vercel
// Set GEMINI_API_KEY in Vercel Environment Variables.

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

const schema = {
  type: 'object',
  properties: {
    isFood: { type: 'boolean' },
    mealName: { type: 'string' },
    description: { type: 'string' },
    confidence: { type: 'number' },
    ingredients: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          quantity: { type: 'string' }
        },
        required: ['name', 'quantity']
      }
    },
    nutrition: {
      type: 'object',
      properties: {
        calories: { type: 'integer' },
        protein: { type: 'integer' },
        carbs: { type: 'integer' },
        fat: { type: 'integer' }
      },
      required: ['calories', 'protein', 'carbs', 'fat']
    },
    suggestions: { type: 'array', items: { type: 'string' } }
  },
  required: ['isFood', 'mealName', 'description', 'confidence', 'ingredients', 'nutrition', 'suggestions']
};

function cleanImage(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return null;
  const m = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!m) return null;
  if (m[2].length > 14_000_000) throw new Error('Image is too large');
  return { mime_type: m[1] === 'image/jpg' ? 'image/jpeg' : m[1], data: m[2] };
}

function clampInt(n, min = 0, max = 10000) {
  const v = Number.isFinite(Number(n)) ? Math.round(Number(n)) : 0;
  return Math.max(min, Math.min(max, v));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'AI is not configured on the server yet', code: 'AI_NOT_CONFIGURED' });

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const input = body?.payload && typeof body.payload === 'object' ? body.payload : body;
    const image = cleanImage(input.image);
    const lang = input.language === 'fr' ? 'French' : input.language === 'en' ? 'English' : 'Arabic';
    const text = String(input.text || '').slice(0, 3000);
    const goal = String(input.goal || 'maintain');
    const targetCalories = clampInt(input.targetCalories, 800, 10000);

    if (!image && !text) return res.status(400).json({ error: 'Provide an image or meal text' });

    const prompt = `You are the nutrition vision assistant inside Smart Meal.\n\nAnalyze the provided food image and/or user text. Respond in ${lang}.\nUser goal: ${goal}. Daily calorie target: ${targetCalories}.\n\nRules:\n- If the image is clearly not food and the user text does not describe a meal, set isFood=false and return empty ingredients with zero nutrition.\n- Identify visible foods conservatively. If portion size is uncertain, estimate a reasonable portion and lower confidence.\n- Never claim exact nutrition from an image; label the result as an estimate in description.\n- Do not diagnose disease or prescribe treatment.\n- If text describes a meal, use it as additional context but do not override obvious visual evidence.\n- Keep suggestions short and relevant to the detected foods and the user's goal.\n- Keep nutrition internally plausible.\nUser text: ${text || '(none)'}`;

    const parts = [{ text: prompt }];
    if (image) parts.push({ inline_data: image });

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`;
    const upstream = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          response_mime_type: 'application/json',
          response_schema: schema
        }
      })
    });

    const data = await upstream.json();
    if (!upstream.ok) return res.status(502).json({ error: data?.error?.message || 'Gemini request failed', code: 'GEMINI_REQUEST_FAILED' });

    const raw = data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
    if (!raw) return res.status(502).json({ error: 'Empty AI response' });

    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      return res.status(502).json({ error: 'Invalid AI JSON response' });
    }

    // Normalize numeric output for the UI.
    result.confidence = Math.max(0, Math.min(1, Number(result.confidence) || 0));
    result.nutrition = result.nutrition || {};
    for (const key of ['calories', 'protein', 'carbs', 'fat']) result.nutrition[key] = clampInt(result.nutrition[key]);
    result.ingredients = Array.isArray(result.ingredients) ? result.ingredients : [];
    result.suggestions = Array.isArray(result.suggestions) ? result.suggestions.slice(0, 5) : [];

    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
}
