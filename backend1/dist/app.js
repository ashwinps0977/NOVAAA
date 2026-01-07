"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const employee_routes_1 = __importDefault(require("./routes/employee.routes"));
const leave_routes_1 = __importDefault(require("./routes/leave.routes"));
const ai_routes_1 = __importDefault(require("../src/routes/ai.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
/* =======================
   Middleware
======================= */
// 1️⃣ Enable CORS
app.use((0, cors_1.default)());
// 2️⃣ Body parsers
app.use(express_1.default.json()); // Parse JSON
app.use(express_1.default.urlencoded({ extended: true })); // Parse form-data / urlencoded
/* =======================
   Routes
======================= */
app.use("/api/auth", auth_routes_1.default);
app.use("/api/employees", employee_routes_1.default);
app.use("/api/leaves", leave_routes_1.default);
app.use("/api/ai", ai_routes_1.default);
/* =======================
   Root Route
======================= */
app.get("/", (_req, res) => {
    res.status(200).json({
        message: "Agentic AI HR Backend is running 🚀",
        version: "1.0.0",
        endpoints: [
            "/api/auth",
            "/api/employees",
            "/api/leaves",
            "/api/ai"
        ]
    });
});
/* =======================
   Health Check
======================= */
app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "novaHR-backend"
    });
});
exports.default = app;
