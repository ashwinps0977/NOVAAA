const mongoose = require('mongoose');

const GlobalSettingsSchema = new mongoose.Schema({
    organization: {
        name: { type: String, default: 'Nova Corp' },
        logo: { type: String },
        brandColor: { type: String, default: '#3b82f6' },
        locations: [{
            name: String,
            address: String,
            timezone: String
        }],
        workingHours: {
            start: { type: String, default: '09:00' },
            end: { type: String, default: '18:00' },
            workingDays: [{ type: String, default: 'Monday', enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }]
        },
        holidayCalendar: [{
            name: String,
            date: Date,
            type: { type: String, enum: ['Mandatory', 'Optional'] }
        }]
    },
    payroll: {
        salaryTemplates: [{
            name: String,
            baseStructure: Map
        }],
        allowances: [{
            name: String,
            percentage: Number,
            fixedAmount: Number
        }],
        taxRules: [{
            slab: String,
            rate: Number
        }],
        payCycle: { type: String, enum: ['Monthly', 'Bi-weekly', 'Weekly'], default: 'Monthly' },
        bonusRules: String
    },
    leaveAttendance: {
        leaveTypes: [{
            name: String,
            maxDays: Number,
            carryForward: Boolean
        }],
        shiftTimings: [{
            name: String,
            start: String,
            end: String
        }],
        overtimeRules: {
            enabled: { type: Boolean, default: false },
            rate: Number
        },
        wfhLimits: { type: Number, default: 4 } // days per month
    },
    aiAutomation: {
        enabledModules: [{ type: String }],
        resumeScreeningThreshold: { type: Number, default: 70 },
        attritionPredictionSensitivity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
        aiChatbotTone: { type: String, enum: ['Formal', 'Friendly', 'Professional'], default: 'Professional' },
        autoApproveLeave: { type: Boolean, default: false }
    },
    notifications: {
        smtp: {
            host: String,
            port: Number,
            user: String
        },
        templates: [{
            name: String,
            subject: String,
            body: String
        }],
        triggers: [{
            event: String,
            enabled: Boolean
        }]
    },
    security: {
        passwordRules: {
            minLength: { type: Number, default: 8 },
            requireSpecialChar: { type: Boolean, default: true }
        },
        sessionTimeout: { type: Number, default: 60 }, // minutes
        twoFactorAuth: { type: Boolean, default: false }
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('GlobalSettings', GlobalSettingsSchema);
