const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    kpi: {
        type: String, // e.g., "Technical Skills", "Leadership"
        required: true
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    dueDate: {
        type: String,
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Goal', goalSchema);
