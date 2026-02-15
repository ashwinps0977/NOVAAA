const express = require('express');
const router = express.Router();
const hrSettingsController = require('../controllers/hrSettingsController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin'); // Assuming there's an admin or HR check middleware

// Only HR/Admin can access these
router.use(auth);

router.get('/', hrSettingsController.getSettings);
router.put('/:category', hrSettingsController.updateSettings);
router.put('/', hrSettingsController.updateSettings);
router.get('/users', hrSettingsController.getHRUsers);

module.exports = router;
