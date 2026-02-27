const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Donation = require('../models/Donation');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/donors
// @desc    Get all donors
// @access  Public
router.get('/', async (req, res) => {
  try {
    const donors = await User.find({ role: 'donor' }).select('-password');
    res.status(200).json({
      success: true,
      count: donors.length,
      data: donors
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/donors/nearby
// @desc    Get nearby donors by blood type
// @access  Public
router.get('/nearby', async (req, res) => {
  try {
    const { bloodType, latitude, longitude, radius = 50 } = req.query;

    // Find donors with matching blood type
    let query = { role: 'donor', availableToDonate: true };
    if (bloodType) {
      query.bloodType = bloodType;
    }

    const donors = await User.find(query).select('-password');

    // Filter by distance (simplified - in production use geospatial queries)
    const nearbyDonors = donors.filter(donor => {
      if (!latitude || !longitude || !donor.latitude || !donor.longitude) return true;
      
      // Haversine distance formula
      const R = 6371; // Earth's radius in km
      const dLat = (donor.latitude - parseFloat(latitude)) * Math.PI / 180;
      const dLon = (donor.longitude - parseFloat(longitude)) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(parseFloat(latitude) * Math.PI / 180) * Math.cos(donor.latitude * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      return distance <= parseFloat(radius);
    });

    res.status(200).json({
      success: true,
      count: nearbyDonors.length,
      data: nearbyDonors
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/donors/:id
// @desc    Get donor by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const donor = await User.findById(req.params.id).select('-password');
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }
    res.status(200).json({
      success: true,
      data: donor
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/donors/register
// @desc    Register as a donor
// @access  Private
router.post('/register', authMiddleware, async (req, res) => {
  try {
    const { bloodType, age, weight, lastDonation } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        role: 'donor',
        bloodType,
        age,
        weight,
        lastDonation,
        availableToDonate: true
      },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Successfully registered as a donor',
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/donors/:id
// @desc    Update donor profile
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const allowedFields = ['name', 'phone', 'city', 'state', 'age', 'weight', 'latitude', 'longitude', 'availableToDonate'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const donor = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');

    res.status(200).json({
      success: true,
      message: 'Donor profile updated',
      data: donor
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/donors/:id/donations
// @desc    Get donor's donation history
// @access  Private
router.get('/:id/donations', authMiddleware, async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.params.id })
      .populate('request', 'bloodType quantity');

    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/donors/accept-request
// @desc    Accept a blood request
// @access  Private
router.post('/accept-request', authMiddleware, async (req, res) => {
  try {
    const { requestId } = req.body;
    
    // Create donation record
    const donation = new Donation({
      donor: req.userId,
      request: requestId,
      status: 'accepted',
      date: new Date()
    });

    await donation.save();

    res.status(200).json({
      success: true,
      message: 'Request accepted successfully',
      data: donation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
