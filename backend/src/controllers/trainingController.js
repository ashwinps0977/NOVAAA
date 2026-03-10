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

// Fallback to legacy model
exports.getMyTrainings = async (req, res) => {
    try {
        const trainings = await Training.find({ employee: req.user.id });
        res.json({ success: true, count: trainings.length, trainings });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Enroll in a training module
exports.enrollInModule = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const userId = req.user.id;

        const module = await TrainingModule.findById(moduleId);
        if (!module) return res.status(404).json({ success: false, message: 'Module not found' });

        // Check if already enrolled
        const existing = await TrainingAssignment.findOne({ module: moduleId, employee: userId });
        if (existing) return res.status(400).json({ success: false, message: 'Already enrolled in this module' });

        const assignment = new TrainingAssignment({
            module: moduleId,
            employee: userId,
            priority: 'Medium',
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            isMandatory: false
        });

        await assignment.save();
        res.json({ success: true, assignment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Seed all requested training modules
exports.seedModules = async (req, res) => {
    try {
        const modules = [
            // 1. Software Development / Engineering
            { title: "Frontend Developer — React — The Complete Guide", description: "Master React, Redux, and Next.js", category: "Software Development", duration: "48h", format: "Video", contentUrl: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/" },
            { title: "Backend Developer — Node.js — The Complete Guide", description: "Deep dive into Node.js, Express, and MongoDB", category: "Software Development", duration: "40h", format: "Video", contentUrl: "https://www.udemy.com/course/nodejs-the-complete-guide/" },
            { title: "Full Stack Developer — Web Development with React", description: "Comprehensive full-stack development path", category: "Software Development", duration: "60h", format: "Video", contentUrl: "https://www.coursera.org/specializations/full-stack-react" },
            { title: "Mobile App Developer — Flutter & Dart", description: "Build cross-platform mobile apps", category: "Software Development", duration: "42h", format: "Video", contentUrl: "https://www.udemy.com/course/flutter-bootcamp-with-dart/" },
            { title: "DevOps Engineer — Docker & Kubernetes", description: "The practical guide to containerization", category: "Software Development", duration: "25h", format: "Video", contentUrl: "https://www.udemy.com/course/docker-kubernetes-the-practical-guide/" },
            { title: "Software Architect — Design and Architecture", description: "Learn advanced software architecture patterns", category: "Software Development", duration: "35h", format: "Video", contentUrl: "https://www.coursera.org/specializations/software-design-architecture" },
            { title: "Embedded Systems Engineer — Introduction", description: "Software for embedded systems", category: "Software Development", duration: "20h", format: "Video", contentUrl: "https://www.coursera.org/learn/introduction-embedded-systems" },

            // 2. Quality Assurance / Testing
            { title: "QA Analyst / Tester — Testing and Automation", description: "Software testing fundamentals and automation", category: "Quality Assurance", duration: "30h", format: "Video", contentUrl: "https://www.coursera.org/specializations/software-testing-automation" },
            { title: "Automation Tester — Selenium WebDriver with Java", description: "Master automation testing with Selenium", category: "Quality Assurance", duration: "28h", format: "Video", contentUrl: "https://www.udemy.com/course/selenium-webdriver-with-java/" },
            { title: "Performance / Load Tester — JMeter", description: "Performance testing using JMeter", category: "Quality Assurance", duration: "15h", format: "Video", contentUrl: "https://www.udemy.com/course/performance-testing-using-jmeter/" },
            { title: "Security Tester — IBM Cybersecurity Analyst", description: "Cybersecurity professional certificate", category: "Quality Assurance", duration: "40h", format: "Video", contentUrl: "https://www.coursera.org/professional-certificates/ibm-cybersecurity-analyst" },

            // 3. IT Infrastructure / Systems
            { title: "System Administrator — Google IT Support", description: "Professional certificate for IT support", category: "IT Infrastructure", duration: "30h", format: "Video", contentUrl: "https://www.coursera.org/professional-certificates/google-it-support" },
            { title: "Network Administrator — Cisco Networking Basics", description: "Learn networking basics from Cisco", category: "IT Infrastructure", duration: "20h", format: "Video", contentUrl: "https://www.coursera.org/specializations/cisco-networking-basics" },
            { title: "Cloud Engineer — AWS Cloud Practitioner", description: "Master AWS cloud fundamentals", category: "IT Infrastructure", duration: "12h", format: "Video", contentUrl: "https://www.coursera.org/learn/aws-cloud-practitioner-essentials" },
            { title: "Database Administrator — Database Management", description: "Specialization in database design and management", category: "IT Infrastructure", duration: "25h", format: "Video", contentUrl: "https://www.coursera.org/specializations/database-management" },
            { title: "IT Support / Helpdesk — Fundamentals", description: "IT support fundamentals certification", category: "IT Infrastructure", duration: "15h", format: "Video", contentUrl: "https://www.coursera.org/learn/technical-support-fundamentals" },
            { title: "Site Reliability Engineer — SRE", description: "Learn site reliability engineering and SLOs", category: "IT Infrastructure", duration: "18h", format: "Video", contentUrl: "https://www.coursera.org/learn/site-reliability-engineering-slos" },

            // 4. Data & Analytics
            { title: "Data Analyst — Google Data Analytics", description: "Google professional certificate in data analytics", category: "Data & Analytics", duration: "35h", format: "Video", contentUrl: "https://www.coursera.org/professional-certificates/google-data-analytics" },
            { title: "Data Scientist — IBM Data Science", description: "IBM professional certificate in data science", category: "Data & Analytics", duration: "45h", format: "Video", contentUrl: "https://www.coursera.org/professional-certificates/ibm-data-science" },
            { title: "Data Engineer — IBM Data Engineering", description: "Master data engineering with IBM", category: "Data & Analytics", duration: "40h", format: "Video", contentUrl: "https://www.coursera.org/professional-certificates/ibm-data-engineer" },
            { title: "BI Developer — Microsoft Power BI Data Analyst", description: "Professional certificate in Power BI", category: "Data & Analytics", duration: "20h", format: "Video", contentUrl: "https://www.coursera.org/professional-certificates/microsoft-power-bi-data-analyst" },

            // 5. Security & Compliance
            { title: "Cybersecurity Analyst — IBM Certificate", description: "IBM cybersecurity analyst professional certificate", category: "Security & Compliance", duration: "40h", format: "Video", contentUrl: "https://www.coursera.org/professional-certificates/ibm-cybersecurity-analyst" },
            { title: "Security Architect — Cybersecurity Specialization", description: "Introduction to cybersecurity and architecture", category: "Security & Compliance", duration: "25h", format: "Video", contentUrl: "https://www.coursera.org/specializations/intro-cyber-security" },
            { title: "Compliance Officer — IT Security: Defense", description: "Defense against the digital dark arts", category: "Security & Compliance", duration: "15h", format: "Video", contentUrl: "https://www.coursera.org/learn/it-security" },
            { title: "Penetration Tester — Ethical Hacking", description: "Learn ethical hacking from scratch", category: "Security & Compliance", duration: "30h", format: "Video", contentUrl: "https://www.udemy.com/course/learn-ethical-hacking-from-scratch/" },

            // 6. Project & Product Management
            { title: "Project Manager — Google Certificate", description: "Google project management professional certificate", category: "Project & Product Management", duration: "35h", format: "Video", contentUrl: "https://www.coursera.org/professional-certificates/google-project-management" },
            { title: "Scrum Master — Agile with Atlassian Jira", description: "Master agile workflows with Jira", category: "Project & Product Management", duration: "12h", format: "Video", contentUrl: "https://www.coursera.org/learn/agile-atlassian-jira" },
            { title: "Product Manager — Digital Product Management", description: "UVA Darden digital product management specialization", category: "Project & Product Management", duration: "20h", format: "Video", contentUrl: "https://www.coursera.org/specializations/uva-darden-digital-product-management" },
            { title: "Business Analyst — Fundamentals", description: "Business analysis fundamentals guide", category: "Project & Product Management", duration: "10h", format: "Video", contentUrl: "https://www.udemy.com/course/business-analysis-fundamentals/" },

            // 7. UX / Design
            { title: "UI/UX Designer — Google UX Design", description: "Google UX design professional certificate", category: "UX / Design", duration: "40h", format: "Video", contentUrl: "https://www.coursera.org/professional-certificates/google-ux-design" },
            { title: "Graphic Designer — Graphic Design Specialization", description: "CalArts graphic design specialization", category: "UX / Design", duration: "30h", format: "Video", contentUrl: "https://www.coursera.org/specializations/graphic-design" },
            { title: "Interaction Designer — Interaction Design Specialization", description: "UC San Diego interaction design specialization", category: "UX / Design", duration: "35h", format: "Video", contentUrl: "https://www.coursera.org/specializations/interaction-design" },

            // 8. IT Sales / Marketing / Customer Engagement
            { title: "Technical Sales Engineer — The Role", description: "The role of the sales engineer", category: "IT Sales / Marketing", duration: "15h", format: "Video", contentUrl: "https://www.coursera.org/learn/sales-engineering" },
            { title: "Pre-Sales Consultant — IT Sales Fundamentals", description: "IT sales fundamentals for beginners", category: "IT Sales / Marketing", duration: "10h", format: "Video", contentUrl: "https://www.udemy.com/course/it-sales-fundamentals/" },
            { title: "Customer Success Manager — Fundamentals", description: "Customer success management course", category: "IT Sales / Marketing", duration: "12h", format: "Video", contentUrl: "https://www.udemy.com/course/customer-success-management/" },

            // 9. Emerging Technologies
            { title: "AI / Machine Learning Engineer — Andrew Ng", description: "DeepLearning.AI machine learning specialization", category: "Emerging Technologies", duration: "11h", format: "Video", contentUrl: "https://www.coursera.org/learn/machine-learning" },
            { title: "Blockchain Developer — Specialization", description: "Blockchain specialization from Buffalo University", category: "Emerging Technologies", duration: "25h", format: "Video", contentUrl: "https://www.coursera.org/specializations/blockchain" },
            { title: "IoT Engineer — Internet of Things", description: "IoT specialization from UCI", category: "Emerging Technologies", duration: "30h", format: "Video", contentUrl: "https://www.coursera.org/specializations/iot" },
            { title: "AR/VR Developer — Introduction to VR", description: "Introduction to virtual reality basics", category: "Emerging Technologies", duration: "15h", format: "Video", contentUrl: "https://www.coursera.org/learn/introduction-virtual-reality" },
            { title: "RPA Developer — Robotic Process Automation", description: "Master RPA with UiPath and more", category: "Emerging Technologies", duration: "20h", format: "Video", contentUrl: "https://www.udemy.com/course/robotic-process-automation/" },

            // 10. Executive & Leadership
            { title: "CIO / CTO — Leading People and Teams", description: "Michigan leadership and team management certificate", category: "Executive & Leadership", duration: "25h", format: "Video", contentUrl: "https://www.coursera.org/specializations/leading-people-teams" },
            { title: "IT Director / VP — Strategic Leadership", description: "Gies College of Business strategic management", category: "Executive & Leadership", duration: "30h", format: "Video", contentUrl: "https://www.coursera.org/specializations/strategic-leadership" },
            { title: "Technical Lead — Software Architecture of Large Systems", description: "Design of modern large scale systems", category: "Executive & Leadership", duration: "20h", format: "Video", contentUrl: "https://www.udemy.com/course/software-architecture-design-of-modern-large-scale-systems/" },

            // 11. Supporting Roles
            { title: "Technical Writer — Technical Writing", description: "Moscow Institute technical writing course", category: "Supporting Roles", duration: "18h", format: "Video", contentUrl: "https://www.coursera.org/learn/technical-writing" },
            { title: "IT Trainer — Instructional Design", description: "Instructional design foundations and applications", category: "Supporting Roles", duration: "15h", format: "Video", contentUrl: "https://www.linkedin.com/learning/instructional-design-foundations-and-applications" },
            { title: "Operations Analyst — Operations Management", description: "Wharton operations management specialization", category: "Supporting Roles", duration: "20h", format: "Video", contentUrl: "https://www.coursera.org/learn/wharton-operations" },
            { title: "Change Manager — Change Management", description: "Organizational change management course", category: "Supporting Roles", duration: "12h", format: "Video", contentUrl: "https://www.coursera.org/learn/organizational-change-management" }
        ];

        // Clear existing modules of these categories (optional, but good for re-seeding)
        // await TrainingModule.deleteMany({ category: { $in: modules.map(m => m.category) } });

        // Upsert modules based on title
        for (const mod of modules) {
            await TrainingModule.findOneAndUpdate(
                { title: mod.title },
                mod,
                { upsert: true, new: true }
            );
        }

        res.json({ success: true, message: `Seeded ${modules.length} training modules successfully.` });
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

// Download Certificate
exports.downloadCertificate = async (req, res) => {
    try {
        const assignment = await TrainingAssignment.findOne({ _id: req.params.id, employee: req.user.id })
            .populate('module', 'title category description duration')
            .populate('employee', 'name email');

        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Training not found' });
        }

        if (assignment.status !== 'Completed') {
            return res.status(400).json({ success: false, message: 'Training not completed yet' });
        }

        // In a real app, generate a PDF. Here we return structured data for a dynamic frontend certificate.
        const certificateData = {
            certificateId: `CERT-${assignment._id.toString().slice(-6).toUpperCase()}-${Date.now().toString().slice(-4)}`,
            candidateName: assignment.employee?.name || 'Employee',
            courseTitle: assignment.module?.title || 'Training Module',
            completionDate: assignment.completedDate || new Date(),
            category: assignment.module?.category || 'General',
            validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2) // 2 years validity
        };

        res.json({ success: true, certificate: certificateData });
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
