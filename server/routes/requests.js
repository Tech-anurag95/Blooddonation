const express = require('express');
const router = express.Router();
const BloodRequest = require('../models/BloodRequest');
const Donation = require('../models/Donation');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const { notifyDonors } = require('../utils/notify');
const djangoSync = require('../utils/djangoSync');

// @route   GET /api/requests
// @desc    Get all blood requests with optional status filter
// @access  Public
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const requests = await BloodRequest.find(filter)
      .populate('requester', 'name phone city email')
      .populate('acceptedBy', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/requests/pending
router.get('/pending', async (req, res) => {
  try {
    const requests = await BloodRequest.find({ status: 'pending' })
      .populate('requester', 'name phone city')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/requests/user/:userId
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const requests = await BloodRequest.find({ requester: req.params.userId })
      .populate('requester', 'name phone')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/requests/:id
router.get('/:id', async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('requester')
      .populate('acceptedBy');
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.status(200).json({ success: true, data: request });
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

    if (!bloodType || !quantity || !urgency || !hospital || !city) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const bloodRequest = new BloodRequest({
      requester: req.userId,
      bloodType, quantity, urgency, reason,
      hospital, city, phone, latitude, longitude,
      status: 'pending',
      createdAt: new Date()
    });

    await bloodRequest.save();
    await bloodRequest.populate('requester', 'name phone city email');

    // Emit real-time event to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('new_blood_request', { request: bloodRequest });
    }

    // Sync to Django
    djangoSync.request(bloodRequest);

    // Notify matching donors via push
    try {
      const donors = await User.find({ bloodType, city, verified: true }).select('name email phone');
      if (donors.length > 0) {
        notifyDonors(bloodRequest, donors).catch(err => console.error('Notify error:', err));
      }
    } catch (notifyErr) {
      console.error('Notify error:', notifyErr.message);
    }

    res.status(201).json({ success: true, message: 'Blood request created successfully', data: bloodRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/requests/:id
// @desc    Update blood request status (pending → matched → completed)
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updates = {};

    if (req.body.status !== undefined)     updates.status     = req.body.status;
    if (req.body.acceptedBy !== undefined) updates.acceptedBy = req.body.acceptedBy;
    if (req.body.donorName !== undefined)  updates.donorName  = req.body.donorName;

    if (req.body.status === 'matched') {
      // Donor accepting — record who accepted
      updates.acceptedBy = req.userId;
      const donor = await User.findById(req.userId).select('name');
      if (donor) updates.donorName = donor.name;
    }

    if (req.body.status === 'completed') {
      updates.completedAt = new Date();
    }

    const bloodRequest = await BloodRequest.findByIdAndUpdate(
      req.params.id, updates, { new: true, runValidators: true }
    ).populate('requester', 'name phone city email').populate('acceptedBy', 'name phone');

    if (!bloodRequest) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Emit real-time status update to all clients
    const io = req.app.get('io');
    if (io) {
      io.emit('request_status_update', {
        requestId: bloodRequest._id,
        status: bloodRequest.status,
        request: bloodRequest
      });
    }

    // If completed, auto-create a donation record
    if (req.body.status === 'completed' && bloodRequest.acceptedBy) {
      const existingDonation = await Donation.findOne({ request: bloodRequest._id });
      if (!existingDonation) {
        const donation = new Donation({
          donor: bloodRequest.acceptedBy,
          request: bloodRequest._id,
          recipientName: bloodRequest.requester?.name || 'Unknown',
          bloodType: bloodRequest.bloodType,
          quantity: bloodRequest.quantity,
          location: `${bloodRequest.hospital}, ${bloodRequest.city}`,
          status: 'completed',
          completedDate: new Date()
        });
        await donation.save();
      }
    }

    res.status(200).json({ success: true, message: 'Request updated successfully', data: bloodRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/requests/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id);
    if (!bloodRequest) return res.status(404).json({ success: false, message: 'Request not found' });

    if (bloodRequest.requester.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this request' });
    }

    await BloodRequest.findByIdAndDelete(req.params.id);

    const io = req.app.get('io');
    if (io) io.emit('request_deleted', { requestId: req.params.id });

    res.status(200).json({ success: true, message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
