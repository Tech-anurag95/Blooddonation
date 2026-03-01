# 🔐 Admin Page Access Guide

## 🚀 Quick Access to Admin Page

Your website is now running! Here's how to access the admin page:

### **Step 1: Create Admin Account**

**Option A: Using Browser (Easiest)**
1. Open your browser
2. Go to: `http://localhost:5000/api/auth/create-admin`
3. You'll see a JSON response with admin credentials

**Option B: Using Command (Copy and paste this in a new terminal)**
```bash
curl -X POST http://localhost:5000/api/auth/create-admin -H "Content-Type: application/json" -d "{\"name\":\"Admin\",\"email\":\"admin@blooddonation.com\",\"password\":\"admin123\"}"
```

**Default Admin Credentials Created:**
- Email: `admin@blooddonation.com`
- Password: `admin123`
- Role: `admin`

### **Step 2: Login as Admin**

1. Go to: `http://localhost:3000/login`
2. Enter:
   - Email: `admin@blooddonation.com`
   - Password: `admin123`
3. Click "Login"

### **Step 3: Access Admin Dashboard**

After logging in, go to:
```
http://localhost:3000/admin/data
```

## 📊 What You'll See on Admin Page

### **Dashboard Statistics**
- Total Users (donors + recipients + admins)
- Total Blood Requests (pending, completed, urgent)
- Total Donations
- Pending Verifications

### **Three Main Tabs**

#### 1️⃣ **Users Tab**
- View all registered users
- See user details: name, email, role, blood type, city
- Verify/reject users
- Edit user information
- Delete users
- Search by name, email, or phone

#### 2️⃣ **Blood Requests Tab**
- View all blood requests
- See request details: requester, blood type, quantity, urgency, hospital
- Edit request status (pending → accepted → completed)
- Change urgency level
- Delete requests
- Filter by status, urgency, blood type

#### 3️⃣ **Donations Tab**
- View all donations
- See donor and recipient information
- Track donation status
- Edit donation details
- Delete donation records

## 🎯 Admin Actions Available

### **User Management**
- ✅ **Verify Users** - Click the green checkmark icon
- ✏️ **Edit Users** - Click the blue edit icon
- 🗑️ **Delete Users** - Click the red trash icon
- 🔍 **Search Users** - Use the search bar at the top

### **Request Management**
- ✏️ **Edit Requests** - Change status, urgency, hospital details
- 🗑️ **Delete Requests** - Remove blood requests
- 🔍 **Filter Requests** - By status, urgency, blood type, city

### **Donation Management**
- ✏️ **Edit Donations** - Update status and notes
- 🗑️ **Delete Donations** - Remove donation records
- 📊 **Track History** - View complete donation history

## 🌐 All Admin URLs

```
Frontend (Website):
http://localhost:3000

Admin Login:
http://localhost:3000/login

Admin Data Management:
http://localhost:3000/admin/data

Admin Dashboard (Old):
http://localhost:3000/admin

Admin Audit Logs:
http://localhost:3000/admin/audit

Backend API:
http://localhost:5000/api

Create Admin Endpoint:
http://localhost:5000/api/auth/create-admin
```

## 🔒 Security Notes

- Only users with `role: 'admin'` can access admin pages
- All admin API endpoints require authentication
- JWT token is validated on every request
- Admin actions are logged for audit purposes

## 🧪 Test the Admin Page

### **Step-by-Step Test:**

1. **Create some test users** (register at http://localhost:3000/register):
   - User 1: donor@test.com (Donor, O+)
   - User 2: recipient@test.com (Recipient, A+)

2. **Login as admin** (http://localhost:3000/login):
   - Email: admin@blooddonation.com
   - Password: admin123

3. **Go to admin page** (http://localhost:3000/admin/data)

4. **Try these actions**:
   - Click "Users" tab → See your test users
   - Click "Edit" on a user → Change their blood type
   - Click "Verify" on an unverified user
   - Use the search bar to find users
   - Click "Refresh" to reload data

## 🎨 Admin Page Features

### **Statistics Cards** (Top of page)
- 📊 Total Users
- 📋 Total Requests  
- ❤️ Total Donations
- ⏳ Pending Verifications

### **Tab Navigation**
- Switch between Users, Requests, and Donations
- Each tab shows count in parentheses

### **Search & Filter**
- Search bar for quick lookup
- Refresh button to reload data
- Real-time filtering

### **Data Tables**
- Sortable columns
- Color-coded status badges
- Action buttons for each row
- Hover effects for better UX

### **Edit Modal**
- Pop-up form for editing
- Pre-filled with current data
- Save or Cancel options

## 🆘 Troubleshooting

### **Can't access admin page?**
1. Make sure you're logged in as admin
2. Check the URL: `http://localhost:3000/admin/data`
3. Clear browser cache and try again

### **"Admin access required" error?**
- You're not logged in as admin
- Login with: admin@blooddonation.com / admin123

### **Page is blank?**
1. Check if backend is running: http://localhost:5000/api/health
2. Check browser console (F12) for errors
3. Refresh the page

### **No data showing?**
- Register some test users first
- Create some blood requests
- Refresh the admin page

## ✅ You're All Set!

Your admin page is ready at:
```
http://localhost:3000/admin/data
```

Login with:
- Email: `admin@blooddonation.com`
- Password: `admin123`

Enjoy managing your blood donation platform! 🎉
