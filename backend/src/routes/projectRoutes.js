const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const protect = require('../middleware/auth');

// Simple role authorization middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user?.role} is not authorized to access this route`
            });
        }
        next();
    };
};

// HR Routes
router.post('/', protect, authorize('hr', 'admin'), projectController.assignProject);
router.get('/', protect, authorize('hr', 'admin'), projectController.getAllProjects);

// Employee Routes
router.get('/my-projects', protect, projectController.getMyProjects);
router.put('/:id/status', protect, projectController.updateProjectStatus);

module.exports = router;
