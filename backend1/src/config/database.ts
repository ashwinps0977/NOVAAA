import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/novahr";

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected Successfully");
    
    // Connection events
    mongoose.connection.on("error", (error) => {
      console.error("❌ MongoDB Connection Error:", error);
    });
    
    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB Disconnected");
    });
    
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed due to app termination");
      process.exit(0);
    });
    
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
    process.exit(1);
  }
};