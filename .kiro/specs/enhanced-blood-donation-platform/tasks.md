# Implementation Plan: Enhanced Blood Donation Platform

## Overview

This implementation plan transforms the existing blood donation platform into a unified system where users can both request and donate blood. The plan follows a logical progression: foundation (validation), data layer (models and migrations), API layer (endpoints), presentation layer (frontend components), and finally real-time features (WebSocket and location services).

The implementation builds incrementally, with each task validating functionality before moving forward. Testing tasks are marked as optional with `*` to allow for faster MVP delivery while maintaining code quality standards.

## Tasks

- [-] 1. Set up form validation foundation
  - [x] 1.1 Create backend validation utilities
    - Create `backend_django/api/validators.py` with phone, email, age, weight, blood type validators
    - Implement `phone_validator` using regex `^\d{10}$`
    - Implement `validate_coordinates()` for latitude/longitude validation
    - Implement `validate_blood_type_compatibility()` with compatibility matrix
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 12.2, 12.3, 4.1-4.9_
  
  - [ ]* 1.2 Write property tests for backend validators
    - **Property 1: Phone Number Validation** - For any string input, validator returns valid iff exactly 10 digits
    - **Property 2: Email Validation** - For any string input, validator returns valid iff matches email pattern
    - **Property 3: Age Validation** - For any numeric input, validator returns valid iff at least 18
    - **Property 4: Weight Validation** - For any numeric input, validator returns valid iff at least 50 kg
    - **Property 5: Blood Type Validation** - For any string input, validator returns valid iff in valid blood types list
    - **Property 6: Validation Error Messages** - For any invalid input, system returns non-empty error message
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6**

  - [ ] 1.3 Create frontend validation utilities
    - Create `client/src/utils/validators.js` with validation functions
    - Implement `validatePhone()`, `validateEmail()`, `validateAge()`, `validateWeight()` functions
    - Each function returns `{isValid: boolean, error: string | null}`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.8_
  
  - [ ]* 1.4 Write property tests for frontend validators
    - **Property 1-6: Same as backend** - Ensure frontend validation matches backend rules
    - **Property 7: Form Submission Prevention** - For any form with invalid field, system prevents submission
    - **Validates: Requirements 1.1-1.7**
  
  - [ ] 1.5 Create reusable ValidatedInput component
    - Create `client/src/components/ValidatedInput.jsx`
    - Accept props: type, value, onChange, onValidation
    - Display real-time validation feedback with error messages
    - Highlight invalid fields in red
    - _Requirements: 1.6, 1.7, 1.8_

- [ ] 2. Checkpoint - Verify validation utilities
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. Extend User model for unified system
  - [ ] 3.1 Create migration to add unified user fields
    - Create migration `0002_add_unified_user_fields.py`
    - Add fields: `is_available_to_donate`, `last_donation_date`, `current_latitude`, `current_longitude`, `location_sharing_enabled`, `location_updated_at`
    - Set appropriate defaults and null constraints
    - _Requirements: 2.1, 2.2, 6.1, 6.2, 11.1, 11.6, 12.6_
  
  - [ ] 3.2 Update User model with new fields and methods
    - Update `backend_django/api/models.py` User model
    - Apply phone_validator to phone field
    - Implement `can_donate()` method checking 90-day eligibility
    - Implement `update_location()` method
    - _Requirements: 1.1, 6.1, 6.2, 6.3, 12.6_
  
  - [ ]* 3.3 Write property tests for User model methods
    - **Property 13: Donation Eligibility Calculation** - User eligible iff never donated OR >90 days since last donation
    - **Validates: Requirements 6.1, 6.2, 6.3**

