# Date Your Brain — Backend

Django REST Framework API sitting in front of a **MySQL** database running under
**XAMPP**. Heavy aggregation and transactional logic live in MySQL **stored
procedures**; Django calls them with `cursor.callproc(...)`.

## Stack

- Python 3.12 + Django 5.1 + Django REST Framework
- MySQL (XAMPP) + PyMySQL driver (pure Python, no C build tools needed)
- Token authentication (`rest_framework.authtoken`)
- CORS enabled for the Vite dev server (`localhost:5173`)

## Setup (one-time)

### 1. Install & start XAMPP

1. Install XAMPP from https://www.apachefriends.org/ (any recent version).
2. Open the **XAMPP Control Panel** and **Start** both:
   - **Apache** (optional for this step, but used by phpMyAdmin)
   - **MySQL**
3. Open http://localhost/phpmyadmin and create the database:

   ```sql
   CREATE DATABASE `dateyourbrain` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

   (or run `backend/sql/01_database.sql` from the phpMyAdmin SQL tab.)

> Defaults assumed below: host `127.0.0.1`, port `3306`, user `root`, empty
> password — exactly what a fresh XAMPP MySQL install gives you.

### 2. Python environment

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Environment file

```bash
copy .env.example .env
```

Edit `.env` if your MySQL credentials differ from the XAMPP defaults.

### 4. Create tables (Django migrations)

```bash
venv\Scripts\python manage.py migrate
```

### 5. Load the stored procedures

The procedures reference the tables created in step 4, so load them **after**
migrating. Two ways:

- Open phpMyAdmin, select the `dateyourbrain` database, SQL tab, paste the
  contents of `backend/sql/02_stored_procedures.sql`, and run it.
- Or from a terminal:

  ```bash
  cd backend
  mysql -u root dateyourbrain < sql/02_stored_procedures.sql
  ```

Provides: `sp_log_swipe`, `sp_dashboard_totals`, `sp_course_metrics`,
`sp_report_counts` (see the file headers for what each returns).

### 6. Seed demo data

```bash
venv\Scripts\python manage.py seed_demo
```

Creates (password for both is `password123`):
- Admin — `admin@dateyourbrain.app`
- Learner — `grad@example.com`
- 7 courses, tracker activity, swipes, and 3 issue reports so the admin
  Analytics dashboard has real numbers.

## Run

```bash
venv\Scripts\python manage.py runserver
```

API: http://127.0.0.1:8000/api/  (Django admin at `/admin/`)

## API map

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/register/` | public | Create account + token |
| POST | `/api/auth/login/` | public | Token auth (`{user, token}`) |
| POST | `/api/auth/logout/` | token | Revoke token |
| GET | `/api/auth/me/` | token | Current user |
| POST | `/api/auth/change-password/` | token | Change password |
| GET | `/api/courses/` | token | Active courses (`?exclude=a,b`) |
| GET | `/api/courses/all/` | admin | All courses incl. inactive |
| POST | `/api/courses/` | admin | Create course |
| GET | `/api/courses/<id>/` | token | Course detail |
| PATCH | `/api/courses/<id>/` | admin | Update course |
| DELETE | `/api/courses/<id>/` | admin | Soft delete (status → inactive) |
| POST | `/api/swipes/` | token | Log swipe (via `sp_log_swipe`) |
| GET | `/api/tracker/` | token | Own tracker entries |
| PATCH | `/api/tracker/<id>/` | token | Update own entry (status/notes) |
| POST | `/api/reports/` | token | Report an issue |
| GET | `/api/reports/admin/` | admin | All reports, newest first |
| PATCH | `/api/reports/admin/<id>/` | admin | Set status (open/reviewed/resolved) |
| GET | `/api/analytics/summary/` | admin | Dashboard via stored procedures |

## Where stored procedures are used

- **`sp_log_swipe`** — the only write path for swipes. It inserts the swipe row
  and, for `direction='right'`, creates the learner's "Interested" tracker entry
  in the same procedure (one transaction, deduped on user+course).
- **`sp_dashboard_totals`**, **`sp_course_metrics`**, **`sp_report_counts`** —
  `/api/analytics/summary/` is built entirely from these three calls in
  `analytics/views.py`; no ORM aggregation happens in Python.

Everything else (account management, the course/issue CRUD that admins do into
individual rows) uses Django's ORM — authentication and fine-grained row writes
are not good fits for stored procedures.

## Notes

- **PyMySQL shim**: `config/__init__.py` calls `pymysql.install_as_MySQLdb()` so
  Django's `django.db.backends.mysql` works on Windows without `mysqlclient`'s
  C compiler requirement.
- Time zone defaults to `Asia/Manila` (`DJANGO_TIME_ZONE` in `.env`).
- Frontend integration: the React app's `src/lib/api.ts` documents each matching
  endpoint in its comments (also mirrored in the map above). Set
  `VITE_API_BASE_URL=http://127.0.0.1:8000/api` in the frontend to go live.