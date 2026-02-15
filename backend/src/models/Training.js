const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
    title: {
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
        enum: ['Onboarding', 'Technical', 'Soft Skills', 'Compliance', 'Upskilling'],
        required: true
    },
    provider: {
        type: String,
        default: 'Internal'
    },
    duration: {
        type: String, // e.g., "8h", "2 Weeks"
        required: true
    },
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed'],
        default: 'Not Started'
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedDate: {
        type: Date,
        default: Date.now
    },
    completedDate: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Training', trainingSchema);
