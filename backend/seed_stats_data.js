const mongoose = require('mongoose');
const Task = require('./src/models/Task');
const Employee = require('./src/models/Employee');
const User = require('./src/models/User');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nova_hr_db');
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const seedData = async () => {
    await connectDB();

    try {
        const email = 'mark@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User mark@gmail.com not found. Create him first via register or login.');
            process.exit(1);
        }

        console.log(`Found User: ${user.name} (${user._id})`);

        // Check for existing tasks
        const existingTasks = await Task.find({ assignedTo: user._id });
        if (existingTasks.length > 0) {
            console.log(`User already has ${existingTasks.length} tasks.`);
            // ensure some are completed
            let completedCount = 0;
            for (const t of existingTasks) {
                if (t.status === 'Completed') completedCount++;
                else {
                    // mark one as completed
                    if (t.title.includes('Review')) {
                        t.status = 'Completed';
                        await t.save();
                        completedCount++;
                        console.log(`Marked task "${t.title}" as Completed`);
                    }
                }
            }
        } else {
            // Create tasks
            const tasks = [
                { title: 'Update documentation', status: 'Completed', priority: 'Medium' },
                { title: 'Fix login bug', status: 'Completed', priority: 'High' },
                { title: 'Prepare presentation', status: 'In Progress', priority: 'Low' },
            ];

            for (const t of tasks) {
                await Task.create({
                    title: t.title,
                    project: 'Internal',
                    priority: t.priority,
                    status: t.status,
                    assignedTo: user._id,
                    assignedBy: user._id, // Self-assigned for demo
                    due: new Date(Date.now() + 86400000)
                });
                console.log(`Created task: ${t.title} (${t.status})`);
            }
        }

        console.log('Seed completed.');
        process.exit(0);

    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seedData();
