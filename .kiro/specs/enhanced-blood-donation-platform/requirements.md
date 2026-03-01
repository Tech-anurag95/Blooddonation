# Requirements Document: Enhanced Blood Donation Platform

## Introduction

This document specifies the functional and non-functional requirements for enhancing an existing blood donation platform. The enhancement transforms the system from a role-based architecture (separate donors and recipients) into a unified user system where every user can both request and donate blood. The system adds real-time communication capabilities (messaging and calling), live location sharing with Google Maps integration, comprehensive form validation, and an intelligent matching system that connects blood donors with recipients based on compatibility and availability.

The platform maintains the existing Django REST Framework backend with JWT authentication and React frontend while adding new capabilities to support bidirectional interactions, real-time updates, and location-based features.

## Glossary

- **System**: The Enhanced Blood Donation Platform (backend and frontend combined)
- **User**: Any registered person who can both request blood and donate blood
- **Donor**: A User who accepts a blood request and commits to donating blood
- **Recipient**: A User who creates a blood request seeking blood donation
- **Blood_Request**: A formal request for blood donation with specific blood type and location
- **Match**: A connection between a Donor and Recipient after the Donor accepts a Blood_Request
- **Validator**: The form validation component that checks input data
- **Message_System**: The real-time messaging component for matched users
- **Location_Service**: The component managing live location sharing and navigation
- **Authentication_Service**: The JWT-based authentication system
- **Database**: The SQLite (development) or PostgreSQL (production) data store
- **Compatible_Blood_Type**: A blood type that can be safely donated to another blood type per medical compatibility rules
- **Active_Match**: A Match with status 'active' where both parties can communicate
- **Location_Share**: A time-limited sharing of a User's geographic coordinates
- **WebSocket_Connection**: A persistent bidirectional connection for real-time updates

## Requirements

### Requirement 1: User Registration with Validation

**User Story:** As a new user, I want to register with validated contact information, so that I can create a verified account for blood donation activities.

#### Acceptance Criteria

