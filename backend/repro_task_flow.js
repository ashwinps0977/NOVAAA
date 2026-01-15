const mongoose = require('mongoose');
const Task = require('./src/models/Task');
const User = require('./src/models/User');
const Employee = require('./src/models/Employee');
const Notification = require('./src/models/Notification');
const bcrypt = require('bcryptjs');

// Mock request/response for controller testing
const mockReq = (body = {}, user = {}, params = {}) => ({
    body,
    user,
    params,
    header: () => { }
});

const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

// Connect to DB (using the same URI as server.js logic roughly, or test DB)
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/NOVAHR1';

async function runTest() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to DB');

        // 1. Setup HR User
        const hrEmail = `hr_test_${Date.now()}@test.com`;
        const hrUser = new User({
            name: 'HR Test',
            email: hrEmail,
            password: 'pass',
            role: 'hr',
            isVerified: true
        });
        await hrUser.save();
        console.log('1. HR User Created:', hrUser._id);

        // 2. Setup Employee (via hrController logic simulation)
        // We do what hrController.addEmployee does: ensure User and Employee exist
        const empEmail = `emp_test_${Date.now()}@test.com`;
        const empPassword = 'pass';

        // Create User for Employee
        const empUser = new User({
            name: 'Emp Test',
            email: empEmail,
            password: empPassword,
            role: 'employee',
            isVerified: true
        });
        await empUser.save();
        console.log('2a. Employee User Created:', empUser._id);

        // Create Employee Profile
        const employee = new Employee({
            name: 'Emp Test',
            email: empEmail,
            password: empPassword,
            role: 'employee',
            department: 'IT',
            position: 'Dev',
            status: 'active'
        });
        await employee.save();
        console.log('2b. Employee Profile Created:', employee._id);

        // 3. HR Assigns Task
        // Mimic taskController.createTask
        console.log('3. Assigning Task...');
        const taskController = require('./src/controllers/taskController');

        const req = mockReq({
            title: "Test Task",
            project: "Test Project",
            priority: "medium",
            due: "Today",
            assignedToEmployeeId: employee._id.toString()
        }, {
            id: hrUser._id.toString() // HR is logged in
        });
        const res = mockRes();

        await taskController.createTask(req, res);

        console.log('Task Creation Response:', res.statusCode, res.data);

        if (!res.data.success) {
            console.error('Task creation failed');
            return;
        }

        const taskId = res.data.task._id;
        console.log('Task Created ID:', taskId);

        // 4. Verification: Check Task in DB
        const taskInDb = await Task.findById(taskId);
        console.log('Task in DB assignedTo:', taskInDb.assignedTo);
        console.log('Expected assignedTo (User ID):', empUser._id);

        if (taskInDb.assignedTo.toString() === empUser._id.toString()) {
            console.log('✅ SUCCESS: Task assigned to correct User ID.');
        } else {
            console.log('❌ FAILURE: Task assigned to wrong ID.');
            console.log('AssignedTo:', taskInDb.assignedTo.toString());
            console.log('EmployeeID:', employee._id.toString());
        }

        // 5. Verification: Get Tasks as Employee
        console.log('5. Fetching tasks as Employee...');
        const reqEmp = mockReq({}, { id: empUser._id.toString() });
        const resEmp = mockRes();
        await taskController.getMyTasks(reqEmp, resEmp);

        console.log('Get Tasks Response:', resEmp.statusCode);
        console.log('Tasks found:', resEmp.data.tasks.length);

        if (resEmp.data.tasks.length > 0 && resEmp.data.tasks[0]._id.toString() === taskId.toString()) {
            console.log('✅ SUCCESS: Employee sees the task.');
        } else {
            console.log('❌ FAILURE: Employee does not see the task.');
        }

    } catch (err) {
        console.error('Test Failed:', err);
    } finally {
        await mongoose.connection.close();
    }
}

runTest();
