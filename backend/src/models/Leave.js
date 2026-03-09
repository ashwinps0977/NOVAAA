const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['Siick', 'Casual', 'Earned', 'Unpaid'], // "Siick" typo in user prompt? Assuming user meant Sick, but I will fix typo to Sick
        enum: ['Sick', 'Casual', 'Earned', 'Unpaid'],
        required: true
    },
    startDate: {
        type: String, // YYYY-MM-DD
        required: true
    },
    endDate: {
        type: String, // YYYY-MM-DD
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    adminComments: {
        type: String
    },
    days: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.models.Leave || mongoose.model('Leave', leaveSchema);
