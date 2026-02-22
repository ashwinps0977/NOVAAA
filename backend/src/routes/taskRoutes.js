const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer storage for task attachments
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../uploads/tasks');
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

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.get('/', auth, taskController.getAllTasks); // For HR/Board view
router.get('/my-tasks', auth, taskController.getMyTasks);
router.post('/', auth, taskController.createTask);
router.put('/:id', auth, taskController.updateTask);
router.put('/:id/status', auth, taskController.updateTaskStatus);
router.post('/:id/comment', auth, taskController.addComment);
router.post('/:id/upload', auth, upload.single('file'), taskController.uploadAttachment);
router.delete('/:id', auth, taskController.deleteTask);

module.exports = router;
