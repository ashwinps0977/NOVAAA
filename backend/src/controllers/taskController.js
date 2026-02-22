const Task = require('../models/Task');
const Employee = require('../models/Employee');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Get all tasks (for HR)
exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate('assignedTo', 'name email')
            .populate('assignedBy', 'name email')
            .populate('comments.author', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyTasks = async (req, res) => {
    try {
        let queryIds = [req.user.id];
        const employee = await Employee.findOne({ email: req.user.email });
        if (employee) {
            queryIds.push(employee._id);
        }

        const tasks = await Task.find({
            assignedTo: { $in: queryIds }
        })
            .populate('assignedTo', 'name email')
            .populate('assignedBy', 'name email')
            .populate('comments.author', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, tasks });
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createTask = async (req, res) => {
    try {
        const { title, description, project, priority, dueDate, due, assignedToEmployeeId } = req.body;

        // Handle field name mismatch and fallback
        const rawDate = dueDate || due;
        let parsedDate = new Date(rawDate);
        if (isNaN(parsedDate.getTime()) || !rawDate) {
            parsedDate = new Date();
            parsedDate.setDate(parsedDate.getDate() + 7); // Default 1 week
        }

        let targetUserId = assignedToEmployeeId;
        const employee = await Employee.findById(assignedToEmployeeId);

        if (employee) {
            const user = await User.findOne({ email: employee.email });
            if (user) {
                targetUserId = user._id;
            }
        }

        const newTask = new Task({
            title,
            description: description || '',
            project: project || 'General',
            priority: (priority || 'medium').toLowerCase(),
            status: 'assigned',
            dueDate: parsedDate,
            assignedTo: targetUserId,
            assignedBy: req.user.id,
            createdBy: req.user.id
        });

        await newTask.save();

        const populatedTask = await Task.findById(newTask._id)
            .populate('assignedTo', 'name email')
            .populate('assignedBy', 'name email')
            .populate('comments.author', 'name');

        await Notification.create({
            user: targetUserId,
            title: 'New Task Assigned',
            message: `You have been assigned a new task: "${title}" by HR.`,
            type: 'info'
        });

        res.status(201).json({ success: true, task: populatedTask });
    } catch (error) {
        console.error('Task creation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (updates.priority) updates.priority = updates.priority.toLowerCase();
        if (updates.dueDate) updates.dueDate = new Date(updates.dueDate);

        const task = await Task.findByIdAndUpdate(id, updates, { new: true })
            .populate('assignedTo', 'name email')
            .populate('assignedBy', 'name email')
            .populate('comments.author', 'name');

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        res.status(200).json({ success: true, task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const task = await Task.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        res.status(200).json({ success: true, task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findByIdAndDelete(id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.status(200).json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        const task = await Task.findByIdAndUpdate(
            id,
            { $push: { comments: { text, author: req.user.id } } },
            { new: true }
        )
            .populate('assignedTo', 'name email')
            .populate('comments.author', 'name');

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        res.status(200).json({ success: true, task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.uploadAttachment = async (req, res) => {
    try {
        const { id } = req.params;
        let url = req.body.url;

        if (req.file) {
            url = `/uploads/tasks/${req.file.filename}`;
        }

        if (!url) {
            return res.status(400).json({ success: false, message: 'No file or URL provided' });
        }

        const task = await Task.findByIdAndUpdate(
            id,
            { $push: { attachments: url } },
            { new: true }
        )
            .populate('assignedTo', 'name email')
            .populate('comments.author', 'name');

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        res.status(200).json({ success: true, task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
