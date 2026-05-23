# Bittada — Progress & Handoff

Last updated: 2026-05-19
Repo: https://github.com/ha-wq/bittada

A Common App-style portal for Uzbek private universities. All user-facing copy is in **Uzbek**.

---

## TL;DR for the next agent

- Next.js 16 (App Router) + Postgres + Prisma + Tailwind v4 + TypeScript. Builds cleanly (`npm run build` passes).
- **Real backend**: Postgres via Docker, Prisma 6 ORM, session cookies, bcrypt passwords, filesystem uploads with auth-gated download.
- **Three roles**: `STUDENT`, `UNIVERSITY_ADMIN`, `SUPER_ADMIN`. Each has its own area.
- **Two UI surfaces**: student app + admin panel under `/admin/*`.
- Read [PLAN.md](PLAN.md) (product spec) and [README.md](README.md) (setup) first.

---

## Run locally

```bash
npm install
npm run db:up      # Docker Postgres
cp .env.example .env
npm run db:migrate # name it "init"
npm run db:seed    # universities + super-admin
npm run dev
```

Super-admin login (from `.env.example`): `admin@bittada.uz` / `changeme123` at `/admin/kirish`.

---

## What's built

### Backend
- [prisma/schema.prisma](prisma/schema.prisma) — `User`, `Session`, `Profile`, `University`, `Major`, `Application`, `Exam`, `ExamRegistration`
- [prisma/seed.ts](prisma/seed.ts) — bootstraps super-admin from env + 6 sample universities
- [lib/db.ts](lib/db.ts) — Prisma client singleton
- [lib/session.ts](lib/session.ts) — `createSession`, `getCurrentUser`, `requireUser`, `requireRole`
- [lib/upload.ts](lib/upload.ts) — `saveUpload` with 2MB cap + MIME validation
- [lib/api.ts](lib/api.ts) — `handle()` wrapper that turns thrown errors into proper JSON responses
- [docker-compose.yml](docker-compose.yml) — Postgres 16

### Student APIs
| Method + Route | Purpose |
|---|---|
| `POST /api/auth/signup` | Create student account + auto-login |
| `POST /api/auth/login` | Sign in |
| `POST /api/auth/logout` | Destroy session |
| `GET  /api/me` | Current user + profile + applications |
| `GET  /api/universities` | List all unis |
| `GET  /api/universities/[slug]` | Detail + majors + exams |
| `PUT  /api/profile` | Upsert profile |
| `POST /api/uploads` | Save file → returns filename |
| `GET  /api/files/[name]` | Authed file download |
| `GET  /api/applications` | My applications |
| `POST /api/applications` | Create draft |
| `DELETE /api/applications/[id]` | Remove draft |
| `POST /api/applications/submit` | Batch submit ids → status `KORIB_CHIQILMOQDA` |
| `POST /api/exams/[id]/register` | Register for an exam, link to application |

### Admin APIs (`UNIVERSITY_ADMIN` and `SUPER_ADMIN`)
| Route | Purpose |
|---|---|
| `GET/PUT /api/admin/university` | Read/write own university |
| `GET/POST /api/admin/exams` | List + create exam slots |
| `PUT/DELETE /api/admin/exams/[id]` | Update/delete |
| `GET /api/admin/applications` | Submitted applications inbox |
| `PATCH /api/admin/applications/[id]` | Set status (accepted/rejected/under-review) |
| `GET /api/admin/applications/export` | Stream `.xlsx` |
| `GET/POST /api/admin/users` | (super only) list + create university admins |

### Student pages (Uzbek)
| Route | File |
|---|---|
| `/` | [app/page.tsx](app/page.tsx) |
| `/royxat` | [app/royxat/page.tsx](app/royxat/page.tsx) |
| `/kirish` | [app/kirish/page.tsx](app/kirish/page.tsx) |
| `/dashboard` | [app/dashboard/page.tsx](app/dashboard/page.tsx) |
| `/universitetlar/[id]` | [app/universitetlar/[id]/page.tsx](app/universitetlar/[id]/page.tsx) (the `id` param is actually a slug) |
| `/profil` | [app/profil/page.tsx](app/profil/page.tsx) |
| `/arizalar` | [app/arizalar/page.tsx](app/arizalar/page.tsx) |
| `/imtihonlar` | [app/imtihonlar/page.tsx](app/imtihonlar/page.tsx) |

