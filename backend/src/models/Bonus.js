const mongoose = require('mongoose');

const bonusSchema = new mongoose.Schema({
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
        type: String, // e.g., "Performance", "Holiday", "Commission"
        required: true
    },
    reason: String,
    date: {
        type: Date,
        default: Date.now
    },
    payrollPeriod: {
        month: String, // e.g. "January"
        year: Number   // e.g. 2026
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Paid'],
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Bonus', bonusSchema);
