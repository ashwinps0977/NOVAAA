import { Request, Response } from "express";
import Employee from "../models/User/Employee"; // ✅ FIXED path (not User/Employee)

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json({
      success: true,
      data: employee
    });
  } catch (error: any) {
    console.error("Create employee error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to create employee", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

export const getEmployees = async (_req: Request, res: Response) => {
  try {
    const employees = await Employee.find().populate("user");
    res.json({
      success: true,
      data: employees
    });
  } catch (error: any) {
    console.error("Get employees error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch employees",
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};