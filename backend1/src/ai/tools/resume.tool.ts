// src/ai/tools/resume.tool.ts
import * as pdfParseLib from "pdf-parse";

export const parseResume = async (fileBuffer: Buffer) => {
  try {
    console.log("Starting PDF parse with buffer size:", fileBuffer.length);

    // Try different ways to access the function
    let pdfParseFunc: any;
    
    // Method 1: Check if it's a function
    if (typeof pdfParseLib === 'function') {
      pdfParseFunc = pdfParseLib;
    } 
    // Method 2: Check for default export
    else if (typeof (pdfParseLib as any).default === 'function') {
      pdfParseFunc = (pdfParseLib as any).default;
    }
    // Method 3: Use directly (some versions work this way)
    else {
      pdfParseFunc = pdfParseLib;
    }

    if (typeof pdfParseFunc !== 'function') {
      throw new Error("pdfParse is not a function. Type: " + typeof pdfParseFunc);
    }

    const data = await pdfParseFunc(fileBuffer);
    
    console.log("PDF parsed successfully, text length:", data.text.length);
    return extractResumeData(data.text);
  } catch (err: any) {
    console.error("Resume parsing failed:", err.message);
    return {
      name: "Error",
      email: "Error",
      skills: "Error parsing PDF: " + err.message,
      rawText: "",
    };
  }
};

function extractResumeData(text: string) {
  console.log("Extracting data from text, first 200 chars:", text.substring(0, 200));
  
  // Try multiple patterns for name
  const namePatterns = [
    /(?:^|\n)(?:Name|Full Name)[:\s]*([A-Z][A-Za-z\s.]{2,50})(?:\n|$)/i,
    /(?:^|\n)([A-Z][a-z]+ [A-Z][a-z]+)(?:\n|$)/,
    /^(?:Resume|CV|Curriculum Vitae) of ([A-Z][A-Za-z\s.]+)/i
  ];
  
  let name = "Not found";
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      name = match[1].trim();
      break;
    }
  }
  
  // Email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  
  // Skills - look in multiple places
  let skillsText = "Not found";
  const skillsPatterns = [
    /(?:Skills|Technical Skills|Expertise)[:\s]*([\s\S]*?)(?:\n\n|\n\s*\n|$)/i,
    /(?:Technologies|Key Skills)[:\s]*([\s\S]*?)(?:\n\n|\n\s*\n|$)/i
  ];
  
  for (const pattern of skillsPatterns) {
    const match = text.match(pattern);
    if (match) {
      skillsText = match[1]
        .replace(/\n/g, ", ")
        .replace(/\s+/g, " ")
        .trim();
      break;
    }
  }

  return {
    name: name,
    email: emailMatch ? emailMatch[0].trim() : "Not found",
    skills: skillsText,
    rawText: text.substring(0, 500),
  };
}