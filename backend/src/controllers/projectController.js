const Project = require('../models/Project');
const Employee = require('../models/Employee');
const User = require('../models/User');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

// Assign a project to an employee
exports.assignProject = async (req, res) => {
    try {
        const { title, description, role, assignedToEmployeeId, deadline } = req.body;

        // Validate employee exists
        const employee = await Employee.findById(assignedToEmployeeId);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // Find corresponding user for this employee (by email)
        const user = await User.findOne({ email: employee.email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User account for this employee not found'
            });
        }

        // Parse deadline safely
        let parsedDeadline = new Date(deadline);
        if (isNaN(parsedDeadline.getTime()) && deadline && deadline.includes('-')) {
            // Try parsing DD-MM-YYYY
            const parts = deadline.split('-');
            if (parts.length === 3) {
                // Check if it's DD-MM-YYYY or YYYY-MM-DD (already tried by new Date)
                // If parts[0] is 4 digits, it's YYYY-MM-DD
                if (parts[0].length !== 4) {
                    parsedDeadline = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                }
            }
        }

        // Final fallback if date is still invalid
        if (isNaN(parsedDeadline.getTime())) {
            parsedDeadline = new Date();
            parsedDeadline.setMonth(parsedDeadline.getMonth() + 1); // Default 1 month
        }

        const project = new Project({
            title,
            description: description || `Project: ${title} - Role: ${role}`, // Handle empty description
            role,
            assignedTo: employee._id,
            assignedToUser: user._id,
            assignedBy: req.user.id,
            deadline: parsedDeadline,
            status: 'Pending'
        });

        await project.save();

        // Create a corresponding Task for the Operations Board
        const newTask = new Task({
            title,
            description: description || `Project Role: ${role}`,
            project: title,
            priority: 'Medium',
            status: 'assigned',
            dueDate: parsedDeadline,
            assignedTo: user._id,
            assignedBy: req.user.id,
            createdBy: req.user.id
        });

        await newTask.save();

        // Create notification
        await Notification.create({
            user: user._id,
            title: 'New Project & Task Assigned',
            message: `You have been assigned to project "${title}" and a corresponding task has been created.`,
            type: 'info'
        });

        res.status(201).json({
            success: true,
            message: 'Project and Task assigned successfully',
            project,
            task: newTask
        });

    } catch (error) {
        console.error('Assign project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to assign project',
            error: error.message,
            stack: error.stack
        });
    }
};

// Get all projects (for HR)
exports.getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find()
            .populate('assignedTo', 'name email department position')
            .populate('assignedBy', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            projects
        });
    } catch (error) {
        console.error('Get all projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch projects'
        });
    }
};

// Get my projects (for Employee)
exports.getMyProjects = async (req, res) => {
    try {
        // req.user.id is the User ID.
        const projects = await Project.find({ assignedToUser: req.user.id })
            .populate('assignedBy', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            projects
        });
    } catch (error) {
        console.error('Get my projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch your projects'
        });
    }
};

// Update project status (for Employee)
exports.updateProjectStatus = async (req, res) => {
    try {
        const { status, feedback } = req.body;
        const projectId = req.params.id;

        const project = await Project.findOne({
            _id: projectId,
            assignedToUser: req.user.id
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found or not assigned to you'
            });
        }

        if (status) project.status = status;
        if (feedback !== undefined) project.feedback = feedback;

        await project.save();

        res.json({
            success: true,
            message: 'Project status updated',
            project
        });

    } catch (error) {
        console.error('Update project status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update project status'
        });
    }
};
