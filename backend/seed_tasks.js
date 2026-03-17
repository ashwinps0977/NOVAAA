require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Task = require('./src/models/Task');
const Employee = require('./src/models/Employee');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://mariamaju:mariaMAJU@cluster0.nnqcw2x.mongodb.net/NOVAHR1?retryWrites=true&w=majority";

const generateTasksForUser = (userId) => {
    const now = new Date();
    
    // Helper to add days
    const addDays = (date, days) => {
        let result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };

    return [
        {
            title: 'Complete Onboarding Documents',
            description: 'Review and sign all pending HR policy documents and NDAs out on your portal.',
            project: 'HR Administration',
            priority: 'High',
            status: 'assigned',
            dueDate: addDays(now, 2),
            assignedTo: userId,
            assignedBy: userId,
            createdBy: userId
        },
        {
            title: 'Analyze Q1 User Feedback',
            description: 'Compile the user feedback from the Q1 product launch into an actionable report.',
            project: 'Product Development',
            priority: 'Medium',
            status: 'in_progress',
            dueDate: addDays(now, 5),
            assignedTo: userId,
            assignedBy: userId,
            createdBy: userId
        },
        {
            title: 'Prepare Presentation Slides',
            description: 'Draft the slides for the Upcoming all-hands department sync.',
            project: 'Internal Comms',
            priority: 'Low',
            status: 'review',
            dueDate: addDays(now, -1), // Overdue but in review
            assignedTo: userId,
            assignedBy: userId,
            createdBy: userId
        },
        {
            title: 'Update System Dependencies',
            description: 'Migrate critical packages (React, Express, Mongoose) to their latest stable patches.',
            project: 'Engineering Maintenance',
            priority: 'High',
            status: 'completed',
            dueDate: addDays(now, -5), // Completed in the past
            assignedTo: userId,
            assignedBy: userId,
            createdBy: userId
        }
    ];
};

const seedDatabase = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected effectively!');

        // Wipe old Tasks to prevent infinite duplication
        console.log('Clearing existing tasks...');
        await Task.deleteMany({});

        // Fetch all actual users
        const users = await User.find({});
        console.log(`Found ${users.length} users. Generating tasks...`);

        let totalTasksSeeded = 0;

        for (const user of users) {
             const userTasks = generateTasksForUser(user._id);
             await Task.insertMany(userTasks);
             totalTasksSeeded += userTasks.length;
             process.stdout.write(`Seeded tasks for user: ${user.email}\n`);
        }

        console.log(`\n✅ Database Seed Completed. ${totalTasksSeeded} Tasks injected successfully.`);

    } catch (error) {
        console.error('Fatal Seeding Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

seedDatabase();
