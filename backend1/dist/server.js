"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const mongoose_1 = __importDefault(require("mongoose")); // ✅ ADDED
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        // ✅ Ensure MongoDB is connected
        console.log("🔗 Attempting to connect to MongoDB...");
        await (0, database_1.connectDB)();
        // ✅ Additional check for MongoDB connection
        if (mongoose_1.default.connection.readyState !== 1) {
            throw new Error("❌ MongoDB connection failed");
        }
        console.log("✅ MongoDB connected successfully");
        app_1.default.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📝 Health check: http://localhost:${PORT}/health`);
            console.log(`👤 Auth: http://localhost:${PORT}/api/auth/register`);
            console.log(`👥 Employees: http://localhost:${PORT}/api/employees`);
            console.log(`📅 Leaves: http://localhost:${PORT}/api/leaves`);
        });
    }
    catch (error) {
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
