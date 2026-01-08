const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: String, // Storing as YYYY-MM-DD for easy querying
        required: true
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'leave', 'holiday'],
        default: 'present'
    },
    checkIn: {
        type: Date
    },
    checkOut: {
        type: Date
    },
    workingHours: {
        type: Number, // In hours
        default: 0
    }
}, { timestamps: true });

// Ensure one record per user per day
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
