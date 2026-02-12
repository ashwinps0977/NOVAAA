const mongoose = require('mongoose');
const User = require('./src/models/User');
const Employee = require('./src/models/Employee');
const aiController = require('./src/controllers/aiController');

// Mock Express Objects
const mockRes = {
    status: function (code) {
        this.statusCode = code;
        return this;
    },
    json: function (data) {
        console.log('\n--- RESPONSE ---');
        console.log(JSON.stringify(data, null, 2));
    }
};

const runTest = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/NOVAHR1');
        console.log('Connected to DB');

        // 1. Find a User
        const user = await User.findOne({ email: { $exists: true } });
        if (!user) { console.log('No users found.'); process.exit(0); }
        console.log(`Testing with User: ${user.email}`);

        // Ensure employee exists
        let employee = await Employee.findOne({ email: user.email });
        if (!employee) {
            console.log('Creating mock employee for testing...');
            employee = await Employee.create({
                name: user.name, email: user.email, role: 'employee',
                department: 'Engineering', position: 'Senior Developer',
                salary: '$120,000', project: 'Project Alpha', status: 'active',
                password: 'hash'
            });
        }

        const testQueries = [
            "What is my salary?",
            "Which project am I on?",
            "How to apply for leave",
            "I want to apply for leave now"
        ];

        require('dotenv').config();

        for (const msg of testQueries) {
            console.log(`\nTesting Message: "${msg}"`);
            const mockReq = {
                user: { id: user._id },
                body: { message: msg }
            };
            await aiController.processChat(mockReq, mockRes);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

runTest();
