# Military Asset Management System

Tracks vehicles, weapons and ammunition across multiple bases: opening balance, net movement (purchases, transfers in/out), assignments, expenditures and closing balance, with role-based access and a full audit trail.

**Stack:** React (Vite) + Tailwind + Recharts + Lucide + Axios · Node.js/Express · PostgreSQL · JWT + bcrypt.

## Quick start
```bash
# 1. Database (PostgreSQL 14+)
createdb military_assets

# 2. Backend
cd backend
cp .env.example .env        # set DATABASE_URL and a long random JWT_SECRET
npm install
npm run seed                # creates tables + sample data + test users
npm start                   # http://localhost:4000

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env        # VITE_API_BASE_URL=http://localhost:4000
npm install
npm run dev                 # http://localhost:5173

# 4. Optional integration tests (API must be running, DB freshly seeded)
cd backend && npm test
```
Alternatively load `schema.sql` (empty schema) or `dump.sql` (schema + sample data) with `psql`.
Note: `dump.sql` contains bcrypt hashes of the **sample** passwords below; do not use it in production.

## Test accounts
| Role | Username | Password | Base |
|---|---|---|---|
| Admin | admin_user | AdminPass123! | All bases |
| Base Commander | commander_alpha | CommandPass123! | Fort Alpha (#1) |
| Base Commander | commander_bravo | CommandPass123! | Fort Bravo (#2) |
| Logistics Officer | logistics_officer | LogisticsPass123! | Base #1 / global operations |

## Key design decisions
* **Balances are derived, never stored.** `balance = purchases + transfers_in − transfers_out − assigned − expended`, so totals cannot drift from the ledger.
* **Closing balance** = opening + net movement − assigned − expended, where *opening* = everything before the start date.
* **Transfers/assignments/expenditures are atomic.** Stock is checked and the record + audit row are written in one transaction, serialised per (base, equipment) with `pg_advisory_xact_lock`, so concurrent requests cannot oversell stock (covered by an integration test).
* **RBAC is enforced on the server** (`authorizeRoles`, `enforceBaseScope`); the UI only mirrors it. Base Commanders are pinned to their own base for reads and writes.
* Deviations from the reference snippets (deliberate): the reference transfer inserted without a stock check, and its dashboard query referenced columns that do not match its schema and omitted opening/closing/assigned/expended.

## Deployment (temporary demo)

The repository includes a Render Blueprint (`render.yaml`) for the Express API and PostgreSQL database, and Vercel configuration (`frontend/vercel.json`) for the React single-page app.

**Free-tier warning:** Render's free web service can sleep when idle, and its free PostgreSQL database expires after 30 days. This setup is for a short evaluation/demo only; do not store real or sensitive asset data. The seed creates public, documented demo accounts, so do not use these credentials for production.

1. Push the repository to GitHub, then create a Vercel project from it. Set the **Root Directory** to `frontend`; use the detected Vite framework, build command `npm run build`, and output directory `dist`.
2. Deploy the frontend once to get its Vercel production URL. In Vercel **Settings → Environment Variables**, set `VITE_API_BASE_URL` to the Render API base URL after creating the API in step 3. Use the base URL only, e.g. `https://your-api.onrender.com` (no trailing slash and no `/api`).
3. In Render, create a **Blueprint** from the GitHub repository and select the `render.yaml` at the repository root. Confirm the free plans. When prompted for `CORS_ORIGIN`, enter the exact Vercel production origin, e.g. `https://your-app.vercel.app` (no path or trailing slash).
4. The Blueprint connects the API to PostgreSQL using Render's internal connection string, generates `JWT_SECRET`, and enables database TLS. On startup, the API checks for a completely empty database and loads demo data only then. It skips an already seeded database and refuses to reset a partial or existing schema. Do not run `npm run seed` again: it drops and recreates the tables.
5. Copy the deployed API's base URL from Render into Vercel's `VITE_API_BASE_URL`, save it for the Production environment, and redeploy the frontend. The backend already receives `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `DATABASE_SSL`, and `CORS_ORIGIN` through Render; do not commit real values or put backend secrets in `VITE_*` variables.
6. Verify `https://your-api.onrender.com/health` returns `{"status":"ok"}`, then open the Vercel URL and sign in with one of the sample accounts in this README.

If you change the Vercel production domain, update Render's `CORS_ORIGIN` to match it. For a production deployment, use paid persistent hosting, remove the demo seed hook, and create private accounts with unique credentials before adding real data.
