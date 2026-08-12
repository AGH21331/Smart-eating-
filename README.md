# Smart Meal — Final Premium Web App

## Required Vercel environment variable
- `GEMINI_API_KEY` (required for real AI image analysis, voice transcription, and Gemini TTS)
- Optional `GEMINI_MODEL` (defaults to `gemini-3.6-flash`)
- Optional `GEMINI_TTS_MODEL` (defaults to `gemini-3.1-flash-tts-preview`)

## Voice behavior
- Primary voice input: Web Speech API in supported browsers (works without an AI key).
- Fallback voice input: recorded audio sent to `/api/voice` when AI is configured.
- Text-to-speech: Gemini TTS when configured; browser speech fallback otherwise.
