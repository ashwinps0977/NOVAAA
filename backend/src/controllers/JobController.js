const Job = require('../models/job');
const JobApplication = require('../models/JobApplication');

// Post a new job
exports.postJob = async (req, res) => {
  try {
    // Normalize Enums
    const allowedDepartments = ['Engineering', 'Design', 'Product', 'Sales', 'Marketing', 'Human Resources', 'Finance', 'Operations'];
    const normalizeDepartment = (dept) => {
      if (!dept) return dept;
      const match = allowedDepartments.find(d => d.toLowerCase() === dept.toLowerCase());
      return match || dept; // Return matched title-case or original if not found
    };

    const jobData = {
      ...req.body,
      department: normalizeDepartment(req.body.department),
      jobType: req.body.jobType?.toLowerCase(),
      experienceLevel: req.body.experienceLevel?.toLowerCase(),
      postedBy: req.user.id,
      status: 'active'
    };

    const job = new Job(jobData);
    await job.save();

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      job
    });
  } catch (error) {
    console.error('Post job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to post job: ' + error.message // Return error message for easier debugging
    });
  }
};

// Get all jobs
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .populate('postedBy', 'name email');

    res.json({
      success: true,
      jobs,
      count: jobs.length
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs'
    });
  }
};

// Get job by ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job'
    });
  }
};

// Update job
exports.updateJob = async (req, res) => {
  try {
    // Normalize Enums if present in update
    const allowedDepartments = ['Engineering', 'Design', 'Product', 'Sales', 'Marketing', 'Human Resources', 'Finance', 'Operations'];
    const normalizeDepartment = (dept) => {
      if (!dept) return dept;
      const match = allowedDepartments.find(d => d.toLowerCase() === dept.toLowerCase());
      return match || dept;
    };

    const updateData = { ...req.body };
    if (updateData.department) updateData.department = normalizeDepartment(updateData.department);
    if (updateData.jobType) updateData.jobType = updateData.jobType.toLowerCase();
    if (updateData.experienceLevel) updateData.experienceLevel = updateData.experienceLevel.toLowerCase();

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      message: 'Job updated successfully',
      job
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job: ' + error.message
    });
  }
};

// Delete job
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job'
    });
  }
};