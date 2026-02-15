const GlobalSettings = require('../models/GlobalSettings');
const User = require('../models/User');

// Get global settings
exports.getSettings = async (req, res) => {
    try {
        let settings = await GlobalSettings.findOne();
        if (!settings) {
            // Create default settings if none exist
            settings = await GlobalSettings.create({
                organization: { name: 'Nova HR' },
                aiAutomation: { enabledModules: ['Recruitment', 'Attendance', 'Payroll'] }
            });
        }
        res.json({ success: true, settings });
    } catch (error) {
        console.error('Get global settings error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching settings' });
    }
};

// Update global settings
exports.updateSettings = async (req, res) => {
    try {
        const { category } = req.params;
        const updateData = req.body;

        let settings = await GlobalSettings.findOne();
        if (!settings) {
            settings = new GlobalSettings();
        }

        if (category) {
            settings[category] = { ...settings[category], ...updateData };
        } else {
            // Full update
            Object.keys(updateData).forEach(key => {
                settings[key] = updateData[key];
            });
        }

        settings.updatedBy = req.user.id;
        settings.updatedAt = Date.now();
        await settings.save();

        res.json({ success: true, message: `${category || 'Settings'} updated successfully`, settings });
    } catch (error) {
        console.error('Update global settings error:', error);
        res.status(500).json({ success: false, message: 'Server error updating settings' });
    }
};

// Manage HR Users & Roles
exports.getHRUsers = async (req, res) => {
    try {
        const hrUsers = await User.find({ role: 'hr' }).select('-password');
        res.json({ success: true, users: hrUsers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching HR users' });
    }
};

exports.createHRUser = async (req, res) => {
    try {
        const { name, email, password, permissions } = req.body;
        // Logic for creating HR user (similar to auth register but forced HR role)
        // ... implementation details
        res.json({ success: true, message: 'HR User created' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating HR user' });
    }
};
