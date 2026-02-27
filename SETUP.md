# Getting Started with Blood Donation Web Application

## Quick Start

### 1. Install Dependencies

From the root directory:
```bash
npm run install-all
```

This will install dependencies for both client and server.

### 2. Setup Environment Variables

**Server Setup:**
```bash
cd server
cp .env.example .env
```

Edit `server/.env` and add your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/blooddonation
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**Client Setup:**
Create `client/.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Ensure MongoDB is Running

Make sure MongoDB is running on your system:
```bash
# Windows (if MongoDB is installed)
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in server/.env with your connection string
```

### 4. Start Development Server

From the root directory:
```bash
npm run dev
```

This will start both:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## Application Features

### For Blood Recipients/Emergency Users
- ✅ Register and create profile
- ✅ Emergency blood request with real-time notifications
- ✅ Search and find nearby available donors
- ✅ Filter by blood type
- ✅ Direct messaging with donors
- ✅ Request tracking

### For Blood Donors
- ✅ Register as a blood donor
- ✅ Manage donor profile and availability
- ✅ View blood requests in your area
- ✅ Accept or decline requests
- ✅ Donation history and statistics
- ✅ Real-time notifications of urgent requests

### Admin Features (Coming Soon)
- User management
- Request verification
- Donation analytics
- Reports and statistics

## Project Structure

```
BLOODDE/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable components (Navbar, Footer)
│   │   ├── pages/         # Page components
│   │   ├── styles/        # CSS and Tailwind config
│   │   └── App.jsx
│   └── package.json
│
├── server/                # Node.js Backend
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API endpoints
│   ├── server.js         # Main server file
│   └── package.json
│
├── .github/
│   └── copilot-instructions.md
├── README.md
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Donors
- `GET /api/donors` - Get all donors
- `GET /api/donors/nearby` - Get nearby donors
- `GET /api/donors/:id` - Get donor details
- `POST /api/donors/register` - Register as donor
- `PUT /api/donors/:id` - Update donor profile

### Blood Requests
- `GET /api/requests` - Get all requests
- `GET /api/requests/pending` - Get pending requests
- `GET /api/requests/:id` - Get request details
- `POST /api/requests` - Create blood request
- `PUT /api/requests/:id` - Update request
- `DELETE /api/requests/:id` - Delete request

## Key Technologies

- **Frontend**: React 18, Tailwind CSS, Axios, React Router
- **Backend**: Node.js, Express.js, MongoDB, Socket.io
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time Communication**: Socket.io
- **Styling**: Tailwind CSS

## Features Implementation Details

### Real-time Notifications
- Socket.io for instant notifications
- Live updates when blood requests are posted
- Real-time donor availability status

### Geolocation
- Find donors within specified radius
- Display nearby donors on map
- Location-based filtering

### User Authentication
- JWT-based authentication
- Password hashing with bcryptjs
- Session management

### Database Schema
- User model with donor/recipient profiles
- Blood request schema with status tracking
- Donation history tracking

## Development Tips

1. **Hot Reload**: Changes to code automatically refresh the browser
2. **API Testing**: Use Postman or Insomnia for testing endpoints
3. **Socket.io Events**: Check server console for connection events
4. **Database**: Use MongoDB Compass for easy database management

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Verify MONGODB_URI format

### npm install fails
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## Security Notes

⚠️ **Important for Production:**
- Change JWT_SECRET in `.env` to a strong random string
- Use environment variables for sensitive data
- Implement HTTPS
- Add rate limiting
- Implement input validation
- Use helmet.js for security headers
- Enable CORS properly for production domain

## Next Steps

1. Set up database backups
2. Implement email notifications
3. Add SMS notifications for urgent requests
4. Integrate Google Maps API for better geolocation
5. Add payment gateway for donations
6. Implement admin dashboard
7. Add user reviews and ratings

## Support

For issues or questions:
1. Check the README.md
2. Review API documentation
3. Check browser console for errors
4. Check server logs

## License

MIT License - Feel free to use for educational and commercial purposes.

---

**Made with ❤️ to save lives through blood donation**
