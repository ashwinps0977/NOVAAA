const Project = require('../models/Project');
const Employee = require('../models/Employee');
const User = require('../models/User');

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

        const project = new Project({
            title,
            description,
            role,
            assignedTo: employee._id,
            assignedToUser: user._id,
            assignedBy: req.user.id, // HR user from token
            deadline,
            status: 'Pending'
        });

        await project.save();

        res.status(201).json({
            success: true,
            message: 'Project assigned successfully',
            project
        });

    } catch (error) {
        console.error('Assign project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to assign project'
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
