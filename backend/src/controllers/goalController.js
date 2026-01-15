const Goal = require('../models/Goal');

exports.getMyGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ assignedTo: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, goals });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createGoal = async (req, res) => {
    try {
        const { title, kpi, dueDate, assignedToEmployeeId, progress } = req.body;

        const User = require('../models/User');
        const Employee = require('../models/Employee');

        let targetUserId = assignedToEmployeeId;

        // Try to find if this is an Employee ID
        const employee = await Employee.findById(assignedToEmployeeId);
        if (employee) {
            const user = await User.findOne({ email: employee.email });
            if (user) {
                targetUserId = user._id;
            }
        }

        const newGoal = new Goal({
            title,
            kpi,
            dueDate,
            progress: progress || 0,
            assignedTo: targetUserId
        });

        await newGoal.save();
        res.status(201).json({ success: true, goal: newGoal });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateGoalProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const { progress } = req.body;

        const goal = await Goal.findOneAndUpdate(
            { _id: id, assignedTo: req.user.id },
            { progress },
            { new: true }
        );

        if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

        res.status(200).json({ success: true, goal });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