- [-] 4. Create new database models for matching and communication
  - [x] 4.1 Create DonorMatch model
    - Create migration `0003_create_donor_match_model.py`
    - Define DonorMatch with fields: request, donor, status, matched_at, completed_at, rating, feedback
    - Add unique_together constraint on (request, donor)
    - Implement `complete_donation()` and `cancel_match()` methods
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6, 16.1, 16.2, 16.3, 17.1_
  
  - [ ]* 4.2 Write property tests for DonorMatch model
    - **Property 9: Match Creation Updates Request Status** - When match created, request status changes to 'matched'
    - **Property 10: Match Timestamp Recording** - Newly created match has matched_at set to current time
    - **Property 11: Duplicate Match Prevention** - Creating second match for same donor/request pair results in error
    - **Property 12: Match Uniqueness Per Request** - Each blood request has at most one active match
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.6**

  - [x] 4.3 Create Message model
    - Create migration `0004_create_message_model.py`
    - Define Message with fields: match, sender, receiver, content, sent_at, read_at, is_read
    - Add ordering by sent_at
    - Add indexes on (match, sent_at) and (receiver, is_read)
    - Implement `mark_as_read()` method
    - _Requirements: 8.2, 8.4, 8.5, 8.6, 9.1, 9.3_
  
  - [ ]* 4.4 Write property tests for Message model
    - **Property 18: Message Persistence** - All sent messages stored with sender, receiver, content, timestamp
    - **Property 19: New Messages Are Unread** - Newly created messages have is_read=false
    - **Property 20: Message Read Status Update** - When receiver views message, is_read becomes true and read_at set
    - **Property 21: Message Chronological Ordering** - Messages ordered by sent_at ascending
    - **Validates: Requirements 8.2, 8.4, 8.5, 8.6, 9.1, 9.3**
  
  - [ ] 4.5 Create LocationShare model
    - Create migration `0005_create_location_share_model.py`
    - Define LocationShare with fields: match, user, latitude, longitude, shared_at, expires_at, is_active
    - Add ordering by -shared_at
    - Add index on (match, user, is_active)
    - Implement `is_expired()` and `deactivate()` methods
    - _Requirements: 12.1, 12.4, 12.5, 13.1, 13.4_
  
  - [ ]* 4.6 Write property tests for LocationShare model
    - **Property 24: Latitude Coordinate Validation** - Latitude accepted iff between -90 and 90
    - **Property 25: Longitude Coordinate Validation** - Longitude accepted iff between -180 and 180
    - **Property 26: Location Share Expiration Time** - New location share has expires_at = current time + 4 hours
    - **Property 27: Location Share Deactivation** - New location share deactivates previous shares for same user/match
    - **Property 29: Location Expiration Logic** - Location share expired iff current time > expires_at
    - **Validates: Requirements 12.2, 12.3, 12.4, 12.5, 13.1**

- [ ] 5. Add database indexes for performance
  - [ ] 5.1 Create migration for performance indexes
    - Create migration `0006_add_performance_indexes.py`
    - Add index on User (blood_type, is_available_to_donate)
    - Add index on BloodRequest (status)
    - Ensure all foreign keys are indexed
    - _Requirements: 25.6_

- [ ] 6. Checkpoint - Verify database models
  - Run migrations, ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement User Management API endpoints
  - [ ] 7.1 Update user registration endpoint with validation
    - Update `POST /api/auth/register/` in `backend_django/api/views.py`
    - Apply all validators to registration fields
    - Return specific error messages for validation failures
    - Generate JWT token on successful registration
    - _Requirements: 1.1-1.9, 20.1_
  
  - [ ] 7.2 Create user profile endpoints
    - Implement `GET /api/users/me/` to retrieve current user profile
    - Implement `PUT /api/users/me/` to update user profile with validation
    - Implement `PUT /api/users/me/location/` to update current location
    - Implement `POST /api/users/me/location/toggle/` to enable/disable location sharing
    - _Requirements: 11.1, 11.2, 11.3, 11.5, 12.6, 20.4_
  
  - [ ]* 7.3 Write unit tests for user management endpoints
    - Test registration with valid and invalid data
    - Test profile update with validation
    - Test location toggle functionality
    - _Requirements: 1.1-1.9, 11.1-11.6_

