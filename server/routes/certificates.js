const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const authMiddleware = require('../middleware/auth');
const User     = require('../models/User');
const djangoSync = require('../utils/djangoSync');

// ── Storage: save to server/uploads/certificates/ ────────────────────────────
const uploadDir = path.join(__dirname, '../uploads/certificates');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const name = `cert-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only images and PDFs are allowed'));
  }
});

// POST /api/certificates/upload
router.post('/upload', authMiddleware, upload.single('certificate_image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { donation_date, hospital_name, blood_type, quantity } = req.body;
    if (!donation_date || !hospital_name) {
      return res.status(400).json({ success: false, message: 'donation_date and hospital_name are required' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Build a public URL for the file
    const SERVER_URL = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
    const fileUrl    = `${SERVER_URL}/uploads/certificates/${req.file.filename}`;
    const fileType   = req.file.mimetype === 'application/pdf' ? 'pdf' : 'image';

    // Create a fake mongo_id for tracking (timestamp-based)
    const mongo_id = `cert-${Date.now()}-${req.userId}`;

    // Sync to Django for admin review
    const synced = await djangoSync.uploadedCertificate({
      mongo_id,
      donorMongoId:  req.userId,
      donorEmail:    user.email,
      donorName:     user.name,
      hospitalName:  hospital_name,
      donationDate:  donation_date,
      bloodType:     blood_type || user.bloodType,
      quantity:      parseInt(quantity) || 450,
      fileUrl,
      fileType,
    });

    res.status(201).json({
      success:   true,
      message:   'Certificate uploaded and submitted for admin review.',
      mongo_id,
      fileUrl,
      certStatus: synced?.cert_status || 'pending',
    });
  } catch (err) {
    console.error('Certificate upload error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
