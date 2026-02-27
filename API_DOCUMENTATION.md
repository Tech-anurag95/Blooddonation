# Blood Donation App - Backend API Documentation

## API Endpoints Overview

### Base URL
```
http://localhost:5000/api
```

## Authentication Routes (`/auth`)

### 1. Register User
- **Method**: POST
- **Endpoint**: `/auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+1(555)123-4567",
    "bloodType": "O+",
    "city": "New York",
    "role": "recipient" // or "donor"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "recipient"
    }
  }
  ```

### 2. Login User
- **Method**: POST
- **Endpoint**: `/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**: Same as register

### 3. Get Current User
- **Method**: GET
- **Endpoint**: `/auth/me`
- **Access**: Private (requires Authorization header)
- **Header**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "success": true,
    "user": { ...user_data }
  }
  ```

---

## User Profile Routes (`/users`)

### 1. Get User Profile
- **Method**: GET
- **Endpoint**: `/users/:id`
- **Access**: Private
- **Response**:
  ```json
  {
    "success": true,
    "data": { ...user_data }
  }
  ```

### 2. Update User Profile
- **Method**: PUT
- **Endpoint**: `/users/:id`
- **Access**: Private
- **Request Body**: Any user fields to update
  ```json
  {
    "name": "Jane Doe",
    "phone": "+1(555)987-6543",
    "city": "Los Angeles"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "data": { ...updated_user }
  }
  ```

### 3. Delete User Account
- **Method**: DELETE
- **Endpoint**: `/users/:id`
- **Access**: Private
- **Response**:
  ```json
  {
    "success": true,
    "message": "Account deleted successfully"
  }
  ```

---

## Donor Routes (`/donors`)

### 1. Get All Donors
- **Method**: GET
- **Endpoint**: `/donors`
- **Access**: Public
- **Response**:
  ```json
  {
    "success": true,
    "count": 10,
    "data": [ { ...donor_data }, ... ]
  }
  ```

### 2. Get Nearby Donors
- **Method**: GET
- **Endpoint**: `/donors/nearby?bloodType=O+&latitude=40.7128&longitude=-74.0060&radius=50`
- **Access**: Public
- **Query Parameters**:
  - `bloodType` (optional): Blood type to filter by
  - `latitude` (optional): User's latitude
  - `longitude` (optional): User's longitude
  - `radius` (optional): Search radius in km (default: 50)
- **Response**:
  ```json
  {
    "success": true,
    "count": 5,
    "data": [ { ...nearby_donors }, ... ]
  }
  ```

### 3. Get Donor by ID
- **Method**: GET
- **Endpoint**: `/donors/:id`
- **Access**: Public
- **Response**:
  ```json
  {
    "success": true,
    "data": { ...donor_data }
  }
  ```

### 4. Register as Donor
- **Method**: POST
- **Endpoint**: `/donors/register`
- **Access**: Private
- **Request Body**:
  ```json
  {
    "bloodType": "O+",
    "age": 28,
    "weight": 70,
    "lastDonation": "2024-01-15"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Successfully registered as a donor",
    "data": { ...donor_data }
  }
  ```

