# 🏗️ Blood Donation Application - Architecture & Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER INTERFACE (React)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Home Page    │  │ Auth Pages   │  │ Dashboard    │           │
│  │ (Hero)       │  │ (Login/Reg)  │  │ (Donor/User) │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Find Donors  │  │ Request      │  │ Profile      │           │
│  │ (Search)     │  │ Blood (Form) │  │ (Management) │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                   │
└────────────────────────────────────────────────────────────────┬─┘
                                                                 │
                        HTTP / REST API
                        (Axios + Socket.io)
                                                                 │
┌────────────────────────────────────────────────────────────────┴─┐
│                    EXPRESS.JS SERVER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              MIDDLEWARE LAYER                           │   │
│  │  • CORS    • JSON Parser    • Error Handler            │   │
│  │  • JWT Auth    • Socket.io    • Health Check          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  AUTH ROUTES     │  │  DONOR ROUTES    │  │ REQUEST      │  │
│  │  • Register      │  │  • Get Donors    │  │ ROUTES       │  │
│  │  • Login         │  │  • Nearby Search │  │ • Create     │  │
│  │  • Get User      │  │  • Update        │  │ • Update     │  │
│  │  • JWT Verify    │  │  • Register      │  │ • Delete     │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│                              ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           BUSINESS LOGIC LAYER                          │   │
│  │  • User Management    • Geolocation    • Status Update │   │
│  │  • Authentication     • Validation     • Search Logic  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                    DATABASE OPERATIONS
                              │
┌─────────────────────────────────────────────────────────────────┐
│                     MONGODB DATABASE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  USERS           │  │ BLOOD_REQUESTS   │  │ DONATIONS    │  │
│  │  COLLECTION      │  │ COLLECTION       │  │ COLLECTION   │  │
│  │                  │  │                  │  │              │  │
│  │ • name           │  │ • requester_id   │  │ • donor_id   │  │
│  │ • email          │  │ • blood_type     │  │ • recipient  │  │
│  │ • password       │  │ • quantity       │  │ • blood_type │  │
│  │ • blood_type     │  │ • urgency        │  │ • quantity   │  │
│  │ • location       │  │ • hospital       │  │ • status     │  │
│  │ • role           │  │ • status         │  │ • dates      │  │
│  │ • verified       │  │ • accepted_by    │  │ • notes      │  │
│  │ • last_donation  │  │ • location       │  │              │  │
│  │ • availability   │  │ • timestamps     │  │              │  │
│  │                  │  │                  │  │              │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Flow Diagram

### **RECIPIENT EMERGENCY WORKFLOW**

```
┌─────────────────┐
│   User Opens    │
│   Application   │
└────────┬────────┘
         │
         ↓
┌─────────────────────────┐
│   Home Page             │
│   - See blood groups    │
│   - Browse features     │
│   - Stats display       │
└────────┬────────────────┘
         │
         ↓
    [Login/Register]
         │
         ├──→ Already User ──→ Login
         │
         └──→ New User ──→ Register as "Recipient"
                         │
                         ↓
              [Fill Profile]
              • Blood Type
              • City
              • Contact
                         │
                         ↓
         ┌──────────────────────────┐
         │  Access Dashboard        │
         └────────┬─────────────────┘
                  │
         ┌────────┴─────────┐
         │                  │
         ↓                  ↓
    [Find Donors]    [Request Blood]
    • Search by type │ • Select blood type
    • View nearby    │ • Set quantity
    • Message donor  │ • Set urgency
         │           │ • Add reason
         │           │ • Hospital details
         │           │
         │           ↓
         │     [POST Request to API]
         │           │
         │           ↓
         │  [System Notifies Nearby Donors]
         │  via Socket.io
         │           │
         │           ↓
         │  [Donors See Notification]
         │           │
         │           ↓
         │  [Donors Accept/Respond]
         │           │
         │           ↓
         └──→ [Connection Made]
              • Donor contacts recipient
              • Arrange donation
              • Complete donation
```

### **DONOR WORKFLOW**

```
┌─────────────────┐
│   User Opens    │
│   Application   │
└────────┬────────┘
         │
         ↓
   [Register as Donor]
         │
         ↓
  [Complete Profile]
  • Blood Type
  • City
  • Age/Weight
  • Contact
         │
         ↓
    [Login]
         │
         ↓
┌──────────────────────┐
│   Donor Dashboard    │
│ • Statistics display │
│ • View my profile    │
│ • Edit availability  │
└────────┬─────────────┘
         │
         ↓
[See Nearby Blood Requests]
(Real-time via Socket.io)
         │
    ┌────┴────┐
    │          │
    ↓          ↓
 [Accept]   [Decline]
    │
    ↓
[Contact Recipient]
    │
    ↓
[Arrange Donation]
    │
    ↓
[Complete Donation]
    │
    ↓
[Update Status]
    │
    ↓
[Donation Recorded in History]
    │
    ↓
[Statistics Updated]
• Total donations +1
• Lives helped +3
```

---

## Data Flow Diagram

### **Authentication Flow**

