const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// @route GET /api/admin/pending-verifications
// @desc  List users with uploaded docs pending verification
// @access Private (admin)
router.get('/pending-verifications', authMiddleware, async (req, res) => {
  try {
    const requester = await User.findById(req.userId);
    if (!requester || requester.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin required' });

    const pending = await User.find({ verified: false, verificationDocs: { $exists: true, $ne: [] } }).select('-password');
    res.status(200).json({ success: true, data: pending });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
