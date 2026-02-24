const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
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
    required: true
  },
  role: {
    type: String,
    enum: ['employee', 'hr', 'admin'],
    default: 'employee'
  },
  department: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  auditLog: [{
    action: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    details: String
  }],
  reasonForChange: String, // Section G
  appraisalRecord: String,  // Section G
  phone: {
    type: String
  },
  salaryStructure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalaryStructure'
  },
  salary: {
    type: Number,
    default: 0
  },
  currentSalary: {
    type: Number, // Actual base salary amount
    default: 0
  },
  bankDetails: {
    accountNumber: String,
    bankName: String,
    ifscCode: String,
    panNumber: String
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  project: {
    type: String
  },
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Intern', 'Freelance'],
    default: 'Full-time'
  },
  salaryGrade: {
    type: String,
    default: 'Grade C'
  },
  salaryBand: {
    type: String, // e.g., "Band 1"
    default: 'Band 1'
  },
  currentCTC: {
    type: Number,
    default: 0
  },
  lastRevisionDate: {
    type: Date
  },
  nextAppraisalDate: {
    type: Date
  },
  taxRegime: {
    type: String,
    enum: ['Old', 'New'],
    default: 'New'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on-leave'],
    default: 'active'
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  address: {
    type: String
  },
  emergencyContact: {
    name: String,
    relation: String,
    phone: String
  },
  profilePhoto: {
    type: String,
    default: null
  },
  workPreferences: {
    preferredHours: String,
    workLocation: { type: String, enum: ['WFH', 'Office', 'Hybrid'], default: 'Office' },
    leavePreferences: String,
    trainingInterests: [String],
    careerGoals: [String]
  },
  documents: [{
    type: { type: String }, // Resume, Certificate, ID, Bank
    name: String,
    url: String,
    uploadDate: { type: Date, default: Date.now }
  }],
  learning: {
    interestedSkills: [String],
    preferredCourses: [String],
    certificationGoals: [String]
  },
  aiSettings: {
    enabled: { type: Boolean, default: true },
    tone: { type: String, enum: ['formal', 'friendly', 'professional'], default: 'professional' },
    recommendationPreferences: { type: Boolean, default: true }
  },
  // Analytics Fields
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say']
  },
  dob: {
    type: Date
  },
  performanceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  taskCompletionRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  onTimeDeliveryRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  currentCapacity: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  yearsInCompany: {
    type: Number,
    default: 0
  },
  totalExperience: {
    type: Number,
    default: 0
  },
  activeProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  promotionHistory: [{
    title: String,
    date: { type: Date, default: Date.now }
  }],
  exitDate: {
    type: Date
  },
  exitReason: {
    type: String
  }
});

module.exports = mongoose.model('Employee', employeeSchema);