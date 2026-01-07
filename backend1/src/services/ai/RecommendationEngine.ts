// src/services/ai/RecommendationEngine.ts
import User from "../../models/User/User";

// Define type for the user data we get from MongoDB
interface UserCandidate {
  _id: any;
  name: string;
  email: string;
  skills: string[];
  department?: string;
  position?: string;
  experience?: string;
  hireDate?: Date;
  performanceScore?: number;
  role: string;
  __v?: number;
}

export const recommendCandidate = async (skill: string, limit: number = 5) => {
  try {
    console.log("Recommendation Engine: Finding candidates with skill:", skill);
    
    const candidates = await User.find({
      role: "EMPLOYEE",
      skills: { $regex: skill, $options: "i" },
    })
    .select("name email skills department position hireDate performanceScore")
    .limit(limit)
    .lean<UserCandidate[]>();

    return candidates.map((c) => ({
      name: c.name,
      email: c.email,
      skills: c.skills || [],
      department: c.department || "Not specified",
      position: c.position || "Not specified",
      hireDate: c.hireDate,
      performanceScore: c.performanceScore || "Not rated",
      matchScore: calculateMatchScore(skill, c.skills || [])
    }));
  } catch (error: any) {
    console.error("Recommendation Error:", error.message);
    return [];
  }
};

export const recommendCandidatesForRole = async (role: string, requiredSkills: string[], limit: number = 5) => {
  try {
    console.log("Recommendation Engine: Finding candidates for role:", role);
    
    // Build query for multiple skills
    const skillQueries = requiredSkills.map(skill => ({
      skills: { $regex: skill, $options: "i" }
    }));

    const candidates = await User.find({
      role: "EMPLOYEE",
      $or: skillQueries
    })
    .select("name email skills department position experience hireDate performanceScore")
    .limit(limit)
    .lean<UserCandidate[]>();

    // Calculate match score for each candidate
    const results = candidates.map((c) => {
      const matchScore = calculateRoleMatchScore(requiredSkills, c.skills || []);
      return {
        name: c.name,
        email: c.email,
        skills: c.skills || [],
        department: c.department || "Not specified",
        position: c.position || "Not specified",
        experience: c.experience || "Not specified",
        hireDate: c.hireDate,
        performanceScore: c.performanceScore || "Not rated",
        matchScore,
        matchPercentage: `${Math.round(matchScore * 100)}%`
      };
    });

    // Sort by best match
    return results.sort((a, b) => b.matchScore - a.matchScore);
  } catch (error: any) {
    console.error("Role Recommendation Error:", error.message);
    return [];
  }
};

export const findSimilarEmployees = async (employeeId: string, limit: number = 3) => {
  try {
    console.log("Finding similar employees to:", employeeId);
    
    const employee = await User.findById(employeeId)
      .select("skills department position")
      .lean<UserCandidate>();
    
    if (!employee || !employee.skills || !Array.isArray(employee.skills)) {
      return [];
    }

    // Find employees with similar skills (excluding the employee themselves)
    const candidates = await User.find({
      _id: { $ne: employeeId },
      role: "EMPLOYEE",
      skills: { $in: employee.skills }
    })
    .select("name email skills department position")
    .limit(limit)
    .lean<UserCandidate[]>();

    return candidates.map((c) => {
      const similarityScore = calculateSimilarityScore(employee.skills, c.skills || []);
      return {
        name: c.name,
        email: c.email,
        skills: c.skills || [],
        department: c.department || "Not specified",
        position: c.position || "Not specified",
        similarityScore
      };
    });
  } catch (error: any) {
    console.error("Similar Employees Error:", error.message);
    return [];
  }
};

// Helper functions
const calculateMatchScore = (requiredSkill: string, candidateSkills: string[]): number => {
  if (!candidateSkills || !Array.isArray(candidateSkills)) return 0;
  
  const skillLower = requiredSkill.toLowerCase();
  const matches = candidateSkills.filter(skill => 
    skill && typeof skill === 'string' && skill.toLowerCase().includes(skillLower)
  ).length;
  
  return matches > 0 ? 0.8 + (matches * 0.05) : 0; // Base score + bonus for multiple matches
};

const calculateRoleMatchScore = (requiredSkills: string[], candidateSkills: string[]): number => {
  if (!candidateSkills || !Array.isArray(candidateSkills)) return 0;
  
  let matchedSkills = 0;
  requiredSkills.forEach(reqSkill => {
    const found = candidateSkills.some(candidateSkill => 
      candidateSkill && typeof candidateSkill === 'string' && 
      candidateSkill.toLowerCase().includes(reqSkill.toLowerCase())
    );
    if (found) matchedSkills++;
  });
  
  return requiredSkills.length > 0 ? matchedSkills / requiredSkills.length : 0;
};

const calculateSimilarityScore = (skills1: string[], skills2: string[]): number => {
  if (!skills1 || !skills2 || !Array.isArray(skills1) || !Array.isArray(skills2)) return 0;
  
  // Filter out any null/undefined skills and ensure they're strings
  const filteredSkills1 = skills1.filter(s => s && typeof s === 'string');
  const filteredSkills2 = skills2.filter(s => s && typeof s === 'string');
  
  if (filteredSkills1.length === 0 || filteredSkills2.length === 0) return 0;
  
  const set1 = new Set(filteredSkills1.map(s => s.toLowerCase().trim()));
  const set2 = new Set(filteredSkills2.map(s => s.toLowerCase().trim()));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
};