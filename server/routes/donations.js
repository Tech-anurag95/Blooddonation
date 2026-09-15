const express = require('express');
const router  = express.Router();
const Donation     = require('../models/Donation');
const BloodRequest = require('../models/BloodRequest');
const authMiddleware = require('../middleware/auth');
const generateCertificate = require('../utils/generateCertificate');
const djangoSync   = require('../utils/djangoSync');

function makeCertId() {
  return 'BLD-' + Date.now().toString(36).toUpperCase();
}

// GET /api/donations — donor's own donations with certificate status
router.get('/', authMiddleware, async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.userId })
      .populate('request')
      .sort({ createdAt: -1 });

    // Enrich each donation with live certificate status from Django
    const enriched = await Promise.all(donations.map(async (d) => {
      const obj = d.toObject();
      const status = await djangoSync.getCertificateStatus(d._id.toString());

      // If Django doesn't know about this donation yet, sync it now
      if (status.certificate_status === 'not_found' && d.status === 'completed') {
        const synced = await djangoSync.donation(d);
        obj.certificateStatus = synced ? synced.certificate_status : 'pending_review';
        obj.rejectionReason   = synced ? synced.rejection_reason   : '';
      } else {
        obj.certificateStatus = status.certificate_status;
        obj.rejectionReason   = status.rejection_reason;
      }
      return obj;
    }));

    res.status(200).json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/donations — record a completed donation, sync to Django
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { requestId, recipientName, bloodType, quantity, location, notes } = req.body;

    const donation = new Donation({
      donor: req.userId,
      request: requestId || null,
      recipientName,
      bloodType,
      quantity: quantity || 450,
      location,
      notes,
      status: 'completed',
      completedDate: new Date()
    });

    await donation.save();

    if (requestId) {
      await BloodRequest.findByIdAndUpdate(requestId, {
        status: 'completed',
        completedAt: new Date()
      });
    }

    // Sync to Django (sets certificate_status = pending_review)
    djangoSync.donation(donation);

    res.status(201).json({
      success: true,
      message: 'Donation recorded. Certificate pending admin review.',
      data: donation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/donations/:id/status — real-time certificate status for frontend polling
router.get('/:id/status', authMiddleware, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });
    if (donation.donor.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const status = await djangoSync.getCertificateStatus(req.params.id);
    res.status(200).json({ success: true, ...status });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/donations/:id/certificate — download for any completed donation (no admin approval needed)
router.get('/:id/certificate', authMiddleware, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id).populate('donor', 'name');
    if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });

    if (donation.donor._id.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (donation.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Donation is not completed yet' });
    }

    generateCertificate(res, {
      donorName:     donation.donor.name,
      bloodType:     donation.bloodType || 'N/A',
      quantity:      donation.quantity  || 450,
      recipientName: donation.recipientName || null,
      hospital:      donation.location ? donation.location.split(',')[0].trim() : null,
      city:          donation.location ? donation.location.split(',').slice(1).join(',').trim() : null,
      completedDate: donation.completedDate || donation.date,
      certificateId: makeCertId()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
