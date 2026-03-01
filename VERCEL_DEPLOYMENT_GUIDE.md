# Vercel Deployment Guide for Blood Donation Platform

## Overview
This guide will help you deploy the React frontend to Vercel. The Django backend needs to be deployed separately (see Backend Deployment section).

## Prerequisites
- GitHub account with your code pushed
- Vercel account (free tier works)
- Backend deployed somewhere accessible (Railway, Render, PythonAnywhere, etc.)

---

## Part 1: Deploy Frontend to Vercel

### Step 1: Prepare Your Repository

The `vercel.json` file has been created in your root directory with the correct configuration:

```json
{
  "version": 2,
  "buildCommand": "cd client && npm install && npm run build",
  "outputDirectory": "client/build",
  "devCommand": "cd client && npm start",
  "installCommand": "npm install",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Step 2: Push to GitHub

Make sure all your changes are committed and pushed:

```bash
git add .
git commit -m "Add Vercel configuration"
git push origin main
```

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the configuration from `vercel.json`
5. **IMPORTANT**: Add environment variable:
   - Name: `REACT_APP_API_URL`
   - Value: Your backend URL (e.g., `https://your-backend.railway.app/api`)
6. Click "Deploy"

### Step 4: Verify Deployment

Once deployed, Vercel will give you a URL like:
- `https://your-app.vercel.app`

Test the following:
- Homepage loads correctly
- Login/Register pages work
- API calls connect to your backend

---

## Part 2: Deploy Django Backend

You have several options for deploying the Django backend:

### Option A: Railway (Recommended - Easy & Free Tier)

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add a new service → "PostgreSQL" (or use SQLite for testing)
6. Configure environment variables:
   ```
   DJANGO_SECRET_KEY=your-secret-key-here
   DEBUG=False
   ALLOWED_HOSTS=.railway.app
   DATABASE_URL=postgresql://... (auto-provided by Railway)
   ```
7. Add `Procfile` to your `backend_django` directory:
   ```
   web: cd backend_django && python manage.py migrate && gunicorn backend_django.wsgi
   ```
8. Add `runtime.txt`:
   ```
   python-3.11.0
   ```
9. Update `requirements.txt` to include:
   ```
   gunicorn
   whitenoise
   psycopg2-binary
   ```

### Option B: Render

1. Go to [render.com](https://render.com)
2. Create new "Web Service"
3. Connect your GitHub repository
4. Configure:
   - Build Command: `cd backend_django && pip install -r requirements.txt`
   - Start Command: `cd backend_django && gunicorn backend_django.wsgi:application`
5. Add environment variables (same as Railway)

### Option C: PythonAnywhere (Free Tier Available)

1. Go to [pythonanywhere.com](https://www.pythonanywhere.com)
2. Create a free account
3. Upload your code or clone from GitHub
4. Configure WSGI file
5. Set up static files
6. Configure allowed hosts

---

## Part 3: Connect Frontend to Backend

### Update Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add/Update:
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app/api
   ```
4. Redeploy your frontend

### Update Django CORS Settings

In `backend_django/backend_django/settings.py`, update:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://your-app.vercel.app",  # Add your Vercel URL
]

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    'your-backend.railway.app',  # Add your backend URL
    '.vercel.app',  # Allow all Vercel subdomains
]
```

---

## Part 4: Quick Fix for Current Error

The error you're seeing is because Vercel is running the root `package.json` build command which tries to `cd client` but the working directory is already set incorrectly.

**The `vercel.json` file I created fixes this!**

Just commit and push it:

```bash
git add vercel.json
git commit -m "Add Vercel configuration for deployment"
git push origin main
```

Then try deploying again on Vercel.

---

## Part 5: Alternative - Deploy Only Frontend

If you want to deploy ONLY the frontend to Vercel and keep the backend local for now:

### Option 1: Use ngrok for Backend (Temporary)

1. Install ngrok: https://ngrok.com/download
2. Run your Django server: `python manage.py runserver 5000`
3. In another terminal: `ngrok http 5000`
4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
5. Add to Vercel environment variables:
   ```
   REACT_APP_API_URL=https://abc123.ngrok.io/api
   ```

**Note**: ngrok URLs change every time you restart, so this is only for testing.

### Option 2: Deploy Frontend Only (Static Mode)

If you want to deploy just to see the UI without backend:

1. Comment out API calls temporarily
2. Deploy to Vercel
3. Later, add backend URL when ready

---

## Part 6: Troubleshooting

### Build Fails with "cd: client: No such file or directory"

**Solution**: Make sure `vercel.json` is in your root directory and pushed to GitHub.

### API Calls Fail (CORS Error)

**Solution**: Update Django CORS settings to include your Vercel URL.

### Static Files Not Loading

**Solution**: 
1. Install whitenoise: `pip install whitenoise`
2. Add to `settings.py`:
   ```python
   MIDDLEWARE = [
       'django.middleware.security.SecurityMiddleware',
       'whitenoise.middleware.WhiteNoiseMiddleware',  # Add this
       # ... other middleware
   ]
   
   STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
   STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
   ```

### Database Issues

**Solution**: 
- For production, use PostgreSQL (not SQLite)
- Railway provides free PostgreSQL
- Update `settings.py` to use `DATABASE_URL` environment variable

---

## Part 7: Recommended Deployment Strategy

**Best Practice for Your Project**:

1. **Frontend (Vercel)**: 
   - Deploy React app to Vercel
   - Free tier, automatic deployments from GitHub
   - Fast CDN, great for static sites

2. **Backend (Railway)**:
   - Deploy Django to Railway
   - Free tier includes PostgreSQL
   - Easy setup, automatic deployments

3. **Database (Railway PostgreSQL)**:
   - Included with Railway
   - Better than SQLite for production
   - Automatic backups

**Total Cost**: $0 (both have generous free tiers)

---

## Quick Start Commands

```bash
# 1. Add vercel.json (already done)
git add vercel.json

# 2. Commit and push
git commit -m "Add Vercel deployment configuration"
git push origin main

# 3. Deploy to Vercel
# Go to vercel.com and import your GitHub repo

# 4. Add environment variable in Vercel dashboard
# REACT_APP_API_URL=https://your-backend-url/api
```

---

## Environment Variables Summary

### Vercel (Frontend)
```
REACT_APP_API_URL=https://your-backend.railway.app/api
```

### Railway/Render (Backend)
```
DJANGO_SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=.railway.app,.vercel.app
DATABASE_URL=postgresql://... (auto-provided)
```

---

## Testing Checklist

After deployment, test:
- [ ] Homepage loads
- [ ] Login works
- [ ] Register works
- [ ] Profile page loads
- [ ] Blood requests work
- [ ] Rewards system works
- [ ] Image uploads work
- [ ] All API calls succeed

---

## Need Help?

If you encounter issues:
1. Check Vercel build logs
2. Check browser console for errors
3. Verify environment variables are set
4. Test API endpoint directly (e.g., `https://your-backend.railway.app/api/users/me/`)
5. Check Django logs on Railway/Render

---

## Next Steps

1. Push `vercel.json` to GitHub
2. Deploy frontend to Vercel
3. Deploy backend to Railway
4. Update environment variables
5. Test the live site
6. Set up custom domain (optional)

Good luck with your deployment! 🚀
