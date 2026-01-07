"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseResumeController = void 0;
const resume_tool_1 = require("../ai/tools/resume.tool");
const parseResumeController = async (req, res) => {
    try {
        console.log("Received file upload request");
        // Type assertion for multer file
        const file = req.file;
        if (!file || !file.buffer) {
            console.log("No file uploaded");
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
                data: {
                    name: "Error",
                    email: "Error",
                    skills: "No file uploaded",
                    rawText: "",
                },
            });
        }
        // Validate file type
        if (file.mimetype !== 'application/pdf') {
            console.log("Invalid file type:", file.mimetype);
            return res.status(400).json({
                success: false,
                message: "Only PDF files are allowed",
                data: {
                    name: "Error",
                    email: "Error",
                    skills: "Invalid file type",
                    rawText: "",
                },
            });
        }
        console.log("File received:", {
            name: file.originalname,
            size: file.size,
            type: file.mimetype
        });
        const parsedData = await (0, resume_tool_1.parseResume)(file.buffer);
        return res.status(200).json({
            success: true,
            message: "Resume parsed successfully",
            data: parsedData,
        });
    }
    catch (err) {
        console.error("Controller error:", err.message, err.stack);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: {
                name: "Error",
                email: "Error",
                skills: "Error parsing PDF: " + err.message,
                rawText: "",
            },
        });
    }
};
exports.parseResumeController = parseResumeController;
