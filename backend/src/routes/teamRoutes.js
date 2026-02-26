const express = require('express');
const router = express.Router();
const teamSelectionController = require('../controllers/teamSelectionController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// All routes are protected and restricted to HR/Admin
router.use(auth);
router.use(admin);


router.post('/auto-select', teamSelectionController.createProjectWithAutoTeam);
router.get('/overview', teamSelectionController.getTeamOverview);

module.exports = router;
