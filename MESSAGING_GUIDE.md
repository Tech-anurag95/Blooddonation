# Messaging Feature Guide

## Overview
The messaging feature allows donors and recipients to communicate after they've been matched through a blood request.

## How It Works

### 1. Create a Blood Request
- Navigate to "Request Blood" in the navbar
- Fill out the blood request form with required details
- Submit the request

### 2. Donor Accepts Request
- Donors can view available blood requests in "Find Donors"
- When a donor clicks "Request Blood" on a donor profile, they accept the request
- This creates a "match" between the donor and recipient

### 3. View Matches
- Click "Matches" in the navbar to see all your active matches
- Each match shows:
  - Donor and recipient usernames
  - Blood type and location
  - Hospital information
  - Match status (active, completed, cancelled)

### 4. Start Messaging
- From the Matches page, click the "Chat" button on any active match
- This opens the chat interface where you can send messages
- Messages are delivered in real-time (polling every 3 seconds)
- Messages are automatically marked as read when viewed

### 5. Complete or Cancel Match
- From the Matches page, you can:
  - Click "Complete" to mark the donation as completed
  - Click "Cancel" to cancel the match (requires a reason)

## Features

### Chat Interface
- Real-time message delivery
- Auto-scroll to latest messages
- Read/unread indicators
- Sender identification (You vs other user's name)
- Timestamps for each message

### Match Management
- View all matches in one place
- Filter by status (active, completed, cancelled)
- Quick access to chat from matches list
- Complete or cancel matches with one click

## Navigation Flow

```
Find Donors → View Matches → Chat with Matched Users
     ↓              ↓                    ↓
Request Blood → Match Created → Send Messages
```

## Important Notes

1. You can only message users you're matched with
2. Matches are created when a donor accepts a blood request
3. Both donor and recipient can complete or cancel a match
4. Messages are preserved even after match completion
5. The "View Matches" button in Find Donors redirects to the Matches page

## API Endpoints Used

- `GET /api/matches/` - List all matches
- `GET /api/matches/:id/` - Get match details
- `POST /api/matches/` - Create a match
- `POST /api/matches/:id/complete/` - Complete a match
- `POST /api/matches/:id/cancel/` - Cancel a match
- `GET /api/messages/?match_id=:id` - Get messages for a match
- `POST /api/messages/` - Send a message
- `POST /api/messages/:id/mark_read/` - Mark message as read

## Database Models

### DonorMatch
- Links a blood request with a donor
- Tracks match status (active, completed, cancelled)
- Records timestamps for matching and completion
- Stores rating and feedback

### Message
- Links to a DonorMatch
- Stores sender, receiver, content
- Tracks read status and timestamps
- Ordered chronologically

## Next Steps

To enhance the messaging feature further, consider:
1. Implementing WebSocket for real-time updates (no polling)
2. Adding typing indicators
3. Adding message notifications
4. Adding file/image sharing
5. Adding location sharing within chat
6. Adding call functionality from chat interface
