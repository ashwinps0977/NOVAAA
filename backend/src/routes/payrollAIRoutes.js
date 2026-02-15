const express = require('express');
const router = express.Router();
const { getPayrollInsights, aiQuery, getModels, getPolicies, getPolicy } = require('../controllers/PayrollAIController');
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

// Apply authentication middleware
router.use(auth);

// Role check middleware (HR/Admin only)
const authorizeHrAdmin = (req, res, next) => {
    if (req.user.role !== 'hr' && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. HR role required.'
        });
    }
    next();
};

router.get('/insights', authorizeHrAdmin, getPayrollInsights);
router.post('/query', aiQuery);
router.post('/chat', aiController.processChat);
router.get('/models', authorizeHrAdmin, getModels);
router.get('/policies', getPolicies);
router.get('/policies/:filename', getPolicy);

module.exports = router;
