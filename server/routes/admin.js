const express = require('express');
const router = express.Router();
const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');
const Donation = require('../models/Donation');
const authMiddleware = require('../middleware/auth');

// Middleware to check if user is admin
const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== DASHBOARD OVERVIEW ====================

// @route GET /api/admin/dashboard
// @desc  Get complete dashboard statistics
// @access Private (admin)
router.get('/dashboard', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const totalRecipients = await User.countDocuments({ role: 'recipient' });
    const verifiedUsers = await User.countDocuments({ verified: true });
    const pendingVerifications = await User.countDocuments({ verified: false });
    
    const totalRequests = await BloodRequest.countDocuments();
    const pendingRequests = await BloodRequest.countDocuments({ status: 'pending' });
    const completedRequests = await BloodRequest.countDocuments({ status: 'completed' });
    const urgentRequests = await BloodRequest.countDocuments({ urgency: 'urgent', status: 'pending' });
    
    const totalDonations = await Donation.countDocuments();
    const completedDonations = await Donation.countDocuments({ status: 'completed' });

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          donors: totalDonors,
          recipients: totalRecipients,
          verified: verifiedUsers,
          pendingVerification: pendingVerifications
        },
        requests: {
          total: totalRequests,
          pending: pendingRequests,
          completed: completedRequests,
          urgent: urgentRequests
        },
        donations: {
          total: totalDonations,
          completed: completedDonations
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== USER MANAGEMENT ====================

// @route GET /api/admin/users
// @desc  Get all users with filters
// @access Private (admin)
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { role, verified, bloodType, city, search } = req.query;
    
    let query = {};
    if (role) query.role = role;
    if (verified !== undefined) query.verified = verified === 'true';
    if (bloodType) query.bloodType = bloodType;
    if (city) query.city = new RegExp(city, 'i');
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/admin/users/:id
// @desc  Get single user details
// @access Private (admin)
router.get('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get user's requests and donations
    const requests = await BloodRequest.find({ requester: req.params.id });
    const donations = await Donation.find({ donor: req.params.id });

    res.status(200).json({
      success: true,
      data: {
        user,
        requests,
        donations
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/admin/users/:id
// @desc  Update user details
// @access Private (admin)
router.put('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const allowedFields = ['name', 'email', 'phone', 'bloodType', 'city', 'state', 'role', 'verified', 'availableToDonate', 'age', 'weight'];
    const updates = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route DELETE /api/admin/users/:id
// @desc  Delete user
// @access Private (admin)
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Also delete user's requests and donations
    await BloodRequest.deleteMany({ requester: req.params.id });
    await Donation.deleteMany({ donor: req.params.id });

    res.status(200).json({
      success: true,
      message: 'User and related data deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/admin/pending-verifications
// @desc  List users pending verification
// @access Private (admin)
router.get('/pending-verifications', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const pending = await User.find({ verified: false }).select('-password');
    res.status(200).json({ success: true, count: pending.length, data: pending });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/admin/users/:id/verify
// @desc  Verify or reject user
// @access Private (admin)
router.put('/users/:id/verify', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { verified } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { verified },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: `User ${verified ? 'verified' : 'rejected'} successfully`,
      data: user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== BLOOD REQUEST MANAGEMENT ====================

// @route GET /api/admin/requests
// @desc  Get all blood requests with filters
// @access Private (admin)
router.get('/requests', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, urgency, bloodType, city } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (urgency) query.urgency = urgency;
    if (bloodType) query.bloodType = bloodType;
    if (city) query.city = new RegExp(city, 'i');

    const requests = await BloodRequest.find(query)
      .populate('requester', 'name email phone')
      .populate('acceptedBy', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/admin/requests/:id
// @desc  Update blood request
// @access Private (admin)
router.put('/requests/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const allowedFields = ['bloodType', 'quantity', 'urgency', 'reason', 'hospital', 'city', 'status', 'acceptedBy'];
    const updates = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (req.body.status === 'completed') {
      updates.completedAt = new Date();
    }

    const request = await BloodRequest.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('requester acceptedBy');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Request updated successfully',
      data: request
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route DELETE /api/admin/requests/:id
// @desc  Delete blood request
// @access Private (admin)
router.delete('/requests/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const request = await BloodRequest.findByIdAndDelete(req.params.id);
    
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Request deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== DONATION MANAGEMENT ====================

// @route GET /api/admin/donations
// @desc  Get all donations
// @access Private (admin)
router.get('/donations', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    if (status) query.status = status;

    const donations = await Donation.find(query)
      .populate('donor', 'name email phone bloodType')
      .populate('recipient', 'name email phone')
      .populate('bloodRequest', 'bloodType quantity hospital')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/admin/donations/:id
// @desc  Update donation
// @access Private (admin)
router.put('/donations/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const allowedFields = ['status', 'notes'];
    const updates = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('donor recipient bloodRequest');

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Donation updated successfully',
      data: donation
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route DELETE /api/admin/donations/:id
// @desc  Delete donation
// @access Private (admin)
router.delete('/donations/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const donation = await Donation.findByIdAndDelete(req.params.id);
    
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Donation deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== BULK OPERATIONS ====================

// @route POST /api/admin/bulk-verify
// @desc  Bulk verify users
// @access Private (admin)
router.post('/bulk-verify', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userIds, verified } = req.body;
    
    await User.updateMany(
      { _id: { $in: userIds } },
      { verified }
    );

    res.status(200).json({
      success: true,
      message: `${userIds.length} users ${verified ? 'verified' : 'unverified'} successfully`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/admin/bulk-delete-users
// @desc  Bulk delete users
// @access Private (admin)
router.post('/bulk-delete-users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userIds } = req.body;
    
    await User.deleteMany({ _id: { $in: userIds } });
    await BloodRequest.deleteMany({ requester: { $in: userIds } });
    await Donation.deleteMany({ donor: { $in: userIds } });

    res.status(200).json({
      success: true,
      message: `${userIds.length} users and related data deleted successfully`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
