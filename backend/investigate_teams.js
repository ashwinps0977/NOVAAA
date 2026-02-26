const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const Employee = require('./src/models/Employee');
const User = require('./src/models/User');
const Skill = require('./src/models/Skill');

async function checkEmployees() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nova';
        console.log(`Connecting to ${uri}...`);
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const employees = await Employee.find();
        console.log(`Found ${employees.length} employees`);

        for (const emp of employees) {
            const user = await User.findOne({ email: emp.email });
            if (!user) {
                console.log(`- ${emp.name} | Pos: ${emp.position} | NO USER FOUND`);
                continue;
            }

            const skills = await Skill.find({ employee: user._id });
            console.log(`- ${emp.name} | Pos: ${emp.position} | Skills: ${skills.map(s => `${s.name}(L${s.currentLevel})`).join(', ')}`);
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkEmployees();
