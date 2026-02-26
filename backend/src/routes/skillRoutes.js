const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const auth = require('../middleware/auth');

const adminCheck = (req, res, next) => {
    if (req.user && (req.user.role === 'hr' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'HR or Admin privileges required' });
    }
};

router.get('/my-skills', auth, skillController.getMySkills);
router.get('/unique-names', auth, skillController.getUniqueSkillNames); // New route
router.get('/employee/:employeeId', auth, adminCheck, skillController.getEmployeeSkills);
router.get('/org-gaps', auth, adminCheck, skillController.getOrgSkillGaps);
router.post('/seed', auth, skillController.seedSkills);

module.exports = router;
