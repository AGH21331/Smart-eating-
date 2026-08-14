# SmartMeal PRO v24.2.0

Production-oriented PWA for nutrition, recipes, meal planning and optional Gemini AI analysis.

## Included

- 100 curated recipe records.
- Arabic, French and English recipe names, ingredients and preparation steps.
- Ingredient/step consistency pass: every listed ingredient is referenced by the recipe's preparation flow.
- 62 vegetarian recipes with a working vegetarian filter.
- Search across all three recipe languages.
- Recipe details: ingredients, quantities, nutrition, preparation steps, favorites, history and shopping list.
- Arabic RTL / French & English LTR switching.
- Dark / light theme switching.
- No voice / speech-recognition feature.
- AI meal analysis and weekly planner through Vercel Serverless Functions.
- Backend validation, request size limits, rate limiting, timeouts, retry handling, security headers and structured JSON responses.
- Frontend split into `index.html`, `style.css`, `app.js` and `recipes.json` for maintainability.

## Vercel environment variable

Required for AI:

`GEMINI_API_KEY`

Optional:

`GEMINI_MODEL` (defaults to `gemini-3.6-flash`)

The Gemini API key belongs in **Vercel Project Settings → Environment Variables**. Do not put it in the frontend or commit it to GitHub.

## API

- `GET /api/health`
- `POST /api/ai`
- `POST /api/coach`

`/api/health` reports whether the Gemini key is configured. It does not expose the key.

## Local audit

```bash
npm run audit
```

The audit checks the recipe count, multilingual fields, preparation completeness, vegetarian data, absence of old voice code, and the separated frontend structure.