1. WHEN a user submits a phone number, THE Validator SHALL accept it if and only if it contains exactly 10 digits
2. WHEN a user submits an email address, THE Validator SHALL accept it if and only if it matches the pattern `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
3. WHEN a user submits an age value, THE Validator SHALL accept it if and only if the age is at least 18 years
4. WHEN a user submits a weight value, THE Validator SHALL accept it if and only if the weight is at least 50 kg
5. WHEN a user submits a blood type, THE Validator SHALL accept it if and only if it is one of: O+, O-, A+, A-, B+, B-, AB+, AB-
6. WHEN validation fails for any field, THE System SHALL display a specific error message describing the validation rule
7. WHEN any field contains invalid data, THE System SHALL prevent form submission
8. WHEN a user corrects invalid input, THE System SHALL provide real-time validation feedback
9. WHEN registration is successful, THE Authentication_Service SHALL generate a JWT token and return it to the user

### Requirement 2: Unified User System

**User Story:** As a user, I want a single account that allows me to both request blood and donate blood, so that I can participate in the platform without managing multiple roles.

#### Acceptance Criteria

1. THE System SHALL allow every User to create blood requests
2. THE System SHALL allow every User to accept blood requests from other users
3. WHEN a User creates a blood request, THE System SHALL store the User as the requester
4. WHEN a User accepts a blood request, THE System SHALL store the User as the donor
5. THE System SHALL allow a User to have multiple active blood requests simultaneously
6. THE System SHALL allow a User to have multiple active donations simultaneously
7. THE System SHALL provide a unified dashboard showing both donation opportunities and the User's own blood requests

### Requirement 3: Blood Request Creation

**User Story:** As a user needing blood, I want to create a detailed blood request, so that potential donors can find and respond to my need.

#### Acceptance Criteria

1. WHEN a User creates a blood request, THE System SHALL require blood type, quantity, urgency level, reason, hospital name, city, phone number, and location coordinates
2. WHEN a blood request is created, THE System SHALL set its status to 'pending'
3. WHEN a blood request is created, THE System SHALL store the creation timestamp
4. THE System SHALL validate all blood request fields using the same validation rules as user registration
5. WHEN a blood request is successfully created, THE System SHALL make it visible to compatible donors
6. THE System SHALL allow the requester to update or cancel their blood request while it has status 'pending'

### Requirement 4: Blood Type Compatibility Matching

**User Story:** As a donor, I want to see only blood requests that match my blood type compatibility, so that I can donate safely and effectively.

#### Acceptance Criteria

1. WHEN a User with blood type O- views available requests, THE System SHALL show requests for all blood types (O-, O+, A-, A+, B-, B+, AB-, AB+)
2. WHEN a User with blood type O+ views available requests, THE System SHALL show requests for blood types O+, A+, B+, AB+
3. WHEN a User with blood type A- views available requests, THE System SHALL show requests for blood types A-, A+, AB-, AB+
4. WHEN a User with blood type A+ views available requests, THE System SHALL show requests for blood types A+, AB+
5. WHEN a User with blood type B- views available requests, THE System SHALL show requests for blood types B-, B+, AB-, AB+
6. WHEN a User with blood type B+ views available requests, THE System SHALL show requests for blood types B+, AB+
7. WHEN a User with blood type AB- views available requests, THE System SHALL show requests for blood types AB-, AB+
8. WHEN a User with blood type AB+ views available requests, THE System SHALL show requests for blood type AB+
9. THE System SHALL NOT display blood requests to donors with incompatible blood types

### Requirement 5: Donor Matching Process

**User Story:** As a donor, I want to accept blood requests that I can fulfill, so that I can help recipients in need.

#### Acceptance Criteria

1. WHEN a Donor accepts a pending Blood_Request, THE System SHALL create an Active_Match linking the Donor and Recipient
2. WHEN an Active_Match is created, THE System SHALL change the Blood_Request status from 'pending' to 'matched'
3. WHEN an Active_Match is created, THE System SHALL record the match timestamp
4. WHEN a Donor attempts to accept a Blood_Request they already matched with, THE System SHALL reject the request with error "Match already exists"
5. WHEN a Donor attempts to accept a Blood_Request that is no longer pending, THE System SHALL reject the request with error "Request not available"
6. THE System SHALL enforce that each Blood_Request can have at most one Active_Match
7. WHEN an Active_Match is created, THE System SHALL notify both the Donor and Recipient

### Requirement 6: Donation Eligibility Tracking

**User Story:** As a system administrator, I want to enforce donation eligibility rules, so that donors' health is protected according to medical guidelines.

#### Acceptance Criteria

1. WHEN a User has never donated before, THE System SHALL consider them eligible to donate
2. WHEN a User's last donation date is more than 90 days ago, THE System SHALL consider them eligible to donate
3. WHEN a User's last donation date is 90 days ago or less, THE System SHALL consider them ineligible to donate
4. WHEN an ineligible User attempts to accept a blood request, THE System SHALL reject the request with error "Must wait 90 days between donations"
5. WHEN a donation is completed, THE System SHALL update the Donor's last donation date to the current date
6. THE System SHALL display the number of days remaining until a User becomes eligible again

### Requirement 7: Contact Information Visibility

**User Story:** As a matched user, I want to see the other person's contact information after matching, so that I can coordinate the blood donation.

#### Acceptance Criteria

1. WHEN a Blood_Request has status 'pending', THE System SHALL hide the Recipient's phone number and email from all other users
2. WHEN an Active_Match exists, THE System SHALL display the Recipient's phone number and email to the Donor
3. WHEN an Active_Match exists, THE System SHALL display the Donor's phone number and email to the Recipient
4. WHEN a Match status changes to 'cancelled' or 'completed', THE System SHALL continue to display contact information for historical reference
5. THE System SHALL NOT display contact information between users who are not matched

### Requirement 8: Real-Time Messaging System

**User Story:** As a matched user, I want to send and receive messages with the other person in real-time, so that we can coordinate donation logistics.

#### Acceptance Criteria

1. WHEN an Active_Match exists, THE System SHALL enable both the Donor and Recipient to send messages to each other
2. WHEN a User sends a message, THE Message_System SHALL store the message content, sender, receiver, and timestamp
3. WHEN a message is sent, THE Message_System SHALL deliver it to the receiver in real-time via WebSocket_Connection
4. WHEN a message is delivered, THE System SHALL initially mark it as unread
5. WHEN a receiver views a message, THE System SHALL mark it as read and record the read timestamp
6. THE Message_System SHALL display messages in chronological order based on sent timestamp
7. WHEN a User attempts to send a message to a non-matched User, THE System SHALL reject the request with error "Can only message matched users"
8. THE System SHALL prevent sending empty messages
9. WHEN a User has unread messages, THE System SHALL display an unread message count indicator

### Requirement 9: Message History and Persistence

**User Story:** As a matched user, I want to access our complete message history, so that I can review previous conversations and coordination details.

#### Acceptance Criteria

1. THE System SHALL store all messages permanently in the Database
2. WHEN a User opens a chat interface, THE System SHALL retrieve and display all messages for that Match
3. THE System SHALL display messages with sender name, content, and timestamp
4. THE System SHALL indicate which messages are read and which are unread
5. THE System SHALL implement pagination for message history, loading 50 messages per page
6. WHEN new messages arrive, THE System SHALL automatically append them to the chat interface
7. THE System SHALL auto-scroll to the latest message when new messages arrive

### Requirement 10: Click-to-Call Functionality

**User Story:** As a matched user, I want to call the other person directly from the platform, so that I can have voice conversations for urgent coordination.

#### Acceptance Criteria

1. WHEN an Active_Match exists, THE System SHALL display a call button for both users
2. WHEN a User clicks the call button, THE System SHALL initiate a phone call using the device's native dialer
3. THE System SHALL format the phone number as a tel: URI for click-to-call functionality
4. WHEN a User is not matched with another User, THE System SHALL NOT display call functionality
5. THE System SHALL display the other User's phone number alongside the call button

### Requirement 11: Location Sharing Enablement

**User Story:** As a user, I want to control whether I share my location, so that I can maintain privacy when desired.

#### Acceptance Criteria

1. THE System SHALL provide a location sharing toggle in user settings
2. WHEN a User enables location sharing, THE System SHALL set location_sharing_enabled to true
3. WHEN a User disables location sharing, THE System SHALL set location_sharing_enabled to false and deactivate all active Location_Shares
4. WHEN location sharing is disabled, THE System SHALL prevent the User from sharing their location
5. WHEN a User attempts to share location while location_sharing_enabled is false, THE System SHALL reject the request with error "Location sharing is disabled"
6. THE System SHALL default location_sharing_enabled to false for new users

### Requirement 12: Live Location Sharing

**User Story:** As a matched user, I want to share my current location with the other person, so that they can navigate to meet me for the blood donation.

#### Acceptance Criteria

1. WHEN a User shares their location, THE Location_Service SHALL capture latitude and longitude coordinates
2. WHEN location coordinates are provided, THE System SHALL validate that latitude is between -90 and 90 degrees
3. WHEN location coordinates are provided, THE System SHALL validate that longitude is between -180 and 180 degrees
4. WHEN a User shares location, THE System SHALL create a Location_Share with an expiration time of 4 hours from the current time
5. WHEN a new Location_Share is created for a User and Match, THE System SHALL deactivate all previous Location_Shares for that User and Match
6. WHEN a Location_Share is created, THE System SHALL update the User's current_latitude, current_longitude, and location_updated_at fields
7. WHEN a Location_Share is created, THE System SHALL send a real-time update to the other matched User via WebSocket_Connection
8. THE System SHALL limit location updates to once per minute per User to reduce server load

### Requirement 13: Location Expiration and Deactivation

**User Story:** As a user, I want location shares to expire automatically, so that my location is not shared indefinitely.

#### Acceptance Criteria

1. WHEN the current time exceeds a Location_Share's expires_at timestamp, THE System SHALL consider the Location_Share expired
2. WHEN a Location_Share is expired, THE System SHALL NOT display it as the User's current location
3. WHEN a User views an expired Location_Share, THE System SHALL display an "expired" indicator
4. WHEN a User manually stops sharing location, THE System SHALL set is_active to false for their current Location_Share
5. THE System SHALL automatically deactivate Location_Shares when they expire

### Requirement 14: Google Maps Integration

**User Story:** As a matched user, I want to see both our locations on a map, so that I can visualize the distance and plan the meeting.

#### Acceptance Criteria

1. WHEN both users in a Match have shared their locations, THE System SHALL display both locations on a Google Map
2. THE System SHALL display the current User's location with a "You" marker
3. THE System SHALL display the other User's location with their role label (Donor or Recipient)
4. THE System SHALL center the map to show both locations
5. WHEN only one User has shared location, THE System SHALL display only that location on the map
6. WHEN neither User has shared location, THE System SHALL display a message "No locations shared yet"

### Requirement 15: Distance Calculation and Navigation

**User Story:** As a matched user, I want to know the distance to the other person and navigate to their location, so that I can plan my travel.

#### Acceptance Criteria

1. WHEN both users in a Match have shared their locations, THE System SHALL calculate the distance between them using the Haversine formula
2. THE System SHALL display the calculated distance in kilometers with two decimal places
3. THE System SHALL provide a "Navigate to location" button when the other User has shared their location
4. WHEN a User clicks "Navigate to location", THE System SHALL open Google Maps with directions to the other User's location
5. THE System SHALL format the Google Maps URL as `https://www.google.com/maps/dir/?api=1&destination={latitude},{longitude}`
6. THE System SHALL open the navigation link in a new browser tab or window

