const mongoose = require('mongoose');

const salaryStructureSchema = new mongoose.Schema({
    name: {
        type: String, // e.g., "Grade A - Senior Dev"
        required: true,
        unique: true
    },
    description: String,
    baseSalary: {
        type: Number,
        required: true
    },
    components: {
        hra: { type: Number, default: 0 }, // Percentage or fixed amount
        da: { type: Number, default: 0 },
        travelAllowance: { type: Number, default: 0 },
        medicalAllowance: { type: Number, default: 0 },
        specialAllowance: { type: Number, default: 0 }
    },
    deductions: {
        pf: { type: Number, default: 0 }, // Percentage
        tax: { type: Number, default: 0 } // Percentage
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('SalaryStructure', salaryStructureSchema);
