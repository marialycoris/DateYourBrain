# DateYourBrain — Workflows & Feature Overview

> A swipe/Tinder-style course discovery app for fresh graduates and career shifters.
> Surfaces vetted, free-to-certify online courses (Google, HubSpot, freeCodeCamp, Meta, IBM, Alison…),
> lets learners swipe to save them to a personal tracker, and gives admins tools to curate the
> catalog, triage reports, and view analytics.

**Stack:** Django 5 + DRF (token auth) · MySQL (XAMPP, stored procedures) · React 18 + TypeScript + Vite · Tailwind CSS

---

## Table of Contents

1. [User Roles](#1-user-roles)
2. [Learner Workflow](#2-learner-workflow)
3. [Admin Workflow](#3-admin-workflow)
4. [Feature Overview (applied so far)](#4-feature-overview-applied-so-far)
5. [System Flow Diagram](#5-system-flow-diagram)
6. [How to Demo](#6-how-to-demo)

---

## 1. User Roles

| Role | Value | How it's granted |
|---|---|---|
| **Learner** | `user` (default) | Self-registration at `/register` |
| **Admin** | `admin` | Seeded by `manage.py seed_demo`, Django superuser, or Django admin site (`/admin/`) |

- Auth uses **DRF Token Authentication**; token is stored in `localStorage` (`dyb_token`).
- Learner UI = mobile app shell (bottom tab bar). Admin UI = desktop sidebar layout.
- Admins can also use every learner feature ("View learner app").

---

## 2. Learner Workflow

### 2.1 Register / Login
1. Visit `/login` or `/register`.
2. **Register:** email + password + confirm (min 8 chars, Django validators) → `POST /api/auth/register/` → account created with `role='user'` → token issued → redirected to `/discover`.
3. **Login:** `POST /api/auth/login/` → learner lands on `/discover`, admin lands on `/admin`.
4. Demo credentials are shown directly on the login page.

### 2.2 Discover (swipe deck) — `/discover`
1. App fetches active courses: `GET /api/courses/`.
2. Learner swipes a card **right (save)** or **left (pass)** — drag past a 120px threshold, or tap the ♥ / ✕ buttons.
3. Each swipe → `POST /api/swipes/` → MySQL procedure `sp_log_swipe` runs in one transaction:
   - **Right swipe:** logs the swipe **and** creates a deduped tracker entry with status `Interested`.
   - **Left swipe:** logs the pass only.
4. Tapping **"i"** on a card opens the course detail page.
5. When the deck is exhausted: *"You're through today's stack"* empty state.

### 2.3 Course Detail — `/courses/:id`
1. View badges, description, skills, duration, verification notes, and the external course link.
2. **Save to tracker** → logs a right swipe (same path as above).
3. **Report a problem** → pick an issue type (*No longer free / Link broken / Certificate requires payment / Other*) + optional comment → `POST /api/reports/` → report enters the admin queue with status `open`.

### 2.4 Tracker — `/tracker`
1. `GET /api/tracker/` returns the learner's own entries (scoped to session user).
2. Filter by status chips (All / Interested / In Progress / Completed) or by issuer.
3. Per entry:
   - **Change status:** Mark *Interested* → *In Progress* → *Completed* → `PATCH /api/tracker/:id/`.
   - **Notes:** add/edit inline notes → same `PATCH`.
4. Entries link back to the course detail page.

### 2.5 Account — `/account`
1. View email + role badge.
2. **Change password** → modal (current + new + confirm) → `POST /api/auth/change-password/` (server verifies current password and applies Django validators).
3. **Log out** → `POST /api/auth/logout/` (token revoked) → redirected to `/login`.

> **Session handling:** any `401` response clears the stored token and bounces the user to `/login`.

---

## 3. Admin Workflow

**Login as admin** → redirected to `/admin`. Sidebar: Analytics · Courses · Reports · View learner app · Log out.

### 3.1 Analytics Dashboard — `/admin`
`GET /api/analytics/summary/` (admin-only) — built entirely from **3 MySQL stored procedures**:

| Stored procedure | Feeds |
|---|---|
| `sp_dashboard_totals` | Stat cards: registered users, active users (30d), total swipes, avg swipes/user |
| `sp_course_metrics` | Per-course table: Interested / In Progress / Completed counts + completion rate |
| `sp_report_counts` | Issue reports grouped by course, broken out by type |

### 3.2 Course Management — `/admin/courses`
1. `GET /api/courses/all/` returns **all** courses including inactive ones.
2. Client-side search by title/issuer + status chips.
3. **Edit** → `/admin/courses/:id` form.
4. **Deactivate** (confirm modal) → `DELETE /api/courses/:id/` → **soft delete** (`status → inactive`): course disappears from the swipe deck, record is retained.

### 3.3 Course Create/Edit Form — `/admin/courses/new` | `/admin/courses/:id`
1. Fill in: title, one-line outcome (shown on swipe card), full description, issuer, duration hours, comma-separated skills, trust badges (*Accredited / Industry cert / Free cert / University-issued*), course URL, internal verification notes, published toggle.
2. **Pre-publish checklist (4 items):** issuer credibility · truly free · verification mechanism exists · content current — **saving as active is blocked until all 4 are checked**.
3. Submit → `POST /api/courses/` (create) or `PATCH /api/courses/:id/` (update).

### 3.4 Issue-Report Queue — `/admin/reports`
1. `GET /api/reports/admin/` returns reports (newest first) joined with course titles.
2. Filter chips: All / open / reviewed / resolved.
3. Each card shows course, issue type, date, comment, status badge.
4. Triage → **Mark open / reviewed / resolved** → `PATCH /api/reports/admin/:id/`.

### 3.5 Back-office (Django admin site)
- Superusers can access `/admin/` (Django) with registered model admins for User, Course, TrackerEntry, SwipeLog, and Report.

---

## 4. Feature Overview (applied so far)

### Learner features
- [x] Email/password registration & login (token auth, session persistence)
- [x] Swipe deck with drag gestures (right = save, left = pass)
- [x] Swipe logging via MySQL stored procedure (`sp_log_swipe`, atomic write path)
- [x] Course detail page (badges, skills, duration, verification notes, external link)
- [x] Personal tracker with status pipeline (Interested → In Progress → Completed)
- [x] Per-entry notes
- [x] Tracker filters (status chips + issuer dropdown)
- [x] Issue reporting (4 issue types + comment)
- [x] Change password / logout
- [x] Protected routes + auto-logout on 401
- [x] Mobile app shell (bottom tab navigation)

### Admin features
- [x] Analytics dashboard from stored procedures (`sp_dashboard_totals`, `sp_course_metrics`, `sp_report_counts`)
- [x] Course catalog management (create / edit / search / soft-delete)
- [x] Pre-publish vetting checklist (blocks publishing until all items checked)
- [x] Issue-report triage queue with status workflow (open → reviewed → resolved)
- [x] Desktop sidebar shell, admin-only route guards
- [x] "View learner app" switcher

### Platform / infra
- [x] Custom user model (`email` as username, `role` field)
- [x] `IsAdmin` permission class + `AdminRoute` guard
- [x] 4 MySQL stored procedures for all swipe/analytics writes & aggregates
- [x] Idempotent demo seeder (`manage.py seed_demo`)
- [x] CORS configured for localhost:5173, Asia/Manila timezone
- [x] Django admin site for back-office

---

## 5. System Flow Diagram

```
┌────────────────────────── LEARNER ──────────────────────────┐
│                                                             │
│  Register/Login ──▶ Discover (swipe deck)                   │
│                        │                                    │
│              ┌─────────┴─────────┐                          │
│         Left swipe           Right swipe                    │
│         (log pass)      (log swipe + create                 │
│                          "Interested" entry)                │
│                        │                                    │
│                        ▼                                    │
│              Course Detail ──▶ Save to tracker              │
│                        │        Report a problem ──────┐    │
│                        ▼                               │    │
│                    Tracker ◀────────────────────────── │    │
│              (status + notes)                          │    │
│                        │                               │    │
│                        ▼                               ▼    │
│                    Account                     ┌────────────┴───┐
│               (password / logout)              │  ADMIN QUEUE   │
└────────────────────────────────────────────────│  (reports)     │
┌────────────────────────── ADMIN ───────────────┴───────────────┐
│                                                                │
│  Login ──▶ Analytics dashboard (3 stored procedures)           │
│               │                                                │
│               ├──▶ Courses: create / edit / deactivate         │
│               │      └──▶ 4-item pre-publish checklist         │
│               │                                                │
│               └──▶ Reports: open ▶ reviewed ▶ resolved         │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 6. How to Demo

### 6.1 Prerequisites
- **XAMPP** with MySQL running (port 3306)
- **Python 3.12** and **Node.js**

### 6.2 One-time setup

**Backend** (from `backend/`):
```bash
# 1. Create the database (or run sql/01_database.sql in phpMyAdmin)
mysql -u root -e "CREATE DATABASE \`dateyourbrain\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Virtualenv + dependencies
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# 3. Env + migrate
copy .env.example .env
venv\Scripts\python manage.py migrate

# 4. Load stored procedures (REQUIRED after migrate)
mysql -u root dateyourbrain < sql\02_stored_procedures.sql

# 5. Seed demo data (courses, accounts, swipes, tracker, reports)
venv\Scripts\python manage.py seed_demo

# 6. Run
venv\Scripts\python manage.py runserver
```
API is now at `http://127.0.0.1:8000/api/`, Django admin at `http://127.0.0.1:8000/admin/`.

**Frontend** (from `frontend/`, new terminal):
```bash
npm install
npm run dev
```
App is now at `http://localhost:5173` (expects the backend on `127.0.0.1:8000`).

### 6.3 Demo accounts (from `seed_demo`)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@dateyourbrain.app` | `password123` |
| Learner | `grad@example.com` | `password123` |

Seed data: **7 courses**, **4 tracker entries** for the learner (2 In Progress, 2 Completed), **8 swipes**, and **3 reports** (1 open, 1 reviewed, 1 resolved) so the dashboard shows real numbers.

### 6.4 Demo script — Learner path (~3 min)
1. Go to `http://localhost:5173` → redirected to `/login`.
2. **Register** a new account (or log in as `grad@example.com` / `password123`).
3. **Discover:** swipe cards right and left — show the drag gesture and the ♥/✕ buttons. Point out that a right swipe immediately appears in the tracker.
4. Tap **"i"** on a card → **Course Detail** — show badges, skills, verification notes, external link.
5. Click **Report a problem** → pick *Link broken*, add a comment, submit → "goes straight to our admin queue".
6. Open the **Tracker** tab → change a status to *In Progress* / *Completed*, add a note, and try the status/issuer filters.
7. Open **Account** → show the change-password modal (optional) and log out.

### 6.5 Demo script — Admin path (~3 min)
1. Log in as `admin@dateyourbrain.app` / `password123` → redirected to `/admin`.
2. **Analytics:** highlight the stat cards, per-course metrics table, and issue breakdown (all from stored procedures).
3. **Courses:** search the catalog, open a course for **Edit**, then **Deactivate** one and show it's gone from the learner's swipe deck (soft delete).
4. **Create a course:** `/admin/courses/new` → try saving as *Published* before checking the checklist (blocked) → check all 4 items → save → it appears in the learner deck.
5. **Reports:** open the queue, filter by status, and triage the learner-submitted report from step 5 of the learner demo → mark it *reviewed*, then *resolved*.
6. Click **View learner app** to show the admin can use the learner side too.

### 6.6 Optional back-office
- Log in to Django admin at `http://127.0.0.1:8000/admin/` with the admin account (it's also a superuser) to inspect raw tables.

---

## Appendix: API Map

| Feature | Endpoint | Access |
|---|---|---|
| Register | `POST /api/auth/register/` | Public |
| Login / Logout | `POST /api/auth/login/` · `POST /api/auth/logout/` | Public / Auth |
| Current user / change password | `GET /api/auth/me/` · `POST /api/auth/change-password/` | Auth |
| Active courses (deck) | `GET /api/courses/?exclude=a,b` | Auth |
| All courses | `GET /api/courses/all/` | Admin |
| Create course | `POST /api/courses/` | Admin |
| Course detail / update / soft-delete | `GET \| PATCH \| DELETE /api/courses/<id>/` | Auth / Admin |
| Log swipe | `POST /api/swipes/` | Auth |
| Tracker list / update | `GET /api/tracker/` · `PATCH /api/tracker/<id>/` | Auth (own) |
| Report issue | `POST /api/reports/` | Auth |
| Admin report queue / status | `GET /api/reports/admin/` · `PATCH /api/reports/admin/<id>/` | Admin |
| Analytics summary | `GET /api/analytics/summary/` | Admin |
| Django admin site | `/admin/` | Superuser |

### Frontend Routes

| Route | Page | Guard |
|---|---|---|
| `/login`, `/register` | Auth pages | Public |
| `/discover` | Swipe deck | Protected |
| `/tracker` | Tracker | Protected |
| `/courses/:id` | Course detail | Protected |
| `/account` | Account | Protected |
| `/admin` | Analytics dashboard | Admin |
| `/admin/courses` (+ `/new`, `/:id`) | Course management | Admin |
| `/admin/reports` | Report queue | Admin |
