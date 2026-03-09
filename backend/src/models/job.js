const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    enum: ['Engineering', 'Design', 'Product', 'Sales', 'Marketing', 'Human Resources', 'Finance', 'Operations']
  },
  location: {
    type: String,
    required: true
  },
  jobType: {
    type: String,
    required: true,
    enum: ['full-time', 'part-time', 'contract', 'internship']
  },
  experienceLevel: {
    type: String,
    required: true,
    enum: ['entry', 'mid', 'senior', 'lead']
  },
  minExperience: {
    type: Number,
    default: 0
  },
  maxExperience: {
    type: Number,
    default: 5
  },
  salaryRange: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  description: {
    type: String,
    required: true
  },
  responsibilities: [{
    type: String
  }],
  requirements: [{
    type: String
  }],
  skills: [{
    type: String
  }],
  benefits: [{
    type: String
  }],
  applicationDeadline: {
    type: Date,
    required: true
  },
  vacancies: {
    type: Number,
    default: 1,
    min: 1
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicants: {
    type: Number,
    default: 0
  },
  shortlisted: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Job || mongoose.model('Job', jobSchema);