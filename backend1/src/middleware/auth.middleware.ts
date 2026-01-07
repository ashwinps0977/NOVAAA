import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Define JWT payload interface
interface JwtPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ 
        success: false,
        message: "Access denied. No token provided." 
      });
      return;
    }

    const token = authHeader.split(" ")[1];
    
    if (!token) {
      res.status(401).json({ 
        success: false,
        message: "Invalid token format" 
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret-key-change-this"
    ) as JwtPayload;

    // Attach user to request
    req.user = decoded;
    next();
    
  } catch (error: any) {
    console.error("Authentication error:", error.message);
    
    // Handle specific JWT errors
    if (error.name === "JsonWebTokenError") {
      res.status(401).json({ 
        success: false,
        message: "Invalid token" 
      });
    } else if (error.name === "TokenExpiredError") {
      res.status(401).json({ 
        success: false,
        message: "Token expired" 
      });
    } else {
      res.status(401).json({ 
        success: false,
        message: "Authentication failed" 
      });
    }
  }
};

// Role-based middleware
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(403).json({ 
        success: false,
        message: "Access denied. Insufficient permissions." 
      });
      return;
    }
    
    next();
  };
};

// Check if user is authenticated (for optional auth)
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback-secret-key-change-this"
      ) as JwtPayload;
      
      req.user = decoded;
    } catch (error) {
      // Token is invalid but we don't fail (optional auth)
      console.warn("Optional auth: Invalid token, continuing without user");
    }
  }
  
  next();
};