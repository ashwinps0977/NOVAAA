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
    required: false
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
  matchedSkills: [String],
  parsedSkills: [String],
  matchPercentage: {
    type: Number,
    default: 0
  },
  // Detailed AI Analysis Fields
  candidateDetails: {
    location: String,
    education: [{
      degree: String,
      institution: String,
      year: String
    }],
    experience: [{
      title: String,
      company: String,
      duration: String,
      responsibilities: String
    }],
    projects: [{
      title: String,
      description: String,
      technologies: [String]
    }],
    certifications: [String]
  },
  scoreBreakdown: {
    skills: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    education: { type: Number, default: 0 },
    projects: { type: Number, default: 0 }
  },
  aiRecommendations: String,
  strengths: [String],
  gaps: [String],
  analysisSummary: String,
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
  interviewScheduled: Date,
  // Analytics Fields
  source: {
    type: String,
    enum: ['LinkedIn', 'Referral', 'Portal', 'Direct', 'Other'],
    default: 'Portal'
  },
  hiredDate: {
    type: Date
  },
  offerAcceptedDate: {
    type: Date
  },
  recruitmentCost: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.JobApplication || mongoose.model('JobApplication', jobApplicationSchema);