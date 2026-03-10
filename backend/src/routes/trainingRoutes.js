const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin'); // HR/Admin check

// Employee Routes
router.get('/my-trainings', auth, trainingController.getMyTrainings);
router.get('/my-assignments', auth, trainingController.getMyAssignments);
router.put('/:id/progress', auth, trainingController.updateProgress);
router.post('/enroll/:moduleId', auth, trainingController.enrollInModule);
router.post('/seed', auth, trainingController.seedTrainings);
router.post('/seed-modules', auth, trainingController.seedModules); // For initial setup

// HR Management Routes (Modules)
router.get('/modules', auth, trainingController.getModules);
router.post('/modules', auth, admin, trainingController.createModule);
router.put('/modules/:id', auth, admin, trainingController.updateModule);
router.delete('/modules/:id', auth, admin, trainingController.deleteModule);

// HR Assignment & Stats
router.get('/stats', auth, admin, trainingController.getHRTrainingStats);
router.post('/assign', auth, admin, trainingController.assignTraining);

// Certificate Download
router.get('/:id/certificate', auth, trainingController.downloadCertificate);

module.exports = router;
