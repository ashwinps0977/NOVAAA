const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    month: {
        type: String,
        required: true,
        enum: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    },
    year: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Draft', 'Processing', 'Approved', 'Paid'],
        default: 'Draft'
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    generatedAt: Date,
    paidAt: Date,
    details: {
        totalEmployees: Number,
        manualAdjustments: Number
    }
}, { timestamps: true });

// Prevent duplicate payrolls for same month/year
payrollSchema.index({ month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
