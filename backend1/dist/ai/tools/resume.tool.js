"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseResume = void 0;
// src/ai/tools/resume.tool.ts
const parseResume = async (fileBuffer) => {
    try {
        console.log("Starting PDF parse with buffer size:", fileBuffer.length);
        // Dynamic import to handle module issues
        const pdfParseModule = await Promise.resolve().then(() => __importStar(require("pdf-parse")));
        // Handle different export patterns
        let pdfParseFunction;
        if (typeof pdfParseModule === 'function') {
            pdfParseFunction = pdfParseModule;
        }
        else if (pdfParseModule.default && typeof pdfParseModule.default === 'function') {
            pdfParseFunction = pdfParseModule.default;
        }
        else {
            throw new Error("Could not find PDF parse function in module");
        }
        const data = await pdfParseFunction(fileBuffer);
        console.log("PDF parsed successfully, text length:", data.text.length);
        return extractResumeData(data.text);
    }
    catch (err) {
        console.error("Resume parsing failed:", err.message);
        return {
            name: "Error",
            email: "Error",
            skills: "Error parsing PDF: " + err.message,
            rawText: "",
        };
    }
};
exports.parseResume = parseResume;
function extractResumeData(text) {
    const nameMatch = text.match(/(?:Name|Full Name|Candidate)[:\s]*([A-Za-z\s.]+)/i);
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    let skillsText = "Not found";
    const skillsMatch = text.match(/(?:Skills|Technical Skills|Expertise|Technologies)[:\s]*([\s\S]*?)(?:\n\n|\n\s*\n|$)/i);
    if (skillsMatch)
        skillsText = skillsMatch[1].replace(/\n/g, ", ").trim();
    return {
        name: nameMatch ? nameMatch[1].trim() : "Not found",
        email: emailMatch ? emailMatch[0].trim() : "Not found",
        skills: skillsText,
        rawText: text.substring(0, 500),
    };
}
