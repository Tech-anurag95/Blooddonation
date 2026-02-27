const express = require('express');
const router = express.Router();
const BloodRequest = require('../models/BloodRequest');
const Donation = require('../models/Donation');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const { notifyDonors } = require('../utils/notify');

// @route   GET /api/requests
// @desc    Get all blood requests
// @access  Public
router.get('/', async (req, res) => {
  try {
    const requests = await BloodRequest.find()
      .populate('requester', 'name phone city')
      .populate('acceptedBy', 'name phone')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/requests/pending
// @desc    Get pending blood requests
// @access  Public
router.get('/pending', async (req, res) => {
  try {
    const requests = await BloodRequest.find({ status: 'pending' })
      .populate('requester', 'name phone city')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/requests/user/:userId
// @desc    Get requests by user ID
// @access  Private
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const requests = await BloodRequest.find({ requester: req.params.userId })
      .populate('requester', 'name phone')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/requests/:id
// @desc    Get request by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('requester')
      .populate('acceptedBy');
    
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/requests
// @desc    Create new blood request
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { bloodType, quantity, urgency, reason, hospital, city, phone, latitude, longitude } = req.body;

    // Validation
    if (!bloodType || !quantity || !urgency || !hospital || !city) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const bloodRequest = new BloodRequest({
      requester: req.userId,
      bloodType,
      quantity,
      urgency,
      reason,
      hospital,
      city,
      phone,
      latitude,
      longitude,
      status: 'pending',
      createdAt: new Date()
    });

    await bloodRequest.save();

    // Find nearby/matching verified donors (simple filter by bloodType and city)
    try {
      const donors = await User.find({ bloodType: bloodType, city: city, verified: true }).select('name email phone');
      if (donors && donors.length > 0) {
        notifyDonors(bloodRequest, donors).catch(err => console.error('Notify error:', err));
      } else {
        console.log('No matching verified donors found for notification');
      }
    } catch (notifyErr) {
      console.error('Error finding donors for notification:', notifyErr.message || notifyErr);
    }

    res.status(201).json({
      success: true,
      message: 'Blood request created successfully',
      data: bloodRequest
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/requests/:id
// @desc    Update blood request
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { status, acceptedBy } = req.body;

    const allowedUpdates = ['status', 'acceptedBy'];
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (status === 'completed') {
      updates.completedAt = new Date();
    }

    const bloodRequest = await BloodRequest.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!bloodRequest) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Request updated successfully',
      data: bloodRequest
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/requests/:id
// @desc    Delete blood request
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id);
    
    if (!bloodRequest) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Make sure only requester can delete
    if (bloodRequest.requester.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this request'
      });
    }

    await BloodRequest.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Request deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