- [ ] 8. Implement Blood Request API endpoints
  - [ ] 8.1 Create blood request CRUD endpoints
    - Implement `POST /api/requests/` to create blood request with validation
    - Implement `GET /api/requests/` to list all blood requests
    - Implement `GET /api/requests/pending/` to list pending requests
    - Implement `GET /api/requests/{id}/` to get request details
    - Implement `PUT /api/requests/{id}/` to update request
    - Implement `DELETE /api/requests/{id}/` to cancel request
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [ ] 8.2 Implement blood type compatibility filtering
    - Add `get_compatible_donors()` method to BloodRequest model
    - Implement compatibility matrix logic for all blood type combinations
    - Filter donors by is_available_to_donate=True and can_donate()=True
    - Implement `GET /api/requests/{id}/compatible-donors/` endpoint
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_
  
  - [ ]* 8.3 Write property tests for blood type compatibility
    - **Property 8: Blood Type Compatibility Matrix** - Compatibility check returns true iff donor can safely donate to recipient
    - Test all 64 blood type combinations (8 donor types × 8 recipient types)
    - **Validates: Requirements 4.1-4.9**
  
  - [ ] 8.4 Implement search and filter functionality
    - Add query parameters for filtering by blood_type, city, urgency
    - Add sorting by created_at and distance (when location available)
    - Return count of matching requests
    - _Requirements: 29.1, 29.2, 29.3, 29.4, 29.5, 29.6_

- [ ] 9. Implement Matching API endpoints
  - [ ] 9.1 Create match creation endpoint
    - Implement `POST /api/matches/` to create match (donor accepts request)
    - Validate donor eligibility using can_donate()
    - Check for duplicate matches
    - Update request status to 'matched'
    - Create contact permissions for both users
    - Send notifications to both users
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.4, 7.2, 7.3_
  
  - [ ]* 9.2 Write property tests for match creation
    - **Property 14: Ineligible Donor Rejection** - User not eligible to donate cannot accept request
    - **Property 15: Donation Completion Updates Last Donation Date** - Completed donation updates donor's last_donation_date
    - **Property 16: Contact Information Privacy Before Match** - Pending request contact info not visible to non-matched users
    - **Property 17: Contact Information Visibility After Match** - Active match enables both users to view each other's contact info
    - **Validates: Requirements 6.4, 16.3, 7.1, 7.2, 7.3**
  
  - [ ] 9.3 Create match management endpoints
    - Implement `GET /api/matches/` to list user's matches
    - Implement `GET /api/matches/{id}/` to get match details with contact info
    - Implement `POST /api/matches/{id}/complete/` to mark donation completed
    - Implement `POST /api/matches/{id}/cancel/` to cancel match
    - Implement `POST /api/matches/{id}/rate/` to submit rating and feedback
    - _Requirements: 7.2, 7.3, 7.4, 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 18.1-18.6_
  
  - [ ]* 9.4 Write property tests for donation completion and cancellation
    - **Property 32: Donation Completion Status Update** - Completion changes match and request status to 'completed'
    - **Property 33: Completion Timestamp Recording** - Completed donation has completed_at set to current time
    - **Property 34: Match Cancellation Status Update** - Cancellation changes match to 'cancelled' and request back to 'pending'
    - **Validates: Requirements 16.1, 16.2, 16.4, 17.1, 17.2**

- [ ] 10. Implement Messaging API endpoints
  - [ ] 10.1 Create message endpoints
    - Implement `GET /api/matches/{match_id}/messages/` to retrieve message history with pagination (50 per page)
    - Implement `POST /api/matches/{match_id}/messages/` to send message
    - Implement `PUT /api/messages/{id}/read/` to mark message as read
    - Implement `GET /api/messages/unread/` to get unread message count
    - Validate sender and receiver are match participants
    - Prevent empty messages
    - _Requirements: 8.1, 8.2, 8.3, 8.7, 8.8, 8.9, 9.1, 9.2, 9.5_
  
  - [ ]* 10.2 Write property tests for messaging
    - **Property 22: Message Authorization** - System rejects message if sender/receiver not in active match
    - **Property 23: Empty Message Prevention** - System rejects messages with empty or whitespace-only content
    - **Validates: Requirements 8.7, 8.8**

