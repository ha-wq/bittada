# Bittada

Common-App style portal for Uzbek private universities. Next.js 16 + Postgres + Prisma. UI in Uzbek.

## Quick start (local)

```bash
# 1. Install
npm install

# 2. Start Postgres (needs Docker)
npm run db:up

# 3. Configure env
cp .env.example .env
# edit .env if you want to change the bootstrap super-admin

# 4. Create the schema + seed universities and the super-admin
npm run db:migrate    # first time: name the migration "init"
npm run db:seed

# 5. Run the app
npm run dev
```

Open http://localhost:3000.

The default super-admin (from `.env.example`):
- email: `admin@bittada.uz`
- password: `changeme123`

Sign in at `/admin/kirish` to create university admin accounts at `/admin/super`.

## Layout

| Path | Who | What |
|---|---|---|
| `/` | public | Landing |
| `/royxat`, `/kirish` | public | Student sign up / sign in |
| `/dashboard` | student | Browse universities |
| `/universitetlar/[slug]` | student | University detail + apply flow |
| `/profil` | student | Profile with file uploads |
| `/arizalar` | student | My applications + batch submit |
| `/imtihonlar` | student | Registered entrance exams |
| `/admin/kirish` | admin | Admin login |
| `/admin/universitet` | uni admin | Edit own university page |
| `/admin/imtihonlar` | uni admin | CRUD entrance exam slots |
| `/admin/arizalar` | uni admin | Inbox + Excel export + accept/reject |
| `/admin/super` | super admin | Create university admins |

## Server-side concepts

- **Auth**: opaque session token in HTTP-only cookie, looked up against the `Session` table. See [lib/session.ts](lib/session.ts).
- **Roles**: `STUDENT`, `UNIVERSITY_ADMIN`, `SUPER_ADMIN`. Enforce with `requireRole(...)`.
- **Files**: saved to `./uploads/` (configurable via `UPLOADS_DIR`). Served via `/api/files/[name]` which requires auth. See [lib/upload.ts](lib/upload.ts).
- **Excel export**: `/api/admin/applications/export` uses `exceljs` to stream a `.xlsx`.

## Deploying to a server

Server needs: Node 20+, Postgres 14+, file storage that survives restarts.

```bash
# On server, with Postgres reachable:
git clone <repo>
cd bittada
npm ci
cp .env.example .env  # set DATABASE_URL, secrets, super-admin creds
npm run db:deploy     # apply migrations
npm run db:seed       # one-time: bootstrap super-admin + universities
npm run build
npm start             # listens on 0.0.0.0:3000 by default; put behind nginx/caddy
```

Use a process supervisor (systemd, pm2, or docker) to keep `npm start` alive. The `uploads/` directory must be persisted (volume mount or filesystem).

## Project docs

- [PLAN.md](PLAN.md) — product spec
- [PROGRESS.md](PROGRESS.md) — what's built, what's not, conventions
- [DESIGN.md](DESIGN.md) — design tokens
