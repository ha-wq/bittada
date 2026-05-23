# Bittada — Progress & Handoff

Last updated: 2026-05-19
Repo: https://github.com/ha-wq/bittada

A Common App-style portal for Uzbek private universities. All user-facing copy is in **Uzbek**.

---

## TL;DR for the next agent

- Next.js 16 (App Router) + Tailwind v4 + TypeScript scaffold is in place and builds cleanly (`npm run build` passes, all 10 routes).
- All 6 screens described in [PLAN.md](PLAN.md) are implemented as UI with **mock data** and **localStorage-only persistence**.
- There is **no backend, no real auth, no real file uploads**. Everything lives in the browser.
- Design follows [DESIGN.md](DESIGN.md) (Airbnb-inspired). Colors, radii, fonts already wired into `app/globals.css` as Tailwind v4 `@theme` tokens.
- Read [PLAN.md](PLAN.md) first — it's the product spec. This file describes what's built vs. not.

---

## Run locally

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # production build (passes today)
```

---

## What's done

### Infrastructure
- [package.json](package.json) — Next.js 16.2.6, React 19.2, Tailwind v4, TypeScript 5
- [app/globals.css](app/globals.css) — design tokens (`--color-primary` Rausch #ff385c, `--color-ink` #222, soft radii, Inter font with Cyrillic subset)
- [app/layout.tsx](app/layout.tsx) — root layout in `lang="uz"`, mounts `AuthProvider` + global `Navbar`

### Data & state
- [lib/types.ts](lib/types.ts) — `User`, `Profile`, `Application`, `University`, `Major`, `ApplicationStatus`, `PartOfDay`
- [lib/mock-universities.ts](lib/mock-universities.ts) — 6 seeded universities (Westminster, Inha, TIIAME, Ajou, MDIS, Amity) with majors, requirements, deadlines, tuition ranges. Also exports `formatSom`, `formatDate`, `PART_OF_DAY_LABEL`, `getUniversity`.
- [lib/auth-context.tsx](lib/auth-context.tsx) — `AuthProvider` + `useAuth` hook. Persists to two `localStorage` keys:
  - `bittada:user` — current logged-in user
  - `bittada:accounts` — all signups (mock "database")
  - Exports: `signUp`, `signIn`, `signOut`, `updateProfile`, `addApplication`, `updateApplication`, `removeApplication`, `isProfileComplete`

### Components
- [components/Navbar.tsx](components/Navbar.tsx) — sticky top nav. Shows nav links + account menu when signed in; shows "Kirish" / "Ro'yxatdan o'tish" when signed out.
- [components/ui.tsx](components/ui.tsx) — `Button` (primary/secondary/tertiary/danger), `Input`, `Select`, `Textarea`, `Badge`, `Card`
- [components/UniversityCard.tsx](components/UniversityCard.tsx) — grid card used on dashboard

### Pages (all Uzbek)
| Route | File | What it does |
|---|---|---|
| `/` | [app/page.tsx](app/page.tsx) | Landing — redirects to `/dashboard` if signed in |
| `/royxat` | [app/royxat/page.tsx](app/royxat/page.tsx) | Sign up (full name, DOB, email, password) |
| `/kirish` | [app/kirish/page.tsx](app/kirish/page.tsx) | Sign in |
| `/dashboard` | [app/dashboard/page.tsx](app/dashboard/page.tsx) | University browser with search + filters (all / English / grant) |
| `/universitetlar/[id]` | [app/universitetlar/[id]/page.tsx](app/universitetlar/[id]/page.tsx) | University detail + apply modal. Blocks apply if profile incomplete; routes to `/profil`. |
| `/profil` | [app/profil/page.tsx](app/profil/page.tsx) | Profile form with completion % bar and mock file uploads (only filename stored) |
| `/arizalar` | [app/arizalar/page.tsx](app/arizalar/page.tsx) | My Applications grouped into Ready / Needs Exam / Submitted. Multi-select + batch submit. |
| `/imtihonlar` | [app/imtihonlar/page.tsx](app/imtihonlar/page.tsx) | Registered entrance exams (date, location, subjects) |

### Apply flow logic (already wired)
- On Apply: if `!user` → `/kirish`. If profile incomplete → modal then `/profil`. Else: select major → schedule (kunduzgi/kechki/sirtqi) → financial aid yes/no → application created with status `"yuborilmagan"`.
- Requirements check is naive: compares `profile.dtm` and `profile.ielts` against `requirements.minDtm` / `minIelts`. If university has `hasEntranceExam` and student doesn't meet → `needsEntranceExam: true` and the app lands in the "Imtihon kerak" group.
- Exam registration is mocked: sets `examDate` to "today + 14 days" and flips `needsEntranceExam: false`.
- Batch submit on `/arizalar` flips selected drafts to `"korib_chiqilmoqda"`.

---

## What's NOT done (priority order)

### 1. Real backend (biggest gap)
Everything is `localStorage`. To make this real:
- Recommended: **Supabase** (auth + Postgres + storage in one) — matches [PLAN.md](PLAN.md) suggestion.
- Tables needed: `users`, `profiles`, `universities`, `majors`, `applications`, `exam_registrations`.
- Replace `lib/auth-context.tsx` with Supabase client calls — keep the same hook signature so pages don't need to change.
- File uploads (diploma, DTM cert, photo) currently store only the filename string. Wire to Supabase Storage.

### 2. University admin panel
Universities can't manage their own data. Needed:
- Admin auth (separate role)
- CRUD for: their university page, majors, deadlines, requirements
- Application inbox: view applicants, change status (Under Review → Accepted / Rejected)
- Schedule exams + assign dates/locations
- See [PLAN.md](PLAN.md) "Data & Role Architecture" section.

### 3. Open questions from PLAN.md (need user input)
- Who seeds university data initially — self-serve admins or manual?
- Application fee per university? (no payment flow exists)
- DTM score verification — official source integration, or self-reported?
- Notifications (email/SMS) when status changes?

### 4. UX gaps
- No password reset flow
- No email verification
- No localization toggle (PLAN.md mentions Uzbek + Russian — only Uzbek exists)
- No loading skeletons / empty states beyond basic text
- No error toasts — errors render inline only
- No mobile testing pass (responsive classes are written but not verified in a real browser)
- Profile photo uploads UI exists but image is never displayed anywhere
- No way to edit an application after creation (only remove)

### 5. Code quality
- No ESLint config (skipped during scaffold with `--no-eslint`)
- No tests
- No CI
- `AGENTS.md` and `CLAUDE.md` are the create-next-app defaults — could be cleaned up

---

## Conventions to keep

- **Uzbek copy.** All user-facing strings are Uzbek (Latin script). Don't introduce English UI text. Internal code (vars, types, comments) stays English.
- **Route names are Uzbek** too: `/royxat`, `/kirish`, `/universitetlar`, `/arizalar`, `/imtihonlar`, `/profil`. Match this if adding new routes.
- **Design tokens only.** Use Tailwind classes like `bg-primary`, `text-ink`, `border-hairline`, `rounded-md` — they're wired to [DESIGN.md](DESIGN.md). Don't hardcode hex colors in components.
- **Mock data shape is the contract.** When wiring a real backend, keep `lib/types.ts` shapes stable so pages don't need rewrites.
- `useAuth()` is the single source of truth for user state. Don't read `localStorage` from pages directly.

---

## Suggested next steps (in order)

1. **Decide backend.** Supabase is the lowest-friction path — set up project, port `lib/auth-context.tsx`.
2. **Seed universities into the DB.** Move [lib/mock-universities.ts](lib/mock-universities.ts) into a seed script.
3. **File uploads → Supabase Storage.** Wire diploma/photo/DTM cert.
4. **Status update mechanism.** Either a basic admin route (`/admin`) or a manual DB update process for now.
5. **Email notifications** on status change (Resend / Supabase Edge Functions).
6. **Russian translation pass** — extract strings to a dictionary first, then add `ru.json`.
7. **Polish: loading states, error toasts, mobile QA.**

---

## Files worth reading first

1. [PLAN.md](PLAN.md) — product spec (what we're building)
2. [DESIGN.md](DESIGN.md) — design system reference (Airbnb-style)
3. [lib/types.ts](lib/types.ts) — data shapes
4. [lib/auth-context.tsx](lib/auth-context.tsx) — state layer to replace with real backend
5. [app/universitetlar/[id]/page.tsx](app/universitetlar/[id]/page.tsx) — most complex page (apply flow lives here)
