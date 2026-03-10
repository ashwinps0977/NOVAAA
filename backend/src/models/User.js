const mongoose = require('mongoose');

// SIMPLE USER MODEL - NO PRE-SAVE HOOKS
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: false
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  githubId: {
    type: String,
    unique: true,
    sparse: true
  },
  role: {
    type: String,
    enum: ['employee', 'hr', 'admin'],
    default: 'employee'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  profilePhoto: {
    type: String,
    default: null
  },
  preferences: {
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' },
    dateFormat: { type: String, default: 'MMM DD, YYYY' }
  },
  security: {
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorMethod: { type: String, enum: ['email', 'app'], default: 'email' },
    loginHistory: [{
      device: String,
      time: { type: Date, default: Date.now },
      ip: String,
      location: String
    }],
    securityAlerts: { type: Boolean, default: true }
  },
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    inApp: { type: Boolean, default: true },
    leaveUpdates: { type: Boolean, default: true },
    salaryUpdates: { type: Boolean, default: true },
    hrAnnouncements: { type: Boolean, default: true },
    aiAlerts: { type: Boolean, default: true }
  },
  privacy: {
    hideContactInfo: { type: Boolean, default: false },
    profileVisibility: { type: String, enum: ['public', 'private', 'team'], default: 'team' },
    dataSharingConsent: { type: Boolean, default: true }
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

// No pre-save hooks - handle hashing in controller
module.exports = mongoose.model('User', userSchema);