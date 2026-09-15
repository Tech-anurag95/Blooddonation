const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodRequest',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  matchedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  cancelledAt: Date,
  cancellationReason: String,
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: String
});

module.exports = mongoose.model('Match', matchSchema);
