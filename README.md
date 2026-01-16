# Bridal Studio Sessions (MVP)

Tablet-first, multi-tenant bridal shop experience for running “Bride Sessions” where brides swipe through dresses and receive a ranked Top 10 list.

## Prerequisites
- Python 3.12+
- macOS or Linux

## Quickstart (one line)
```bash
make dev
```
This command creates a local virtualenv, installs dependencies, runs migrations, seeds demo data, and starts the server at `http://localhost:8000`.

## Setup details
1. Copy env vars:
   ```bash
   cp .env.example .env
   ```
2. Optional: edit `.env` for Postgres, allowed hosts, CORS, or email settings.

## Create an admin user
```bash
.venv/bin/python manage.py createsuperuser
```

## Seed demo data
```bash
make seed
```
Seeded data includes:
- Shop: **Luna Bridal Atelier**
- Owner login: `owner / password123`
- Stylist login: `stylist / password123`
- ~30 dresses with placeholder SVG images

## Access the app
- Dashboard: `http://localhost:8000/dashboard/`
- Admin: `http://localhost:8000/admin/`
- New session: `http://localhost:8000/sessions/new/`

## Swiping flow
1. Login as stylist or owner.
2. Create a new Bride Session.
3. Open the swipe link on a tablet.
4. Use Like/Dislike buttons (or keyboard arrows).
5. Finish to see the Top 10 list.

## Architecture overview
- `accounts`: Custom user model + role
- `shops`: Shop and memberships
- `inventory`: Dresses, images, manager UI
- `sessions`: Bride sessions, swipes, ranking service
- `api`: Lightweight DRF health endpoint

## Configuration & environments
- **SQLite** is default via `DATABASE_URL=sqlite:///db.sqlite3`.
- To use Postgres locally, set `DATABASE_URL=postgres://...`.
- CORS is configured via `CORS_ALLOWED_ORIGINS`.
- Media storage uses local filesystem; swap to S3/GCS later by changing `DEFAULT_FILE_STORAGE`.

## Production notes (high-level)
- **Firebase Hosting** can serve marketing/static assets with rewrites to the Django backend.
- **Cloud Run** hosts the Django API server (containerized) with Postgres.
- Configure `DJANGO_DEBUG=False`, `DJANGO_ALLOWED_HOSTS`, and secure cookie settings.
- Use GCS/S3 for `MEDIA_*` and `STATIC_*` with `django-storages`.

## Makefile targets
- `make dev` - one-line local run
- `make migrate` - migrations only
- `make seed` - seed demo data
- `make test` - run tests
- `make lint` - placeholder
