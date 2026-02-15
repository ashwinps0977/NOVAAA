const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
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
  // Earnings Breakup
  basic: { type: Number, required: true },
  hra: { type: Number, required: true },
  specialAllowance: { type: Number, default: 0 },
  conveyanceAllowance: { type: Number, default: 0 },
  medicalAllowance: { type: Number, default: 0 },
  internetAllowance: { type: Number, default: 0 },
  transportAllowance: { type: Number, default: 0 },
  mealAllowance: { type: Number, default: 0 },
  shiftAllowance: { type: Number, default: 0 },
  projectAllowance: { type: Number, default: 0 },
  performancePay: { type: Number, default: 0 },

  // Employer Contributions
  employerPF: { type: Number, default: 0 },
  employerInsurance: { type: Number, default: 0 },
  gratuity: { type: Number, default: 0 },
  esi: { type: Number, default: 0 },

  // Deductions Section
  pf: { type: Number, required: true },
  professionalTax: { type: Number, default: 0 },
  incomeTaxTDS: { type: Number, default: 0 },
  insurancePremium: { type: Number, default: 0 },
  loanDeduction: { type: Number, default: 0 },
  advanceSalaryDeduction: { type: Number, default: 0 },
  latePenalty: { type: Number, default: 0 },
  lop: { type: Number, default: 0 }, // Loss of Pay
  otherDeductions: { type: Number, default: 0 },

  // Variable & Incentives
  performanceIncentive: { type: Number, default: 0 },
  salesCommission: { type: Number, default: 0 },
  projectBonus: { type: Number, default: 0 },
  spotAward: { type: Number, default: 0 },
  referralBonus: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },

  // Tax & Compliance
  pan: String,
  taxRegime: { type: String, enum: ['Old', 'New'] },
  hraDeclaration: { type: Number, default: 0 },
  investmentDeclarations: {
    section80C: { type: Number, default: 0 },
    section80D: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  taxSlab: String,
  tdsAmount: { type: Number, default: 0 },

  // Bank & Payment Info
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  ifsc: String,
  paymentMode: { type: String, enum: ['Bank Transfer', 'Cheque', 'Cash'], default: 'Bank Transfer' },
  salaryCreditDate: Date,
  transactionReference: String,

  // Section G: Salary History Extras
  reasonForChange: String,
  appraisalRecord: String,

  netSalary: {
    type: Number,
    required: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
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
    action: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    details: String
  }]
}, { timestamps: true });

// Prevent duplicate salary entries for same month/year for an employee
salarySchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Salary', salarySchema);
