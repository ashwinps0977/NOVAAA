const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getMyNotifications, markAsRead } = require('../controllers/notificationController');

router.get('/', auth, getMyNotifications);
router.put('/:id/read', auth, markAsRead);

module.exports = router;
