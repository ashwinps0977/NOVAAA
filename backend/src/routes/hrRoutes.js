const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const hrController = require('../controllers/HRController');

// All HR routes require authentication
router.use(auth);

// Only HR and Admin can access these routes
router.use((req, res, next) => {
  if (req.user.role !== 'hr' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. HR role required.'
    });
  }
  next();
});

// Employee management routes
router.post('/employees', hrController.addEmployee);
router.get('/employees', hrController.getAllEmployees);
router.get('/employees/:id', hrController.getEmployeeById);
router.put('/employees/:id', hrController.updateEmployee);
router.delete('/employees/:id', hrController.deleteEmployee);

module.exports = router;