# Blood Donation Web Application - Development Instructions

## Project Overview
A full-fledged web application for connecting blood donors with people in emergency need of blood transfusions.

## Technology Stack
- **Frontend**: React 18, Tailwind CSS, Axios
- **Backend**: Node.js, Express.js, MongoDB
- **Real-time**: Socket.io
- **Maps**: Google Maps API / Mapbox

## Development Setup

### Environment Requirements
- Node.js v14+
- MongoDB
- npm/yarn

### Key Features to Implement
1. User authentication (Donor & Emergency Requestor)
2. Geolocation-based donor search
3. Real-time messaging between donors and requestors
4. Donor profile management
5. Blood request creation and tracking
6. Modern, responsive UI with Tailwind CSS

## Project Structure
- `/client` - React frontend application
- `/server` - Express.js backend API
- Configuration and documentation at root level

## Customization Points
- API endpoints can be modified in server routes
- UI components are modular and can be customized
- Database schema can be extended as needed
- Real-time features can be scaled with Socket.io
