const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    recipient: {
        type: String,
        required: true,
        index: true
    },
    otp: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['email', 'phone'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // OTP expires in 5 minutes (300 seconds)
    }
});

module.exports = mongoose.model('OTP', otpSchema);
