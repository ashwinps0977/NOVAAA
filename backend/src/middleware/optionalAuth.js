const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // If no token, just proceed without setting req.user
    if (!token) {
        return next();
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Add user from payload
        req.user = decoded;
        next();
    } catch (err) {
        // If token exists but is invalid, we could either:
        // 1. Return 401 (Strict: "You tried to auth but failed")
        // 2. Ignore and treat as guest (Loose: "Your session expired, whatever")

        // Usually, if a client SENDS a token, they expect it to work. 
        // If it's expired, they might want to know.
        // However, for a public form, if the token is stale, we probably still want to let them apply?
        // Let's decide to be permissive: If invalid, just proceed as guest.
        // This prevents "Application Failed" just because an old token was in localStorage.
        console.log('OptionalAuth: Invalid token, proceeding as guest', err.message);
        next();
    }
};
