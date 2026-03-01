# Quick Deployment Checklist

## ✅ Files Created/Updated

- [x] `vercel.json` - Vercel configuration for frontend
- [x] `backend_django/Procfile` - Railway/Render deployment config
- [x] `backend_django/runtime.txt` - Python version specification
- [x] `backend_django/requirements.txt` - Added gunicorn, whitenoise, dj-database-url
- [x] `backend_django/backend_django/settings.py` - Added production settings

## 🚀 Deployment Steps

### Step 1: Commit and Push Changes

```bash
git add .
git commit -m "Add deployment configuration for Vercel and Railway"
git push origin main
```

### Step 2: Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect `vercel.json`
5. Add environment variable:
   - `REACT_APP_API_URL` = `http://localhost:5000/api` (temporary, update after backend deployment)
6. Click "Deploy"
7. Wait for deployment to complete
8. Note your Vercel URL (e.g., `https://your-app.vercel.app`)

### Step 3: Deploy Backend to Railway

1. Go to https://railway.app
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Railway will detect Django automatically
7. Add environment variables:
   ```
   DJANGO_SECRET_KEY=your-super-secret-key-change-this
   DJANGO_DEBUG=False
   ALLOWED_HOSTS=.railway.app,.vercel.app
   ```
8. Railway will provide a PostgreSQL database automatically
9. Wait for deployment
10. Note your Railway URL (e.g., `https://your-app.railway.app`)

### Step 4: Update Frontend Environment Variable

1. Go back to Vercel dashboard
2. Go to Settings → Environment Variables
3. Update `REACT_APP_API_URL` to your Railway URL:
   - `REACT_APP_API_URL` = `https://your-app.railway.app/api`
4. Redeploy frontend (Vercel → Deployments → Redeploy)

### Step 5: Update Django CORS Settings

1. In Railway dashboard, add environment variable:
   ```
   CSRF_TRUSTED_ORIGINS=https://your-app.vercel.app
   ```
2. Railway will automatically redeploy

### Step 6: Test Your Deployment

Visit your Vercel URL and test:
- [ ] Homepage loads
- [ ] Login works
- [ ] Register works
- [ ] Profile page loads
- [ ] Can upload profile picture
- [ ] Blood requests work
- [ ] Rewards system works

## 🔧 Troubleshooting

### Frontend Build Fails
- Check Vercel build logs
- Ensure `vercel.json` is in root directory
- Verify all dependencies are in `client/package.json`

### Backend Deployment Fails
- Check Railway logs
- Verify `Procfile` is in `backend_django` directory
- Check `requirements.txt` has all dependencies
- Ensure Python version in `runtime.txt` is supported

### API Calls Fail (CORS Error)
- Update `CSRF_TRUSTED_ORIGINS` in Railway
- Update `CORS_ALLOW_ALL_ORIGINS` or add specific origins
- Check `REACT_APP_API_URL` in Vercel

### Database Issues
- Railway provides PostgreSQL automatically
- Check `DATABASE_URL` environment variable is set
- Run migrations: Railway does this automatically via Procfile

### Static Files Not Loading
- Whitenoise is configured in settings.py
- Run `python manage.py collectstatic` (Railway does this automatically)

## 📝 Environment Variables Summary

### Vercel (Frontend)
```
REACT_APP_API_URL=https://your-backend.railway.app/api
```

### Railway (Backend)
```
DJANGO_SECRET_KEY=your-super-secret-key-here
DJANGO_DEBUG=False
ALLOWED_HOSTS=.railway.app,.vercel.app
CSRF_TRUSTED_ORIGINS=https://your-app.vercel.app
DATABASE_URL=(auto-provided by Railway)
```

## 🎉 Success!

Once everything is deployed:
1. Your frontend will be at: `https://your-app.vercel.app`
2. Your backend will be at: `https://your-app.railway.app`
3. Both will be automatically deployed on every git push!

## 💰 Cost

- Vercel: FREE (generous free tier)
- Railway: FREE ($5 credit/month, enough for small apps)
- Total: $0/month for hobby projects

## 🔄 Continuous Deployment

Both Vercel and Railway support automatic deployments:
- Push to GitHub → Automatic deployment
- No manual steps needed after initial setup
- View deployment logs in dashboards

## 📚 Additional Resources

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Django Deployment: https://docs.djangoproject.com/en/stable/howto/deployment/
- Full Guide: See `VERCEL_DEPLOYMENT_GUIDE.md`
