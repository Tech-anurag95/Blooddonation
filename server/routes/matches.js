const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Match = require('../models/Match');
const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');

const normalizeUser = (user) => {
  if (!user) return user;
  const result = user.toObject ? user.toObject({ virtuals: true }) : { ...user };
  if (!result.username) {
    result.username = result.name || '';
  }
  return result;
};

const normalizeMatch = (match) => {
  const result = match.toObject ? match.toObject({ virtuals: true }) : { ...match };

  if (result.donor) {
    result.donor = normalizeUser(result.donor);
  }

  if (result.request) {
    result.request = {
      ...result.request,
      blood_type: result.request.bloodType,
      requester: normalizeUser(result.request.requester)
    };
  }

  return result;
};

// @route   POST /api/matches
// @desc    Create a new match for a blood request
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { request_id } = req.body;
    if (!request_id) {
      return res.status(400).json({ success: false, message: 'request_id is required' });
    }

    const bloodRequest = await BloodRequest.findById(request_id).populate('requester');
    if (!bloodRequest) {
      return res.status(404).json({ success: false, message: 'Blood request not found' });
    }

    if (bloodRequest.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'This blood request is no longer available for matching' });
    }

    if (bloodRequest.requester._id.toString() === req.userId) {
      return res.status(403).json({ success: false, message: 'Cannot match your own request' });
    }

    const donor = await User.findById(req.userId);
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    const existingMatch = await Match.findOne({ request: request_id });
    if (existingMatch) {
      return res.status(400).json({ success: false, message: 'A match already exists for this request' });
    }

    const match = new Match({
      donor: req.userId,
      request: request_id,
      status: 'active',
      matchedAt: new Date()
    });

    await match.save();

    bloodRequest.status = 'accepted';
    bloodRequest.acceptedBy = req.userId;
    await bloodRequest.save();

    const populatedMatch = await Match.findById(match._id)
      .populate('donor')
      .populate({ path: 'request', populate: { path: 'requester' } });

    res.status(201).json(normalizeMatch(populatedMatch));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/matches
// @desc    Get matches for the current user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const requestDocs = await BloodRequest.find({ requester: req.userId }).select('_id');
    const requestIds = requestDocs.map((request) => request._id);

    const matches = await Match.find({
      $or: [
        { donor: req.userId },
        { request: { $in: requestIds } }
      ]
    })
      .populate('donor')
      .populate({ path: 'request', populate: { path: 'requester' } })
      .sort({ matchedAt: -1 });

    res.json(matches.map(normalizeMatch));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/matches/:id
// @desc    Get a single match by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('donor')
      .populate({ path: 'request', populate: { path: 'requester' } });

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    if (
      match.donor._id.toString() !== req.userId &&
      match.request.requester._id.toString() !== req.userId
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this match' });
    }

    res.json(normalizeMatch(match));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/matches/:id/complete
// @desc    Mark a match as completed
// @access  Private
router.post('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id).populate('request');
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    if (
      match.donor.toString() !== req.userId &&
      match.request.requester.toString() !== req.userId
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this match' });
    }

    match.status = 'completed';
    match.completedAt = new Date();
    await match.save();

    await BloodRequest.findByIdAndUpdate(match.request._id, {
      status: 'completed',
      completedAt: new Date()
    });

    res.json({ success: true, message: 'Match marked as completed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/matches/:id/cancel
// @desc    Cancel a match
// @access  Private
router.post('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    const match = await Match.findById(req.params.id).populate('request');
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    if (
      match.donor.toString() !== req.userId &&
      match.request.requester.toString() !== req.userId
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this match' });
    }

    match.status = 'cancelled';
    match.cancelledAt = new Date();
    match.cancellationReason = reason || 'Cancelled by user';
    await match.save();

    await BloodRequest.findByIdAndUpdate(match.request._id, {
      status: 'cancelled'
    });

    res.json({ success: true, message: 'Match cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/matches/:id/rate
// @desc    Rate a completed match
// @access  Private
router.post('/:id/rate', authMiddleware, async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    if (match.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Only completed matches can be rated' });
    }

    if (
      match.donor.toString() !== req.userId &&
      match.request.toString() !== req.userId
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to rate this match' });
    }

    match.rating = rating;
    match.feedback = feedback;
    await match.save();

    res.json({ success: true, message: 'Match rated successfully', rating: match.rating });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
