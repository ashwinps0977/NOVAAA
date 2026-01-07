// src/routes/ai.routes.ts
import express from "express";
import multer from "multer";
import { 
  parseResumeController, 
  chatWithAI,
  chatHRController,
  recommendCandidateController,
  recommendForRoleController,
  findSimilarEmployeesController
} from "../controllers/AIController";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
});

// Resume parsing endpoint
router.post("/resume/parse", upload.single("resume"), parseResumeController);

// General AI chat endpoint
router.post("/chat", chatWithAI);

// HR-specific chatbot endpoint
router.post("/chat/hr", chatHRController);

// Candidate recommendation endpoints
router.post("/recommend/candidate", recommendCandidateController);
router.post("/recommend/role", recommendForRoleController);
router.post("/recommend/similar", findSimilarEmployeesController);

export default router;