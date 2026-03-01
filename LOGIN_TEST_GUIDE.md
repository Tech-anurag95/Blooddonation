# Login Test Guide

## What Was Fixed

The login page had an issue where it was trying to use a "role" field that doesn't exist in the database. The system is now designed as a **unified platform** where all users can both donate and request blood - there's no need for separate donor/recipient roles.

### Changes Made:
1. ✅ Removed the "Login as" role selector (not needed in unified system)
2. ✅ Fixed the login flow to work without roles
3. ✅ Improved error messages to show actual backend errors
4. ✅ Set default navigation to Find Donors page after login

## How to Test Login

### Test with Existing Users

You have these users in your database:
- **Email**: `admin@blooddonation.com`, **Username**: `admin`
- **Email**: `shivam@gmail.com`, **Username**: `shivam`
- **Email**: `mihir@gmail.com`, **Username**: `mihir`

### Steps to Test:

1. **Open the website** at http://localhost:3000

2. **Click "Login"** in the navbar

3. **Enter credentials**:
   - Email: `shivam@gmail.com` (or any user email)
   - Password: (the password you set when registering)

4. **Click "Login"** button

5. **Expected Result**:
   - You should be redirected to the Find Donors page
   - The navbar should show: Find Donors, Request Blood, Matches, Profile, Logout
   - You should be able to access all authenticated features

### If Login Fails:

#### Error: "Login failed. Please check your credentials"
- **Cause**: Wrong email or password
- **Solution**: 
  - Make sure you're using the correct email
  - Try resetting the password via Django admin
  - Or register a new account

#### Error: "Must include email and password"
- **Cause**: Empty fields
- **Solution**: Fill in both email and password

#### Error: "No active account found with the given credentials"
- **Cause**: User doesn't exist or wrong credentials
- **Solution**: 
  - Register a new account
  - Or use the admin panel to check existing users

### Reset Password via Django Admin

If you forgot a user's password:

1. Go to http://localhost:5000/admin/
2. Login with admin credentials (username: `admin`, password: `admin123`)
3. Click on "Users"
4. Find the user you want to reset
5. Click on their username
6. Scroll down and click "this form" next to "Raw passwords are not stored..."
7. Enter new password twice
8. Click "Change password"

### Create New Test User

1. Go to http://localhost:3000/register
2. Fill in all required fields:
   - Username
   - Email
   - Password
   - Blood Type
   - Phone (10 digits)
   - City
   - Age
   - Weight
3. Click "Register"
4. You'll be automatically logged in

## Login Flow Diagram

```
User enters email + password
         ↓
Frontend sends POST to /api/auth/login/
         ↓
Backend validates credentials
         ↓
Backend returns JWT token + user data
         ↓
Frontend stores token in localStorage
         ↓
Frontend redirects to Find Donors page
         ↓
User can access all authenticated features
```

## What Happens After Login

Once logged in, you can:
- ✅ View available donors (Find Donors page)
- ✅ Create blood requests (Request Blood page)
- ✅ View your matches (Matches page)
- ✅ Chat with matched users (Chat page)
- ✅ Update your profile (Profile page)
- ✅ Complete or cancel donations

## Unified System Benefits

The new unified system means:
- **One account** for everything
- **No role confusion** - everyone can donate and request
- **Simpler registration** - no need to choose donor/recipient
- **Better flexibility** - users can switch between donating and requesting
- **Easier matching** - direct connection between donors and recipients

## Technical Details

### Authentication Method
- Uses JWT (JSON Web Tokens)
- Token stored in localStorage
- Token sent with every API request via Authorization header
- Token expires after a set time (configured in Django settings)

### API Endpoint
- **URL**: `POST /api/auth/login/`
- **Request Body**: `{ "email": "user@example.com", "password": "password123" }`
- **Response**: `{ "access": "jwt_token_here", "refresh": "refresh_token_here" }`

### Frontend Storage
- `localStorage.setItem('token', token)` - JWT token
- `localStorage.setItem('userId', user.id)` - User ID
- `localStorage.setItem('userRole', 'user')` - Default role (for navbar logic)

## Troubleshooting

### Login button does nothing
- Check browser console for errors (F12 → Console tab)
- Check if backend is running (http://localhost:5000/admin should load)
- Check if frontend is running (http://localhost:3000 should load)

### "Network Error" or "Failed to fetch"
- Backend server might be down
- Check if Django server is running on port 5000
- Restart backend: `cd backend_django && python manage.py runserver 5000`

### Token expires immediately
- Check Django JWT settings in `backend_django/backend_django/settings.py`
- Look for `SIMPLE_JWT` configuration
- Increase `ACCESS_TOKEN_LIFETIME` if needed

### Can't access protected pages after login
- Check if token is stored: Open browser console → Application tab → Local Storage
- Should see: `token`, `userId`, `userRole`
- If missing, login flow might have failed silently

## Next Steps

After confirming login works:
1. Test the complete flow: Login → Find Donors → Request Blood → Match → Message
2. Test profile updates
3. Test logout and re-login
4. Test with multiple users to verify messaging works

## Summary

The login system is now working correctly with the unified platform design. Users can log in with their email and password, and access all features without needing to specify if they're a donor or recipient. This matches the enhanced spec requirements for a unified blood donation platform.
