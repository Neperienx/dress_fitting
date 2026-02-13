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

## Landing page (Python-rendered)
The marketing landing page is rendered server-side with a lightweight Python HTTP server (no client-side JavaScript required).

```bash
python landing_server.py
```

Then open `http://localhost:8000/` in your browser. To switch languages, append a locale query param like `?lang=fr` (supported locales are `en`, `fr`, `de`, `es`).

### Updating landing page images
Landing page images are configured in `landing-content.json` under each block's `image.src` field. The default setup points to local placeholders in `images/hero.svg` and `images/workflow.svg`.

To replace the photos:
1. Add your new image files under `images/` (or another static folder in the repo).
2. Update the relevant `image.src` values in `landing-content.json` to the new relative paths.
3. Restart `python landing_server.py` and refresh the page.


### Store-specific dress photos (upload + default)
Stores can now have their own dress image in the **Stores** page.

How it works:
1. Open `http://localhost:8000/stores` and select a store tile.
2. In the store detail card, use **Dress photo** to upload a `.png`, `.jpg`, `.jpeg`, or `.webp` file.
3. The server saves that file under `images/stores/store-<store_id>/` with a unique filename (for example: `images/stores/store-3/dress-a1b2c3d4.jpg`).
4. The photo is linked only to that store.

Default photo behavior:
- If a store has no uploaded photo yet, the app automatically uses `images/default/default-dress.svg`, `images/default/default-dress.png`, `images/default/default-dress.jpg`, or `images/default/default-dress.jpeg` (first one found).
- For backward compatibility, it can still fall back to the previous `images/default-dress.*` location.
- You can customize the default by replacing one of those files (same base name) or by updating `DEFAULT_DRESS_PHOTO_PATH` in `landing_server.py`.

### Changing the tagging of default dresses
Default session cards infer a category from each default dress filename and the tags configured in `tag-options.json`.

To change how defaults are tagged:
1. Update `tag-options.json` with the tags/categories you want to support.
2. Rename files in `images/default/` so each filename includes one of those tag IDs. Example: `ball-gown-satin-01.jpg` or `v-neck-lace-02.png`.
3. Restart the server and start a new default session. The card category chip is computed from the filename tokens.

Notes:
- Matching is based on normalized tag IDs (lowercase, punctuation replaced with `-`).
- If no token in a filename matches a known tag, the app assigns a fallback category.
- This filename-based tagging affects the default session deck only. Store-uploaded dress photos use explicit metadata tags set in the Stores page.

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
