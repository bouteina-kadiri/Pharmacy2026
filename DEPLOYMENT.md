# Vercel + Render + Neon deployment

Status: configuration prepared locally; no cloud resources have been created.

The deployable repository is Pharmacy2026 (this directory). Its active API is
`backend/server.js`, not the separate sibling Java project.

1. Create a fresh Neon PostgreSQL database. Copy its TLS connection string into
   Render's secret `DATABASE_URL` field. Never put it in Angular or Git.
2. Push the reviewed deployment changes to the GitHub repository, then create a
   Render Blueprint using `render.yaml`. The free service runs an idempotent,
   transactional schema migration at startup (no sample or local data is copied).
   Verify `https://YOUR-API.onrender.com/api/health` returns HTTP 200.
3. Generate Vercel's config from the actual Render origin:
   `API_ORIGIN=https://YOUR-API.onrender.com npm run configure:hosting`
   Commit the generated `vercel.json`; it contains only the public API hostname.
4. Import the repository into Vercel, use Node 22, build command
   `npm run build:hosting`, and output `dist/my-angular-app/browser`.
   The configuration proxies `/api/*` to Render and serves Angular routes.
5. Test sign-up, login, refresh on `/login`, `/api/users/me`, logout, and
   `/api/health` using the Vercel URL. Cookies stay on the frontend host.

This must use an empty/demo database: `/api/clients` and the name-based
prescription endpoint currently lack record-level authorization. Do not migrate
real client, prescription, or account data to public hosting until access control
is implemented and verified. Existing local data is untouched.

Free-tier availability and limits must be checked during account setup. No paid
plan or subscription is authorized by this configuration. Render's free service
may sleep; allow time for a cold start when testing login.

References:
- https://vercel.com/docs/routing/rewrites
- https://render.com/docs/deploy-node-express-app
- https://render.com/docs/web-services
- https://neon.com/docs/connect/connection-pooling
