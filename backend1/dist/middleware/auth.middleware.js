"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticate = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
            return;
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            res.status(401).json({
                success: false,
                message: "Invalid token format"
            });
            return;
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "fallback-secret-key-change-this");
        // Attach user to request
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error("Authentication error:", error.message);
        // Handle specific JWT errors
        if (error.name === "JsonWebTokenError") {
            res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }
        else if (error.name === "TokenExpiredError") {
            res.status(401).json({
                success: false,
                message: "Token expired"
            });
        }
        else {
            res.status(401).json({
                success: false,
                message: "Authentication failed"
            });
        }
    }
};
exports.authenticate = authenticate;
// Role-based middleware
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole || !allowedRoles.includes(userRole)) {
            res.status(403).json({
                success: false,
                message: "Access denied. Insufficient permissions."
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
// Check if user is authenticated (for optional auth)
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "fallback-secret-key-change-this");
            req.user = decoded;
        }
        catch (error) {
            // Token is invalid but we don't fail (optional auth)
            console.warn("Optional auth: Invalid token, continuing without user");
        }
    }
    next();
};
exports.optionalAuth = optionalAuth;
