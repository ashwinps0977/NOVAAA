import app from "./app";
import { connectDB } from "./config/database";
import mongoose from "mongoose"; // ✅ ADDED

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // ✅ Ensure MongoDB is connected
    console.log("🔗 Attempting to connect to MongoDB...");
    
    await connectDB();
    
    // ✅ Additional check for MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      throw new Error("❌ MongoDB connection failed");
    }
    
    console.log("✅ MongoDB connected successfully");
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📝 Health check: http://localhost:${PORT}/health`);
      console.log(`👤 Auth: http://localhost:${PORT}/api/auth/register`);
      console.log(`👥 Employees: http://localhost:${PORT}/api/employees`);
      console.log(`📅 Leaves: http://localhost:${PORT}/api/leaves`);
    });
    
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
  process.exit(1);
});

startServer();