- [ ] 11. Implement Location Sharing API endpoints
  - [ ] 11.1 Create location sharing endpoints
    - Implement `POST /api/matches/{match_id}/location/` to share location
    - Validate coordinates using validate_coordinates()
    - Set expiration time to 4 hours from current time
    - Deactivate previous location shares for user/match
    - Update user's current location fields
    - Rate limit to 6 updates per hour per user
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.8, 21.3_
  
  - [ ] 11.2 Create location retrieval endpoints
    - Implement `GET /api/matches/{match_id}/location/{user_id}/` to get user's active location
    - Implement `DELETE /api/matches/{match_id}/location/` to stop sharing location
    - Check location expiration before returning
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  
  - [ ]* 11.3 Write property tests for location sharing
    - **Property 28: Location Share Updates User Location** - Location share creation updates user's current_latitude, current_longitude, location_updated_at
    - **Property 30: Distance Calculation Symmetry** - distance(A,B) = distance(B,A)
    - **Property 31: Distance Non-Negativity** - Calculated distance always >= 0
    - **Validates: Requirements 12.6, 15.1**
  
  - [ ] 11.4 Implement distance calculation utility
    - Create `calculate_distance()` function using Haversine formula
    - Accept two coordinate pairs, return distance in kilometers
    - Add to location retrieval response
    - _Requirements: 15.1, 15.2_

- [ ] 12. Checkpoint - Verify all API endpoints
  - Test all endpoints with valid and invalid data, ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement authentication and authorization middleware
  - [ ] 13.1 Create JWT token validation middleware
    - Validate JWT signature on all protected endpoints
    - Check token expiration
    - Return appropriate errors for invalid/expired tokens
    - _Requirements: 20.2, 20.3, 20.8_
  
  - [ ] 13.2 Create authorization checks
    - Verify users can only access their own profile data
    - Verify users can only access matches they participate in
    - Verify users can only message in their matches
    - Verify users can only view shared locations in their matches
    - _Requirements: 20.4, 20.5, 20.6, 20.7_
  
  - [ ]* 13.3 Write property tests for authentication
    - **Property 35: JWT Token Validation** - System validates token signature before processing request
    - **Property 36: Expired Token Rejection** - System rejects requests with expired tokens
    - **Validates: Requirements 20.2, 20.3**

- [ ] 14. Implement API rate limiting
  - [ ] 14.1 Add rate limiting middleware
    - Install and configure django-ratelimit
    - Apply 100 requests/minute limit to general endpoints
    - Apply 10 messages/minute limit per match
    - Apply 6 location updates/hour per user
    - Apply 5 match attempts/hour per user
    - Return "Rate limit exceeded" with reset time
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6_

- [ ] 15. Implement input sanitization and security
  - [ ] 15.1 Add input sanitization
    - Sanitize message content to prevent XSS
    - Validate numeric inputs are within expected ranges
    - Validate string inputs don't exceed max length
    - Add Content Security Policy headers
    - _Requirements: 22.1, 22.3, 22.4_
  
  - [ ] 15.2 Configure CORS and security headers
    - Configure django-cors-headers for frontend domain
    - Set X-Frame-Options header
    - Enforce HTTPS in production settings
    - _Requirements: 23.1_

- [ ] 16. Create frontend registration and login pages
  - [ ] 16.1 Update registration page with validation
    - Update `client/src/pages/Register.jsx`
    - Use ValidatedInput components for phone and email
    - Apply real-time validation to all fields
    - Prevent form submission with invalid data
    - Display validation error messages
    - Store JWT token on successful registration
    - _Requirements: 1.1-1.9, 20.1_
  
  - [ ] 16.2 Update login page
    - Update `client/src/pages/Login.jsx`
    - Handle JWT token storage
    - Redirect to dashboard on success
    - Display error messages for invalid credentials
    - _Requirements: 20.1, 20.3_

