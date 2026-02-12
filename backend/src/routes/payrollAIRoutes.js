const express = require('express');
const router = express.Router();
const { getPayrollInsights, aiQuery } = require('../controllers/PayrollAIController');
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
router.post('/query', authorizeHrAdmin, aiQuery);

module.exports = router;
