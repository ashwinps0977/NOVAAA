import { Router } from "express";
import { 
  register, 
  login, 
  getCurrentUser, 
  logout 
} from "../controllers/AuthController";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Public routes (no authentication required)
router.post("/register", register);
router.post("/login", login);

// Protected routes (authentication required)
router.get("/me", authenticate, getCurrentUser);
router.post("/logout", authenticate, logout);

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth service is healthy",
    timestamp: new Date().toISOString(),
  });
});

export default router;