const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const attendanceController = require('../controllers/attendanceController');

// Helper to auto-checkin (manually triggerable if needed, but mostly internal)
// We expose check-out and get logic

router.use(auth);

router.get('/my-history', attendanceController.getMyAttendance);
router.get('/download-report', attendanceController.downloadReport);
router.post('/checkin', attendanceController.checkIn);
router.post('/checkout', attendanceController.checkOut);

// HR routes
router.get('/all', attendanceController.getAllAttendance);
router.post('/hr-mark', attendanceController.hrMarkAttendance);

module.exports = router;
