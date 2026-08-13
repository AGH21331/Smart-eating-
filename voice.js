const { MODEL, json, body, callGemini, outputText, dataUrl } = require('../lib/gemini');
module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return json(res, 405, { error: 'POST required' });
    const b = await body(req);
    const a = dataUrl(b.audio);
    if (!a) return json(res, 400, { error: 'Missing audio.' });
    const supported = ['audio/wav','audio/mp3','audio/mpeg','audio/aac','audio/ogg','audio/flac','audio/aiff'];
    if (!supported.includes(a.mime)) return json(res, 400, { error: 'Unsupported audio format. Please use WAV, MP3, AAC, OGG, FLAC or AIFF.' });
    const x = await callGemini({
      model: MODEL,
      input: [
        { type: 'text', text: `Transcribe this recording exactly as spoken. Language: ${b.language || 'ar'}. Return only the transcript, with no commentary.` },
        { type: 'audio', data: a.data, mime_type: a.mime }
      ],
      store: false
    });
    return json(res, 200, { text: outputText(x), model: MODEL });
  } catch (e) { return json(res, e.status || 500, { error: e.message || 'Server error', code: e.code || 'SERVER_ERROR' }); }
};