### 5. Update Donor Profile
- **Method**: PUT
- **Endpoint**: `/donors/:id`
- **Access**: Private
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "age": 29,
    "weight": 65,
    "availableToDonate": true
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Donor profile updated",
    "data": { ...updated_donor }
  }
  ```

### 6. Get Donor's Donation History
- **Method**: GET
- **Endpoint**: `/donors/:id/donations`
- **Access**: Private
- **Response**:
  ```json
  {
    "success": true,
    "count": 5,
    "data": [ { ...donation_records }, ... ]
  }
  ```

### 7. Accept Blood Request
- **Method**: POST
- **Endpoint**: `/donors/accept-request`
- **Access**: Private
- **Request Body**:
  ```json
  {
    "requestId": "request_id_here"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Request accepted successfully",
    "data": { ...donation_record }
  }
  ```

---

## Blood Request Routes (`/requests`)

### 1. Get All Requests
- **Method**: GET
- **Endpoint**: `/requests`
- **Access**: Public
- **Response**:
  ```json
  {
    "success": true,
    "count": 20,
    "data": [ { ...request_data }, ... ]
  }
  ```

### 2. Get Pending Requests
- **Method**: GET
- **Endpoint**: `/requests/pending`
- **Access**: Public
- **Response**:
  ```json
  {
    "success": true,
    "count": 5,
    "data": [ { ...pending_requests }, ... ]
  }
  ```

### 3. Get Requests by User
- **Method**: GET
- **Endpoint**: `/requests/user/:userId`
- **Access**: Private
- **Response**:
  ```json
  {
    "success": true,
    "count": 3,
    "data": [ { ...user_requests }, ... ]
  }
  ```

### 4. Get Request by ID
- **Method**: GET
- **Endpoint**: `/requests/:id`
- **Access**: Public
- **Response**:
  ```json
  {
    "success": true,
    "data": { ...request_data }
  }
  ```

### 5. Create Blood Request
- **Method**: POST
- **Endpoint**: `/requests`
- **Access**: Private
- **Request Body**:
  ```json
  {
    "bloodType": "O+",
    "quantity": 2,
    "urgency": "urgent",
    "reason": "Emergency surgery",
    "hospital": "City General Hospital",
    "city": "New York",
    "phone": "+1(555)123-4567",
    "latitude": 40.7128,
    "longitude": -74.0060
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Blood request created successfully",
    "data": { ...request_data }
  }
  ```

### 6. Update Blood Request
- **Method**: PUT
- **Endpoint**: `/requests/:id`
- **Access**: Private
- **Request Body**:
  ```json
  {
    "status": "completed",
    "acceptedBy": "donor_id_here"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Request updated successfully",
    "data": { ...updated_request }
  }
  ```

### 7. Delete Blood Request
- **Method**: DELETE
- **Endpoint**: `/requests/:id`
- **Access**: Private (only requester can delete)
- **Response**:
  ```json
  {
    "success": true,
    "message": "Request deleted successfully"
  }
  ```

---

## Health Check

### Server Health
- **Method**: GET
- **Endpoint**: `/health`
- **Access**: Public
- **Response**:
  ```json
  {
    "status": "Server is running",
    "timestamp": "2024-01-25T10:30:00.000Z"
  }
  ```

---

## Error Handling

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description here"
}
```

Common HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (not authorized for this action)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

---

## Authentication

Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get a token by:
1. Registering a new user at `/auth/register`
2. Logging in at `/auth/login`

Store the token in `localStorage` with key `token`.

---

## Frontend Integration

The frontend uses the `api.js` service file that handles:
- Base URL configuration
- Authorization header injection
- Token management
- Error handling

Example usage in components:
```javascript
import { authAPI, donorAPI, requestAPI } from '../services/api';

// Login
const response = await authAPI.login(email, password);

// Get nearby donors
const donors = await donorAPI.getNearbyDonors(bloodType);

// Create request
const request = await requestAPI.createRequest(requestData);
```

---

## Socket.io Events (Real-time)

### Client Events
- `join_room`: Join a chat room
- `send_message`: Send a message to a room
- `blood_request`: Broadcast a new blood request
- `donor_available`: Update donor availability status

### Server Events (listen for)
- `message`: Receive a message
- `receive_message`: New message in room
- `new_blood_request`: New blood request created
- `donor_status`: Donor availability changed

---

## Development

To start the server:
```bash
cd server
npm run dev
```

Server will run on `http://localhost:5000`

MongoDB must be running on `mongodb://localhost:27017`

---

## Production Deployment

Update `.env` variables:
```
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=your_frontend_production_url
PORT=5000
```

Then deploy using:
```bash
npm start
```
