const express = require('express');
const router = express.Router();
const hrAnalyticsController = require('../controllers/hrAnalyticsController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// All routes require authentication and HR/Admin role
router.use(auth, admin);

router.get('/dashboard-stats', hrAnalyticsController.getDashboardStats);
router.get('/workforce', hrAnalyticsController.getWorkforceStats);
router.get('/hiring', hrAnalyticsController.getHiringStats);
router.get('/attrition', hrAnalyticsController.getAttritionStats);
router.get('/payroll', hrAnalyticsController.getPayrollStats);
router.get('/training', hrAnalyticsController.getTrainingStats);
router.get('/performance', hrAnalyticsController.getPerformanceStats);
router.get('/performance-overview', hrAnalyticsController.getPerformanceOverview);
router.get('/performance/export', hrAnalyticsController.exportPerformanceReport);
router.get('/attendance', hrAnalyticsController.getAttendanceStats);
router.get('/compliance', hrAnalyticsController.getComplianceStats);
router.get('/ai-insights', hrAnalyticsController.getAISuggestions);
router.get('/custom-report', hrAnalyticsController.getCustomReport);

module.exports = router;