- [ ] 17. Create unified dashboard component
  - [ ] 17.1 Create UnifiedDashboard component
    - Create `client/src/pages/UnifiedDashboard.jsx`
    - Display toggle between donor and recipient views
    - Show user's active blood requests in recipient view
    - Show available donation opportunities in donor view
    - Show active matches for both views
    - Display donation statistics and eligibility status
    - _Requirements: 2.7, 30.1, 30.2, 30.3, 30.4, 30.5, 30.6_
  
  - [ ] 17.2 Create blood request list components
    - Create `client/src/components/BloodRequestList.jsx`
    - Display blood requests with all details
    - Show compatibility indicator for donor view
    - Implement search and filter controls
    - Show distance when location available
    - _Requirements: 29.1-29.7_
  
  - [ ] 17.3 Create blood request form
    - Create `client/src/pages/CreateBloodRequest.jsx`
    - Use ValidatedInput for all fields
    - Capture location coordinates using browser geolocation API
    - Handle permission denied gracefully
    - _Requirements: 3.1-3.6, 10.5_

- [ ] 18. Create match detail and contact components
  - [ ] 18.1 Create MatchDetail component
    - Create `client/src/pages/MatchDetail.jsx`
    - Display both users' contact information (phone, email)
    - Show match status and timestamps
    - Provide buttons for: message, call, share location, complete, cancel
    - Display donation completion form with rating
    - _Requirements: 7.2, 7.3, 7.4, 16.1-16.6, 17.1-17.6, 18.1-18.6_
  
  - [ ] 18.2 Create ContactActions component
    - Create `client/src/components/ContactActions.jsx`
    - Implement click-to-call using tel: URI
    - Display phone number alongside call button
    - Show message button linking to chat
    - Show location sharing toggle
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 19. Checkpoint - Verify basic frontend functionality
  - Test registration, login, dashboard, blood request creation, ensure all tests pass, ask the user if questions arise.

- [ ] 20. Implement real-time messaging frontend
  - [ ] 20.1 Create ChatInterface component
    - Create `client/src/pages/ChatInterface.jsx`
    - Display message history with sender names and timestamps
    - Show read/unread indicators
    - Implement auto-scroll to latest messages
    - Show typing indicator area
    - Implement pagination for message history (50 per page)
    - _Requirements: 8.6, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_
  
  - [ ] 20.2 Create MessageInput component
    - Create `client/src/components/MessageInput.jsx`
    - Prevent sending empty messages
    - Show character count
    - Handle Enter key to send
    - Show sending status
    - _Requirements: 8.8_
  
  - [ ] 20.3 Integrate message API calls
    - Fetch message history on component mount
    - Send messages via POST endpoint
    - Mark messages as read when viewed
    - Handle network errors with retry
    - _Requirements: 8.1, 8.2, 8.3, 8.5, 24.2_

- [ ] 21. Implement WebSocket for real-time updates
  - [ ] 21.1 Set up Django Channels backend
    - Install channels and channels-redis
    - Configure channel layers in settings
    - Create `backend_django/api/routing.py` for WebSocket routing
    - _Requirements: 19.1_
  
  - [ ] 21.2 Create MatchConsumer for WebSocket
    - Create `backend_django/api/consumers.py`
    - Implement MatchConsumer with connect, disconnect, receive handlers
    - Verify user is match participant before connecting
    - Handle message.new, message.read, location.update, match.status events
    - Broadcast events to all connected participants
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.6_
  
  - [ ] 21.3 Integrate WebSocket in frontend
    - Install socket.io-client
    - Create `client/src/services/websocket.js` utility
    - Connect to WebSocket when opening match/chat
    - Listen for real-time events and update UI
    - Implement automatic reconnection on connection loss
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_
  
  - [ ]* 21.4 Write integration tests for WebSocket
    - Test message delivery via WebSocket
    - Test location update broadcasting
    - Test connection authorization
    - Test automatic reconnection
    - _Requirements: 19.1-19.6_

