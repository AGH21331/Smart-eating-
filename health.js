const { MODEL, TTS_MODEL, json } = require('../lib/gemini');
module.exports = async (req, res) => json(res, 200, {
  ok: true,
  version: '18.0.0',
  aiConfigured: Boolean(process.env.GEMINI_API_KEY),
  model: MODEL,
  ttsModel: TTS_MODEL,
  timestamp: new Date().toISOString()
});