### Requirement 16: Donation Completion

**User Story:** As a matched user, I want to mark the donation as completed, so that the system records the successful donation.

#### Acceptance Criteria

1. WHEN a donation is completed, THE System SHALL change the Match status from 'active' to 'completed'
2. WHEN a donation is completed, THE System SHALL record the completion timestamp
3. WHEN a donation is completed, THE System SHALL update the Donor's last_donation_date to the current date
4. WHEN a donation is completed, THE System SHALL change the Blood_Request status to 'completed'
5. WHEN a donation is completed, THE System SHALL notify both the Donor and Recipient
6. WHEN a Match is completed, THE System SHALL allow users to provide rating and feedback

### Requirement 17: Match Cancellation

**User Story:** As a matched user, I want to cancel a match if circumstances change, so that the blood request can be made available to other donors.

#### Acceptance Criteria

1. WHEN a User cancels an Active_Match, THE System SHALL change the Match status to 'cancelled'
2. WHEN a Match is cancelled, THE System SHALL change the Blood_Request status back to 'pending'
3. WHEN a Match is cancelled, THE System SHALL make the Blood_Request visible to other compatible donors again
4. WHEN a Match is cancelled, THE System SHALL notify both users
5. THE System SHALL allow either the Donor or Recipient to cancel the Match
6. WHEN a Match is cancelled, THE System SHALL preserve the message history for record-keeping

