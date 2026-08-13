# Smart Meal FINAL v16

Production-oriented PWA for Vercel.

## Environment variables
- `GEMINI_API_KEY` — required for AI image analysis and server transcription fallback.
- `GEMINI_MODEL` — optional; defaults to `gemini-3.6-flash`.

## Deploy
Deploy the repository root to Vercel. Do not set a `functions` pattern in `vercel.json`.

## Health
Open `/api/health` after deployment. It should return JSON with `ok: true`.
