const mongoose = require('mongoose');
const Employee = require('./src/models/Employee');
const User = require('./src/models/User');
const Project = require('./src/models/Project');
const Task = require('./src/models/Task');
const Attendance = require('./src/models/Attendance');
const Payroll = require('./src/models/Payroll');
const TrainingAssignment = require('./src/models/TrainingAssignment');
const hrAnalyticsController = require('./src/controllers/hrAnalyticsController');
require('dotenv').config();

async function diagnose() {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/NOVAHR1';
        console.log(`Connecting to: ${mongoURI}`);
        await mongoose.connect(mongoURI);
        console.log('✅ Connected\n');

        // Simulate req, res
        const req = { useTestMode: false };
        const res = {
            json: (data) => {
                console.log('Controller Response:');
                console.log(JSON.stringify(data, null, 2));
            },
            status: (code) => {
                console.log(`Response Status: ${code}`);
                return res;
            }
        };

        console.log('Calling getWorkforceStats...');
        await hrAnalyticsController.getWorkforceStats(req, res);

        process.exit(0);
    } catch (error) {
        console.error('❌ Diagnostic failed:', error.message);
        process.exit(1);
    }
}

diagnose();
