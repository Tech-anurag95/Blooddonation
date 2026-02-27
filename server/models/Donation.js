const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodRequest'
  },
  recipientName: String,
  bloodType: String,
  quantity: Number,
  location: String,
  status: {
    type: String,
    enum: ['accepted', 'scheduled', 'completed', 'cancelled'],
    default: 'accepted'
  },
  scheduledDate: Date,
  date: {
    type: Date,
    default: Date.now
  },
  completedDate: Date,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Donation', donationSchema);
