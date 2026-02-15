const Training = require('../models/Training');
const TrainingModule = require('../models/TrainingModule');
const TrainingAssignment = require('../models/TrainingAssignment');
const Employee = require('../models/Employee');
const User = require('../models/User');

// --- HR MODULE MANAGEMENT ---

// Create a new training module
exports.createModule = async (req, res) => {
    try {
        const module = new TrainingModule(req.body);
        await module.save();
        res.status(201).json({ success: true, module });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Get all modules
exports.getModules = async (req, res) => {
    try {
        const modules = await TrainingModule.find().sort('-createdAt');
        res.json({ success: true, count: modules.length, modules });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Update module
exports.updateModule = async (req, res) => {
    try {
        const module = await TrainingModule.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!module) return res.status(404).json({ success: false, message: 'Module not found' });
        res.json({ success: true, module });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Delete module
exports.deleteModule = async (req, res) => {
    try {
        const module = await TrainingModule.findByIdAndDelete(req.params.id);
        if (!module) return res.status(404).json({ success: false, message: 'Module not found' });
        res.json({ success: true, message: 'Module removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// --- HR ASSIGNMENT LOGIC ---

// Assign module to employees (single or bulk based on rules)
exports.assignTraining = async (req, res) => {
    try {
        const { moduleId, employeeIds, department, role, priority, deadline, isMandatory } = req.body;

        const module = await TrainingModule.findById(moduleId);
        if (!module) return res.status(404).json({ success: false, message: 'Module not found' });

        let targetEmployeeIds = [];

        if (employeeIds && employeeIds.length > 0) {
            targetEmployeeIds = employeeIds;
        } else if (department || role) {
            const query = {};
            if (department) query.department = department;
            if (role) query.role = role;

            // We need to find User IDs that correspond to these Employees
            // In this system, Employee and User are sometimes separate or the same.
            // Based on models, User has 'id' and Employee has 'email'.
            // Let's assume we are assigning to Users.
            const employees = await Employee.find(query).select('_id');
            targetEmployeeIds = employees.map(e => e._id);
        }

        const assignments = targetEmployeeIds.map(empId => ({
            module: moduleId,
            employee: empId,
            priority: priority || 'Medium',
            deadline: deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
            isMandatory: isMandatory !== undefined ? isMandatory : true
        }));

        // Avoid duplicate assignments for the same module/employee
        for (const assignment of assignments) {
            await TrainingAssignment.findOneAndUpdate(
                { module: assignment.module, employee: assignment.employee },
                assignment,
                { upsert: true, new: true }
            );
        }

        res.json({ success: true, message: `Assigned to ${targetEmployeeIds.length} employees` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// --- HR TRACKING ---

// Get HR-wide training stats
exports.getHRTrainingStats = async (req, res) => {
    try {
        const assignments = await TrainingAssignment.find().populate('module', 'title category');

        const stats = {
            totalAssigned: assignments.length,
            completed: assignments.filter(a => a.status === 'Completed').length,
            inProgress: assignments.filter(a => a.status === 'In Progress').length,
            notStarted: assignments.filter(a => a.status === 'Not Started').length,
            overdue: assignments.filter(a => a.status === 'Overdue').length,
            byCategory: {}
        };

        assignments.forEach(a => {
            const cat = a.module.category;
            stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;
        });

        res.json({ success: true, stats });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// --- EMPLOYEE ACTIONS (Updated for new models) ---

// Get all assignments for current employee
exports.getMyAssignments = async (req, res) => {
    try {
        // We look for assignments in the new model
        const assignments = await TrainingAssignment.find({ employee: req.user.id })
            .populate('module')
            .sort('-assignedDate');

        res.json({ success: true, count: assignments.length, assignments });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Legacy support: Get all trainings for current employee
exports.getMyTrainings = async (req, res) => {
    try {
        const trainings = await Training.find({ employee: req.user.id });
        res.json({ success: true, count: trainings.length, trainings });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Update training progress
exports.updateProgress = async (req, res) => {
    try {
        const { progress, status } = req.body;

        // Try new model first
        let assignment = await TrainingAssignment.findOne({ _id: req.params.id, employee: req.user.id });

        if (assignment) {
            assignment.progress = progress || assignment.progress;
            assignment.status = status || assignment.status;
            assignment.lastActivityDate = Date.now();

            if (assignment.progress === 100) {
                assignment.status = 'Completed';
                assignment.completedDate = Date.now();
            } else if (assignment.progress > 0 && assignment.progress < 100) {
                assignment.status = 'In Progress';
            }

            await assignment.save();
            return res.json({ success: true, assignment });
        }

        // Fallback to legacy model
        const training = await Training.findOne({ _id: req.params.id, employee: req.user.id });

        if (!training) {
            return res.status(404).json({ success: false, message: 'Training not found' });
        }

        training.progress = progress || training.progress;
        training.status = status || training.status;

        if (training.progress === 100) {
            training.status = 'Completed';
            training.completedDate = Date.now();
        }

        await training.save();
        res.json({ success: true, training });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Seed initial training data for an employee (Legacy)
exports.seedTrainings = async (req, res) => {
    try {
        const userId = req.user.id;
        const initialTrainings = [
            {
                title: 'Corporate Onboarding',
                description: 'Welcome to the team! Learn about company policies and core values.',
                category: 'Onboarding',
                duration: '4h',
                employee: userId,
                status: 'In Progress',
                progress: 50
            },
            {
                title: 'Advanced React Patterns',
                description: 'Master hooks, context, and performance optimization.',
                category: 'Technical',
                duration: '12h',
                employee: userId,
                status: 'Not Started',
                progress: 0
            },
            {
                title: 'Effective Communication',
                description: 'Improve your professional communication and collaboration.',
                category: 'Soft Skills',
                duration: '6h',
                employee: userId,
                status: 'Completed',
                progress: 100,
                completedDate: new Date()
            }
        ];

        await Training.deleteMany({ employee: userId }); // Clean start
        const trainings = await Training.insertMany(initialTrainings);
        res.json({ success: true, trainings });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
