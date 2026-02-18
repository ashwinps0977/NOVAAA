const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');

// Get today's date string YYYY-MM-DD
const getTodayDate = () => new Date().toISOString().split('T')[0];

exports.markCheckIn = async (userId) => {
    try {
        const date = getTodayDate();

        // Check if already checked in
        const existing = await Attendance.findOne({ user: userId, date });
        if (existing) {
            // If user checked out previously today and is logging in again, reset checkOut
            if (existing.checkOut) {
                console.log(`ℹ️ User ${userId} logging in again after check out. Resetting check-out status.`);
                existing.checkOut = null;
                existing.workingHours = 0; // Reset hours as they are still working
                // Optionally keep original checkIn or update checkIn to now?
                // Standard: Keep original checkIn to track total duration from first login
                // OR: multiple sessions? Simpler model: Single session per day. 
                // Let's keep original checkIn.
                await existing.save();
            }
            return existing;
        }

        const attendance = new Attendance({
            user: userId,
            date,
            status: 'present',
            checkIn: new Date()
        });

        await attendance.save();
        console.log(`✅ User ${userId} checked in for ${date}`);
        return attendance;
    } catch (error) {
        console.error('Check-in error:', error);
        // Duplicate key error is fine (race condition)
        if (error.code === 11000) return null;
        throw error;
    }
};

exports.markCheckOut = async (userId) => {
    try {
        const date = getTodayDate();
        const attendance = await Attendance.findOne({ user: userId, date });

        if (!attendance) {
            return {
                success: false,
                message: 'No check-in record found for today'
            };
        }

        attendance.checkOut = new Date();

        // Calculate working hours
        if (attendance.checkIn) {
            const diffMs = attendance.checkOut - attendance.checkIn;
            attendance.workingHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
        }

        await attendance.save();
        console.log(`✅ User ${userId} checked out at ${attendance.checkOut}`);

        return {
            success: true,
            attendance
        };
    } catch (error) {
        console.error('Mark check-out error:', error);
        throw error;
    }
};

exports.checkOut = async (req, res) => {
    try {
        const result = await exports.markCheckOut(req.user.id);

        if (!result.success) {
            return res.status(404).json(result);
        }

        res.json({
            success: true,
            message: 'Checked out successfully',
            attendance: result.attendance
        });
    } catch (error) {
        console.error('Check-out route error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check out'
        });
    }
};

exports.checkIn = async (req, res) => {
    try {
        const attendance = await exports.markCheckIn(req.user.id);

        if (!attendance) {
            return res.status(400).json({
                success: false,
                message: 'Already checked in for today or error occurred'
            });
        }

        res.json({
            success: true,
            message: 'Checked in successfully',
            attendance
        });
    } catch (error) {
        console.error('Check-in route error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check in'
        });
    }
};

exports.getMyAttendance = async (req, res) => {
    try {
        // Get last 35 days history for calendar view
        const history = await Attendance.find({ user: req.user.id })
            .sort({ date: -1 })
            .limit(35);

        // Get approved leaves to merge into calendar
        const leaves = await Leave.find({
            user: req.user.id,
            status: 'Approved'
        });

        // Create a map of dates with leave data
        const leaveMap = new Map();
        leaves.forEach(leave => {
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);

            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                leaveMap.set(dateStr, { type: leave.type, leaveId: leave._id });
            }
        });

        // Enrich history with leave data
        const enrichedHistory = history.map(record => {
            const recordObj = record.toObject();
            const leaveInfo = leaveMap.get(record.date);

            if (leaveInfo) {
                recordObj.status = 'leave';
                recordObj.leaveType = leaveInfo.type;
            }

            return recordObj;
        });

        // Get today's status
        const today = getTodayDate();
        const todayRecord = enrichedHistory.find(r => r.date === today);

        // Calculate summary stats
        const totalDays = enrichedHistory.length;
        const presentDays = enrichedHistory.filter(r => r.status === 'present').length;
        const absentDays = enrichedHistory.filter(r => r.status === 'absent').length;
        const leaveDays = enrichedHistory.filter(r => r.status === 'leave').length;

        res.json({
            success: true,
            today: todayRecord || null,
            history: enrichedHistory,
            summary: {
                totalDays,
                presentDays,
                absentDays,
                leaveDays
            }
        });
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch attendance'
        });
    }
};

// For HR to view all
exports.getAllAttendance = async (req, res) => {
    try {
        const { date } = req.query;
        const query = date ? { date } : { date: getTodayDate() };

        const attendance = await Attendance.find(query)
            .populate('user', 'name email department position');

        res.json({
            success: true,
            attendance,
            count: attendance.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch all attendance'
        });
    }
};

exports.downloadReport = async (req, res) => {
    try {
        const { month, year } = req.query;
        let query = { user: req.user.id };

        if (month && year) {
            const monthStr = month.padStart(2, '0');
            const startDate = `${year}-${monthStr}-01`;
            const endDate = `${year}-${monthStr}-31`;
            query.date = { $gte: startDate, $lte: endDate };
        }

        const attendance = await Attendance.find(query).sort({ date: -1 });

        // CSV Header
        let csv = 'Date,Status,Check In,Check Out,Working Hours\n';

        attendance.forEach(record => {
            const checkInTime = record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-';
            const checkOutTime = record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-';

            csv += `${record.date},${record.status},${checkInTime},${checkOutTime},${record.workingHours || 0}\n`;
        });

        const filename = month && year
            ? `attendance_report_${year}_${month}_${req.user.name}.csv`
            : `attendance_report_${req.user.name}.csv`;

        res.header('Content-Type', 'text/csv');
        res.attachment(filename);
        res.send(csv);

    } catch (error) {
        console.error('Download report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate report'
        });
    }
};

exports.hrMarkAttendance = async (req, res) => {
    try {
        const { userId, date, status } = req.body;

        if (!userId || !date || !status) {
            return res.status(400).json({
                success: false,
                message: 'userId, date, and status are required'
            });
        }

        // Upsert attendance record
        const attendance = await Attendance.findOneAndUpdate(
            { user: userId, date },
            {
                status,
                $setOnInsert: { checkIn: status === 'present' ? new Date() : null }
            },
            { upsert: true, new: true }
        );

        res.json({
            success: true,
            message: `Attendance marked as ${status} for ${date}`,
            attendance
        });
    } catch (error) {
        console.error('HR mark attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark attendance'
        });
    }
};
