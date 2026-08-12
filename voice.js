const MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

function audioPart(v) {
  if (typeof v !== 'string') return null;
  const m = v.match(/^data:(audio\/(?:wav|mp3|ogg|aac|flac|aiff));base64,(.+)$/i);
  if (!m) return null;
  if (m[2].length > 8_000_000) throw new Error('Audio too large');
  return { type: 'audio', data: m[2], mime_type: m[1].toLowerCase() };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.status(503).json({ error: 'AI is not configured on the server yet' });
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const audio = audioPart(body.audio);
    const language = body.language === 'fr' ? 'French' : body.language === 'en' ? 'English' : 'Arabic';
    if (!audio) return res.status(400).json({ error: 'Unsupported audio format. Please record again.' });

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        model: MODEL,
        input: [
          { type: 'text', text: `Transcribe the speech exactly as spoken in ${language}. Return only the transcript. Do not summarize or translate.` },
          audio
        ]
      })
    });
    const data = await response.json();
    if (!response.ok) return res.status(502).json({ error: data?.error?.message || 'Speech transcription failed' });
    const text = String(data?.output_text || '').trim();
    if (!text) return res.status(502).json({ error: 'No speech detected' });
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ text });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e?.message || 'Voice server error' });
  }
}
