"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveLeave = exports.applyLeave = void 0;
const LeaveRequest_1 = __importDefault(require("../models/Attendance/LeaveRequest")); // ✅ FIXED path (not Attendance/LeaveRequest)
const applyLeave = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated",
            });
        }
        const leave = await LeaveRequest_1.default.create({
            employee: userId,
            ...req.body
        });
        res.status(201).json({
            success: true,
            data: leave
        });
    }
    catch (error) {
        console.error("Apply leave error:", error);
        res.status(500).json({
            success: false,
            message: "Leave application failed",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};
exports.applyLeave = applyLeave;
const approveLeave = async (req, res) => {
    try {
        const leave = await LeaveRequest_1.default.findByIdAndUpdate(req.params.id, { status: "APPROVED" }, { new: true });
        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found",
            });
        }
        res.json({
            success: true,
            data: leave
        });
    }
    catch (error) {
        console.error("Approve leave error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to approve leave",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};
exports.approveLeave = approveLeave;
