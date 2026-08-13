const MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
const TTS_MODEL = process.env.GEMINI_TTS_MODEL || 'gemini-3.1-flash-tts-preview';
const API = 'https://generativelanguage.googleapis.com/v1beta/interactions';

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}
async function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  let raw = '';
  for await (const chunk of req) raw += chunk;
  try { return JSON.parse(raw || '{}'); }
  catch { throw Object.assign(new Error('Invalid JSON body'), { status: 400, code: 'INVALID_JSON' }); }
}
async function callGemini(payload) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw Object.assign(new Error('GEMINI_API_KEY is not configured.'), { status: 503, code: 'AI_NOT_CONFIGURED' });
  const r = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key, 'Api-Revision': '2026-05-20' },
    body: JSON.stringify(payload)
  });
  const raw = await r.text();
  let data;
  try { data = JSON.parse(raw); } catch { data = null; }
  if (!r.ok) throw Object.assign(new Error(data?.error?.message || `Gemini HTTP ${r.status}`), { status: r.status, code: 'GEMINI_ERROR' });
  return data;
}
function outputText(x) {
  if (typeof x?.output_text === 'string') return x.output_text.trim();
  return (x?.steps || []).flatMap(s => s?.content || []).filter(c => c?.type === 'text').map(c => c.text || '').join('\n').trim();
}
function dataUrl(v) {
  const m = String(v || '').match(/^data:([^;]+);base64,(.+)$/s);
  return m ? { mime: m[1], data: m[2] } : null;
}
module.exports = { MODEL, TTS_MODEL, json, body, callGemini, outputText, dataUrl };
