"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public routes (no authentication required)
router.post("/register", AuthController_1.register);
router.post("/login", AuthController_1.login);
// Protected routes (authentication required)
router.get("/me", auth_middleware_1.authenticate, AuthController_1.getCurrentUser);
router.post("/logout", auth_middleware_1.authenticate, AuthController_1.logout);
// Health check endpoint
router.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Auth service is healthy",
        timestamp: new Date().toISOString(),
    });
});
exports.default = router;
