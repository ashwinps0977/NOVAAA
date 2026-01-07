"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/novahr";
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(MONGO_URI);
        console.log("✅ MongoDB Connected Successfully");
        // Connection events
        mongoose_1.default.connection.on("error", (error) => {
            console.error("❌ MongoDB Connection Error:", error);
        });
        mongoose_1.default.connection.on("disconnected", () => {
            console.log("⚠️ MongoDB Disconnected");
        });
        process.on("SIGINT", async () => {
            await mongoose_1.default.connection.close();
            console.log("MongoDB connection closed due to app termination");
            process.exit(0);
        });
    }
    catch (error) {
        console.error("❌ MongoDB Connection Failed:", error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
