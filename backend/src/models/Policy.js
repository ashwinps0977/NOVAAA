const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String, // e.g., "General", "HR", "Operations"
        required: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    content: {
        type: String,
        default: ''
    },
    url: { // If it's a link to a PDF or doc
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Policy', policySchema);