### Requirement 18: Feedback and Rating System

**User Story:** As a user who completed a donation, I want to rate and provide feedback about the experience, so that the community can build trust.

#### Acceptance Criteria

1. WHEN a Match is completed, THE System SHALL allow both users to provide a rating from 1 to 5 stars
2. WHEN a User submits a rating, THE System SHALL validate that it is an integer between 1 and 5 inclusive
3. WHEN a User submits a rating, THE System SHALL allow optional text feedback
4. THE System SHALL store ratings and feedback in the Match record
5. THE System SHALL display average ratings on user profiles
6. THE System SHALL only allow rating after a Match is completed

### Requirement 19: WebSocket Real-Time Updates

**User Story:** As a matched user, I want to receive instant updates when the other person sends messages or shares location, so that I can respond quickly.

#### Acceptance Criteria

1. WHEN a User opens a Match interface, THE System SHALL establish a WebSocket_Connection for that Match
2. WHEN a message is sent in a Match, THE System SHALL broadcast it to all connected participants via WebSocket_Connection
3. WHEN a location is shared in a Match, THE System SHALL broadcast the location update to all connected participants via WebSocket_Connection
4. WHEN a Match status changes, THE System SHALL broadcast the status change to all connected participants via WebSocket_Connection
5. WHEN a WebSocket_Connection is lost, THE System SHALL attempt to reconnect automatically
6. THE System SHALL verify that Users are participants in a Match before allowing WebSocket_Connection