```
┌──────────────────┐
│  User Registers  │
└────────┬─────────┘
         │
         ↓
┌──────────────────────────────┐
│ Submit Form (name, email,    │
│ password, phone, blood type) │
└────────┬─────────────────────┘
         │
         ↓ (Axios POST)
┌──────────────────────────────┐
│ Express Server               │
│ /api/auth/register           │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ Validate Input               │
│ Check if user exists         │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ Hash Password (bcryptjs)     │
│ Create User Document         │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ Save to MongoDB              │
│ users collection             │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ Generate JWT Token           │
│ (signed with secret)         │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ Return token + user info     │
│ to client                    │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ Store token in localStorage  │
│ Redirect to dashboard        │
└──────────────────────────────┘
```

### **Blood Request Flow**

```
┌──────────────────────┐
│ Recipient Creates    │
│ Blood Request        │
└────────┬─────────────┘
         │
         ↓
┌────────────────────────────────┐
│ Submit Request Form            │
│ • Blood type                   │
│ • Quantity                     │
│ • Urgency                      │
│ • Hospital                     │
│ • Location (lat/long)          │
└────────┬───────────────────────┘
         │
         ↓ (Axios POST with JWT)
┌────────────────────────────────┐
│ Express Server                 │
│ /api/requests (Protected)      │
└────────┬───────────────────────┘
         │
         ↓
┌────────────────────────────────┐
│ Verify JWT Token               │
│ Validate Input                 │
│ Set status to "pending"        │
└────────┬───────────────────────┘
         │
         ↓
┌────────────────────────────────┐
│ Create BloodRequest Document   │
│ Save to MongoDB                │
└────────┬───────────────────────┘
         │
         ↓
┌────────────────────────────────┐
│ Socket.io Event                │
│ Emit "blood_request" to all    │
│ connected donors               │
└────────┬───────────────────────┘
         │
         ↓
┌────────────────────────────────┐
│ Nearby Donors Receive          │
│ Real-time Notification         │
│ New blood request posted!      │
└────────┬───────────────────────┘
         │
         ↓
┌────────────────────────────────┐
│ Donor Views Request            │
│ Clicks "Respond"               │
└────────┬───────────────────────┘
         │
         ↓ (Axios PUT)
┌────────────────────────────────┐
│ Update Request Status          │
│ /api/requests/:id              │
│ • Status: "accepted"           │
│ • acceptedBy: donor_id         │
└────────┬───────────────────────┘
         │
         ↓
┌────────────────────────────────┐
│ Update MongoDB                 │
│ Request Status Changes         │
└────────┬───────────────────────┘
         │
         ↓
┌────────────────────────────────┐
│ Notify Recipient               │
│ A donor accepted your request! │
└────────────────────────────────┘
```

---

## Component Relationship Diagram

```
┌─────────────────┐
│   App.jsx       │
│  (Root)         │
└────────┬────────┘
         │
    ┌────┴─────────────────┬──────────┬──────────┐
    │                      │          │          │
    ↓                      ↓          ↓          ↓
┌────────────┐    ┌──────────────┐  ┌──────┐  ┌────────┐
│ Navbar     │    │ Routes       │  │      │  │ Footer │
│ (Shared)   │    │ (React       │  │      │  │        │
│            │    │  Router)     │  │      │  │        │
└────────────┘    └──────────────┘  │      │  └────────┘
                        │            │      │
        ┌───────────────┼────────┬──┴──────┴┐
        │               │        │          │
        ↓               ↓        ↓          ↓
    [Public]        [Protected] │      [Protected]
        │               │       │          │
    ┌──┴────┬─────┐     ├─────┬─┴─┐    ┌──┴──┐
    ↓       ↓     ↓     ↓     ↓   ↓    ↓     ↓
  Home   Login Register       FindDonors  RequestBlood
                          Dashboard Profile

    │
    └─ All pages use
       • Navbar (header)
       • Footer (shared)
       • Responsive layout
       • Tailwind CSS
```

---

## State Management Flow

```
User Authentication State
         │
    ┌────┴────────────────┐
    │                     │
    ↓                     ↓
Logged In State      Logged Out State
    │                     │
┌───┴─────────┐       ┌───┴──────┐
│             │       │          │
↓             ↓       ↓          ↓
Token      UserRole  Token=null  Role=null
Stored     (donor/    Redirect   Show
in LS      recipient) to Home    Login/Reg
           Access               Buttons
           Protected
           Routes
```

---

## Real-time Communication (Socket.io)

```
┌─────────────────────────────────────────────────────┐
│             REAL-TIME FEATURES                      │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ↓            ↓            ↓
    Blood Requests  Messages    Notifications
    Posted          Between     Status Updates
    Real-time       Donors &
    Notifications   Recipients
        │            │            │
        ↓            ↓            ↓
    Socket Events:
    • blood_request
    • send_message
    • receive_message
    • join_room
    • disconnect
```

---

## Security Architecture

```
┌──────────────────────────────────────────────┐
│          SECURITY LAYERS                     │
└────────────────────┬─────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ↓            ↓            ↓
    Frontend      Backend       Database
        │            │            │
    localStorage │  JWT Auth    │  Role-based
    Token        │  Middleware  │  Access
    Validation   │  Encrypted   │  User
                 │  Passwords   │  Verification
                 │  Input       │
                 │  Validation  │
```

---

This architecture provides:
- ✅ Scalability
- ✅ Security
- ✅ Real-time features
- ✅ Clean separation of concerns
- ✅ Maintainable code structure
- ✅ Easy to extend

**Your application is built with enterprise-level architecture!** 🚀
