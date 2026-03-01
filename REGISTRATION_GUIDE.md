# Registration Guide - Blood Donation Platform

## ✅ ISSUE FIXED!

The registration was failing because the frontend was trying to connect to the wrong port (8000 instead of 5000).

**Fixed:**
- Updated `client/src/services/api.js` to use port 5000
- Updated `client/.env` to use correct API URL
- Restarted frontend server

## 📋 Required Data for Registration

### **All Fields Are Required:**

1. **Full Name** (text)
   - Example: "John Doe"
   - Minimum: 1 character

2. **Email** (email format)
   - Example: "john@example.com"
   - Must be unique (not already registered)
   - Must be valid email format

3. **Phone** (text/number)
   - Example: "+1 (555) 123-4567" or "1234567890"
   - Any format accepted

4. **City** (text)
   - Example: "New York"
   - Minimum: 1 character

5. **Blood Type** (dropdown)
   - Options: O+, O-, A+, A-, B+, B-, AB+, AB-
   - Default: O+

6. **Role** (dropdown)
   - Options: Blood Donor, Blood Recipient
   - Default: Blood Recipient

7. **Password** (text, minimum 6 characters)
   - Example: "password123"
   - Minimum: 6 characters
   - Will be hashed before storage

8. **Confirm Password** (text)
   - Must match the password field

## 🚀 How to Register

### Step 1: Go to Registration Page
```
http://localhost:3000/register
```

### Step 2: Fill in All Fields
- Full Name: Your name
- Email: Your email address
- Phone: Your phone number
- City: Your city
- Blood Type: Select from dropdown
- Role: Choose Donor or Recipient
- Password: At least 6 characters
- Confirm Password: Same as password

### Step 3: Click "Register"

### Step 4: Automatic Login
- After successful registration, you'll be automatically logged in
- Redirected to:
  - **Donors** → `/dashboard`
  - **Recipients** → `/find-donors`

## 🔍 Common Registration Errors

### Error: "User already exists"
**Cause:** Email is already registered
**Solution:** Use a different email or login with existing account

### Error: "Passwords do not match"
**Cause:** Password and Confirm Password fields don't match
**Solution:** Make sure both password fields are identical

### Error: "Please fill in all required fields"
**Cause:** One or more fields are empty
**Solution:** Fill in all 8 fields

### Error: "Registration failed. Please try again."
**Cause:** Server error or network issue
**Solution:** 
1. Check if backend is running (http://localhost:5000/api/health)
2. Check browser console for errors
3. Try again

## 🧪 Test Registration

### Test User 1 (Donor):
```
Name: Test Donor
Email: donor@test.com
Phone: 1234567890
City: New York
Blood Type: O+
Role: Blood Donor
Password: test123
Confirm Password: test123
```

### Test User 2 (Recipient):
```
Name: Test Recipient
Email: recipient@test.com
Phone: 0987654321
City: Los Angeles
Blood Type: A+
Role: Blood Recipient
Password: test123
Confirm Password: test123
```

## 📊 What Happens After Registration

1. **User Created** in MongoDB database
2. **Password Hashed** using bcrypt (secure)
3. **JWT Token Generated** (valid for 30 days)
4. **Token Stored** in localStorage
5. **User ID & Role Stored** in localStorage
6. **Automatic Login** - no need to login again
7. **Redirected** to appropriate dashboard

## 🔐 Security Features

- Passwords are hashed with bcrypt (10 rounds)
- JWT tokens expire after 30 days
- Email must be unique
- Password minimum 6 characters
- All data validated on both frontend and backend

## 🛠️ Backend API Endpoint

```
POST http://localhost:5000/api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "bloodType": "O+",
  "city": "New York",
  "role": "donor"
}
```

**Success Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "donor"
  }
}
```

## ✅ Verification

After registration, users are created with:
- `verified: false` (default)
- Admin can verify users from admin panel
- Unverified users can still use the platform

## 🎯 Next Steps After Registration

### For Donors:
1. Go to Donor Dashboard
2. Set availability status
3. View nearby blood requests
4. Accept requests
5. Track donation history

### For Recipients:
1. Go to Find Donors page
2. Search for donors by blood type
3. Create blood requests
4. Contact donors
5. Track request status

## 🆘 Still Having Issues?

1. **Check Backend Status:**
   ```
   http://localhost:5000/api/health
   ```
   Should return: `{"status":"Server is running"}`

2. **Check Frontend:**
   ```
   http://localhost:3000
   ```
   Should load the home page

3. **Check Browser Console:**
   - Press F12
   - Go to Console tab
   - Look for error messages

4. **Check Network Tab:**
   - Press F12
   - Go to Network tab
   - Try registering
   - Look for failed requests

## 📱 Registration is Now Working!

Try registering a new account at:
```
http://localhost:3000/register
```

All issues have been fixed! 🎉
