const mongoose = require('mongoose');

const deductionSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String, // e.g., "Advance Salary", "LWP", "Damage Recovery"
        required: true
    },
    reason: String,
    date: {
        type: Date,
        default: Date.now
    },
    payrollPeriod: {
        month: String,
        year: Number
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Deducted'],
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Deduction', deductionSchema);
