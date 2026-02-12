const mongoose = require('mongoose');

const taxRuleSchema = new mongoose.Schema({
    name: {
        type: String, // e.g., "Standard Tax Slab 2025"
        required: true
    },
    financialYear: {
        type: String, // e.g., "2025-2026"
        required: true
    },
    minIncome: {
        type: Number,
        required: true
    },
    maxIncome: {
        type: Number, // Use extremely high number for top slab
        required: true
    },
    percentage: {
        type: Number,
        required: true
    },
    description: String,
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('TaxRule', taxRuleSchema);
