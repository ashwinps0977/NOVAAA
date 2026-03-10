const mongoose = require('mongoose');

const trainingModuleSchema = new mongoose.Schema({
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
        enum: [
            'Software Development',
            'Quality Assurance',
            'IT Infrastructure',
            'Data & Analytics',
            'Security & Compliance',
            'Project & Product Management',
            'UX / Design',
            'IT Sales / Marketing',
            'Emerging Technologies',
            'Executive & Leadership',
            'Supporting Roles',
            'Technical',
            'Soft Skills',
            'Compliance',
            'Security',
            'Onboarding'
        ],
        required: true
    },
    skillTags: [{
        type: String,
        trim: true
    }],
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner'
    },
    duration: {
        type: String, // e.g., "2 hrs", "3 days"
        required: true
    },
    format: {
        type: String,
        enum: ['Video', 'PDF', 'PPT', 'Live Session', 'Quiz-based'],
        required: true
    },
    trainerName: {
        type: String,
        default: 'Internal'
    },
    validityMonths: {
        type: Number,
        default: 12
    },
    contentUrl: {
        type: String
    },
    quiz: [{
        question: String,
        options: [String],
        correctAnswer: Number // index
    }],
    passingMark: {
        type: Number,
        default: 70
    },
    attemptsAllowed: {
        type: Number,
        default: 3
    }
}, { timestamps: true });

module.exports = mongoose.model('TrainingModule', trainingModuleSchema);
