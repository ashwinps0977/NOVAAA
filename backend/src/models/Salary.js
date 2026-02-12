const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: String,
    required: true, // e.g., "January"
    enum: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  },
  year: {
    type: Number,
    required: true // e.g., 2024
  },
  basic: {
    type: Number,
    required: true
  },
  hra: {
    type: Number,
    required: true
  },
  da: {
    type: Number,
    default: 0
  },
  pf: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    default: 0
  },
  bonus: {
    type: Number,
    default: 0
  },
  deductions: {
    type: Number,
    default: 0
  },
  netSalary: {
    type: Number,
    required: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  accountNumber: {
    type: String, // Masked or full, but mostly for display
    required: true
  },
  bankName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending', 'Processing'],
    default: 'Pending'
  },
  payroll: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payroll'
  },
  auditLog: [{
    action: String, // e.g., "Created", "Updated Bonus", "Paid"
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    details: String
  }]
}, { timestamps: true });

// Prevent duplicate salary entries for same month/year for an employee
salarySchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Salary', salarySchema);
