const Project = require('../models/Project');
const Employee = require('../models/Employee');
const User = require('../models/User');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

// Assign a project to an employee
exports.assignProject = async (req, res) => {
    try {
        const { title, projectName, description, role, assignedToEmployeeId, deadline } = req.body;
        const pName = projectName || title;

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
            const parts = deadline.split('-');
            if (parts.length === 3) {
                if (parts[0].length !== 4) {
                    parsedDeadline = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                }
            }
        }

        if (isNaN(parsedDeadline.getTime())) {
            parsedDeadline = new Date();
            parsedDeadline.setMonth(parsedDeadline.getMonth() + 1);
        }

        const project = new Project({
            projectName: pName,
            title: pName,
            description: description || `Project: ${pName} - Role: ${role}`,
            role,
            assignedTo: employee._id,
            assignedToUser: user._id,
            assignedBy: req.user.id,
            deadline: parsedDeadline,
            endDate: parsedDeadline,
            status: 'Pending'
        });

        await project.save();

        // Create a corresponding Task for the Operations Board
        const newTask = new Task({
            title: pName,
            description: description || `Project Role: ${role}`,
            project: pName,
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
            message: `You have been assigned to project "${pName}" and a corresponding task has been created.`,
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
            error: error.message
        });
    }
};

// Get all projects (for HR)
exports.getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find()
            .populate('assignedTo', 'name email department position')
            .populate('assignedBy', 'name')
            .populate('teamId', 'teamName')
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
        // 1. Find the employee record associated with this user
        const user = await User.findById(req.user.id);
        const employee = await Employee.findOne({ email: user.email });

        let query = {
            $or: [
                { assignedToUser: req.user.id }
            ]
        };

        if (employee) {
            // Include projects where the employee's team is assigned
            const Team = require('../models/Team');
            const myTeams = await Team.find({
                $or: [
                    { teamLead: employee._id },
                    { members: employee._id }
                ]
            });

            if (myTeams.length > 0) {
                const teamIds = myTeams.map(t => t._id);
                query.$or.push({ teamId: { $in: teamIds } });
            }
        }

        const projects = await Project.find(query)
            .populate('assignedBy', 'name')
            .populate('teamId', 'teamName')
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

        if (status) {
            project.status = status;

            // Handle dynamic completion percentage
            if (status === 'In Progress') {
                project.progressPercentage = Math.floor(Math.random() * (35 - 25 + 1)) + 25; // 25-35%
            } else if (status === 'For Review') {
                project.progressPercentage = Math.floor(Math.random() * (80 - 70 + 1)) + 70; // 70-80%
            } else if (status === 'Completed') {
                project.progressPercentage = 100;
            } else if (status === 'Planning' || status === 'Pending') {
                project.progressPercentage = 0;
            }
        }
        if (feedback !== undefined) project.feedback = feedback;

        await project.save();

        res.json({
            success: true,
            message: `Project status updated to ${status} with ${project.progressPercentage}% completion`,
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

// Delete project and dissolve team (for HR/Admin)
exports.deleteProject = async (req, res) => {
    try {
        const projectId = req.params.id;
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Dissolve team if it exists
        if (project.teamId) {
            const Team = require('../models/Team');
            const team = await Team.findById(project.teamId);

            if (team) {
                // Reset teamId on lead and members
                const allMemberIds = [team.teamLead, ...team.members].filter(Boolean);

                // Calculate workload to release (mirrors creation logic)
                const workloadToRelease = Math.round(100 / (allMemberIds.length + 2));

                await Employee.updateMany(
                    { _id: { $in: allMemberIds } },
                    {
                        $unset: { teamId: 1 },
                        $pull: { activeProjects: project._id },
                        $inc: { currentCapacity: -workloadToRelease }
                    }
                );

                // Ensure capacity doesn't go below 0
                await Employee.updateMany(
                    { _id: { $in: allMemberIds }, currentCapacity: { $lt: 0 } },
                    { $set: { currentCapacity: 0 } }
                );

                await Team.findByIdAndDelete(team._id);
            }
        }

        // Cleanup direct assignments (assignedTo)
        if (project.assignedTo) {
            await Employee.findByIdAndUpdate(project.assignedTo, {
                $pull: { activeProjects: project._id },
                $inc: { currentCapacity: -25 }
            });
            await Employee.updateOne(
                { _id: project.assignedTo, currentCapacity: { $lt: 0 } },
                { $set: { currentCapacity: 0 } }
            );
        }

        // Cleanup user-based assignments (assignedToUser)
        if (project.assignedToUser) {
            const user = await User.findById(project.assignedToUser);
            if (user) {
                const assigneeEmp = await Employee.findOne({ email: user.email });
                if (assigneeEmp) {
                    await Employee.findByIdAndUpdate(assigneeEmp._id, {
                        $pull: { activeProjects: project._id },
                        $inc: { currentCapacity: -25 }
                    });
                    await Employee.updateOne(
                        { _id: assigneeEmp._id, currentCapacity: { $lt: 0 } },
                        { $set: { currentCapacity: 0 } }
                    );
                }
            }
        }

        // Delete associated tasks
        await Task.deleteMany({ project: project.projectName });
        await Task.deleteMany({ project: project.title });

        await Project.findByIdAndDelete(projectId);

        res.json({
            success: true,
            message: 'Project, associated team, and tasks deleted successfully'
        });

    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete project',
            error: error.message
        });
    }
};
