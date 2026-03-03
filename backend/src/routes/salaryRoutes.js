const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const salaryController = require('../controllers/salaryController');

// @route   GET /api/salary/history
// @desc    Get salary history
// @access  Private
router.get('/history', auth, salaryController.getSalaryHistory);

// @route   GET /api/salary/latest
// @desc    Get latest salary
// @access  Private
router.get('/latest', auth, salaryController.getLatestSalary);

// @route   POST /api/salary/query
// @desc    Raise a salary query
// @access  Private
router.post(
    '/query',
    [
        auth,
        [
            check('subject', 'Subject is required').not().isEmpty(),
            check('description', 'Description is required').not().isEmpty(),
            check('category', 'Category is required').not().isEmpty()
        ]
    ],
    salaryController.raiseQuery
);

// @route   GET /api/salary/queries
// @desc    Get my queries
// @access  Private
router.get('/queries', auth, salaryController.getQueries);

// @route   POST /api/salary/seed
// @desc    Seed salary data (Dev only)
// @access  Private
router.post('/seed', auth, salaryController.seedSalary);

// --- HR/Admin Routes ---

// @route   POST /api/salary/structure
// @desc    Create/Update Salary Structure
// @access  Private (Admin/HR)
router.post('/structure', auth, salaryController.createSalaryStructure);

// @route   GET /api/salary/structures
// @desc    Get all salary structures
// @access  Private (Admin/HR)
router.get('/structures', auth, salaryController.getSalaryStructures);

// @route   POST /api/salary/assign-structure
// @desc    Assign structure to employee
// @access  Private (Admin/HR)
router.post('/assign-structure', auth, salaryController.assignSalaryStructure);

// @route   POST /api/salary/generate-payroll
// @desc    Generate monthly payroll
// @access  Private (Admin/HR)
router.post('/generate-payroll', auth, salaryController.generatePayroll);

// @route   PUT /api/salary/update-component
// @desc    Update specific salary component (Bonus/Deduction)
// @access  Private (Admin/HR)
router.put('/update-component', auth, salaryController.updateSalaryComponent);

// @route   PUT /api/salary/payroll-status
// @desc    Approve or Pay payroll
// @access  Private (Admin/HR)
router.put('/payroll-status', auth, salaryController.processPayrollStatus);

// @route   GET /api/salary/hr/salary-list
// @desc    Get all employees salary list for HR
// @access  Private (Admin/HR)
router.get('/hr/salary-list', auth, salaryController.getHRSalaryList);

module.exports = router;
