const mongoose = require('mongoose');

const employeePerformanceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    month: {
        type: String, // Format: YYYY-MM
        required: true
    },
    kpiScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    onTimeDelivery: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    goalCompletion: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    attritionRisk: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Low'
    }
}, { collection: 'employee_performance' });

module.exports = mongoose.model('EmployeePerformance', employeePerformanceSchema);
