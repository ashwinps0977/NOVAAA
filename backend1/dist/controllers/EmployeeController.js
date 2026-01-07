"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmployees = exports.createEmployee = void 0;
const Employee_1 = __importDefault(require("../models/User/Employee")); // ✅ FIXED path (not User/Employee)
const createEmployee = async (req, res) => {
    try {
        const employee = await Employee_1.default.create(req.body);
        res.status(201).json({
            success: true,
            data: employee
        });
    }
    catch (error) {
        console.error("Create employee error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create employee",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};
exports.createEmployee = createEmployee;
const getEmployees = async (_req, res) => {
    try {
        const employees = await Employee_1.default.find().populate("user");
        res.json({
            success: true,
            data: employees
        });
    }
    catch (error) {
        console.error("Get employees error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch employees",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};
exports.getEmployees = getEmployees;