### Requirement 20: Authentication and Authorization

**User Story:** As a user, I want secure authentication and proper access controls, so that my data and communications are protected.

#### Acceptance Criteria

1. WHEN a User logs in with valid credentials, THE Authentication_Service SHALL generate a JWT token with 15-minute expiration
2. WHEN a User makes an API request, THE System SHALL validate the JWT token signature
3. WHEN a JWT token is expired, THE System SHALL reject the request with error "Token expired"
4. THE System SHALL allow Users to access only their own profile data
5. THE System SHALL allow Users to access only Matches where they are a participant
6. THE System SHALL allow Users to send messages only in Matches where they are a participant
7. THE System SHALL allow Users to view location only for Users who have shared it in a common Match
8. WHEN a User logs out, THE System SHALL invalidate their JWT token

### Requirement 21: API Rate Limiting

**User Story:** As a system administrator, I want to enforce rate limits on API endpoints, so that the system remains stable and prevents abuse.

#### Acceptance Criteria

1. THE System SHALL limit general API requests to 100 per minute per User
2. THE System SHALL limit message sending to 10 messages per minute per Match
3. THE System SHALL limit location updates to 6 per hour per User
4. THE System SHALL limit match creation attempts to 5 per hour per User
5. WHEN a User exceeds a rate limit, THE System SHALL reject the request with error "Rate limit exceeded"
6. WHEN a User exceeds a rate limit, THE System SHALL include the time until the limit resets in the error response

### Requirement 22: Input Sanitization and Security

**User Story:** As a system administrator, I want all user input to be validated and sanitized, so that the system is protected from malicious input.

#### Acceptance Criteria

1. WHEN a User submits message content, THE System SHALL sanitize it to prevent XSS attacks
2. THE System SHALL use parameterized database queries to prevent SQL injection
3. THE System SHALL validate all numeric inputs are within expected ranges
4. THE System SHALL validate all string inputs do not exceed maximum length limits
5. THE System SHALL reject requests with invalid or malformed data
6. THE System SHALL log security-related errors for monitoring

### Requirement 23: Data Privacy and GDPR Compliance

**User Story:** As a user, I want my personal data to be handled privately and securely, so that my privacy rights are respected.

#### Acceptance Criteria

1. THE System SHALL encrypt all data in transit using HTTPS
2. THE System SHALL allow Users to delete their account and all associated data
3. THE System SHALL allow Users to export their data in a machine-readable format
4. THE System SHALL require explicit consent before enabling location sharing
5. THE System SHALL display a privacy policy explaining data usage
6. THE System SHALL not share User data with third parties without consent
7. WHEN a User deletes their account, THE System SHALL anonymize their messages rather than deleting them to preserve conversation context for other users

### Requirement 24: Error Handling and User Feedback

**User Story:** As a user, I want clear error messages when something goes wrong, so that I understand what happened and how to fix it.

#### Acceptance Criteria

