const mongoose = require('mongoose');
const User = require('./src/models/User');
const Employee = require('./src/models/Employee');
const Salary = require('./src/models/Salary');
const { processChat, trainModel } = require('./src/controllers/aiController');

const MONGO_URI = 'mongodb://127.0.0.1:27017/nova_final';

async function testSalaryExplanation() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        // Setup test user (HR)
        let hrUser = await User.findOne({ role: 'hr' });
        if (!hrUser) {
            hrUser = new User({ name: 'HR Admin', email: 'hr@nova.com', password: 'password', role: 'hr' });
            await hrUser.save();
        }

        // Setup test employee and salary
        let employee = await Employee.findOne({ name: 'Ashwin' });
        if (!employee) {
            employee = new Employee({
                name: 'Ashwin',
                email: 'as@nova.com',
                password: 'password',
                department: 'Engineering',
                position: 'Senior Dev',
                role: 'employee'
            });
            await employee.save();
        }

        let salary = await Salary.findOne({ employee: employee._id });
        if (!salary) {
            salary = new Salary({
                employee: employee._id,
                month: 'March',
                year: 2026,
                basic: 60000,
                hra: 24000,
                da: 6000,
                pf: 7200,
                incomeTaxTDS: 5000,
                netSalary: 77800,
                bankName: 'NOVA Bank',
                accountNumber: '9876543210',
                status: 'Paid',
                payslipId: 'PSL-MAR2026-ASH-1234'
            });
            await salary.save();
        }

        // Wait for training to complete
        const { trainingPromise } = require('./src/controllers/aiController');
        console.log('Waiting for AI model training...');
        await trainingPromise;
        console.log('AI model ready');

        // Test query
        const req = {
            user: { id: hrUser._id, role: 'hr' },
            body: { message: 'explain salary of Ashwin' }
        };
        const res = {
            json: (data) => {
                console.log('\n--- AI RESPONSE ---');
                console.log(data.reply);
                if (data.reply && data.reply.includes('Salary Breakdown for Ashwin') && data.reply.includes('PSL-MAR2026-ASH-1234')) {
                    console.log('\n✅ Verification SUCCESS!');
                } else {
                    console.log('\n❌ Verification FAILED!');
                    console.log('Actual Reply:', data.reply);
                }
            },
            status: (code) => ({ json: (m) => { console.log(`Error ${code}:`, m); console.error('Full Error:', m); } })
        };

        await processChat(req, res);

    } catch (err) {
        console.error('Test Error:', err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

testSalaryExplanation();
