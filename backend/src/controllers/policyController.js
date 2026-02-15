const Policy = require('../models/Policy');

exports.getAllPolicies = async (req, res) => {
    try {
        const policies = await Policy.find().sort({ lastUpdated: -1 });
        res.status(200).json({ success: true, policies });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createPolicy = async (req, res) => {
    try {
        const { title, category, content } = req.body;

        const newPolicy = new Policy({
            title,
            category,
            content,
            lastUpdated: Date.now()
        });

        await newPolicy.save();
        res.status(201).json({ success: true, policy: newPolicy });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
