# Login Credentials Guide

## ✅ Login is Now Working!

The login issue has been fixed. You can now log in with any of these accounts:

## Available Test Accounts

### 1. Test User (Newly Created)
- **Email**: `test@test.com`
- **Password**: `test123`
- **Status**: ✅ Verified working

### 2. Admin User
- **Email**: `admin@blooddonation.com`
- **Username**: `admin`
- **Password**: `admin123`
- **Status**: ✅ Password reset

### 3. Shivam User
- **Email**: `shivam@gmail.com`
- **Username**: `shivam`
- **Password**: `shivam123`
- **Status**: ✅ Password reset

### 4. Other Users
- **Mihir**: `mihir@gmail.com` (password needs to be reset)
- **Madhur**: `madhur@gmail.com` (password needs to be reset)
- **Shrishti**: `shrishti@gmail.com` (password needs to be reset)

## What Was Fixed

### The Problem
The backend login endpoint was expecting a different field format than what the frontend was sending. This caused 400 Bad Request errors.

### The Solution
1. ✅ Updated the `EmailTokenObtainPairSerializer` to properly handle email-based login
2. ✅ Set `username_field = 'email'` to tell Django to use email instead of username
3. ✅ Rewrote the validation logic to work correctly with the parent class
4. ✅ Created test users with known passwords

## How to Login

### Step 1: Open the Website
Go to http://localhost:3000

### Step 2: Click Login
Click the "Login" button in the navbar

### Step 3: Enter Credentials
Use any of the accounts listed above:
- Email: `test@test.com`
- Password: `test123`

### Step 4: Click Login Button
You should be redirected to the Find Donors page

## Testing the Login

### Test 1: Basic Login
```
1. Go to http://localhost:3000/login
2. Enter: test@test.com / test123
3. Click Login
4. Should redirect to Find Donors page
5. Navbar should show: Find Donors, Request Blood, Matches, Profile, Logout
```

### Test 2: Admin Login
```
1. Go to http://localhost:3000/login
2. Enter: admin@blooddonation.com / admin123
3. Click Login
4. Should redirect to Find Donors page
5. Can also access Django admin at http://localhost:5000/admin/
```

### Test 3: Wrong Password
```
1. Go to http://localhost:3000/login
2. Enter: test@test.com / wrongpassword
3. Click Login
4. Should show error: "No active account found with the given credentials"
```

## Reset Password for Other Users

If you want to reset passwords for mihir, madhur, or shrishti:

### Option 1: Using Django Admin
1. Go to http://localhost:5000/admin/
2. Login with admin credentials
3. Click "Users"
4. Find the user
5. Click their username
6. Click "this form" next to password
7. Enter new password twice
8. Click "Change password"

### Option 2: Using Python Script
Create a file `backend_django/reset_user_password.py`:

```python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from api.models import User

# Reset password for a specific user
email = 'mihir@gmail.com'  # Change this
new_password = 'mihir123'   # Change this

try:
    user = User.objects.get(email=email)
    user.set_password(new_password)
    user.save()
    print(f'✅ Password reset for {email}')
    print(f'New password: {new_password}')
except User.DoesNotExist:
    print(f'❌ User {email} not found')
```

Then run:
```bash
cd backend_django
python reset_user_password.py
```

## Create New User

### Option 1: Register via Website
1. Go to http://localhost:3000/register
2. Fill in all fields
3. Click Register
4. You'll be automatically logged in

### Option 2: Using Python Script
The `create_test_user.py` script is already created. You can modify it to create more users:

```bash
cd backend_django
python create_test_user.py
```

## Troubleshooting

### Error: "No active account found with the given credentials"
- **Cause**: Wrong email or password
- **Solution**: 
  - Double-check the email address
  - Try one of the test accounts above
  - Reset the password using Django admin

### Error: "Must include email and password"
- **Cause**: Empty fields
- **Solution**: Fill in both email and password fields

### Error: Network error or "Failed to fetch"
- **Cause**: Backend server not running
- **Solution**: 
  - Check if Django is running on port 5000
  - Restart: `cd backend_django && python manage.py runserver 5000`

### Login button does nothing
- **Cause**: Frontend server not running or JavaScript error
- **Solution**:
  - Check browser console (F12 → Console)
  - Check if React is running on port 3000
  - Restart: `cd client && npm start`

## API Testing

You can also test the login API directly:

### Using PowerShell:
```powershell
$body = @{email='test@test.com'; password='test123'} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login/' -Method Post -Body $body -ContentType 'application/json'
```

### Expected Response:
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## What Happens After Login

Once logged in, you can:
- ✅ View available donors (Find Donors page)
- ✅ Create blood requests (Request Blood page)
- ✅ View your matches (Matches page)
- ✅ Chat with matched users (Chat page)
- ✅ Update your profile (Profile page)
- ✅ Logout

## Files Modified

- `backend_django/api/views.py` - Fixed EmailTokenObtainPairSerializer
- `backend_django/create_test_user.py` - Script to create test user
- `backend_django/reset_admin_password.py` - Script to reset passwords
- `client/src/pages/Login.jsx` - Removed role selector (already done)

## Summary

The login system is now fully functional! You can log in with:
- **Email**: `test@test.com`
- **Password**: `test123`

Or any of the other accounts listed above. The issue was in the backend serializer, which has now been fixed to properly handle email-based authentication.

Try logging in now and let me know if you encounter any other issues!
