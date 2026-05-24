# Bittada — One application for Uzbekistan's private universities

> **Build with AI EdTech Hackathon** · New Uzbekistan University · May 23–24
> **Track:** General Education

Bittada is a Common-App–style portal that lets a student in Uzbekistan build **one profile**, then discover and apply to **multiple private universities from a single place** — instead of filling out a separate form, uploading the same documents, and tracking deadlines for every university individually.

It adds an **AI university-recommendation assistant** (Google Gemini) that reads the student's profile, asks a few adaptive questions, and ranks the universities by fit with a short explanation for each.

**Live demo:** https://178-105-158-123.sslip.io
**Telegram Mini App / bot:** [@b1ttadabot](https://t.me/b1ttadabot)

The whole UI is in **Uzbek**, because the users are Uzbek high-school graduates and their parents.

---

## The EdTech problem

Applying to private universities in Uzbekistan today means:

- repeating the same personal data, test scores (IELTS / SAT / DTM / Milliy sertifikat), and document uploads on every university's separate system;
- not knowing **which** universities actually fit your scores, budget, language, and field of interest;
- losing track of deadlines and application status across institutions.

Bittada fixes this with: one shared profile and document vault, a unified browse-and-apply flow, an admin inbox for each university, and an AI assistant that turns a student's profile into a ranked shortlist.

---

## Key features

- **One student profile + document vault** — personal info, test scores, and file uploads (passport/ID, diploma, photos) entered once and reused for every application.
- **Browse & apply** — students browse universities, view majors, tuition, language, and entrance-exam requirements, then batch-submit applications.
- **AI recommendation assistant** (`/tavsiya`) — generates personalized multiple-choice questions from the profile, then ranks universities 0–100 by fit with a one-line reason and best-matched major. **(AI feature — disclosed below.)**
- **University admin console** — each university edits its page, manages entrance-exam slots, and reviews an application inbox with accept/reject and an Excel (`.xlsx`) export.
- **Super-admin** — bootstraps university-admin accounts.
- **Parent accounts** — parents link to a child via a claim code and can act on the child's behalf.
- **Telegram Mini App + bot** — students can use the core flows and receive notifications inside Telegram.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19 |
| Language | TypeScript |
| Database | PostgreSQL 16 + Prisma ORM |
| Styling | Tailwind CSS v4 |
| Auth | Opaque session token in an HTTP-only cookie, stored in the `Session` table |
| AI | Google **Gemini 2.0 Flash** via REST (no SDK) |
| Excel export | `exceljs` |
| Deploy | Docker Compose (app + Postgres + Caddy for automatic HTTPS) |

---

## Quick start (local)

**Prerequisites:** Node.js 20+, Docker (for Postgres), and a free [Gemini API key](https://aistudio.google.com/apikey) if you want the AI feature.

```bash
# 1. Install dependencies
npm install

# 2. Start Postgres (Docker)
npm run db:up

# 3. Configure environment
cp .env.example .env
# edit .env — at minimum set GEMINI_API_KEY to enable AI recommendations

# 4. Create the schema + seed universities and the super-admin
npm run db:migrate    # first run: name the migration "init"
npm run db:seed

# 5. Run the app
npm run dev
```

Open **http://localhost:3000**.

### Run with Docker (production-style)

```bash
cp .env.example .env   # fill in real values (see table below)
docker compose -f docker-compose.prod.yml up -d --build
```

This brings up the app, Postgres, and Caddy (which provisions a Let's Encrypt certificate for `SITE_ADDRESS`).

---

## Environment variables

All configuration is via `.env`. **No real secrets are committed** — `.env.example` ships with empty placeholders. Copy it and fill in your own values.

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string. |
| `UPLOADS_DIR` | yes | Where uploaded files are stored on disk (default `./uploads`). |
| `SESSION_COOKIE_NAME` | no | Name of the session cookie (default `bittada_session`). |
| `SUPER_ADMIN_EMAIL` | yes | Bootstrap super-admin email (read by the seed script). |
| `SUPER_ADMIN_PASSWORD` | yes | Bootstrap super-admin password — **change before deploying**. |
| `SUPER_ADMIN_NAME` | no | Display name for the bootstrap super-admin. |
| `GEMINI_API_KEY` | yes, for AI | Google Gemini API key. Free key at https://aistudio.google.com/apikey |
| `GEMINI_MODEL` | no | Override the model (default `gemini-2.0-flash`). |
| `TELEGRAM_BOT_TOKEN` | for Telegram | Bot token from @BotFather. |
| `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | for Telegram | Public bot username (no `@`), used for share links. |
| `TELEGRAM_WEBAPP_URL` | for Telegram | Public HTTPS URL of the Mini App (e.g. `https://yourdomain/tg`). |
| `TELEGRAM_WEBHOOK_SECRET` | for Telegram | Random string verified on the webhook. |
| `CRON_SECRET` | no | Guards the deadline-reminder cron endpoint. |
| `SITE_ADDRESS` | Docker only | Public hostname Caddy serves + gets HTTPS for. |

> Do not commit a filled-in `.env`. Keep API keys and secrets out of the repository.

---

## Demo access & sample data

`npm run db:seed` creates a working super-admin and seeds the catalog of universities (with majors, tuition, and requirements), so the app is usable immediately.

**Default super-admin** (change in `.env` before any real deployment):

- URL: `/admin/kirish`
- Email: `admin@bittada.uz`
- Password: `changeme123`

From `/admin/super`, the super-admin creates university-admin accounts. Students self-register at `/royxat`. To try the AI assistant, sign in as a student, fill in the profile, then open **`/tavsiya`**.

---

## AI disclosure (Responsible AI)

Per the hackathon rules, here is exactly what AI is used and how.

**Model & provider**
- **Google Gemini 2.0 Flash** (free tier), called over the public REST endpoint `generativelanguage.googleapis.com` — **no SDK**, just `fetch`. See [`lib/gemini.ts`](lib/gemini.ts).
- Responses are forced to JSON using Gemini's `responseSchema` / structured-output mode for reliable parsing. Temperature `0.4`.

**Where it's used**
- `POST /api/recommendations/questions` → `generateQuestions()` — produces up to 6 Uzbek-language multiple-choice questions tailored to the student's profile.
- `POST /api/recommendations/rank` → `rankUniversities()` — ranks the seeded universities 0–100 with a short reason and matched major.
- UI: [`app/tavsiya/page.tsx`](app/tavsiya/page.tsx).

**What data is sent to the model**
- A short, derived **summary** of the signed-in student's own profile (school, country, citizenship, graduation year, a digest of test scores, grant intent) plus their multiple-choice answers, and the **public** university catalog (name, city, tuition range, language, requirements, majors).
- No documents, file uploads, passwords, emails, or other users' data are ever sent to the model.

**Prompts** are inlined and readable in [`lib/gemini.ts`](lib/gemini.ts) (the `generateQuestions` and `rankUniversities` functions) — nothing hidden.

**Limitations**
- Recommendations are guidance, not admissions decisions; fit scores are model estimates.
- The model is constrained to the seeded university list — server-side code filters out any university ID the model invents before returning results.

**Fallback behavior**
- If `GEMINI_API_KEY` is missing, or the API errors, times out, or returns non-JSON, the API throws a clear Uzbek-language error and the rest of the app (browse, apply, admin, Telegram) keeps working — the AI assistant is an add-on, not a hard dependency.
- Returned rankings are validated against real university IDs, so a malformed AI response can never surface a non-existent university.

---

## App map

| Path | Who | What |
|---|---|---|
| `/` | public | Landing |
| `/royxat`, `/kirish` | public | Student sign up / sign in |
| `/dashboard` | student | Browse universities |
| `/universitetlar/[slug]` | student | University detail + apply flow |
| `/tavsiya` | student | **AI university recommendations** |
| `/profil` | student | Profile with file uploads |
| `/arizalar` | student | My applications + batch submit |
| `/imtihonlar` | student | Registered entrance exams |
| `/ota-ona` | parent | Linked children + act on their behalf |
| `/tg`, `/tg/*` | student | Telegram Mini App |
| `/admin/kirish` | admin | Admin login |
| `/admin/universitet` | uni admin | Edit own university page |
| `/admin/imtihonlar` | uni admin | CRUD entrance-exam slots |
| `/admin/arizalar` | uni admin | Inbox + Excel export + accept/reject |
| `/admin/super` | super admin | Create university admins |

### Architecture notes

- **Auth** — opaque session token in an HTTP-only cookie, looked up against the `Session` table. See [`lib/session.ts`](lib/session.ts).
- **Roles** — `STUDENT`, `PARENT`, `UNIVERSITY_ADMIN`, `SUPER_ADMIN`, enforced with `requireRole(...)`.
- **Files** — saved to `UPLOADS_DIR`, served via `/api/files/[name]` behind auth. See [`lib/upload.ts`](lib/upload.ts).
- **Excel export** — `/api/admin/applications/export` streams a `.xlsx` via `exceljs`.

---

## Build & run evidence

```bash
npm run build   # prisma generate && next build  (TypeScript-checked production build)
npm start       # serve the production build on :3000
```

The project is deployed and running in production via [`docker-compose.prod.yml`](docker-compose.prod.yml) (app + Postgres + Caddy/HTTPS) at the live demo URL above.

---

## External assets & libraries (disclosed)

- **Google Gemini API** — AI recommendation feature (see AI disclosure above).
- **Telegram Bot API / Mini Apps** — `@b1ttadabot` integration.
- Open-source libraries: Next.js, React, Prisma, Tailwind CSS, `exceljs`, `bcryptjs`, `jszip` (see [`package.json`](package.json)).
- Fonts: Playfair Display, Inter, JetBrains Mono (Google Fonts).
- University names, logos, and campus photos are used to represent real institutions for this demo.

## Project docs

- [PLAN.md](PLAN.md) — product spec
- [PROGRESS.md](PROGRESS.md) — what's built, conventions
- [DESIGN.md](DESIGN.md) — design tokens
