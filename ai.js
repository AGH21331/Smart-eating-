const { MODEL, json, body, callGemini, outputText, dataUrl } = require('../lib/gemini');
const schema = {
  type: 'object',
  properties: {
    mealName: { type: 'string' },
    description: { type: 'string' },
    confidence: { type: 'number' },
    nutrition: {
      type: 'object',
      properties: {
        calories: { type: 'number' }, protein: { type: 'number' }, carbs: { type: 'number' }, fat: { type: 'number' }
      }, required: ['calories','protein','carbs','fat']
    },
    ingredients: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, quantity: { type: 'string' } }, required: ['name','quantity'] } },
    cookingMethod: { type: 'array', items: { type: 'string' } },
    advice: { type: 'array', items: { type: 'string' } }
  },
  required: ['mealName','description','confidence','nutrition','ingredients','cookingMethod','advice']
};
module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return json(res, 405, { error: 'POST required' });
    const b = await body(req);
    const lang = b.language || 'ar';
    const parts = [{ type: 'text', text: `You are Smart Meal PRO, a commercial nutrition assistant. Analyze the meal conservatively. Language: ${lang}. Return only JSON matching the supplied schema. If calories/macros are uncertain, estimate and lower confidence. Never claim medical diagnosis. User description: ${String(b.text || '').slice(0, 6000)}` }];
    const image = dataUrl(b.image);
    if (image) parts.push({ type: 'image', data: image.data, mime_type: image.mime });
    const x = await callGemini({
      model: MODEL,
      input: [{ type: 'text', text: parts[0].text }, ...(image ? [{ type: 'image', data: image.data, mime_type: image.mime }] : [])],
      response_format: { type: 'text', mime_type: 'application/json', schema },
      store: false
    });
    let result;
    try { result = JSON.parse(outputText(x)); } catch { throw Object.assign(new Error('AI returned invalid JSON.'), { status: 502, code: 'BAD_AI_JSON' }); }
    return json(res, 200, { ...result, model: MODEL });
  } catch (e) { return json(res, e.status || 500, { error: e.message || 'Server error', code: e.code || 'SERVER_ERROR' }); }
};
