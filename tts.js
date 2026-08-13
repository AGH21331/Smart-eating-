const { TTS_MODEL, json, body, callGemini } = require('../lib/gemini');
module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return json(res, 405, { error: 'POST required' });
    const b = await body(req);
    const text = String(b.text || '').trim().slice(0, 2500);
    if (!text) return json(res, 400, { error: 'Missing text.' });
    const language = b.language === 'fr' ? 'French' : b.language === 'en' ? 'English' : 'Arabic';
    const x = await callGemini({
      model: TTS_MODEL,
      input: `Synthesize natural, clear ${language} speech. Speak only this transcript:\n${text}`,
      response_format: { type: 'audio', mime_type: 'audio/wav', delivery: 'inline', sample_rate: 24000 },
      generation_config: { speech_config: [{ voice: 'Kore' }] },
      store: false
    });
    const data = x?.output_audio?.data;
    if (!data) throw Object.assign(new Error('No audio was returned by Gemini.'), { status: 502, code: 'NO_AUDIO' });
    return json(res, 200, { audioBase64: data, mimeType: 'audio/wav', model: TTS_MODEL });
  } catch (e) { return json(res, e.status || 500, { error: e.message || 'Server error', code: e.code || 'SERVER_ERROR' }); }
};
