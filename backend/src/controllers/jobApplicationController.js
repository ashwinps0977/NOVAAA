const JobApplication = require('../models/JobApplication');
const Job = require('../models/job');

// Submit job application
exports.submitApplication = async (req, res) => {
  try {
    const { jobId, ...applicationData } = req.body;
    
    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job || job.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Job not found or no longer active'
      });
    }

    // Check if already applied
    const existingApplication = await JobApplication.findOne({
      job: jobId,
      email: applicationData.email
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Parse resume and extract skills (mock implementation)
    const parsedSkills = parseResumeForSkills(applicationData.resumeUrl, job.skills);
    
    // Calculate match percentage
    const matchPercentage = calculateMatchPercentage(
      parsedSkills,
      applicationData.skills || [],
      job.skills
    );

    // Get matched skills
    const matchedSkills = getMatchedSkills(
      [...parsedSkills, ...(applicationData.skills || [])],
      job.skills
    );

    const application = new JobApplication({
      job: jobId,
      candidate: req.user?.id,
      ...applicationData,
      parsedSkills,
      matchPercentage,
      matchedSkills,
      status: 'pending'
    });

    await application.save();

    // Update job applicants count
    job.applicants += 1;
    await job.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application'
    });
  }
};

// Mock resume parsing function
const parseResumeForSkills = (resumeUrl, jobSkills) => {
  // In production, use a resume parsing service like:
  // - Affinda API
  // - Sovren
  // - ParseHub
  // - Custom NLP solution
  
  // For demo, return some mock skills
  const commonSkills = ['Communication', 'Problem Solving', 'Teamwork'];
  
  // Match with job skills (mock implementation)
  const matchedSkills = jobSkills.slice(0, Math.min(3, jobSkills.length));
  
  return [...matchedSkills, ...commonSkills];
};

// Calculate match percentage
const calculateMatchPercentage = (parsedSkills, manualSkills, jobSkills) => {
  if (!jobSkills || jobSkills.length === 0) return 100;
  
  const allCandidateSkills = [...new Set([...parsedSkills, ...manualSkills])];
  
  const matchedSkills = allCandidateSkills.filter(skill => 
    jobSkills.some(jobSkill => 
      jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(jobSkill.toLowerCase())
    )
  );
  
  return Math.round((matchedSkills.length / jobSkills.length) * 100);
};

// Get matched skills
const getMatchedSkills = (candidateSkills, jobSkills) => {
  return candidateSkills.filter(skill => 
    jobSkills.some(jobSkill => 
      jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(jobSkill.toLowerCase())
    )
  );
};

// Get applications for HR
exports.getApplications = async (req, res) => {
  try {
    const { status, jobId } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (jobId) filter.job = jobId;
    
    const applications = await JobApplication.find(filter)
      .populate('job', 'title department')
      .populate('candidate', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      applications,
      count: applications.length
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications'
    });
  }
};

// Get application by ID
exports.getApplicationById = async (req, res) => {
  try {
    const application = await JobApplication.findById(req.params.id)
      .populate('job', 'title department skills requirements')
      .populate('candidate', 'name email phone');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application'
    });
  }
};

// Update application status (for HR)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      {
        status,
        $push: notes ? {
          notes: {
            text: notes,
            addedBy: req.user.id
          }
        } : undefined
      },
      { new: true }
    ).populate('job', 'title');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      message: 'Application status updated',
      application
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application'
    });
  }
};

// Schedule interview
exports.scheduleInterview = async (req, res) => {
  try {
    const { interviewDate, notes } = req.body;
    
    const application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      {
        status: 'interview-scheduled',
        interviewScheduled: interviewDate,
        $push: notes ? {
          notes: {
            text: notes,
            addedBy: req.user.id
          }
        } : undefined
      },
      { new: true }
    ).populate('candidate', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // TODO: Send interview email to candidate

    res.json({
      success: true,
      message: 'Interview scheduled successfully',
      application,
      emailSent: true
    });
  } catch (error) {
    console.error('Schedule interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule interview'
    });
  }
};

// Reject application
exports.rejectApplication = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        $push: {
          notes: {
            text: reason,
            addedBy: req.user.id
          }
        }
      },
      { new: true }
    ).populate('candidate', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // TODO: Send rejection email to candidate

    res.json({
      success: true,
      message: 'Application rejected',
      application,
      emailSent: true
    });
  } catch (error) {
    console.error('Reject application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject application'
    });
  }
};