- [ ] 22. Implement Google Maps integration
  - [ ] 22.1 Set up Google Maps API
    - Obtain Google Maps API key
    - Configure API key in environment variables
    - Install @react-google-maps/api package
    - _Requirements: 14.1_
  
  - [ ] 22.2 Create LocationMap component
    - Create `client/src/components/LocationMap.jsx`
    - Use GoogleMap component from @react-google-maps/api
    - Display markers for both users when locations shared
    - Label current user as "You" and other user by role
    - Center map to show both locations
    - Handle cases where only one or no locations shared
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_
  
  - [ ] 22.3 Implement location sharing controls
    - Create location sharing toggle in MatchDetail
    - Request browser geolocation permission
    - Send location updates to API
    - Display permission denied message gracefully
    - Show location sharing status indicator
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 12.1, 12.7_
  
  - [ ] 22.4 Implement navigation functionality
    - Display calculated distance between users
    - Add "Navigate to location" button
    - Open Google Maps with directions on click
    - Format URL as `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}`
    - Open in new tab/window
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_
  
  - [ ] 22.5 Implement real-time location updates
    - Listen for location updates via WebSocket
    - Update map markers when location changes
    - Show "expired" indicator for expired locations
    - Refresh distance calculation on location update
    - _Requirements: 12.7, 13.1, 13.2, 13.3_

- [ ] 23. Implement notification system
  - [ ] 23.1 Create notification utility
    - Create `client/src/services/notifications.js`
    - Request browser notification permission
    - Implement showNotification() function
    - Handle permission denied gracefully
    - _Requirements: 28.1, 28.6_
  
  - [ ] 23.2 Add notification triggers
    - Notify on new message received
    - Notify when donor accepts blood request
    - Notify on match cancellation
    - Notify on match completion
    - Respect user notification preferences
    - _Requirements: 28.1, 28.2, 28.3, 28.4, 28.7_
  
  - [ ] 23.3 Create in-app notification display
    - Create notification badge for unread messages
    - Show notification count in dashboard
    - Display recent notifications list
    - _Requirements: 8.9_

- [ ] 24. Implement user profile and settings
  - [ ] 24.1 Create ProfileSettings component
    - Create `client/src/pages/ProfileSettings.jsx`
    - Display and allow editing of user profile fields
    - Use ValidatedInput for phone and email
    - Show donation history and statistics
    - Display eligibility status and days until next donation
    - _Requirements: 30.1, 30.2, 30.3, 30.4, 30.5, 30.6, 30.7_
  
  - [ ] 24.2 Add location sharing preferences
    - Add location sharing toggle in settings
    - Show current location sharing status
    - Explain location sharing in privacy context
    - _Requirements: 11.1, 11.2, 11.3_
  
  - [ ] 24.3 Implement data export and deletion
    - Add "Export my data" button
    - Add "Delete my account" button with confirmation
    - Implement data export API endpoint
    - Implement account deletion with data anonymization
    - _Requirements: 23.2, 23.3, 23.7_

- [ ] 25. Implement responsive design and mobile optimization
  - [ ] 25.1 Add responsive layouts
    - Update all components to use responsive Tailwind classes
    - Test layouts on screen sizes 320px to 2560px
    - Ensure touch-friendly button sizes (minimum 44x44px)
    - Handle portrait and landscape orientations
    - _Requirements: 26.1, 26.2, 26.3_
  
  - [ ] 25.2 Optimize for mobile devices
    - Use native dialer for phone calls on mobile
    - Use native permission dialogs for location
    - Optimize images and assets for mobile bandwidth
    - Test on actual mobile devices
    - _Requirements: 26.4, 26.5, 26.6_

- [ ] 26. Implement error handling and user feedback
  - [ ] 26.1 Create error handling utilities
    - Create `client/src/utils/errorHandler.js`
    - Map API errors to user-friendly messages
    - Handle network errors, validation errors, authorization errors
    - _Requirements: 24.1, 24.2, 24.3, 24.4_
  
  - [ ] 26.2 Add error display components
    - Create ErrorMessage component for inline errors
    - Create Toast notification component for global errors
    - Display specific validation errors on forms
    - Show recovery guidance for recoverable errors
    - _Requirements: 24.1, 24.6, 24.7_
  
  - [ ] 26.3 Implement backend error logging
    - Configure logging in Django settings
    - Log all errors with sufficient detail
    - Log security-related errors separately
    - Consider integrating Sentry for production
    - _Requirements: 22.6, 24.5_

- [ ] 27. Checkpoint - Verify complete feature set
  - Test end-to-end flows: registration → create request → match → message → location → complete, ensure all tests pass, ask the user if questions arise.

