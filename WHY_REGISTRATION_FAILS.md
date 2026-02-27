# Why Friends Cannot Register via DevTunnels Link

## The Problem

When you forwarded the React dev server (port 3000) via DevTunnels, you created a public URL:
```
https://bnkz16cm-3000.inc1.devtunnels.ms/
```

However, when your friends visit this link, the React app still tries to connect to the backend at `http://localhost:8000/api`. Since `localhost` only refers to their own machine (not your machine), the API requests fail silently:

```
❌ Your friend's browser on DevTunnels URL
   ↓ tries to call
❌ http://localhost:8000/api (friend's own machine - doesn't exist)
   instead of
✅ Your actual backend (running on your machine)
```

## The Solution

You need to configure the React app to know the correct backend URL when running via DevTunnels.

### Step 1: Find Your Backend DevTunnels URL

Check if your Django backend is also tunneled. If not, you need to tunnel it:

```powershell
# In backend_django directory, start Django with port binding visible
python manage.py runserver 0.0.0.0:8000
# Note: Make sure it's binding to 0.0.0.0, not just 127.0.0.1

# In another terminal, expose the backend via DevTunnels
devtunnel host 8000
```

This will give you a backend URL like:
```
https://your-backend-url-8000.inc1.devtunnels.ms/
```

### Step 2: Update Frontend `.env` File

Edit `client/.env` and set the backend URL:

```
REACT_APP_API_URL=https://your-backend-url-8000.inc1.devtunnels.ms/api
REACT_APP_VAPID_PUBLIC_KEY=your_vapid_public_key_here
```

### Step 3: Restart React Dev Server

```powershell
cd client
npm start
```

The React app will now read the new `REACT_APP_API_URL` and use the correct backend URL.

### Step 4: Test Registration

1. **Clear browser cache**: Press `Ctrl+Shift+Delete` → clear all cookies/cache
2. **Visit your DevTunnels frontend URL**: `https://bnkz16cm-3000.inc1.devtunnels.ms/`
3. **Try registering**: Fill the form and submit
4. **Check browser console** (F12):
   - Network tab should show POST request to your backend tunnel URL
   - It should respond with `{"id": ...}` or similar success response

## Quick Reference: Environment Setup

### For Local Development
```env
# client/.env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_VAPID_PUBLIC_KEY=BCxx...
```

### For DevTunnels / Remote Access
```env
# client/.env
REACT_APP_API_URL=https://your-backend-tunnel-url/api
REACT_APP_VAPID_PUBLIC_KEY=BCxx...
```

Replace `your-backend-tunnel-url` with the actual URL from `devtunnel host 8000` output.

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Registration form hangs | `REACT_APP_API_URL` still points to localhost | Update `.env` with tunnel URL, restart React |
| Network tab shows failed POST | CORS error | Django already has `CORS_ALLOW_ALL_ORIGINS=True`, check backend console |
| 404 Not Found on `/api/auth/register/` | Backend tunnel URL incorrect | Verify URL from `devtunnel host` output |
| "Cannot POST /api/auth/register/" | Backend not running | Start Django: `python manage.py runserver 0.0.0.0:8000` |

## Complete Setup Flow

```powershell
# Terminal 1: Django Backend
cd backend_django
.\.venv\Scripts\Activate.ps1
python manage.py runserver 0.0.0.0:8000

# Terminal 2: React Frontend
cd client
npm start

# Terminal 3: Tunnel Backend (if not already tunneled)
devtunnel host 8000
# Copy the URL from output

# Terminal 4: Tunnel Frontend (if not already tunneled)
devtunnel host 3000
# Copy the URL from output

# Update client/.env with backend tunnel URL from Terminal 3
# Restart React (Ctrl+C in Terminal 2, then npm start again)
```

---

**TL;DR**: Your React app is still trying to reach `localhost:8000` instead of your tunneled backend. Update `client/.env` with your backend tunnel URL and restart the React dev server.
