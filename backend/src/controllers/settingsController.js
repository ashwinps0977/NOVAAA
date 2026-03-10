const User = require('../models/User');
const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');

// Get all settings for current user
exports.getSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        const employee = await Employee.findOne({ email: user.email });

        res.json({
            success: true,
            settings: {
                preferences: user.preferences,
                security: {
                    twoFactorEnabled: user.security.twoFactorEnabled,
                    twoFactorMethod: user.security.twoFactorMethod,
                    loginHistory: user.security.loginHistory.slice(0, 10), // Last 10 logins
                    securityAlerts: user.security.securityAlerts
                },
                notifications: user.notifications,
                privacy: user.privacy,
                workPreferences: employee?.workPreferences,
                aiSettings: employee?.aiSettings,
                learning: employee?.learning,
                bankDetails: employee?.bankDetails,
                taxRegime: employee?.taxRegime
            }
        });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching settings' });
    }
};

// Update User Preferences
exports.updatePreferences = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.preferences = { ...user.preferences, ...req.body };
        await user.save();
        res.json({ success: true, message: 'Preferences updated', preferences: user.preferences });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Update failed' });
    }
};

// Update Notification Settings
exports.updateNotifications = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.notifications = { ...user.notifications, ...req.body };
        await user.save();
        res.json({ success: true, message: 'Notifications updated', notifications: user.notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Update failed' });
    }
};

// Update Privacy Settings
exports.updatePrivacy = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.privacy = { ...user.privacy, ...req.body };
        await user.save();
        res.json({ success: true, message: 'Privacy settings updated', privacy: user.privacy });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Update failed' });
    }
};

// Update Work Preferences
exports.updateWorkPreferences = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const employee = await Employee.findOne({ email: user.email });
        if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

        employee.workPreferences = { ...employee.workPreferences, ...req.body };
        await employee.save();
        res.json({ success: true, message: 'Work preferences updated', workPreferences: employee.workPreferences });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Update failed' });
    }
};

// Update AI Settings
exports.updateAiSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const employee = await Employee.findOne({ email: user.email });
        employee.aiSettings = { ...employee.aiSettings, ...req.body };
        await employee.save();
        res.json({ success: true, message: 'AI settings updated', aiSettings: employee.aiSettings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Update failed' });
    }
};

// Update Bank Details & Payroll Settings
exports.updatePayrollSettings = async (req, res) => {
    try {
        const { bankDetails, taxRegime } = req.body;
        const user = await User.findById(req.user.id);
        const employee = await Employee.findOne({ email: user.email });

        if (bankDetails) employee.bankDetails = { ...employee.bankDetails, ...bankDetails };
        if (taxRegime) employee.taxRegime = taxRegime;

        await employee.save();
        res.json({ success: true, message: 'Payroll settings updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Update failed' });
    }
};

// Handle Employee Profile Update (Limited)
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, address, emergencyContact } = req.body;
        const user = await User.findById(req.user.id);
        const employee = await Employee.findOne({ email: user.email });

        if (name) {
            user.name = name;
            employee.name = name;
        }
        if (phone) employee.phone = phone;
        if (address) employee.address = address;
        if (emergencyContact) employee.emergencyContact = emergencyContact;

        await user.save();
        await employee.save();

        res.json({ success: true, message: 'Profile updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Update failed' });
    }
};

const fs = require('fs');
const path = require('path');

// Update Password
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user.password) {
            // Handle case where user might have signed in via social but wants to set a password
            // (though ideally they should have a password or we should let them set one)
        } else {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: 'Incorrect current password' });
            }
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({ success: false, message: 'Update failed' });
    }
};

// Toggle 2FA
exports.update2FA = async (req, res) => {
    try {
        const { enabled } = req.body;
        const user = await User.findById(req.user.id);

        user.security.twoFactorEnabled = enabled;
        await user.save();

        res.json({ success: true, message: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'}`, enabled: user.security.twoFactorEnabled });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Update failed' });
    }
};

// Update Learning/Skills
exports.updateLearning = async (req, res) => {
    try {
        const { learning } = req.body;
        const user = await User.findById(req.user.id);
        const employee = await Employee.findOne({ email: user.email });

        if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

        employee.learning = learning;
        await employee.save();

        res.json({ success: true, message: 'Skills updated', learning: employee.learning });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Update failed' });
    }
};

// Export User Data
exports.exportData = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        const employee = await Employee.findOne({ email: user.email });

        const exportData = {
            user,
            employee,
            exportedAt: new Date().toISOString()
        };

        res.json({ success: true, data: exportData });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Export failed' });
    }
};

// Deactivate Account
exports.deactivateAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const employee = await Employee.findOne({ email: user.email });

        user.status = 'inactive';
        if (employee) employee.status = 'inactive';

        await user.save();
        if (employee) await employee.save();

        res.json({ success: true, message: 'Account deactivated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Deactivation failed' });
    }
};

// Upload Profile Photo (Base64 for simplicity in this demo)
exports.uploadProfilePhoto = async (req, res) => {
    try {
        const { photo } = req.body; // Expecting base64 string
        const user = await User.findById(req.user.id);
        const employee = await Employee.findOne({ email: user.email });

        user.profilePhoto = photo;
        if (employee) employee.profilePhoto = photo;

        await user.save();
        if (employee) await employee.save();

        res.json({ success: true, message: 'Profile photo updated', photo: user.profilePhoto });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Upload failed' });
    }
};

// Upload Document Placeholder
exports.uploadDocument = async (req, res) => {
    try {
        const { type, name, url } = req.body;
        const user = await User.findById(req.user.id);
        const employee = await Employee.findOne({ email: user.email });

        employee.documents.push({ type, name, url });
        await employee.save();

        res.json({ success: true, message: 'Document added', documents: employee.documents });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Upload failed' });
    }
};
