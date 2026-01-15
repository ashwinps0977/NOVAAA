const Task = require('../models/Task');
const Employee = require('../models/Employee');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.getMyTasks = async (req, res) => {
    try {
        // ROBUST TASK RETRIEVAL:
        // Find tasks assigned to the User ID (standard behavior)
        // OR assigned to the linked Employee ID (legacy/inconsistent data support)

        let queryIds = [req.user.id]; // Always check User ID

        // Find associated employee profile to get that ID too
        // We use the email from the logged-in user to find their Employee profile
        const employee = await Employee.findOne({ email: req.user.email });
        if (employee) {
            queryIds.push(employee._id);
        }

        const tasks = await Task.find({
            assignedTo: { $in: queryIds }
        }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, tasks });
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createTask = async (req, res) => {
    try {
        const { title, project, priority, due, assignedToEmployeeId } = req.body;

        console.log('📝 Task Creation Request:', { title, assignedTo: assignedToEmployeeId });

        let targetUserId = assignedToEmployeeId;

        // 1. Try to find the Employee first
        const employee = await Employee.findById(assignedToEmployeeId);

        if (employee) {
            // 2. Find the corresponding User
            const user = await User.findOne({ email: employee.email });
            if (user) {
                targetUserId = user._id; // Preferred: Link to User
                console.log(`✅ ID Resolution: Employee (${employee.name}) -> User ID (${targetUserId})`);
            } else {
                console.warn(`⚠️  Warning: No User found for Employee (${employee.email}). Task assigned to Employee ID.`);
                // We proceed assigning to Employee ID. 
                // Thanks to our robust getMyTasks, the employee will still see this task once they log in (assuming they can log in).
            }
        } else {
            // Maybe the ID passed was already a User ID?
            const directUser = await User.findById(assignedToEmployeeId);
            if (directUser) {
                console.log(`ℹ️ ID provided was already a User ID: ${directUser.name}`);
            } else {
                console.warn(`⚠️  Warning: assignedTo ID (${assignedToEmployeeId}) not found in Employee or User collections.`);
            }
        }

        const newTask = new Task({
            title,
            project,
            priority,
            due,
            assignedTo: targetUserId,
            assignedBy: req.user.id
        });

        await newTask.save();

        // Create Notification
        // Pass the targetUserId. Notifications usually expect a User ID.
        // If targetUserId is an Employee ID, the notification might not surface if the notification system typically queries by User ID.
        // However, this is best effort for inconsistent data.
        await Notification.create({
            user: targetUserId,
            title: 'New Task Assigned',
            message: `You have been assigned a new task: "${title}" by HR.`,
            type: 'info'
        });

        res.status(201).json({ success: true, task: newTask });
    } catch (error) {
        console.error('Task creation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // User can update task if it is assigned to them (User ID or Employee ID)
        let queryIds = [req.user.id];
        const employee = await Employee.findOne({ email: req.user.email });
        if (employee) {
            queryIds.push(employee._id);
        }

        const task = await Task.findOneAndUpdate(
            {
                _id: id,
                assignedTo: { $in: queryIds }
            },
            { status },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found or unauthorized' });
        }

        res.status(200).json({ success: true, task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
