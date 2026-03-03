const mongoose = require('mongoose');
const Employee = require('./src/models/Employee');
const User = require('./src/models/User');
const Project = require('./src/models/Project');
const Task = require('./src/models/Task');
const Attendance = require('./src/models/Attendance');
const Payroll = require('./src/models/Payroll');
const TrainingAssignment = require('./src/models/TrainingAssignment');
require('dotenv').config();

async function diagnose() {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/NOVAHR1';
        console.log(`Connecting to: ${mongoURI}`);
        await mongoose.connect(mongoURI);
        console.log('✅ Connected\n');

        const models = {
            Employee,
            User,
            Project,
            Task,
            Attendance,
            Payroll,
            TrainingAssignment
        };

        for (const [name, model] of Object.entries(models)) {
            try {
                const count = await model.countDocuments();
                console.log(`${name}: ${count} documents`);
            } catch (e) {
                console.log(`${name}: Error - ${e.message}`);
            }
        }

        const activeEmployees = await Employee.countDocuments({ status: 'active' });
        console.log(`\nActive Employees: ${activeEmployees}`);

        const sampleEmployee = await Employee.findOne();
        if (sampleEmployee) {
            console.log('\nSample Employee:');
            console.log(JSON.stringify({
                name: sampleEmployee.name,
                department: sampleEmployee.department,
                status: sampleEmployee.status,
                performanceScore: sampleEmployee.performanceScore
            }, null, 2));
        } else {
            console.log('\n❌ No employees found in database.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Diagnostic failed:', error.message);
        process.exit(1);
    }
}

diagnose();
