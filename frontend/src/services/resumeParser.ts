// Mock resume parser service
// In a real application, you would integrate with a resume parsing API

export interface ParsedResume {
  skills: string[];
  experience: number;
  education: string[];
  previousRoles: string[];
  certifications: string[];
}

export const parseResume = async (): Promise<ParsedResume> => {
  // This is a mock implementation
  // In reality, you would:
  // 1. Upload the file to your backend
  // 2. Call a resume parsing API (like Affinda, Sovren, or use OpenAI)
  // 3. Return structured data
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock data - in reality, parse the actual file
  const mockSkills = [
    'React', 'TypeScript', 'Node.js', 'AWS', 
    'Python', 'MongoDB', 'Git', 'Agile Methodology'
  ];
  
  const mockEducation = [
    'Bachelor of Science in Computer Science',
    'Certified AWS Developer'
  ];
  
  const mockPreviousRoles = [
    'Senior Frontend Developer',
    'Full Stack Engineer'
  ];
  
  const mockCertifications = [
    'AWS Certified Developer',
    'React Professional Certificate'
  ];
  
  return {
    skills: mockSkills,
    experience: Math.floor(Math.random() * 10) + 1,
    education: mockEducation,
    previousRoles: mockPreviousRoles,
    certifications: mockCertifications
  };
};

export const matchSkills = (jobSkills: string[], candidateSkills: string[]): number => {
  if (jobSkills.length === 0) return 0;
  
  const matchedSkills = candidateSkills.filter(candidateSkill =>
    jobSkills.some(jobSkill =>
      jobSkill.toLowerCase().includes(candidateSkill.toLowerCase()) ||
      candidateSkill.toLowerCase().includes(jobSkill.toLowerCase())
    )
  );
  
  return (matchedSkills.length / jobSkills.length) * 100;
};