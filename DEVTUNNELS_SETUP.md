# Production Deployment Guide

## DevTunnels Setup

When using VS Code Dev Tunnels to forward your application, follow these steps to enable remote access for your friends:

### Frontend (React - Port 3000)

1. **Create or update `.env` file** in `/client` directory:
   ```
   REACT_APP_API_URL=https://your-backend-tunnel-url/api
   REACT_APP_VAPID_PUBLIC_KEY=your_vapid_public_key_here
   ```

   Replace `your-backend-tunnel-url` with your actual Dev Tunnels backend URL.

2. **Restart React dev server**:
   ```bash
   cd client
   npm start
   ```

### Backend (Django - Port 8000)

1. **Add DevTunnels URL to CORS allowed origins** in `backend_django/backend_django/settings.py`:
   ```python
   CORS_ALLOWED_ORIGINS = [
       'http://localhost:3000',
       'https://bnkz16cm-3000.inc1.devtunnels.ms',  # Your frontend tunnel URL
       'https://your-backend-tunnel-url',  # Add if backend is also tunneled
   ]
   ```

2. **Add DevTunnels URL to ALLOWED_HOSTS**:
   ```python
   ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'your-backend-tunnel-url']
   ```

3. **Restart Django dev server**:
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```

## Common Issues

### Issue: "CORS error" or "API request blocked"
- **Cause**: Frontend tunnel URL not added to Django `CORS_ALLOWED_ORIGINS`
- **Solution**: Add your frontend tunnel URL to Django settings and restart Django

### Issue: "Cannot reach API" or "Connection refused"
- **Cause**: Frontend `.env` file points to `localhost:8000` instead of backend tunnel URL
- **Solution**: Update `REACT_APP_API_URL` in frontend `.env` to point to your backend tunnel URL

### Issue: "Registration/API requests hang or timeout"
- **Cause**: Dev Tunnel not properly authenticated or backend not responding
- **Solution**: Check Dev Tunnel status (`devtunnel commands show`), verify backend is running

## Testing Registration Flow

1. Visit your frontend tunnel URL: `https://bnkz16cm-3000.inc1.devtunnels.ms/`
2. Click "Register" → fill form → submit
3. Check browser DevTools (F12) → Network tab to see API request
4. If request fails, check:
   - Backend logs for API errors
   - Frontend `.env` has correct `REACT_APP_API_URL`
   - Django `CORS_ALLOWED_ORIGINS` includes your frontend tunnel URL

## Environment Variable Template

**Frontend `.env`** (create file at `/client/.env`):
```
REACT_APP_API_URL=https://backend-tunnel-url/api
REACT_APP_VAPID_PUBLIC_KEY=BCxx...
```

**Backend `.env`** (create or update file at `/backend_django/.env`):
```
DEBUG=False
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1,your-backend-tunnel-url
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://bnkz16cm-3000.inc1.devtunnels.ms
DATABASE_URL=your-database-url
```

---
For more details on Dev Tunnels, see: https://code.visualstudio.com/docs/remote/tunnels
