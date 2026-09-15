const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Message = require('../models/Message');
const Match = require('../models/Match');

const normalizeUser = (user) => {
  if (!user) return user;
  const result = user.toObject ? user.toObject({ virtuals: true }) : { ...user };
  if (!result.username) {
    result.username = result.name || '';
  }
  return result;
};

const normalizeMessage = (message) => {
  const result = message.toObject ? message.toObject({ virtuals: true }) : { ...message };
  result.sender = normalizeUser(result.sender);
  result.receiver = normalizeUser(result.receiver);
  return result;
};

// @route   GET /api/messages
// @desc    Get messages for a match
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const matchId = req.query.match_id;
    if (!matchId) {
      return res.status(400).json({ success: false, message: 'match_id query parameter is required' });
    }

    const match = await Match.findById(matchId)
      .populate({ path: 'request', populate: { path: 'requester' } });
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    const requesterId = match.request.requester.toString();
    const donorId = match.donor.toString();
    if (req.userId !== requesterId && req.userId !== donorId) {
      return res.status(403).json({ success: false, message: 'Not authorized to view these messages' });
    }

    const messages = await Message.find({ match: matchId })
      .populate('sender')
      .populate('receiver')
      .sort({ sentAt: 1 });

    res.json(messages.map(normalizeMessage));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/messages
// @desc    Send a new message for a match
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { match_id, content } = req.body;
    if (!match_id || !content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'match_id and non-empty content are required' });
    }

    const match = await Match.findById(match_id)
      .populate({ path: 'request', populate: { path: 'requester' } })
      .populate('donor');
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    const requesterId = match.request.requester.toString();
    const donorId = match.donor._id.toString();
    if (req.userId !== requesterId && req.userId !== donorId) {
      return res.status(403).json({ success: false, message: 'Not authorized to send messages for this match' });
    }

    const receiverId = req.userId === requesterId ? donorId : requesterId;

    const message = new Message({
      match: match_id,
      sender: req.userId,
      receiver: receiverId,
      content: content.trim(),
      sentAt: new Date(),
      isRead: false
    });

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender')
      .populate('receiver');

    res.status(201).json(normalizeMessage(populatedMessage));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/messages/:id/mark_read
// @desc    Mark a message as read
// @access  Private
router.post('/:id/mark_read', authMiddleware, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id).populate('match');
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    const match = await Match.findById(message.match._id)
      .populate({ path: 'request', populate: { path: 'requester' } });
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    const requesterId = match.request.requester.toString();
    const donorId = match.donor.toString();
    if (req.userId !== requesterId && req.userId !== donorId) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this message' });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    res.json({ success: true, message: 'Message marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/messages/unread_count
// @desc    Get the current user's unread message count
// @access  Private
router.get('/unread_count', authMiddleware, async (req, res) => {
  try {
    const count = await Message.countDocuments({ receiver: req.userId, isRead: false });
    res.json({ unread_count: count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
