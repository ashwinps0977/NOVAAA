"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/ai.routes.ts
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const AIController_1 = require("../controllers/AIController");
const router = express_1.default.Router();
const upload = (0, multer_1.default)();
router.post("/resume/parse", upload.single("resume"), AIController_1.parseResumeController);
exports.default = router;
