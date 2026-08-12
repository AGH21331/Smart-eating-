export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  return res.status(200).json({
    ok: true,
    backend: 'ok',
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    node: process.version,
    models: {
      vision: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
      voice: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
      tts: process.env.GEMINI_TTS_MODEL || 'gemini-3.1-flash-tts-preview'
    }
  });
}
