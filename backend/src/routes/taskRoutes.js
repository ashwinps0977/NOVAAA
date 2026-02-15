const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');

router.get('/my-tasks', auth, taskController.getMyTasks);
router.post('/', auth, taskController.createTask); // Usually HR/Admin
router.put('/:id/status', auth, taskController.updateTaskStatus);

module.exports = router;
