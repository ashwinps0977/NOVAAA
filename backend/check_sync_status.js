const mongoose = require('mongoose');
const User = require('./src/models/User');
const Employee = require('./src/models/Employee');
const Skill = require('./src/models/Skill');
const Project = require('./src/models/Project');
const JobApplication = require('./src/models/JobApplication');
const Job = require('./src/models/job');
const dotenv = require('dotenv');

dotenv.config();

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/NOVAHR1');

        const counts = {
            users: await User.countDocuments(),
            employees: await Employee.countDocuments(),
            skills: await Skill.countDocuments(),
            projects: await Project.countDocuments(),
            applications: await JobApplication.countDocuments(),
            jobs: await Job.countDocuments()
        };

        console.log('--- DATABASE SYNC STATUS ---');
        console.log(`✅ Users: ${counts.users}`);
        console.log(`✅ Employees: ${counts.employees}`);
        console.log(`✅ Skills: ${counts.skills}`);
        console.log(`✅ Projects: ${counts.projects}`);
        console.log(`✅ Applications: ${counts.applications}`);
        console.log(`✅ Jobs: ${counts.jobs}`);
        console.log('---------------------------');

        if (counts.employees > 0) {
            const sample = await Employee.findOne().select('name email salary currentSalary');
            console.log('\n📊 Sample Data Check:');
            console.log(`Name: ${sample.name}`);
            console.log(`Email: ${sample.email}`);
            console.log(`Salary: ${sample.salary}`);
            console.log(`Current Salary: ${sample.currentSalary}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error checking data:', error);
        process.exit(1);
    }
}

checkData();
