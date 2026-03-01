# Emergency Login - Bypass Method

## Quick Access (Works Immediately)

### Method 1: Use Django Admin
1. Go to: http://localhost:5000/admin
2. Login with: `admin` / `admin123`
3. You can manage everything from Django admin

### Method 2: Manual Token Injection
1. Open http://localhost:3000
2. Press F12 (Developer Tools)
3. Go to "Console" tab
4. Paste this code and press Enter:

```javascript
// Get token from API
fetch('http://localhost:5000/api/auth/login/', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({email: 'shivam@gmail.com', password: 'shivam123'})
})
.then(r => r.json())
.then(data => {
  localStorage.setItem('token', data.access);
  localStorage.setItem('userId', '2');
  localStorage.setItem('userRole', 'user');
  alert('✅ Logged in! Refresh the page (F5)');
  location.reload();
});
```

5. Wait for "Logged in!" alert
6. You're now logged in!

### Method 3: Register New Account
If login doesn't work, registration might:
1. Go to http://localhost:3000/register
2. Create a new account
3. Registration usually works even when login doesn't

### Method 4: Use Test API Page
1. Go to: http://localhost:3000/test-api
2. Click "Test Login"
3. If it works, copy the token
4. Open Console (F12)
5. Run:
```javascript
localStorage.setItem('token', 'PASTE_TOKEN_HERE');
localStorage.setItem('userId', '2');
localStorage.setItem('userRole', 'user');
location.href = '/blood-requests';
```

## All Working Credentials

- **Shivam**: `shivam@gmail.com` / `shivam123`
- **Test User**: `test@test.com` / `test123`
- **Admin**: `admin@blooddonation.com` / `admin123`

## Why This Works

The backend API is working perfectly. The issue is in the React frontend's login form. By manually setting the token in localStorage, you bypass the login form entirely and access the site directly.

## After You're Logged In

Once you use any of these methods, you'll have full access to:
- Blood Requests
- Donate Blood
- Messaging
- Profile
- All features

The token lasts 30 days, so you won't need to do this again.
