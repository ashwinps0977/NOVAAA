const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    projectName: {
        type: String,
        trim: true
    },
    // Compatibility with title used in projectController
    title: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    requiredSkills: [{
        skill: String,
        level: { type: Number, min: 1, max: 5 }
    }],
    minExperience: {
        type: Number,
        default: 0
    },
    role: {
        type: String
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date
    },
    deadline: {
        type: Date
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    },
    assignedToUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['Planning', 'Active', 'Completed', 'Pending', 'In Progress', 'For Review', 'On Hold', 'Delayed'],
        default: 'Pending'
    },
    progressPercentage: {
        type: Number,
        default: 0
    },
    updates: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: String,
        progressPercentage: Number,
        feedback: String,
        attachments: [{
            fileName: String,
            fileUrl: String,
            fileType: String // photo, code, file
        }],
        createdAt: { type: Date, default: Date.now }
    }],
    // Keep internal tracking
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
