// src/services/ai/LangChainService.ts
import { ChatOpenAI } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import dotenv from "dotenv";

dotenv.config();

// Initialize the ChatOpenAI model (newer version)
const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0.7,
  modelName: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
  maxTokens: 1000,
});

// Create a prompt template
const createPromptTemplate = (context?: string) => {
  if (context) {
    return PromptTemplate.fromTemplate(`
You are an expert HR assistant. Use the following context to answer the question accurately and professionally.

Context:
{context}

Question: {question}

Provide a detailed, helpful answer:`);
  } else {
    return PromptTemplate.fromTemplate(`
You are an expert HR assistant. Provide a helpful, professional answer to the following question.

Question: {question}

Provide a detailed, helpful answer:`);
  }
};

export const askAI = async (question: string, context?: string) => {
  try {
    console.log("LangChain Service: Processing question...");

    // Create the prompt
    const prompt = createPromptTemplate(context);
    
    // Create chain
    const chain = prompt.pipe(model).pipe(new StringOutputParser());
    
    // Call the model
    console.log("Calling LangChain model...");
    
    let input: any = { question };
    if (context) {
      input = { question, context };
    }
    
    const response = await chain.invoke(input);
    
    console.log("LangChain response received");
    return response.trim();

  } catch (error: any) {
    console.error("LangChain Error:", error.message);
    
    // Fallback to simple OpenAI API if LangChain fails
    if (error.message.includes("Cannot find module") || error.message.includes("@langchain")) {
      console.log("Falling back to direct OpenAI API...");
      return await fallbackToOpenAI(question, context);
    }
    
    throw new Error(`LangChain processing failed: ${error.message}`);
  }
};

// Fallback function using direct OpenAI API
const fallbackToOpenAI = async (question: string, context?: string): Promise<string> => {
  try {
    const { OpenAI } = require("openai");
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const messages: any[] = [
      {
        role: "system",
        content: "You are a helpful HR assistant. Provide accurate, professional, and helpful responses related to human resources, employee management, hiring, and workplace policies."
      }
    ];

    if (context) {
      messages.push({
        role: "system",
        content: `Context: ${context}`
      });
    }

    messages.push({
      role: "user",
      content: question
    });

    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "No response from AI";
    
  } catch (fallbackError: any) {
    console.error("Fallback OpenAI Error:", fallbackError.message);
    return "I apologize, but I'm currently unable to process your request. Please try again later or contact support.";
  }
};

// Text splitter for document processing
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

// Document processing function
export const processDocument = async (text: string) => {
  try {
    console.log("Processing document with LangChain...");
    
    // Split the document into chunks
    const docs = await textSplitter.createDocuments([text]);
    
    console.log(`Document split into ${docs.length} chunks`);
    
    return {
      success: true,
      chunkCount: docs.length,
      chunks: docs.slice(0, 3).map(doc => ({
        content: doc.pageContent.substring(0, 200) + "...",
        metadata: doc.metadata
      }))
    };
    
  } catch (error: any) {
    console.error("Document processing error:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Resume analysis using AI
export const analyzeResumeWithAI = async (resumeText: string, jobDescription?: string) => {
  try {
    const prompt = jobDescription 
      ? PromptTemplate.fromTemplate(`
Analyze this resume against the provided job description and provide a detailed assessment.

RESUME:
{resumeText}

JOB DESCRIPTION:
{jobDescription}

Please provide:
1. Candidate summary
2. Key skills match
3. Missing qualifications
4. Overall suitability score (1-10)
5. Recommended interview questions`)
      : PromptTemplate.fromTemplate(`
Analyze this resume and provide a professional assessment.

RESUME:
{resumeText}

Please provide:
1. Candidate summary
2. Key strengths
3. Potential areas for improvement
4. Recommended roles/industries`);

    const chain = prompt.pipe(model).pipe(new StringOutputParser());
    
    const input: any = { resumeText: resumeText.substring(0, 3000) };
    if (jobDescription) {
      input.jobDescription = jobDescription;
    }
    
    const response = await chain.invoke(input);
    return response.trim();
    
  } catch (error: any) {
    console.error("Resume analysis error:", error.message);
    return "Unable to analyze resume at this time.";
  }
};