### Admin pages (Uzbek)
| Route | File |
|---|---|
| `/admin/kirish` | [app/admin/kirish/page.tsx](app/admin/kirish/page.tsx) — separate login |
| `/admin/universitet` | [app/admin/universitet/page.tsx](app/admin/universitet/page.tsx) — edit own uni |
| `/admin/imtihonlar` | [app/admin/imtihonlar/page.tsx](app/admin/imtihonlar/page.tsx) — exam CRUD |
| `/admin/arizalar` | [app/admin/arizalar/page.tsx](app/admin/arizalar/page.tsx) — inbox + Excel export + accept/reject |
| `/admin/super` | [app/admin/super/page.tsx](app/admin/super/page.tsx) — create uni admins |
| `/admin/layout.tsx` | Gates the whole `/admin` tree by role |

### Client state
- [lib/auth-context.tsx](lib/auth-context.tsx) — `useAuth()` hook backed by `/api/me`. Mutations call APIs then `refresh()`. Exports `apiJson()` helper for other pages.

---

## What's NOT done

### Security
- No CSRF tokens (cookies are `sameSite: lax` which mitigates most cases, but state-changing requests over POST are not double-checked)
- No rate limiting on auth / upload endpoints
- File `GET /api/files/[name]` requires *any* signed-in user — not just the owner or the uni admin reviewing the application. Anyone authed who guesses the UUID filename can read it. Tighten by joining `Upload` to `Profile`/`Application` for proper ACL.
- No email verification for student signup
- No password reset flow
- Session tokens never rotate

### Functionality gaps
- Exam registration: there's no UI yet for the student to *pick a slot*. Student-side flow goes API → success, but no page that lists open slots. Need a `/imtihonlar/[universitySlug]` page that fetches open exams and posts to `/api/exams/[id]/register`.
- Application export: only Excel. PDF export per student profile would be useful for uni admins.
- No notification system (email/SMS) on status changes.
- No payment flow (exam price field exists but no checkout).

### Code quality
- No ESLint config (scaffold was created with `--no-eslint`).
- No tests.
- No CI.
- `entranceExamSubjects` is on `Exam` but the seed doesn't carry university-level default subjects (admin must add per exam).
- `FileUploadField` is duplicated logic-wise across pages — could move to a shared component, but currently lives only in `app/profil/page.tsx`.

### Production readiness
- No HTTPS / nginx config example. Server section in README assumes proxy is provided externally.
- No backup/restore guide for Postgres or `uploads/`.
- File uploads are local-filesystem only — won't scale beyond a single instance. Swap to S3/MinIO before scaling out.
- `SUPER_ADMIN_PASSWORD` in `.env.example` is `changeme123`. Document loudly that this must be rotated before going live.

---

## Conventions

- **Uzbek copy and Uzbek route names.** `/royxat`, `/kirish`, `/universitetlar`, `/arizalar`, `/imtihonlar`, `/profil`, `/admin/...`. Code/vars/comments stay English.
- **Design tokens only.** Use Tailwind classes like `bg-primary`, `text-ink`, `border-hairline`. Don't hardcode hex.
- **`apiJson()` is the only fetch wrapper** on the client. Always pass body as a plain object — it'll be JSON-stringified.
- **Server: throw to fail.** Inside `handle(async () => ...)`, throw `new Error("msg")` for 400s, throw `AuthError` for 401/403. The wrapper returns proper JSON.
- **Status enum is uppercase** (`KORIB_CHIQILMOQDA`) — driven by Prisma. Translate via `APPLICATION_STATUS_LABEL` in `lib/format.ts`.

---

## Files worth reading first

1. [PLAN.md](PLAN.md) — product spec
2. [README.md](README.md) — setup
3. [prisma/schema.prisma](prisma/schema.prisma) — data shapes
4. [lib/session.ts](lib/session.ts) — auth pattern
5. [lib/auth-context.tsx](lib/auth-context.tsx) — client state
6. [app/admin/universitet/page.tsx](app/admin/universitet/page.tsx) — most complex admin form
