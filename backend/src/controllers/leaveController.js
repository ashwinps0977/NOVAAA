const Leave = require('../models/Leave');

// Helper to calculate days between dates
const calculateDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
};

exports.applyLeave = async (req, res) => {
    try {
        const { type, startDate, endDate, reason } = req.body;

        // Auto-calculate days
        const days = calculateDays(startDate, endDate);

        // Check if overlap exists? (Optional enhancement)

        const leave = new Leave({
            user: req.user.id,
            type,
            startDate,
            endDate,
            reason,
            days
        });

        await leave.save();

        res.status(201).json({
            success: true,
            message: 'Leave application submitted successfully',
            leave
        });
    } catch (error) {
        console.error('Apply leave error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit leave application'
        });
    }
};

exports.getMyLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ user: req.user.id }).sort({ createdAt: -1 });

        // Mock balances for now (or store in Employee model eventually)
        // We can just return standard balances
        const balances = {
            Sick: 7,
            Casual: 5,
            Earned: 15
        };

        // Calculate used
        leaves.forEach(l => {
            if (l.status === 'Approved' && balances[l.type]) {
                balances[l.type] -= l.days;
            }
        });

        res.json({
            success: true,
            leaves,
            balances
        });
    } catch (error) {
        console.error('Get my leaves error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leaves'
        });
    }
};

// HR: Get all leaves
exports.getAllLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find()
            .populate('user', 'name email department position')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            leaves
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch all leaves'
        });
    }
};

exports.cancelLeave = async (req, res) => {
    try {
        const leave = await Leave.findOne({ _id: req.params.id, user: req.user.id });

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave application not found'
            });
        }

        if (leave.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: 'Can only cancel pending leave requests'
            });
        }

        await Leave.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Leave application cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel leave error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel leave'
        });
    }
};

// HR: Update Status
exports.updateLeaveStatus = async (req, res) => {
    try {
        const { status, adminComments } = req.body;
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave application not found'
            });
        }

        leave.status = status;
        if (adminComments) leave.adminComments = adminComments;

        await leave.save();

        // TODO: Send email notification to employee?

        res.json({
            success: true,
            message: `Leave application ${status}`,
            leave
        });
    } catch (error) {
        console.error('Update leave error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update leave status'
        });
    }
};
