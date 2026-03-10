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
        hra: { type: Number, default: 0 },
        da: { type: Number, default: 0 },
        specialAllowance: { type: Number, default: 0 },
        conveyanceAllowance: { type: Number, default: 0 },
        medicalAllowance: { type: Number, default: 0 },
        internetAllowance: { type: Number, default: 0 },
        transportAllowance: { type: Number, default: 0 },
        mealAllowance: { type: Number, default: 0 },
        shiftAllowance: { type: Number, default: 0 },
        performancePay: { type: Number, default: 0 }
    },
    deductions: {
        pf: { type: Number, default: 0 },
        professionalTax: { type: Number, default: 0 },
        insurancePremium: { type: Number, default: 0 }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('SalaryStructure', salaryStructureSchema);
