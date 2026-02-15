const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['Technical', 'Soft Skills', 'Business', 'Others'],
        default: 'Technical'
    },
    currentLevel: {
        type: Number,
        min: 1,
        max: 5,
        default: 1
    },
    requiredLevel: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
    },
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastAssessmentDate: {
        type: Date,
        default: Date.now
    },
    careerPathGoal: {
        type: String // e.g., "Senior Developer", "Architect"
    }
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);
