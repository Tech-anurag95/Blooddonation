const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer setup for uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// @route   GET /api/users/:id
// @desc    Get user profile
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/users/:id/upload-docs
// @desc    Upload verification document (donor)
// @access  Private
router.post('/:id/upload-docs', authMiddleware, upload.single('document'), async (req, res) => {
  try {
    // only allow owner or admin to upload on behalf
    if (req.userId !== req.params.id) {
      // check if requester is admin
      const requester = await User.findById(req.userId);
      if (!requester || requester.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    user.verificationDocs = user.verificationDocs || [];
    user.verificationDocs.push(`/uploads/${req.file.filename}`);
    await user.save();

    res.status(200).json({ success: true, message: 'Document uploaded', data: user.verificationDocs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/push/subscribe
// @desc    Save web push subscription for logged in user
// @access  Private
router.post('/push/subscribe', authMiddleware, async (req, res) => {
  try {
    const subscription = req.body.subscription;
    if (!subscription) return res.status(400).json({ success: false, message: 'No subscription provided' });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Avoid duplicate subscriptions by endpoint
    user.pushSubscriptions = user.pushSubscriptions || [];
    const exists = user.pushSubscriptions.find(s => s.endpoint === subscription.endpoint);
    if (!exists) user.pushSubscriptions.push(subscription);
    await user.save();

    res.status(200).json({ success: true, message: 'Subscription saved' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/users/:id/verify
// @desc    Admin verifies or rejects a donor
// @access  Private (admin)
router.put('/:id/verify', authMiddleware, async (req, res) => {
  try {
    const requester = await User.findById(req.userId);
    if (!requester || requester.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin privileges required' });
    }

    const { verified } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { verified }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, message: `User verification updated to ${verified}`, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    // Prevent password update through this endpoint
    if (req.body.password) {
      return res.status(400).json({ success: false, message: 'Cannot update password through this endpoint' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user account
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Make sure user can only delete their own account
    if (req.userId !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this account' });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
