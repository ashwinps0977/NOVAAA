// src/app.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes";
import employeeRoutes from "./routes/employee.routes";
import leaveRoutes from "./routes/leave.routes";
import aiRoutes from "./routes/ai.routes";

dotenv.config();

const app = express();

/* =======================
   Middleware
======================= */

// 1️⃣ Enable CORS
app.use(cors());

// 2️⃣ Body parsers
app.use(express.json()); // Parse JSON
app.use(express.urlencoded({ extended: true })); // Parse form-data / urlencoded

/* =======================
   Routes
======================= */

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/ai", aiRoutes);

/* =======================
   Root Route
======================= */

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    message: "Agentic AI HR Backend is running 🚀",
    version: "1.0.0",
    endpoints: [
      "/api/auth",
      "/api/employees",
      "/api/leaves",
      // AI Endpoints
      "POST /api/ai/resume/parse",
      "POST /api/ai/chat",
      "POST /api/ai/chat/hr",
      "POST /api/ai/recommend/candidate",
      "POST /api/ai/recommend/role",
      "POST /api/ai/recommend/similar"
    ]
  });
});

/* =======================
   Health Check
======================= */

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "novaHR-backend",
    aiEnabled: !!process.env.OPENAI_API_KEY,
    environment: process.env.NODE_ENV || "development",
    aiEndpoints: 6 // Updated count
  });
});

/* =======================
   404 Handler - FIXED
======================= */

// CORRECT 404 handler - use a middleware function without route pattern
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableEndpoints: [
      "GET /",
      "GET /health",
      // AI Endpoints
      "POST /api/ai/resume/parse",
      "POST /api/ai/chat",
      "POST /api/ai/chat/hr",
      "POST /api/ai/recommend/candidate",
      "POST /api/ai/recommend/role",
      "POST /api/ai/recommend/similar",
      // Other endpoints
      "/api/auth/*",
      "/api/employees/*",
      "/api/leaves/*"
    ]
  });
});

/* =======================
   Error Handler
======================= */

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

export default app;