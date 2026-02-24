const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    teamName: {
        type: String,
        required: true,
        trim: true
    },
    teamLead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    }],
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    averageSkillScore: {
        type: Number,
        default: 0
    },
    averagePerformanceScore: {
        type: Number,
        default: 0
    },
    teamProgress: {
        type: Number,
        default: 0
    },
    teamPerformanceScore: {
        type: Number,
        default: 0
    },
    teamStatus: {
        type: String,
        enum: ['Idle', 'Active', 'Completed'],
        default: 'Idle'
    },
    teamHealth: {
        type: Number,
        default: 100
    }
}, { timestamps: true });

teamSchema.pre('save', async function (next) {
    if (this.isModified('members') || this.isNew) {
        try {
            const Employee = mongoose.model('Employee');
            const members = await Employee.find({ _id: { $in: this.members } });

            if (members.length > 0) {
                const totalPerf = members.reduce((acc, m) => acc + (m.performanceScore || 0), 0);
                const totalComp = members.reduce((acc, m) => acc + (m.taskCompletionRate || 0), 0);

                this.averagePerformanceScore = totalPerf / members.length;
                this.teamPerformanceScore = this.averagePerformanceScore; // Simple average
                this.teamProgress = totalComp / members.length;
            }
        } catch (err) {
            console.error('Error in Team pre-save hook:', err);
        }
    }
    next();
});

module.exports = mongoose.model('Team', teamSchema);
