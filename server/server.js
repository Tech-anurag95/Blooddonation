require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

// Import routes
const authRoutes = require('./routes/auth');
const donorRoutes = require('./routes/donors');
const requestRoutes = require('./routes/requests');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const matchRoutes = require('./routes/matches');
const messageRoutes = require('./routes/messages');
const donationRoutes      = require('./routes/donations');
const certificateRoutes   = require('./routes/certificates');

const seedDefaultUsers = require('./utils/seedUser');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  }
});

app.set('io', io);

const path = require('path');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection with optional in-memory fallback for development
const connectWithFallback = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/blooddonation';
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ MongoDB connected successfully');
    await seedDefaultUsers();
  } catch (err) {
    console.error('✗ MongoDB connection failed:', err.message || err);

    if (process.env.NODE_ENV === 'development') {
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        await mongoose.connect(memUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        });
        console.log('✓ Connected to in-memory MongoDB for development');
        await seedDefaultUsers();
      } catch (memErr) {
        console.error('✗ In-memory MongoDB failed to start:', memErr);
      }
    }
  }
};

connectWithFallback();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use(['/api/matches', '/api/match'], matchRoutes);
app.use(['/api/messages', '/api/message'], messageRoutes);
app.use('/api/donations',     donationRoutes);
app.use('/api/certificates',  certificateRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Socket.io events
io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  socket.on('join_room', (data) => {
    socket.join(data.room);
    socket.emit('message', `You joined room ${data.room}`);
    socket.broadcast.to(data.room).emit('message', `User ${socket.id} joined the room`);
  });

  socket.on('send_message', (data) => {
    io.to(data.room).emit('receive_message', data);
  });

  socket.on('blood_request', (data) => {
    io.emit('new_blood_request', data);
  });

  socket.on('donor_available', (data) => {
    io.emit('donor_status', { donorId: data.donorId, available: true });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 Socket.io running on http://localhost:${PORT}`);
  console.log(`🔗 CORS enabled for ${process.env.CLIENT_URL || 'http://localhost:3000'}\n`);
});

module.exports = { app, io };
