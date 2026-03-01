# Port Forwarding Guide - Create Shareable Link

## Your Application Ports
- **Frontend (React)**: http://localhost:3000
- **Backend (Django)**: http://localhost:5000

## Option 1: VS Code Port Forwarding (Recommended - Easiest)

If you're using VS Code:

1. Open the **Ports** panel (View → Ports or Ctrl+`)
2. Click **"Forward a Port"**
3. Enter port `3000` for frontend
4. Right-click the forwarded port → **Port Visibility** → **Public**
5. Copy the forwarded address (looks like: `https://xyz-3000.preview.app.github.dev`)
6. Repeat for port `5000` (backend)

**Important**: Update frontend to use the public backend URL:
- Edit `client/.env`
- Set `REACT_APP_API_URL=https://your-backend-url/api`

## Option 2: ngrok (Most Popular)

### Step 1: Install ngrok
```bash
# Download from https://ngrok.com/download
# Or use chocolatey:
choco install ngrok
```

### Step 2: Create ngrok account (free)
- Go to https://dashboard.ngrok.com/signup
- Get your authtoken

### Step 3: Configure ngrok
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### Step 4: Forward Frontend Port
```bash
ngrok http 3000
```

This will give you a public URL like: `https://abc123.ngrok.io`

### Step 5: Forward Backend Port (in another terminal)
```bash
ngrok http 5000
```

This will give you a backend URL like: `https://def456.ngrok.io`

### Step 6: Update Frontend Configuration
Edit `client/.env`:
```env
REACT_APP_API_URL=https://def456.ngrok.io/api
```

Restart your React app after changing the .env file.

## Option 3: localtunnel (No signup required)

### Step 1: Install localtunnel
```bash
npm install -g localtunnel
```

### Step 2: Forward Frontend
```bash
lt --port 3000 --subdomain mybloodapp
```

### Step 3: Forward Backend (in another terminal)
```bash
lt --port 5000 --subdomain mybloodapp-api
```

### Step 4: Update Frontend Configuration
Edit `client/.env`:
```env
REACT_APP_API_URL=https://mybloodapp-api.loca.lt/api
```

## Option 4: Cloudflare Tunnel (Free, Permanent URLs)

### Step 1: Install cloudflared
```bash
# Download from https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
```

### Step 2: Forward Frontend
```bash
cloudflared tunnel --url http://localhost:3000
```

### Step 3: Forward Backend (in another terminal)
```bash
cloudflared tunnel --url http://localhost:5000
```

## Important Notes

### CORS Configuration
Your Django backend needs to allow the public frontend URL. Update `backend_django/backend_django/settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://your-ngrok-url.ngrok.io',  # Add your public URL here
]
```

Or keep it open for testing:
```python
CORS_ALLOW_ALL_ORIGINS = True  # Already set in your project
```

### Security Warnings
- These are temporary URLs for testing/sharing
- Don't use for production
- URLs may change when you restart the tunnel
- Some services have rate limits on free tier

## Quick Start Script (ngrok)

I can create a script to automate this. Would you like me to create:
1. A script to start both tunnels
2. Automatically update the .env file
3. Restart the React app

## Recommended Approach

For quick sharing, I recommend:
1. **ngrok** - Most reliable, good free tier
2. Start ngrok for both ports
3. Update `client/.env` with backend URL
4. Share the frontend ngrok URL

Let me know which option you'd like to use, and I'll help you set it up!
