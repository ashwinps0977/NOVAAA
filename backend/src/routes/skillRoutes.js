const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/my-skills', auth, skillController.getMySkills);
router.get('/org-gaps', auth, admin, skillController.getOrgSkillGaps);
router.post('/seed', auth, skillController.seedSkills);

module.exports = router;
