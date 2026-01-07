import { Request, Response } from "express";
import Leave from "../models/Attendance/LeaveRequest"; // ✅ FIXED path (not Attendance/LeaveRequest)

export const applyLeave = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const leave = await Leave.create({
      employee: userId,
      ...req.body
    });
    
    res.status(201).json({
      success: true,
      data: leave
    });
  } catch (error: any) {
    console.error("Apply leave error:", error);
    res.status(500).json({ 
      success: false,
      message: "Leave application failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

export const approveLeave = async (req: Request, res: Response) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status: "APPROVED" },
      { new: true }
    );
    
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
  } catch (error: any) {
    console.error("Approve leave error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to approve leave",
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};