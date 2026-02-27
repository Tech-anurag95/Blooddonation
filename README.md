# 🩸 Blood Donation Platform

A comprehensive blood donation management system that connects blood donors with recipients through a modern web platform. The system provides real-time matching, emergency request handling, donation tracking, and secure user management.

## 🌟 Features

- **Real-time Donor Matching**: Find compatible blood donors instantly using geolocation
- **Emergency Requests**: Priority handling for urgent blood requirements
- **User Roles**: Separate dashboards for donors, recipients, and administrators
- **Live Notifications**: Socket.io powered real-time updates
- **Secure Authentication**: JWT-based authentication with role-based access control
- **Blood Type Compatibility**: Automatic matching based on blood type compatibility rules
- **Donation History**: Track past donations and eligibility status
- **Admin Panel**: User verification and system management tools

## 🚀 Tech Stack

### Frontend
- **React 18.2+** - Modern UI framework
- **Tailwind CSS 3.0+** - Utility-first CSS framework
- **React Router 6+** - Client-side routing
- **Axios** - HTTP client for API calls
- **Socket.io Client** - Real-time communication
- **Lucide React** - Beautiful icons

### Backend
- **Node.js 18+** - Runtime environment
- **Express.js 4.18+** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose 7.0+** - MongoDB ODM
- **Socket.io 4.0+** - Real-time engine
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- MongoDB installed (or use MongoDB Atlas)
- Git installed

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/blood-donation-platform.git
cd blood-donation-platform
```

### 2. Install dependencies

#### Backend
```bash
cd server
npm install
```

#### Frontend
```bash
cd ../client
npm install
```

### 3. Environment Setup

Create `.env` files in both `server` and `client` directories:

#### Server `.env`
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/blooddonation
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

#### Client `.env`
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Start the application

#### Start Backend (Terminal 1)
```bash
cd server
npm start
```

#### Start Frontend (Terminal 2)
```bash
cd client
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## 🎯 Usage

### For Blood Recipients
1. Register as a "Blood Recipient"
2. Browse available donors by blood type
3. Send blood requests to compatible donors
4. Receive real-time notifications when donors respond

### For Blood Donors
1. Register as a "Blood Donor"
2. Set your availability status
3. Receive notifications for nearby blood requests
4. Respond to requests and coordinate donations

### For Administrators
1. Access admin dashboard
2. Verify user accounts and documents
3. Monitor system activity and audit logs
4. Manage user roles and permissions

## 🏗️ Project Structure

```
blood-donation-platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── styles/        # CSS files
│   └── public/            # Static assets
├── server/                # Node.js backend
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── utils/            # Utility functions
└── docs/                 # Documentation
```

## 🔐 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS protection
- Rate limiting

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Donors
- `GET /api/donors/nearby` - Find nearby donors
- `PUT /api/donors/availability` - Update availability

### Requests
- `POST /api/requests` - Create blood request
- `GET /api/requests/pending` - Get pending requests
- `PUT /api/requests/:id` - Update request status

### Admin
- `GET /api/admin/pending-verifications` - Get pending verifications
- `PUT /api/admin/verify/:id` - Verify user account

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/YOUR_USERNAME/blood-donation-platform/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about the problem

## 🙏 Acknowledgments

- Thanks to all contributors who help make this platform better
- Special thanks to the open-source community for the amazing tools and libraries
- Inspired by the need to make blood donation more accessible and efficient

---

**Made with ❤️ to save lives through technology**