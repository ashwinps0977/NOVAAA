const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');

// No validation middleware - let controller handle it
router.post('/register', authController.register);
router.post('/login', authController.login);

const auth = require('../middleware/auth');
router.get('/me', auth, authController.getCurrentUser);
router.post('/logout', auth, authController.logout);

module.exports = router;