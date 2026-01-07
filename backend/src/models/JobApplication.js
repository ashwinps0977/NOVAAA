const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  currentCompany: String,
  currentRole: String,
  experience: {
    type: Number,
    required: true
  },
  coverLetter: String,
  skills: [String],
  resumeUrl: String,
  resumeFileName: String,
  parsedSkills: [String], // Skills extracted from resume
  matchPercentage: {
    type: Number,
    default: 0
  },
  matchedSkills: [String],
  status: {
    type: String,
    enum: ['pending', 'shortlisted', 'rejected', 'interview-scheduled', 'hired'],
    default: 'pending'
  },
  notes: [{
    text: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  interviewScheduled: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('JobApplication', jobApplicationSchema);