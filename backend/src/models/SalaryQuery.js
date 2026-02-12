const mongoose = require('mongoose');

const salaryQuerySchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Payslip Correction', 'Salary Discrepancy', 'Tax Query', 'Bonus Query', 'Other'],
        required: true
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
        default: 'Open'
    },
    adminResponse: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('SalaryQuery', salaryQuerySchema);
