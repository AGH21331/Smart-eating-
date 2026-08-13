# Smart Meal PRO v18

Commercial-ready PWA baseline for deployment on Vercel.

## Vercel
- Root Directory: repository root
- Framework Preset: Other
- Build Command: empty
- Output Directory: `.`
- Add Environment Variable `GEMINI_API_KEY`
- Optional `GEMINI_MODEL=gemini-3.6-flash`
- Optional `GEMINI_TTS_MODEL=gemini-3.1-flash-tts-preview`

## API endpoints
- `/api/health`
- `/api/ai`
- `/api/voice`
- `/api/tts`

Each endpoint is a real Vercel Serverless Function under `/api`. No rewrites are required.

## Features
- Arabic / French / English with RTL/LTR switching
- Dark / Light mode persisted locally
- 24 bilingual/trilingual recipes with ingredients and cooking steps
- Search by recipe or ingredient
- Camera and gallery meal analysis
- Browser speech recognition with recording + Gemini fallback
- Gemini meal analysis with structured JSON
- Gemini TTS playback with browser speech fallback
- Local meal diary
