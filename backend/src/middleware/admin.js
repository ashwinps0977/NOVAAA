module.exports = function (req, res, next) {
    // Check if user exists and has hr or admin role (case-insensitive for robustness)
    const role = req.user && req.user.role ? req.user.role.toLowerCase() : null;

    if (role === 'hr' || role === 'admin') {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: 'Access denied: HR or Admin privileges required'
    });
};
