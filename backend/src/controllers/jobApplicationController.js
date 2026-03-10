const JobApplication = require('../models/JobApplication');
const Job = require('../models/Job');

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

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
      // If file was uploaded, delete it since we're rejecting the application
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Resume file is required'
      });
    }

    // AI Analysis using Gemini
    const aiService = require('../services/aiService');
    const resumePath = req.file.path;

    console.log('🚀 Starting Gemini-powered AI resume analysis...');
    let aiResult = {
      overallScore: 0,
      candidateDetails: {},
      scoreBreakdown: {},
      parsedSkills: [],
      strengths: [],
      gaps: [],
      aiRecommendations: 'Error during AI analysis',
      analysisSummary: ''
    };

    try {
      const resumeText = await aiService.extractText(resumePath);
      aiResult = await aiService.analyzeResume(resumeText, {
        title: job.title,
        department: job.department,
        skills: job.skills,
        requirements: job.requirements,
        experienceLevel: job.experienceLevel
      });
      console.log('✅ AI Parsing successful - Score:', aiResult.overallScore);
    } catch (aiError) {
      console.error('❌ AI Parsing failed:', aiError.message);
      // We still proceed with the application, just with 0 score
    }

    // Prepare application object
    const application = new JobApplication({
      job: jobId,
      candidate: req.user?.id,
      ...applicationData,
      skills: applicationData.skills ? JSON.parse(applicationData.skills) : [],
      resumeUrl: `/uploads/resumes/${req.file.filename}`,
      resumeFileName: req.file.originalname,

      // AI Results Mapping
      matchPercentage: aiResult.overallScore || 0,
      candidateDetails: aiResult.candidateDetails || {},
      scoreBreakdown: aiResult.scoreBreakdown || {},
      parsedSkills: aiResult.parsedSkills || [],
      strengths: aiResult.strengths || [],
      gaps: aiResult.gaps || [],
      aiRecommendations: aiResult.aiRecommendations || '',
      analysisSummary: aiResult.analysisSummary || '',

      matchedSkills: aiResult.parsedSkills ? aiResult.parsedSkills.filter(skill =>
        job.skills.some(jobSkill =>
          jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(jobSkill.toLowerCase())
        )
      ) : [],
      status: 'pending'
    });

    await application.save();

    // Update job applicants count
    await Job.findByIdAndUpdate(jobId, { $inc: { applicants: 1 } });

    res.status(201).json({
      success: true,
      message: 'Application submitted with AI analysis',
      application,
      aiAnalysis: {
        score: aiResult.overallScore,
        summary: aiResult.analysisSummary
      }
    });
  } catch (error) {
    console.error('Submit application error:', error);
    fs.writeFileSync('error_log.txt', `Error: ${error.message}\nStack: ${error.stack}\n`);

    // If file was uploaded but error occurred, try to delete it
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) { }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit application: ' + error.message
    });
  }
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

const sendEmail = require('../utils/mailer');

// ... (imports remain at top of file, so this is just for context)

// Schedule interview
exports.scheduleInterview = async (req, res) => {
  try {
    const {
      interviewDate, date, // Handle both names
      time, mode, meetingLink, notes,
      interviewers, interviewer // Handle both names
    } = req.body;

    const actualDate = interviewDate || date;
    const actualInterviewer = interviewers || interviewer;

    const updateData = {
      status: 'interview-scheduled',
      interviewScheduled: actualDate
    };

    if (notes) {
      updateData.$push = {
        notes: {
          text: notes,
          addedBy: req.user.id
        }
      };
    }

    const application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .populate('candidate', 'name email')
      .populate('job', 'title');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Send interview email to candidate
    const candidateEmail = application.candidate?.email || application.email;
    const candidateName = application.candidate?.name || application.fullName;

    if (candidateEmail) {
      const interviewDateTime = new Date(actualDate).toLocaleDateString();
      const jobTitle = application.job ? application.job.title : 'Position';
      const companyName = 'NOVA Workforce';

      const emailSubject = `Interview Scheduled – ${jobTitle} Position`;

      const emailContent = `
            <p>Dear ${candidateName},</p>

            <p>We are pleased to inform you that you have been <strong>shortlisted</strong> for the next stage of the selection process for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>

            <p>Your interview has been scheduled as per the details below:</p>

            <p><strong>📅 Date:</strong> ${interviewDateTime}<br>
            <strong>⏰ Time:</strong> ${time || 'To be confirmed'}<br>
            <strong>📍 Mode:</strong> ${mode || 'Virtual'}<br>
            <strong>🏢 Venue / Meeting Link:</strong> ${meetingLink ? (meetingLink.startsWith('http') ? `<a href="${meetingLink}" target="_blank">${meetingLink}</a>` : meetingLink) : 'To be shared'}<br>
            <strong>👤 Interviewer(s):</strong> ${actualInterviewer || 'HR Panel'}</p>

            <p>Please ensure that you carry a copy of your resume and any relevant documents (if attending in person). For online interviews, kindly ensure a stable internet connection and join the meeting at least 5 minutes early.</p>

            <p>Kindly confirm your availability by replying to this email. If you require any changes or have questions, feel free to reach out.</p>

            <p>We look forward to meeting you and wish you the very best.</p>

            <p>Warm regards,<br>
            Rohit Iyer<br>
            HR Department<br>
            ${companyName}<br>
            9072032209</p>
        `;
      await sendEmail(candidateEmail, emailSubject, emailContent);
    }

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

    const updateData = {
      status: 'rejected'
    };

    if (reason) {
      updateData.$push = {
        notes: {
          text: reason,
          addedBy: req.user.id
        }
      };
    }

    const application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .populate('candidate', 'name email')
      .populate('job', 'title');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Send rejection email to candidate
    const candidateEmail = application.candidate?.email || application.email;
    const candidateName = application.candidate?.name || application.fullName;

    if (candidateEmail) {
      const emailSubject = `Update on your application for ${application.job ? application.job.title : 'Position'}`;
      const emailContent = `
            <h3>Dear ${candidateName},</h3>
            <p>Thank you for giving us the opportunity to consider your application for the <strong>${application.job ? application.job.title : 'position'}</strong>.</p>
            <p>After careful consideration, we regret to inform you that we have decided not to pursue your application at this time.</p>
            ${reason ? `<p><strong>Feedback:</strong> ${reason}</p>` : ''}
            <p>We will keep your resume on file for future openings that may be a better fit.</p>
            <p>We wish you all the best in your job search.</p>
            <br>
            <p>Best regards,<br>The HR Team</p>
        `;
      await sendEmail(candidateEmail, emailSubject, emailContent);
    }

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