1. WHEN a validation error occurs, THE System SHALL display a specific error message describing the validation rule
2. WHEN a network error occurs, THE System SHALL display "Network error, please try again"
3. WHEN a server error occurs, THE System SHALL display "Something went wrong, please try again later"
4. WHEN an authorization error occurs, THE System SHALL display "You don't have permission to perform this action"
5. THE System SHALL log all errors with sufficient detail for debugging
6. THE System SHALL display error messages in a user-friendly, non-technical manner
7. WHEN an error is recoverable, THE System SHALL provide guidance on how to resolve it

### Requirement 25: Performance and Scalability

**User Story:** As a user, I want the platform to respond quickly and handle many concurrent users, so that I have a smooth experience.

#### Acceptance Criteria

1. THE System SHALL respond to API requests within 200 milliseconds for the 95th percentile
2. THE System SHALL deliver messages within 500 milliseconds of sending
3. THE System SHALL update location displays within 1 second of receiving location updates
4. THE System SHALL load the initial page within 2 seconds on a 3G connection
5. THE System SHALL support at least 1000 concurrent WebSocket connections
6. THE System SHALL use database indexes on frequently queried fields
7. THE System SHALL cache frequently accessed data with appropriate TTL values

### Requirement 26: Mobile Responsiveness

**User Story:** As a mobile user, I want the platform to work well on my phone, so that I can use it on the go.

#### Acceptance Criteria

1. THE System SHALL display correctly on screen sizes from 320px to 2560px width
2. THE System SHALL use touch-friendly button sizes (minimum 44x44 pixels)
3. THE System SHALL adapt the layout for portrait and landscape orientations
4. THE System SHALL use the device's native dialer for phone calls on mobile devices
5. THE System SHALL request location permission using the device's native permission dialog
6. THE System SHALL optimize images and assets for mobile bandwidth

### Requirement 27: Browser Compatibility

**User Story:** As a user, I want the platform to work on my preferred browser, so that I don't need to switch browsers.

#### Acceptance Criteria

1. THE System SHALL support Chrome version 90 and above
2. THE System SHALL support Firefox version 88 and above
3. THE System SHALL support Safari version 14 and above
4. THE System SHALL support Edge version 90 and above
5. THE System SHALL gracefully degrade features not supported by older browsers
6. THE System SHALL display a warning message for unsupported browsers

### Requirement 28: Notification System

**User Story:** As a user, I want to receive notifications for important events, so that I don't miss critical updates.

#### Acceptance Criteria

1. WHEN a User receives a new message, THE System SHALL display a browser notification if permission is granted
2. WHEN a Donor accepts a User's blood request, THE System SHALL notify the User
3. WHEN a Match is cancelled, THE System SHALL notify both users
4. WHEN a Match is completed, THE System SHALL notify both users
5. WHEN a User's blood request is about to expire, THE System SHALL notify the User
6. THE System SHALL request notification permission from users
7. THE System SHALL respect the user's notification preferences

### Requirement 29: Search and Filter Functionality

**User Story:** As a donor, I want to search and filter blood requests, so that I can find requests that match my preferences.

#### Acceptance Criteria

1. THE System SHALL allow Users to filter blood requests by blood type
2. THE System SHALL allow Users to filter blood requests by city
3. THE System SHALL allow Users to filter blood requests by urgency level
4. THE System SHALL allow Users to sort blood requests by creation date
5. THE System SHALL allow Users to sort blood requests by distance (when location is available)
6. THE System SHALL display the number of matching requests after filters are applied
7. THE System SHALL persist filter preferences in the user's session

### Requirement 30: Dashboard and Analytics

**User Story:** As a user, I want to see statistics about my donation activity, so that I can track my contribution to the community.

#### Acceptance Criteria

1. THE System SHALL display the total number of successful donations for each User
2. THE System SHALL display the date of the User's last donation
3. THE System SHALL display the number of days until the User is eligible to donate again
4. THE System SHALL display the User's average rating from recipients
5. THE System SHALL display the total number of blood requests the User has created
6. THE System SHALL display the number of active matches the User currently has
7. THE System SHALL display a history of completed donations with dates and feedback
