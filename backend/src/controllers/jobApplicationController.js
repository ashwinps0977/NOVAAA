const JobApplication = require('../models/JobApplication');
const Job = require('../models/job');

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

    // Prepare data for Python script
    const jobData = {
      required_skills: job.skills || [],
      job_requirements: (job.requirements || []).join(' '),
      experience_needed: job.minExperience || 0
    };

    // Call Python script for parsing
    const pythonScriptPath = path.join(__dirname, '../../ai_resume_parser.py');
    const resumePath = req.file.path;

    // Promise wrapper for python script execution
    const parseResume = () => {
      return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [
          pythonScriptPath,
          resumePath,
          JSON.stringify(jobData)
        ]);

        let dataString = '';
        let errorString = '';

        pythonProcess.stdout.on('data', (data) => {
          dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          errorString += data.toString();
        });

        pythonProcess.on('close', (code) => {
          if (code !== 0) {
            console.error(`Python script exited with code ${code}`);
            console.error(`Error output: ${errorString}`);
            // Fallback to basic parsing if Python script fails
            resolve({
              success: false,
              skills: [],
              overall_score: 0,
              skill_match_ratio: 0,
              matched_skills_count: 0
            });
          } else {
            try {
              const result = JSON.parse(dataString);
              resolve(result);
            } catch (err) {
              console.error('Error parsing Python output:', err);
              resolve({
                success: false,
                skills: [],
                overall_score: 0
              });
            }
          }
        });
      });
    };

    console.log('Starting AI resume parsing...');
    const aiResult = await parseResume();
    console.log('AI Parsing result:', aiResult);

    // Prepare application object
    const application = new JobApplication({
      job: jobId,
      candidate: req.user?.id,
      ...applicationData,
      skills: applicationData.skills ? JSON.parse(applicationData.skills) : [],
      resumeUrl: `/uploads/resumes/${req.file.filename}`,
      resumeFileName: req.file.originalname,
      // AI Results
      parsedSkills: aiResult.skills || [],
      matchPercentage: aiResult.overall_score || 0,
      matchedSkills: aiResult.skills ? aiResult.skills.filter(skill =>
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
      message: 'Application submitted successfully',
      application,
      aiAnalysis: {
        score: aiResult.overall_score,
        matchedSkills: aiResult.matched_skills_count
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
    const { interviewDate, time, mode, meetingLink, notes, interviewers } = req.body;

    const updateData = {
      status: 'interview-scheduled',
      interviewScheduled: interviewDate
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
    if (application.candidate && application.candidate.email) {
      const interviewDateTime = new Date(interviewDate).toLocaleDateString();
      const jobTitle = application.job ? application.job.title : 'Position';
      const companyName = 'NOVA Workforce';

      const emailSubject = `Interview Scheduled – ${jobTitle} Position`;

      const emailContent = `
            <p>Dear ${application.candidate.name},</p>

            <p>We are pleased to inform you that you have been <strong>shortlisted</strong> for the next stage of the selection process for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>

            <p>Your interview has been scheduled as per the details below:</p>

            <p><strong>📅 Date:</strong> ${interviewDateTime}<br>
            <strong>⏰ Time:</strong> ${time || 'To be confirmed'}<br>
            <strong>📍 Mode:</strong> ${mode || 'Virtual'}<br>
            <strong>🏢 Venue / Meeting Link:</strong> ${meetingLink || 'To be shared'}<br>
            <strong>👤 Interviewer(s):</strong> ${interviewers || 'HR Panel'}</p>

            <p>Please ensure that you carry a copy of your resume and any relevant documents (if attending in person). For online interviews, kindly ensure a stable internet connection and join the meeting at least 5 minutes early.</p>

            <p>Kindly confirm your availability by replying to this email. If you require any changes or have questions, feel free to reach out.</p>

            <p>We look forward to meeting you and wish you the very best.</p>

            <p>Warm regards,<br>
            Ashwin P S<br>
            HR Department<br>
            ${companyName}<br>
            9072032209</p>
        `;
      await sendEmail(application.candidate.email, emailSubject, emailContent);
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
    if (application.candidate && application.candidate.email) {
      const emailSubject = `Update on your application for ${application.job ? application.job.title : 'Position'}`;
      const emailContent = `
            <h3>Dear ${application.candidate.name},</h3>
            <p>Thank you for giving us the opportunity to consider your application for the <strong>${application.job ? application.job.title : 'position'}</strong>.</p>
            <p>After careful consideration, we regret to inform you that we have decided not to pursue your application at this time.</p>
            ${reason ? `<p><strong>Feedback:</strong> ${reason}</p>` : ''}
            <p>We will keep your resume on file for future openings that may be a better fit.</p>
            <p>We wish you all the best in your job search.</p>
            <br>
            <p>Best regards,<br>The HR Team</p>
        `;
      await sendEmail(application.candidate.email, emailSubject, emailContent);
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