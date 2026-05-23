# Bittada — Uzbek University Application Portal

A Common App-style platform for applying to private universities in Uzbekistan.

---

## Pages & Features

---

### 1. Auth

- **Sign Up**: Full name, date of birth, email, password
- **Sign In**
- **Password reset**

---

### 2. Dashboard (home after login)

Two sections:

**A. University Browser**
- Grid/list of universities: logo, name, upcoming deadlines, tuition range, key requirements
- Filter/search by major, tuition, location, deadline

**B. My Applications** (quick summary strip)
- Shows statuses at a glance — links to the full Applications page

---

### 3. University Detail Page

- Full info: tuition breakdown, deadlines, requirements, majors offered, location (map), campus photos
- **APPLY button** flow:
  1. If profile incomplete → redirect to Profile page with a banner "Complete your profile to apply"
  2. If profile complete → modal/step flow:
     - Select major
     - Select start date / part of day (if offered)
     - Financial aid request (if offered by that university)
  3. University added to "My List" with status **Not Submitted**

---

### 4. Profile Page

Fields:
- Photo
- Phone number
- Country & citizenship
- Address
- Passport ID
- School (name, type)
- Year of graduation
- Diploma (upload)
- Test scores — manual entry + file upload (multiple test types)
- DTM scores — manual entry + file upload
- Applying for grant? (yes/no)

Profile shows a **completion percentage** — apply button is locked until 100%.

---

### 5. My Applications Page ("List of Unis")

Each university is a card showing:
- University name + logo
- Selected major
- Selected start date
- Requirements match status:
  - **Meets requirements** → ready to submit
  - **Doesn't meet requirements** → "Register for Entrance Exam" button
- Per-card status badge:
  1. Not Submitted
  2. Under Review
  3. Accepted / Rejected

**Submit flow:**
- Student selects which universities to submit to (checkboxes)
- Single **Submit Applications** button sends only to checked ones
- Submitted cards move to "Under Review"
- Unsubmitted cards (or exam-required ones) stay on the page

---

### 6. My Exams Page

Table/list of registered entrance exams:
- University name
- Exam date & time
- Location (if in-person)
- Subjects being tested

---

## Data & Role Architecture

Two sides to build:

| Side | Users | Key actions |
|---|---|---|
| **Student portal** | Applicants | Profile, browse, apply, track |
| **University admin panel** | Each university's admissions team | Set deadlines, majors, requirements; review applications; update statuses; schedule exams |

---

## Suggested Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | Next.js (React) | SEO on university pages, file-based routing |
| Backend | Node.js + PostgreSQL | Relational data fits applications/statuses well |
| Auth & Storage | Supabase | Auth + file storage (diplomas, uploads) built in |
| Hosting | Vercel + Supabase Cloud | Low ops overhead |
| Languages | Uzbek + Russian | Minimum viable localization |

---

## Key Open Questions

1. **Who manages university data?** — Do universities self-manage via an admin panel, or are they seeded manually?
2. **What triggers status changes?** — Does each university's admin manually update Accepted/Rejected, or is there an integration?
3. **Entrance exam logistics** — Is registration just informational, or does it need calendar/notification integration?
4. **Payment** — Is there an application fee per university?
5. **Grant/DTM integration** — Should DTM scores be verified against an official source, or self-reported only?
