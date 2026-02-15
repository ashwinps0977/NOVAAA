module.exports = function (req, res, next) {
    // Check if user exists and has hr or admin role
    if (req.user && (req.user.role === 'hr' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied: HR or Admin privileges required'
        });
    }
};
