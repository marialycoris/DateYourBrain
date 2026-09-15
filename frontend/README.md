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

No backend is required to try the app. Every API call currently runs against an in-memory/
localStorage mock (`src/lib/api.ts`) seeded with realistic course data (`src/data/mockData.ts`), so
the whole flow — register, swipe, track, report, and the admin panel — works out of the box.

**Demo accounts** (any password of 4+ characters works for these two):
- Learner: `grad@example.com`
- Admin: `admin@dateyourbrain.app`

## Connecting your Django backend

Everything the frontend needs from the backend is isolated in `src/lib/api.ts`. Each exported
function (`auth.login`, `coursesApi.create`, `trackerApi.update`, `reportsApi.create`,
`analyticsApi.summary`, etc.) has a comment above it naming the Django REST endpoint it expects,
e.g.:

```
POST /api/auth/login/
GET  /api/courses/
POST /api/reports/
GET  /api/analytics/summary/     (a good candidate for a single stored-procedure call)
```

To go live:
1. Stand up the matching Django REST Framework views/serializers/URLs (using stored procedures via
   `cursor.callproc(...)` wherever you want the heavy aggregation — e.g. the analytics summary or
   completion-rate calculations — to live in the database rather than in Python).
2. Replace the body of each function in `api.ts` with a real `http.get/post/patch(...)` call using
   the already-configured `axios` instance (`http`), which already attaches the auth token header.
3. Set `VITE_API_BASE_URL` in a `.env` file to your Django server's base URL.
4. Nothing in `src/pages` or `src/components` needs to change — they only import from `api.ts`.

## Feature map

| Feature (from the brief)              | Where it lives                                          |
|----------------------------------------|-----------------------------------------------------------|
| Register / login / logout / change password, role-based access | `src/pages/auth/`, `src/pages/AccountPage.tsx`, `src/context/AuthContext.tsx` |
| Swipe-based discovery                  | `src/pages/DiscoverPage.tsx`, `src/components/SwipeDeck.tsx`, `SwipeCard.tsx` |
| Course tracker (Interested/In Progress/Completed, notes, filters) | `src/pages/TrackerPage.tsx` |
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
