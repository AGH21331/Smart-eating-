# Smart Meal PRO — final build

A production-oriented PWA with:
- 100 curated, recognizable recipes
- ingredient quantities matched to each recipe method
- Arabic / English / French UI
- recipe search + category filters
- favorites, history, shopping list and export
- AI meal analysis through `/api/ai`
- weekly planner through `/api/coach`
- backend health check through `/api/health`
- no voice feature / no microphone dependency

## Vercel
1. Import this project into Vercel.
2. Add `GEMINI_API_KEY` in Project Settings → Environment Variables.
3. Optional: `GEMINI_MODEL=gemini-3.6-flash`.
4. Redeploy after changing environment variables.

The API key must stay server-side in Vercel. Never put it in `index.html` or client-side JavaScript.

## Important
Nutrition values in the recipe library are estimates, not medical advice.
