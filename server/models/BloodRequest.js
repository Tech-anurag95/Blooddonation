const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bloodType: {
    type: String,
    enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  urgency: {
    type: String,
    enum: ['urgent', 'high', 'normal'],
    default: 'normal'
  },
  reason: String,
  hospital: {
    type: String,
    required: true
  },
  phone: String,
  city: String,
  latitude: Number,
  longitude: Number,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'cancelled'],
    default: 'pending'
  },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
});

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
