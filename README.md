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

## Deployment
* Backend → Render/Railway: set `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` (your frontend URL), `DATABASE_SSL=true` if required; start command `npm start`; run `npm run seed` once.
* Frontend → Vercel/Netlify: set `VITE_API_BASE_URL` to the backend URL; build `npm run build`, output `dist`; add an SPA rewrite of all paths to `/index.html`.
