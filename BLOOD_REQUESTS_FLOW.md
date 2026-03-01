# Blood Requests Flow - How It Works

## ✅ New Feature: Blood Requests Dashboard

After logging in, you'll now see a **Blood Requests** page that shows all blood donation requests. This is the main page where donors can see who needs blood and choose to donate.

## How It Works

### 1. Login
- Go to http://localhost:3000/login
- Enter your credentials (e.g., `test@test.com` / `test123`)
- Click Login

### 2. View Blood Requests
After login, you'll be redirected to the **Blood Requests** page where you can see:

- **All pending blood requests** from people who need blood
- **Complete information** about each request:
  - Blood type needed
  - Requester's name
  - Hospital name and location
  - City
  - Contact information (phone, email)
  - Urgency level (Critical, High, Medium, Low)
  - Quantity needed
  - Reason for request
  - Date requested

### 3. Filter Requests
You can filter requests by status:
- **All Requests** - See everything
- **Pending** - Requests waiting for donors
- **Matched** - Requests that have found donors
- **Completed** - Finished donations

### 4. Donate Blood
When you see a request you want to help with:
1. Click the **"Donate Blood"** button on that request
2. Confirm your decision
3. You'll be matched with the recipient
4. You'll be redirected to the **Matches** page
5. From there, you can **message** the recipient to coordinate

### 5. Communicate
After accepting a request:
- Go to **Matches** page to see your active donations
- Click **"Chat"** to message the recipient
- Coordinate pickup/delivery details
- Share location if needed
- Complete the donation when done

## Complete Flow Diagram

```
Login
  ↓
Blood Requests Page (See all requests)
  ↓
Choose a request → Click "Donate Blood"
  ↓
Match Created
  ↓
Matches Page (See your active donations)
  ↓
Chat with Recipient
  ↓
Complete Donation
```

## Navigation Menu

After login, you'll see these options in the navbar:
- **Blood Requests** - Main page to see all requests (NEW!)
- **Find Donors** - Search for donors by blood type
- **Request Blood** - Create your own blood request
- **Matches** - See your active donations and requests
- **Profile** - Update your information
- **Logout** - Sign out

## Example Scenario

### As a Donor:
1. **Login** with your account
2. **See Blood Requests** - You see someone needs O+ blood urgently
3. **Read Details** - Hospital: City Hospital, City: Mumbai, Urgency: Critical
4. **Click "Donate Blood"** - You accept the request
5. **Go to Matches** - See your new match
6. **Click "Chat"** - Message the recipient
7. **Coordinate** - Arrange when and where to donate
8. **Complete** - Mark donation as complete when done

### As a Recipient:
1. **Login** with your account
2. **Click "Request Blood"** - Fill out the form
3. **Wait** - Your request appears on the Blood Requests page
4. **Get Matched** - A donor accepts your request
5. **Go to Matches** - See who's donating
6. **Click "Chat"** - Message the donor
7. **Coordinate** - Arrange pickup/delivery
8. **Complete** - Mark as complete when received

## Request Information Displayed

Each blood request shows:

### Header
- Blood type (large, prominent)
- Status badge (Pending/Matched/Completed)
- Urgency badge (Critical/High/Medium/Low)

### Details
- Requester's name
- Reason for request
- Hospital name
- City/Location
- Quantity needed
- Contact phone
- Contact email
- Date requested

### Actions
- **"Donate Blood"** button (for pending requests)
- Status indicator (for matched/completed requests)

## Urgency Levels

Requests are marked with urgency:
- **Critical** - Red badge, urgent message, needs immediate attention
- **High** - Orange badge, important
- **Medium** - Yellow badge, moderate priority
- **Low** - Green badge, can wait

## Status Flow

A blood request goes through these statuses:
1. **Pending** - Waiting for a donor
2. **Matched** - Donor has accepted
3. **Completed** - Donation finished

## Features

### For Donors:
- ✅ See all blood requests in one place
- ✅ Filter by status
- ✅ View complete information before deciding
- ✅ One-click to accept and donate
- ✅ Message recipients after matching
- ✅ Track your donations in Matches page

### For Recipients:
- ✅ Create blood requests
- ✅ See when someone accepts
- ✅ Message donors
- ✅ Track request status
- ✅ Complete when received

## Testing the Flow

### Create a Test Request:
1. Login as one user (e.g., `test@test.com`)
2. Click "Request Blood"
3. Fill out the form:
   - Blood Type: O+
   - Quantity: 1
   - Urgency: High
   - Hospital: Test Hospital
   - City: Test City
   - Phone: 1234567890
   - Reason: Medical emergency
4. Submit

### Accept as Another User:
1. Logout
2. Login as different user (e.g., `shivam@gmail.com` / `shivam123`)
3. You'll see the Blood Requests page
4. Find the request you just created
5. Click "Donate Blood"
6. Confirm
7. You'll be redirected to Matches
8. Click "Chat" to message

### Complete the Donation:
1. From Matches page
2. Click "Complete" button
3. Confirm
4. Donation marked as completed

## Benefits of This Flow

1. **Clear Overview** - See all requests at once
2. **Informed Decision** - All information before accepting
3. **Easy Communication** - Built-in messaging
4. **Status Tracking** - Know where each request stands
5. **Urgency Awareness** - Critical requests stand out
6. **Simple Process** - One click to donate

## What's Next

After accepting a request, you can:
- Message the recipient
- Share your location
- Coordinate pickup/delivery
- Complete the donation
- Rate the experience

## Summary

The new Blood Requests page is now your main dashboard after login. It shows all blood donation requests with complete information, making it easy to choose which requests to help with. Simply click "Donate Blood" on any request, and you'll be matched with the recipient to coordinate the donation.

This creates a smooth flow: Login → See Requests → Choose to Donate → Message Recipient → Complete Donation.
