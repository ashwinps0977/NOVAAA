const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

// Configure multer for resume uploads
const storage = multer.diskStorage({
  destination: './uploads/resumes/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'));
    }
  }
});

// AI Resume Parser Function
async function parseResumeWithAI(filePath, jobRequirements) {
  try {
    // Extract text from PDF
    const dataBuffer = await fs.readFile(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = pdfData.text;
    
    // Prepare data for AI analysis
    const analysisData = {
      resume_text: resumeText,
      job_requirements: jobRequirements.requirements || '',
      required_skills: jobRequirements.skills || [],
      job_title: jobRequirements.title || '',
      experience_needed: jobRequirements.minExperience || 0
    };
    
    // Call AI service (Python/Flask or direct OpenAI API)
    // Option 1: Local Python AI service
    const pythonScript = path.join(__dirname, '../ai_resume_parser.py');
    
    const { stdout, stderr } = await execPromise(
      `python3 "${pythonScript}" "${filePath}" '${JSON.stringify(analysisData)}'`
    );
    
    const result = JSON.parse(stdout);
    
    // Calculate match score
    const matchScore = calculateMatchScore(result, jobRequirements);
    
    return {
      ...result,
      match_score: matchScore,
      parsed_text: resumeText.substring(0, 1000) // First 1000 chars for preview
    };
    
  } catch (error) {
    console.error('AI parsing error:', error);
    // Fallback to basic text extraction
    const dataBuffer = await fs.readFile(filePath);
    const pdfData = await pdfParse(dataBuffer);
    
    return {
      skills: extractSkillsBasic(pdfData.text),
      experience: extractExperienceBasic(pdfData.text),
      education: extractEducationBasic(pdfData.text),
      match_score: 50, // Default score
      parsed_text: pdfData.text.substring(0, 1000)
    };
  }
}

// Helper functions for fallback parsing
function extractSkillsBasic(text) {
  const commonSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'Java', 'SQL',
    'AWS', 'Docker', 'Kubernetes', 'Git', 'HTML', 'CSS', 'TypeScript',
    'REST API', 'GraphQL', 'MongoDB', 'PostgreSQL', 'Redis'
  ];
  
  return commonSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  ).slice(0, 10);
}

function extractExperienceBasic(text) {
  const experienceMatch = text.match(/(\d+)\+?\s*(years?|yrs?)/i);
  return experienceMatch ? parseInt(experienceMatch[1]) : 0;
}

function extractEducationBasic(text) {
  const degrees = ['B.S.', 'B.A.', 'M.S.', 'M.A.', 'Ph.D', 'Bachelor', 'Master', 'PhD'];
  return degrees.filter(degree => text.includes(degree)).join(', ');
}

function calculateMatchScore(parsedData, jobRequirements) {
  let score = 0;
  const maxScore = 100;
  
  // 1. Skills match (40 points)
  const jobSkills = jobRequirements.skills || [];
  const resumeSkills = parsedData.skills || [];
  
  const matchedSkills = jobSkills.filter(skill => 
    resumeSkills.some(resumeSkill => 
      resumeSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(resumeSkill.toLowerCase())
    )
  );
  
  score += (matchedSkills.length / jobSkills.length) * 40;
  
  // 2. Experience match (30 points)
  const requiredExp = jobRequirements.minExperience || 0;
  const actualExp = parsedData.experience || 0;
  
  if (actualExp >= requiredExp) {
    score += 30;
  } else if (requiredExp > 0) {
    score += (actualExp / requiredExp) * 30;
  }
  
  // 3. Education match (20 points)
  const requiredEdu = jobRequirements.education || '';
  const actualEdu = parsedData.edducation || '';
  
  if (requiredEdu && actualEdu.includes(requiredEdu)) {
    score += 20;
  } else if (!requiredEdu) {
    score += 10; // Partial points if no education requirement
  }
  
  // 4. Keywords match (10 points)
  const jobKeywords = (jobRequirements.description || '').split(/\W+/).slice(0, 20);
  const resumeText = (parsedData.parsed_text || '').toLowerCase();
  
  const matchedKeywords = jobKeywords.filter(keyword => 
    resumeText.includes(keyword.toLowerCase())
  );
  
  score += (matchedKeywords.length / jobKeywords.length) * 10;
  
  return Math.min(Math.round(score), maxScore);
}

// POST /api/applications/apply (enhanced with AI parsing)
router.post('/apply', upload.single('resume'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    let userId = null;
    
    if (token) {
      // Verify token and get user ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    }
    
    const {
      jobId,
      fullName,
      email,
      phone,
      currentCompany,
      currentRole,
      experience,
      coverLetter,
      skills
    } = req.body;
    
    // Get job details for AI parsing
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Parse resume with AI
    let parsedResume = null;
    if (req.file) {
      parsedResume = await parseResumeWithAI(req.file.path, {
        title: job.title,
        requirements: job.requirements,
        skills: job.skills,
        minExperience: job.minExperience
      });
    }
    
    // Create application
    const application = new Application({
      jobId,
      candidateName: fullName,
      candidateEmail: email,
      candidatePhone: phone,
      currentCompany,
      currentRole,
      experience: parseInt(experience),
      skills: typeof skills === 'string' ? JSON.parse(skills) : skills,
      coverLetter,
      resumePath: req.file ? req.file.path : null,
      resumeFilename: req.file ? req.file.filename : null,
      resumeParsedData: parsedResume,
      matchScore: parsedResume ? parsedResume.match_score : 0,
      appliedDate: new Date(),
      status: 'review',
      userId
    });
    
    await application.save();
    
    // Update job applicants count
    job.applicants += 1;
    await job.save();
    
    res.status(201).json({
      message: 'Application submitted successfully',
      application: {
        id: application._id,
        matchScore: application.matchScore
      }
    });
    
  } catch (error) {
    console.error('Application error:', error);
    res.status(500).json({ message: 'Failed to submit application' });
  }
});

// GET /api/applications/:jobId (for HR dashboard)
router.get('/:jobId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'hr') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const applications = await Application.find({ jobId: req.params.jobId })
      .sort({ matchScore: -1, appliedDate: -1 })
      .lean();
    
    // Format response with AI analysis data
    const formattedApplications = applications.map(app => ({
      id: app._id,
      candidateName: app.candidateName,
      candidateEmail: app.candidateEmail,
      candidatePhone: app.candidatePhone,
      experience: app.experience,
      skills: app.skills,
      resumeUrl: `/api/resumes/${app.resumeFilename}`,
      coverLetter: app.coverLetter,
      appliedDate: app.appliedDate,
      status: app.status,
      matchScore: app.matchScore,
      aiAnalysis: app.resumeParsedData ? {
        skills: app.resumeParsedData.skills || [],
        experience: app.resumeParsedData.experience,
        education: app.resumeParsedData.education,
        extractedText: app.resumeParsedData.parsed_text?.substring(0, 500) || ''
      } : null,
      interviewDate: app.interviewDate,
      interviewer: app.interviewer
    }));
    
    res.json({ applications: formattedApplications });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
});

module.exports = router;