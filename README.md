# Smart Meal — FINAL v8 PREMIUM

Upload the contents of this folder to the root of the GitHub repository.

## Vercel
- Deploy the repository as a Vercel project.
- Add `GEMINI_API_KEY` in Vercel Environment Variables for Production.
- Redeploy after adding/changing the variable.
- Do not put the API key in `index.html` or GitHub.

## Health check
Open `/api/health` on the deployed Vercel URL. It should return JSON with `backend: "ok"`.
