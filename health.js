// Smart Meal health endpoint. Safe to expose: never returns secrets.
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  return res.status(200).json({
    ok: true,
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    model: MODEL,
    timestamp: new Date().toISOString()
  });
}
