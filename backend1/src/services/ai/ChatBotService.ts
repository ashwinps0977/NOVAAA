// src/services/ai/ChatBotService.ts
import { askAI } from "./LangChainService";

export const chatWithHR = async (message: string, context?: string) => {
  try {
    console.log("ChatBot Service: Processing HR message");
    
    const prompt = context
      ? `You are a professional HR assistant specialized in human resources, employee relations, hiring, onboarding, payroll, compliance, and workplace policies. 
      
Context provided by user: ${context}

HR Question: ${message}

Please provide a helpful, accurate, and professional response as an HR expert:`
      : `You are a professional HR assistant specialized in human resources, employee relations, hiring, onboarding, payroll, compliance, and workplace policies.

HR Question: ${message}

Please provide a helpful, accurate, and professional response as an HR expert:`;

    const answer = await askAI(prompt);
    return answer;
  } catch (error: any) {
    console.error("ChatBot Service Error:", error.message);
    return "I apologize, but I'm having trouble processing your HR question at the moment. Please try again or contact HR support directly.";
  }
};

// Specific HR functions
export const analyzeEmployeeQuery = async (query: string, employeeData?: any) => {
  try {
    let context = "";
    if (employeeData) {
      context = `Employee context: ${JSON.stringify(employeeData, null, 2)}`;
    }
    
    return await chatWithHR(query, context);
  } catch (error) {
    console.error("Employee query analysis error:", error);
    return "Unable to analyze employee query.";
  }
};

export const generatePolicyResponse = async (policyQuestion: string, companyPolicies?: string) => {
  try {
    const prompt = `You are an HR policy expert. ${
      companyPolicies ? `Company policies: ${companyPolicies}\n\n` : ''
    }Question about policy: ${policyQuestion}\n\nProvide a clear policy explanation:`;
    
    return await askAI(prompt);
  } catch (error) {
    console.error("Policy response generation error:", error);
    return "Unable to generate policy response at this time.";
  }
};