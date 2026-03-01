# Admin Data Management System - Setup Guide

## 🎉 New Feature: Complete Admin Dashboard

You now have a comprehensive admin dashboard where you can view, edit, and delete ALL data in your blood donation platform!

## 🚀 Quick Setup

### Step 1: Create Admin User

First, create an admin account by making a POST request to:

```
POST http://localhost:5000/api/auth/create-admin
```

**Body (JSON):**
```json
{
  "name": "Admin User",
  "email": "admin@blooddonation.com",
  "password": "admin123"
}
```

**Or use default values** (just send empty POST request):
- Email: `admin@blooddonation.com`
- Password: `admin123`

### Step 2: Login as Admin

1. Go to: http://localhost:3000/login
2. Email: `admin@blooddonation.com`
3. Password: `admin123`
4. Select role: **Admin** (if available) or login normally

### Step 3: Access Admin Dashboard

Go to: **http://localhost:3000/admin/data**

## ✨ Features

### 📊 Dashboard Overview
- Total users, donors, recipients
- Total blood requests (pending, completed, urgent)
- Total donations
- Pending verifications count

### 👥 User Management
- **View all users** with filters (role, verified status, blood type, city)
- **Search users** by name, email, or phone
- **Edit user details**: name, email, role, blood type, city, verification status
- **Verify/Reject users** with one click
- **Delete users** (also deletes their requests and donations)
- **Bulk operations**: Verify multiple users, bulk delete

### 🩸 Blood Request Management
- **View all requests** with filters (status, urgency, blood type, city)
- **Edit requests**: Change status, urgency, hospital details
- **Delete requests**
- **Track request status**: pending, accepted, completed, cancelled
- **See requester and donor details**

### ❤️ Donation Management
- **View all donations** with filters
- **Edit donation status** and notes
- **Delete donations**
- **Track donor and recipient information**

## 🔐 API Endpoints

### Admin Dashboard
```
GET /api/admin/dashboard - Get statistics
```

### User Management
```
GET /api/admin/users - Get all users (with filters)
GET /api/admin/users/:id - Get single user
PUT /api/admin/users/:id - Update user
DELETE /api/admin/users/:id - Delete user
PUT /api/admin/users/:id/verify - Verify/reject user
POST /api/admin/bulk-verify - Bulk verify users
POST /api/admin/bulk-delete-users - Bulk delete users
```

### Request Management
```
GET /api/admin/requests - Get all requests (with filters)
PUT /api/admin/requests/:id - Update request
DELETE /api/admin/requests/:id - Delete request
```

### Donation Management
```
GET /api/admin/donations - Get all donations (with filters)
PUT /api/admin/donations/:id - Update donation
DELETE /api/admin/donations/:id - Delete donation
```

## 🎨 UI Features

### Tabs
- **Users Tab**: Manage all users
- **Blood Requests Tab**: Manage all blood requests
- **Donations Tab**: Manage all donations

### Actions
- ✅ **Verify** - Verify unverified users
- ✏️ **Edit** - Edit any record
- 🗑️ **Delete** - Delete any record
- 🔍 **Search** - Search across all data
- 🔄 **Refresh** - Reload data

### Filters
- Filter by role (donor/recipient/admin)
- Filter by verification status
- Filter by blood type
- Filter by city
- Filter by status (for requests/donations)
- Filter by urgency (for requests)

## 📱 How to Use

1. **Login as admin** at http://localhost:3000/login
2. **Navigate to** http://localhost:3000/admin/data
3. **Select a tab** (Users, Requests, or Donations)
4. **Use search** to find specific records
5. **Click Edit** to modify any record
6. **Click Delete** to remove any record
7. **Click Verify** to verify users

## 🔒 Security

- All admin routes require authentication
- Only users with `role: 'admin'` can access admin endpoints
- JWT token validation on every request
- Middleware checks admin status before allowing operations

## 💡 Tips

- Use the search bar to quickly find users by name, email, or phone
- The statistics cards update automatically when you make changes
- Deleting a user also deletes all their requests and donations
- You can change user roles (donor ↔ recipient ↔ admin)
- Verify users to allow them full access to the platform

## 🎯 Next Steps

1. Create your admin account
2. Login and explore the dashboard
3. Add some test users, requests, and donations
4. Try editing and deleting records
5. Use filters and search to find specific data

Enjoy your new admin dashboard! 🎉
