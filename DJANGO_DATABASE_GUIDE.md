# 🎉 Django Database Setup Complete!

## ✅ What Changed

Your blood donation platform now uses **Django with SQLite database** instead of MongoDB!

### **Benefits:**
- ✅ **Persistent Data** - All data is saved in `backend_django/db.sqlite3` file
- ✅ **No More Re-registration** - Users stay registered even after server restart
- ✅ **Built-in Admin Panel** - Django comes with a powerful admin interface
- ✅ **Relational Database** - Better data integrity and relationships
- ✅ **No External Database Required** - SQLite is file-based, no installation needed

## 🚀 Your Website is Now Running

### **Backend (Django)**
```
http://localhost:5000
```
- Using SQLite database (`backend_django/db.sqlite3`)
- All data persists between restarts
- Admin user already created

### **Frontend (React)**
```
http://localhost:3000
```
- Connected to Django backend
- All features working

## 🔐 Admin Credentials

**Email:** `admin@blooddonation.com`  
**Password:** `admin123`

## 📊 Django Admin Panel

Django comes with a built-in admin panel where you can manage all data!

### **Access Django Admin:**
```
http://localhost:5000/admin
```

**Login with:**
- Username: `admin` (or email: admin@blooddonation.com)
- Password: `admin123`

### **What You Can Do in Django Admin:**
- ✅ View all users
- ✅ Edit user details
- ✅ Delete users
- ✅ View all blood requests
- ✅ Manage donations
- ✅ View login activity logs
- ✅ Manage verification documents
- ✅ Full CRUD operations on all models

## 📁 Database File Location

Your database is stored in:
```
backend_django/db.sqlite3
```

**Important:**
- This file contains ALL your data
- Back it up regularly
- Don't delete it unless you want to reset everything
- You can copy it to backup your data

## 🔄 How to Reset Database

If you want to start fresh:

```bash
cd backend_django

# Delete database
del db.sqlite3

# Recreate database
python manage.py migrate

# Create admin user again
python create_admin.py
```

## 📝 Database Models

Your Django backend has these models:

### **1. User Model**
- Custom user extending Django's AbstractUser
- Fields: username, email, password, blood_type, phone, city, age, weight, verified
- Roles: donor, recipient, admin

### **2. BloodRequest Model**
- Fields: requester, blood_type, quantity, urgency, reason, hospital, city, status
- Status: pending, matched, completed
- Timestamps: created_at, completed_at

### **3. VerificationDoc Model**
- User verification documents
- File uploads for identity verification

### **4. LoginActivity Model**
- Audit log for user actions
- Tracks: login, logout, password changes
- Records: IP address, user agent, timestamp

## 🎯 How to Use

### **1. Register New Users**
Go to: `http://localhost:3000/register`

Fill in:
- Name
- Email (must be unique)
- Password
- Phone
- City
- Blood Type
- Role (Donor/Recipient)

**Data is now saved permanently!**

### **2. Login**
Go to: `http://localhost:3000/login`

Use your registered credentials.

### **3. Access Admin Panel**
Go to: `http://localhost:5000/admin`

Login with:
- Username: `admin`
- Password: `admin123`

### **4. Manage Data**
In Django admin, you can:
- Click "Users" to see all registered users
- Click "Blood requests" to see all requests
- Click "Login activities" to see audit logs
- Edit any record by clicking on it
- Delete records using checkboxes and actions

## 🔧 API Endpoints

Your Django backend provides these endpoints:

### **Authentication**
```
POST /api/auth/register/  - Register new user
POST /api/auth/login/     - Login (returns JWT token)
```

### **Users**
```
GET  /api/users/          - List all users
GET  /api/users/me/       - Get current user
GET  /api/users/{id}/     - Get specific user
PUT  /api/users/{id}/     - Update user
DELETE /api/users/{id}/   - Delete user
```

### **Blood Requests**
```
GET  /api/requests/       - List all requests
POST /api/requests/       - Create new request
GET  /api/requests/{id}/  - Get specific request
PUT  /api/requests/{id}/  - Update request
DELETE /api/requests/{id}/ - Delete request
```

### **Admin**
```
GET /api/admin/pending-verifications/ - Get unverified users
```

## 🛠️ Managing Django Backend

### **Start Django Server**
```bash
cd backend_django
python manage.py runserver 5000
```

### **Create Admin User**
```bash
cd backend_django
python create_admin.py
```

### **Make Database Changes**
```bash
cd backend_django

# After modifying models.py
python manage.py makemigrations

# Apply changes to database
python manage.py migrate
```

### **View Database**
You can use SQLite browser tools to view the database:
- **DB Browser for SQLite** (free): https://sqlitebrowser.org/
- Open `backend_django/db.sqlite3` in the browser

## 📊 Database Schema

### **Users Table (api_user)**
- id, username, email, password (hashed)
- first_name, last_name, blood_type
- phone, city, age, weight
- verified, is_staff, is_superuser
- date_joined, last_login

### **Blood Requests Table (api_bloodrequest)**
- id, requester_id (foreign key)
- blood_type, quantity, urgency
- reason, hospital, city, phone
- latitude, longitude, status
- created_at, completed_at

### **Login Activity Table (api_loginactivity)**
- id, user_id (foreign key)
- action, ip, ua (user agent)
- timestamp, extra (JSON)

## ✅ Testing the Setup

### **Test 1: Register a User**
1. Go to http://localhost:3000/register
2. Fill in all fields
3. Click "Register"
4. You should be logged in automatically

### **Test 2: Check Database**
1. Go to http://localhost:5000/admin
2. Login with admin/admin123
3. Click "Users"
4. You should see your registered user

### **Test 3: Restart Server**
1. Stop the Django server (Ctrl+C)
2. Start it again: `python manage.py runserver 5000`
3. Go to http://localhost:3000/login
4. Login with your registered credentials
5. **It should work!** (Data persisted)

## 🎉 You're All Set!

Your blood donation platform now has:
- ✅ Persistent SQLite database
- ✅ Django backend with admin panel
- ✅ React frontend
- ✅ User authentication with JWT
- ✅ All data saved permanently
- ✅ Built-in admin interface

**No more losing data on restart!** 🎊

## 📱 Quick Access Links

- **Website**: http://localhost:3000
- **Django Admin**: http://localhost:5000/admin
- **API Health**: http://localhost:5000/api/health
- **Register**: http://localhost:3000/register
- **Login**: http://localhost:3000/login

## 🆘 Troubleshooting

### **"No such table" error?**
```bash
cd backend_django
python manage.py migrate
```

### **Can't login to Django admin?**
```bash
cd backend_django
python create_admin.py
```

### **Want to reset everything?**
```bash
cd backend_django
del db.sqlite3
python manage.py migrate
python create_admin.py
```

Enjoy your persistent database! 🚀
