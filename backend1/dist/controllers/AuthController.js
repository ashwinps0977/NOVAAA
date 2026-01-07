"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getCurrentUser = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User/User"));
// Helper function to format user response
const formatUserResponse = (user) => {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId,
        phone: user.phone,
        avatar: user.avatar,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};
// REGISTER - Create new user
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required",
            });
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format",
            });
        }
        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }
        // Check if user exists
        const existingUser = await User_1.default.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email",
            });
        }
        // ✅ Use the static method to create user with hashed password
        const user = await User_1.default.createUser({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: password, // Pass plain password
            role: (role || "EMPLOYEE").toUpperCase(),
        });
        // Create JWT token
        const token = jsonwebtoken_1.default.sign({
            id: user._id.toString(),
            role: user.role,
            email: user.email,
        }, process.env.JWT_SECRET || "supersecretkey", { expiresIn: "7d" });
        // Format user response
        const userResponse = formatUserResponse(user);
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                user: userResponse,
                token,
            },
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        // Handle Mongoose validation errors
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors,
            });
        }
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Registration failed. Please try again.",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};
exports.register = register;
// LOGIN - Authenticate user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }
        // Find user with password explicitly selected
        const user = await User_1.default.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }
        // Check password using User model's method
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        // Create JWT token
        const token = jsonwebtoken_1.default.sign({
            id: user._id.toString(),
            role: user.role,
            email: user.email,
        }, process.env.JWT_SECRET || "supersecretkey", { expiresIn: "7d" });
        // Format user response
        const userResponse = formatUserResponse(user);
        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: userResponse,
                token,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Login failed. Please try again.",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};
exports.login = login;
// GET CURRENT USER
const getCurrentUser = async (req, res) => {
    try {
        const reqWithUser = req;
        const userId = reqWithUser.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated",
            });
        }
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        // Format user response
        const userResponse = formatUserResponse(user);
        return res.status(200).json({
            success: true,
            message: "User profile retrieved successfully",
            data: userResponse,
        });
    }
    catch (error) {
        console.error("Get current user error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve user profile",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};
exports.getCurrentUser = getCurrentUser;
// LOGOUT
const logout = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    }
    catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({
            success: false,
            message: "Logout failed",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};
exports.logout = logout;
exports.default = {
    register: exports.register,
    login: exports.login,
    getCurrentUser: exports.getCurrentUser,
    logout: exports.logout,
};
