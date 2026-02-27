const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  phone: String,
  role: {
    type: String,
    enum: ['donor', 'recipient', 'admin'],
    default: 'recipient'
  },
  bloodType: {
    type: String,
    enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
  },
  city: String,
  state: String,
  latitude: Number,
  longitude: Number,
  age: Number,
  weight: Number,
  lastDonation: Date,
  availableToDonate: Boolean,
  verified: {
    type: Boolean,
    default: false
  },
  // Verification documents uploaded by the user (paths)
  verificationDocs: [{ type: String }],
  // Email & password reset tokens
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  // Web Push subscriptions for this user
  pushSubscriptions: {
    type: Array,
    default: []
  },
  profilePicture: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
