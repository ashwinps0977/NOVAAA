const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const applicationController = require('../controllers/jobApplicationController');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/resumes');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only PDF and DOC/DOCX
  if (file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/msword' ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and DOC/DOCX are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Apply for job (public or authenticated)
router.post('/apply', optionalAuth, upload.single('resume'), applicationController.submitApplication);

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