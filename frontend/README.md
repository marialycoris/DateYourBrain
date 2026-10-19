# Date Your Brain — Frontend

Swipe-based discovery for free-to-certify courses, built for fresh graduates and career shifters.

## Why React, not Django templates

Django is a backend framework — it can render server-side HTML (Django Templates), but it has no
native way to do the tactile, drag-to-swipe card interaction this product needs. So this repo is a
standalone **frontend**: React + TypeScript + Tailwind, built with Vite. It's meant to sit in front
of a **Django REST Framework** backend (which is free to call stored procedures internally — the
frontend only ever talks to JSON REST endpoints and never needs to know how the database is queried).

## Stack

- React 18 + TypeScript
- Tailwind CSS (custom amber-only palette — see `tailwind.config.js`)
- React Router for navigation
- Framer Motion for the swipe-card gestures
- Axios, pre-wired for a token-based Django REST API

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-checks then produces a static build in dist/
```

The app expects the **Django backend** (in `../backend`) to be running on
`http://127.0.0.1:8000`. `VITE_API_BASE_URL` in `.env` points there — change it
if your backend runs elsewhere. Setup for the backend (XAMPP MySQL + stored
procedures) is documented in `../backend/README.md`.

**Demo accounts** (password `password123`):
- Learner: `grad@example.com`
- Admin: `admin@dateyourbrain.app`

## Backend wiring

Everything the frontend needs from the backend is isolated in
`src/lib/api.ts` — each exported function maps 1:1 to a Django REST endpoint
(`auth.login` → `POST /api/auth/login/`, `coursesApi.create` → `POST
/api/courses/`, `analyticsApi.summary` → `GET /api/analytics/summary/`, etc.).
The backend aggregates the analytics dashboard inside MySQL stored procedures
and Django handles auth + CRUD.

## Feature map

| Feature (from the brief)              | Where it lives                                          |
|----------------------------------------|-----------------------------------------------------------|
| Register / login / logout / change password, role-based access | `src/pages/auth/`, `src/pages/AccountPage.tsx`, `src/context/AuthContext.tsx` |
| Swipe-based discovery                  | `src/pages/DiscoverPage.tsx`, `src/components/SwipeDeck.tsx`, `SwipeCard.tsx` |
| Course tracker (Interested/Ongoing/Completed, notes, filters) | `src/pages/TrackerPage.tsx` |
| Report an issue                        | `src/pages/CourseDetailPage.tsx` (modal form)              |
| Admin course management (CRUD, soft delete, checklist) | `src/pages/admin/AdminCoursesPage.tsx`, `AdminCourseFormPage.tsx` |
| Admin issue queue                      | `src/pages/admin/AdminReportsPage.tsx`                     |
| Admin analytics                        | `src/pages/admin/AdminDashboardPage.tsx`                   |

## Design notes

- Palette is amber-only by request: a warm gold-leaning paper background, an amber-undertoned near-black
  ("ink") for text, and a single amber ramp (50–900) for every accent, badge, and state. Red is reserved
  only for destructive actions and error states.
- Typeface pairing: Bricolage Grotesque (display/headings) + Inter (UI/body).
- Learner-facing screens use a mobile app shell (top bar + bottom tab bar, max-width column) since the
  swipe mechanic is a phone-first interaction. The admin panel uses a conventional sidebar layout since
  it's data-dense and desktop-oriented.
