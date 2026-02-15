const mongoose = require('mongoose');
const Task = require('./src/models/Task');
const User = require('./src/models/User');
const Employee = require('./src/models/Employee');

const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/NOVAHR1';

async function debugTasks() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to DB');

        const tasks = await Task.find({});
        console.log(`Found ${tasks.length} tasks.`);

        for (const task of tasks) {
            console.log(`\nTask: ${task.title} (ID: ${task._id})`);
            console.log(`AssignedTo (ID): ${task.assignedTo}`);

            // Check if this ID belongs to a User
            const user = await User.findById(task.assignedTo);
            if (user) {
                console.log(`✅ Assigned to User: ${user.name} (${user.email})`);
            } else {
                console.log(`❌ NOT found in User collection.`);

                // Check if it belongs to an Employee
                const emp = await Employee.findById(task.assignedTo);
                if (emp) {
                    console.log(`⚠️  Assigned to Employee: ${emp.name} (${emp.email}) -> THIS IS THE BUG`);
                } else {
                    console.log(`❌ ID not found in Employee collection either.`);
                }
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
}

debugTasks();
