const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const applicationController = require('../controllers/jobApplicationController');

// Apply for job (public or authenticated)
router.post('/apply', auth, applicationController.submitApplication);

// Get my applications
router.get('/my-applications', auth, async (req, res) => {
  try {
    const applications = await JobApplication.find({ candidate: req.user.id })
      .populate('job', 'title department')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications'
    });
  }
});

// HR routes
router.get('/', auth, applicationController.getApplications);
router.get('/:id', auth, applicationController.getApplicationById);
router.put('/:id/status', auth, applicationController.updateApplicationStatus);
router.post('/:id/schedule-interview', auth, applicationController.scheduleInterview);
router.post('/:id/reject', auth, applicationController.rejectApplication);

module.exports = router;