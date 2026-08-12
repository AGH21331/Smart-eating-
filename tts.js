const MODEL = process.env.GEMINI_TTS_MODEL || 'gemini-3.1-flash-tts-preview';

function pcmToWavDataUri(b64) {
  const pcm = Buffer.from(b64, 'base64');
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(24000, 24); h.writeUInt32LE(48000, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  return 'data:audio/wav;base64,' + Buffer.concat([h, pcm]).toString('base64');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.status(503).json({ error: 'AI is not configured on the server yet' });
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const text = String(body.text || '').trim().slice(0, 2500);
    if (!text) return res.status(400).json({ error: 'Text required' });
    const language = body.language === 'fr' ? 'French' : body.language === 'en' ? 'English' : 'Arabic';

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        model: MODEL,
        input: `Read this nutrition text naturally in ${language}. Warm, clear, concise coach voice. Read only the supplied text:\n${text}`,
        response_format: { type: 'audio' },
        generation_config: { speech_config: [{ voice: 'Kore' }] }
      })
    });
    const data = await response.json();
    if (!response.ok) return res.status(502).json({ error: data?.error?.message || 'TTS failed' });
    const audioBlock = (data?.output || []).find(x => x?.type === 'audio');
    const b64 = audioBlock?.data || audioBlock?.audio?.data || data?.output_audio?.data;
    if (!b64) return res.status(502).json({ error: 'No audio returned by Gemini' });
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ audio: pcmToWavDataUri(b64) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e?.message || 'TTS server error' });
  }
}
