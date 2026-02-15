const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', settingsController.getSettings);
router.put('/profile', settingsController.updateProfile);
router.put('/preferences', settingsController.updatePreferences);
router.put('/notifications', settingsController.updateNotifications);
router.put('/privacy', settingsController.updatePrivacy);
router.put('/work-preferences', settingsController.updateWorkPreferences);
router.put('/ai-settings', settingsController.updateAiSettings);
router.put('/payroll', settingsController.updatePayrollSettings);
router.post('/documents', settingsController.uploadDocument);

module.exports = router;