- [ ] 28. Performance optimization
  - [ ] 28.1 Optimize database queries
    - Add select_related() for User and BloodRequest in match queries
    - Add prefetch_related() for messages in chat
    - Verify all indexes are in place
    - Test query performance with sample data
    - _Requirements: 25.6_
  
  - [ ] 28.2 Implement caching
    - Install and configure Redis
    - Cache blood type compatibility matrix
    - Cache user profiles with 5-minute TTL
    - Cache location data with 5-minute TTL
    - _Requirements: 25.7_
  
  - [ ] 28.3 Optimize frontend performance
    - Implement code splitting for chat and maps components
    - Use React.memo for message components
    - Lazy load Google Maps component
    - Optimize bundle size
    - _Requirements: 25.4_
  
  - [ ]* 28.4 Performance testing
    - Test API response times (target <200ms for 95th percentile)
    - Test message delivery latency (target <500ms)
    - Test location update latency (target <1s)
    - Test page load time on 3G (target <2s)
    - **Validates: Requirements 25.1, 25.2, 25.3, 25.4**

- [ ] 29. Browser compatibility and testing
  - [ ] 29.1 Add browser compatibility checks
    - Test on Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
    - Add polyfills for older browser features
    - Display warning for unsupported browsers
    - Implement graceful degradation for missing features
    - _Requirements: 27.1, 27.2, 27.3, 27.4, 27.5, 27.6_
  
  - [ ]* 29.2 Cross-browser testing
    - Test all features on supported browsers
    - Test WebSocket connections on all browsers
    - Test geolocation on all browsers
    - Test notifications on all browsers
    - **Validates: Requirements 27.1-27.6**

- [ ] 30. Privacy and GDPR compliance
  - [ ] 30.1 Create privacy policy page
    - Create `client/src/pages/PrivacyPolicy.jsx`
    - Explain data collection and usage
    - Explain location sharing and consent
    - Explain data retention policies
    - _Requirements: 23.4, 23.5_
  
  - [ ] 30.2 Add consent mechanisms
    - Add location sharing consent dialog
    - Add notification permission request
    - Store consent preferences
    - _Requirements: 23.4, 28.6_
  
  - [ ] 30.3 Implement data anonymization
    - When user deletes account, anonymize their messages
    - Preserve conversation context for other users
    - Remove all personal identifiable information
    - _Requirements: 23.7_

- [ ] 31. Documentation and deployment preparation
  - [ ] 31.1 Update API documentation
    - Document all new API endpoints
    - Include request/response examples
    - Document WebSocket events
    - Document rate limits
  
  - [ ] 31.2 Create deployment configuration
    - Update settings for production (DEBUG=False)
    - Configure PostgreSQL database connection
    - Configure Redis for WebSocket channel layer
    - Set up environment variables
    - Configure CORS for production domain
    - Enable HTTPS enforcement
  
  - [ ] 31.3 Create deployment checklist
    - Document database migration steps
    - Document static file serving setup
    - Document Google Maps API key configuration
    - Document monitoring and logging setup
    - Document backup strategy

- [ ] 32. Final integration testing
  - [ ]* 32.1 End-to-end testing with Cypress
    - Test complete user journey: register → create request → match → message → location → complete
    - Test form validation prevents invalid submissions
    - Test real-time message delivery
    - Test location sharing and navigation
    - Test error handling and recovery
    - **Validates: All requirements**
  
  - [ ]* 32.2 Load and stress testing
    - Test with 100 concurrent users
    - Test WebSocket connection handling
    - Test database performance under load
    - Identify and fix bottlenecks
    - **Validates: Requirements 25.1-25.7**

- [ ] 33. Final checkpoint - Production readiness
  - Ensure all tests pass, verify all features work end-to-end, confirm deployment checklist complete, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional testing tasks that can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout implementation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation follows a logical progression: validation → data layer → API → frontend → real-time features
- All code examples use Python/Django for backend and JavaScript/React for frontend as specified in the design
- WebSocket implementation uses Django Channels for real-time communication
- Google Maps integration uses @react-google-maps/api library
- Authentication uses existing JWT implementation
- Database migrations are incremental and reversible
