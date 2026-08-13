# Smart Meal — Final v13

Professional PWA build focused on reliability:

- Arabic / English / French UI with synchronized RTL/LTR direction.
- AI food analysis through the Vercel server endpoint.
- Native Android speech recognition first, with server transcription fallback.
- Camera and gallery image input.
- Recipe search and local filtering.
- System diagnostics for browser, microphone, internet and AI backend.
- Service-worker update strategy that does not keep an old HTML UI cached forever.

## Vercel setup — required for real AI

1. Deploy this folder to Vercel.
2. In **Project → Settings → Environment Variables**, create:
   - `GEMINI_API_KEY` = your Google AI Studio API key
3. Optional: `GEMINI_MODEL` = `gemini-3.6-flash`
4. Redeploy after saving the variable.
5. Open the app → **More / Paramètres / Settings → System status** → **Run system check**.
6. The AI backend must show `✓ — configured`.

The Gemini key is server-side only. It is not placed in `index.html`.

## Important after deployment

If the phone previously opened an older Smart Meal version, reload once after the new deployment. v13 uses a versioned service worker and network-first HTML strategy so future UI updates are not silently hidden by an old cached `index.html`.
