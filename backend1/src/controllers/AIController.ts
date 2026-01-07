// src/controllers/AIController.ts
import { Request, Response } from "express";
import { parseResume } from "../ai/tools/resume.tool";
import { askAI } from "../services/ai/LangChainService";
import { chatWithHR } from "../services/ai/ChatBotService";
import { 
  recommendCandidate, 
  recommendCandidatesForRole,
  findSimilarEmployees 
} from "../services/ai/RecommendationEngine";

export const parseResumeController = async (req: Request, res: Response) => {
  try {
    console.log("Received file upload request");
    
    // Type assertion for multer file
    const file = (req as any).file;
    
    if (!file || !file.buffer) {
      console.log("No file uploaded");
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
        data: {
          name: "Error",
          email: "Error",
          skills: "No file uploaded",
          rawText: "",
        },
      });
    }

    // Validate file type
    if (file.mimetype !== 'application/pdf') {
      console.log("Invalid file type:", file.mimetype);
      return res.status(400).json({
        success: false,
        message: "Only PDF files are allowed",
        data: {
          name: "Error",
          email: "Error",
          skills: "Invalid file type",
          rawText: "",
        },
      });
    }

    console.log("File received:", {
      name: file.originalname,
      size: file.size,
      type: file.mimetype
    });
    
    const parsedData = await parseResume(file.buffer);

    return res.status(200).json({
      success: true,
      message: "Resume parsed successfully",
      data: parsedData,
    });

  } catch (err: any) {
    console.error("Controller error:", err.message, err.stack);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: {
        name: "Error",
        email: "Error",
        skills: "Error parsing PDF: " + err.message,
        rawText: "",
      },
    });
  }
};

export const chatWithAI = async (req: Request, res: Response) => {
  try {
    const { question, context } = req.body;

    if (!question || typeof question !== 'string' || question.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: "Question is required and must be a non-empty string" 
      });
    }

    console.log("AI Chat Request:", {
      question: question.substring(0, 100) + (question.length > 100 ? "..." : ""),
      contextLength: context ? context.length : 0
    });

    const answer = await askAI(question, context);

    return res.status(200).json({ 
      success: true, 
      answer,
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    console.error("AI Chat Error:", err.message, err.stack);
    return res.status(500).json({
      success: false,
      message: "Failed to process AI request",
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
};

export const chatHRController = async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: "Message is required and must be a non-empty string" 
      });
    }

    console.log("HR Chat Request:", {
      message: message.substring(0, 100) + (message.length > 100 ? "..." : ""),
      contextLength: context ? context.length : 0
    });

    const answer = await chatWithHR(message, context);

    return res.status(200).json({ 
      success: true, 
      answer,
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    console.error("HR Chat Error:", err.message, err.stack);
    return res.status(500).json({
      success: false,
      message: "Failed to process HR chat request",
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
};

export const recommendCandidateController = async (req: Request, res: Response) => {
  try {
    const { skill, limit } = req.body;

    if (!skill || typeof skill !== 'string' || skill.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: "Skill is required and must be a non-empty string" 
      });
    }

    console.log("Candidate Recommendation Request:", { skill, limit });
    const recommendations = await recommendCandidate(skill, limit || 5);

    return res.status(200).json({ 
      success: true, 
      recommendations,
      count: recommendations.length,
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    console.error("Candidate Recommendation Error:", err.message, err.stack);
    return res.status(500).json({
      success: false,
      message: "Failed to get candidate recommendations",
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
};

export const recommendForRoleController = async (req: Request, res: Response) => {
  try {
    const { role, requiredSkills, limit } = req.body;

    if (!role || typeof role !== 'string' || role.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: "Role is required and must be a non-empty string" 
      });
    }

    if (!requiredSkills || !Array.isArray(requiredSkills) || requiredSkills.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Required skills must be a non-empty array" 
      });
    }

    console.log("Role-based Recommendation Request:", { role, requiredSkills, limit });
    const recommendations = await recommendCandidatesForRole(role, requiredSkills, limit || 5);

    return res.status(200).json({ 
      success: true, 
      role,
      requiredSkills,
      recommendations,
      count: recommendations.length,
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    console.error("Role-based Recommendation Error:", err.message, err.stack);
    return res.status(500).json({
      success: false,
      message: "Failed to get role-based recommendations",
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
};

export const findSimilarEmployeesController = async (req: Request, res: Response) => {
  try {
    const { employeeId, limit } = req.body;

    if (!employeeId || typeof employeeId !== 'string' || employeeId.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: "Employee ID is required" 
      });
    }

    console.log("Similar Employees Request:", { employeeId, limit });
    const similarEmployees = await findSimilarEmployees(employeeId, limit || 3);

    return res.status(200).json({ 
      success: true, 
      employeeId,
      similarEmployees,
      count: similarEmployees.length,
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    console.error("Similar Employees Error:", err.message, err.stack);
    return res.status(500).json({
      success: false,
      message: "Failed to find similar employees",
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
};