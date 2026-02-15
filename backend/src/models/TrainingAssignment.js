const mongoose = require('mongoose');

const trainingAssignmentSchema = new mongoose.Schema({
    module: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TrainingModule',
        required: true
    },
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed', 'Overdue'],
        default: 'Not Started'
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    assignedDate: {
        type: Date,
        default: Date.now
    },
    deadline: {
        type: Date,
        required: true
    },
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium'
    },
    isMandatory: {
        type: Boolean,
        default: true
    },
    score: {
        type: Number,
        default: 0
    },
    attemptsUsed: {
        type: Number,
        default: 0
    },
    completedDate: {
        type: Date
    },
    certificateUrl: {
        type: String
    },
    lastActivityDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('TrainingAssignment', trainingAssignmentSchema);
