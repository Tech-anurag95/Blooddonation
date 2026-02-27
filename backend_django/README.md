Django backend scaffold for BloodConnect

Quick start (Windows PowerShell):

1. Create and activate virtualenv
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

2. Install requirements
   ```powershell
   pip install -r requirements.txt
   ```

3. Run migrations and create superuser
   ```powershell
   python manage.py migrate
   python manage.py createsuperuser
   ```

4. Start dev server
   ```powershell
   python manage.py runserver
   ```

Media uploads will be stored under `backend_django/media/` in development.

Notes:
- This scaffold uses SQLite for quick local development. Switch to PostgreSQL in `settings.py` for production.
- JWT auth is configured via `djangorestframework-simplejwt`.
- Add VAPID keys and push/email utilities to integrate notifications.
