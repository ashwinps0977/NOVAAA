const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');

// No validation middleware - let controller handle it
router.post('/register', authController.register);
router.post('/login', authController.login);

const auth = require('../middleware/auth');
router.get('/me', auth, authController.getCurrentUser);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/social-login', authController.socialLogin);
router.post('/logout', auth, authController.logout);

const passport = require('passport');

// Middleware to check if a strategy is available
const checkStrategy = (strategy) => (req, res, next) => {
    if (!passport._strategies[strategy]) {
        // FALLBACK: If strategy not loaded (missing keys), simulate success for development
        if (process.env.NODE_ENV === 'development') {
            console.log(`🛠️ Simulating ${strategy} success (Mock Mode)`);
            req.user = {
                _id: '6999668e7dee516c65e40e21', // Use the existing test employee ID
                name: 'Test ' + strategy.charAt(0).toUpperCase() + strategy.slice(1) + ' User',
                email: strategy + '_mock@example.com',
                role: 'employee',
                isVerified: true
            };
            return authController.handleOAuthCallback(req, res);
        }
        return res.status(501).json({
            success: false,
            message: `${strategy} authentication is not configured. Please add credentials to .env.`
        });
    }
    next();
};

// Google OAuth
router.get('/google', checkStrategy('google'), passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: (process.env.FRONTEND_URL || 'http://localhost:5173') + '/login?error=oauth_failed', session: false }),
    authController.handleOAuthCallback
);

// GitHub OAuth
router.get('/github', checkStrategy('github'), passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: (process.env.FRONTEND_URL || 'http://localhost:5173') + '/login?error=oauth_failed', session: false }),
    authController.handleOAuthCallback
);


module.exports = router;