const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');

router.get('/', auth, taskController.getAllTasks); // For HR/Board view
router.get('/my-tasks', auth, taskController.getMyTasks);
router.post('/', auth, taskController.createTask);
router.put('/:id', auth, taskController.updateTask);
router.put('/:id/status', auth, taskController.updateTaskStatus);
router.post('/:id/comment', auth, taskController.addComment);
router.post('/:id/upload', auth, taskController.uploadAttachment);
router.delete('/:id', auth, taskController.deleteTask);

module.exports = router;
