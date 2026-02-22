const Leave = require('../models/Leave');
const User = require('../models/User');
const sendEmail = require('../utils/mailer');

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

        // Get current balances and validate
        const leaves = await Leave.find({ user: req.user.id });
        const balances = { Sick: 2, Casual: 3, Earned: 0 };

        // Calculate used leaves this month
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        leaves.forEach(l => {
            const leaveDate = new Date(l.startDate);
            if (
                l.status === 'Approved' &&
                balances[l.type] !== undefined &&
                leaveDate.getMonth() === currentMonth &&
                leaveDate.getFullYear() === currentYear
            ) {
                balances[l.type] -= l.days;
            }
        });

        // Validation: Check if user has sufficient balance
        if (balances[type] < days) {
            return res.status(400).json({
                success: false,
                message: `Insufficient ${type} leave balance. Available: ${balances[type]} days, Requested: ${days} days`
            });
        }

        const leave = new Leave({
            user: req.user.id,
            type,
            startDate,
            endDate,
            reason,
            days
        });

        await leave.save();

        // Send notification to admin/HR
        try {
            const admins = await User.find({ role: { $in: ['admin', 'hr'] } });
            const employee = await User.findById(req.user.id);

            for (const admin of admins) {
                if (admin.email) {
                    await sendEmail(
                        admin.email,
                        'New Leave Request Pending Approval',
                        `
                            <p>Dear ${admin.name},</p>
                            <p>A new leave request has been submitted and requires your attention.</p>
                            <br>
                            <p><b>Employee:</b> ${employee.name} (${employee.email})</p>
                            <p><b>Leave Type:</b> ${type}</p>
                            <p><b>Duration:</b> ${startDate} to ${endDate} (${days} day${days > 1 ? 's' : ''})</p>
                            <p><b>Reason:</b> ${reason}</p>
                            <br>
                            <p>Please review and approve/reject this request in the HR dashboard.</p>
                            <br>
                            <p>Regards,</p>
                            <p>NOVA HR System</p>
                        `
                    );
                    console.log(`📧 Leave notification sent to ${admin.email}`);
                }
            }
        } catch (emailError) {
            console.error('Failed to send admin notification:', emailError);
            // Don't fail the request if email fails
        }

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
        // Monthly Leave Limits
        const balances = {
            Sick: 5,
            Casual: 5,
            Earned: 0 // Not specified, setting to 0 or keeping as is? User only mentioned Sick and Casual.
        };

        // Calculate used leaves for the CURRENT MONTH only
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        leaves.forEach(l => {
            const leaveDate = new Date(l.startDate);
            if (
                l.status === 'Approved' &&
                balances[l.type] !== undefined &&
                leaveDate.getMonth() === currentMonth &&
                leaveDate.getFullYear() === currentYear
            ) {
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
        const leave = await Leave.findById(req.params.id).populate('user');

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave application not found'
            });
        }

        leave.status = status;
        if (adminComments) leave.adminComments = adminComments;

        await leave.save();

        // Send Email Notification
        if (leave.user && leave.user.email) {
            const employeeName = leave.user.name;
            const applicationDate = new Date(leave.createdAt).toLocaleDateString();
            const startDate = new Date(leave.startDate).toLocaleDateString();
            const endDate = new Date(leave.endDate).toLocaleDateString();
            const companyName = "NOVA Workforce"; // Or from env/config

            let subject = '';
            let html = '';

            if (status === 'Approved') {
                subject = 'Leave Application Approved';
                html = `
                    <p>Dear ${employeeName},</p>
                    <p>This is to inform you that your leave application submitted on ${applicationDate} for the period from <b>${startDate}</b> to <b>${endDate}</b> has been <strong>approved</strong>.</p>
                    <p>You are requested to ensure that your responsibilities are properly handed over to the concerned team member before proceeding on leave.</p>
                    <p>We wish you a pleasant time off. Please feel free to reach out if any assistance is required.</p>
                    <br>
                    <p>Regards,</p>
                    <p>Rohit Iyer</p>
                    <p>HR Department</p>
                    <p>${companyName}</p>
                `;
            } else if (status === 'Rejected') {
                subject = 'Leave Application Status – Rejected';
                const reason = adminComments || 'work requirements / staffing constraints';
                html = `
                    <p>Dear ${employeeName},</p>
                    <p>Thank you for submitting your leave application dated ${applicationDate} for the period from <b>${startDate}</b> to <b>${endDate}</b>.</p>
                    <p>After careful consideration, we regret to inform you that your leave request has <strong>not been approved</strong> due to: ${reason}.</p>
                    <p>You may apply for leave on alternate dates or discuss the matter with your reporting manager for further clarification.</p>
                    <p>Thank you for your understanding.</p>
                    <br>
                    <p>Regards,</p>
                    <p>Rohit Iyer</p>
                    <p>HR Department</p>
                    <p>${companyName}</p>
                `;
            }

            if (subject && html) {
                await sendEmail(leave.user.email, subject, html);
                console.log(`📧 Leave notification sent to ${leave.user.email}`);
            }
        }

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
