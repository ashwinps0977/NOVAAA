require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Employee = require('./src/models/Employee');
const Team = require('./src/models/Team');
const Project = require('./src/models/Project');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://mariamaju:mariaMAJU@cluster0.nnqcw2x.mongodb.net/NOVAHR1?retryWrites=true&w=majority";

const seedProjectsAndTeams = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected effectively!');

        console.log('Clearing existing projects and teams...');
        await Project.deleteMany({});
        await Team.deleteMany({});

        const employees = await Employee.find({});
        console.log(`Found ${employees.length} employees. Generating projects...`);

        const allProjects = [];
        const allTeams = [];
        
        const now = new Date();
        const addDays = (date, days) => {
            let result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        };

        // 1. Generate Individual Projects for each employee
        for (const emp of employees) {
            // Find corresponding user
            const user = await User.findOne({ email: emp.email });
            const userId = user ? user._id : null;

            // Active Project
            allProjects.push(new Project({
                title: `${emp.name}'s Active Goals`,
                projectName: `${emp.name}'s Active Goals`,
                description: 'Current active deliverables and individual milestones.',
                priority: 'High',
                status: 'Active',
                assignedTo: emp._id,
                ...(userId && { assignedToUser: userId }),
                startDate: addDays(now, -10),
                deadline: addDays(now, 14),
                progressPercentage: Math.floor(Math.random() * 80)
            }));

            // Completed Project
            allProjects.push(new Project({
                title: `${emp.name}'s Completed Goals`,
                projectName: `${emp.name}'s Completed Goals`,
                description: 'Past deliverables that have been fully verified and signed off.',
                priority: 'Low',
                status: 'Completed',
                assignedTo: emp._id,
                ...(userId && { assignedToUser: userId }),
                startDate: addDays(now, -40),
                endDate: addDays(now, -5),
                deadline: addDays(now, -2),
                progressPercentage: 100
            }));
        }

        // 2. Group into Teams (size 3)
        for (let i = 0; i < employees.length; i += 3) {
            const teamMembers = employees.slice(i, i + 3);
            if (teamMembers.length === 0) continue;

            const lead = teamMembers[0];
            const teamName = `${lead.name}'s Squad`;

            const team = new Team({
                teamName: teamName,
                teamLead: lead._id,
                members: teamMembers.map(m => m._id),
                teamStatus: 'Active',
                teamHealth: 90 + Math.floor(Math.random() * 10)
            });

            allTeams.push(team);

            // Create projects for this team
            // Active Team Project
            allProjects.push(new Project({
                title: `${teamName} Active Initiative`,
                projectName: `${teamName} Active Initiative`,
                description: 'Ongoing collaborative workflow for the team across disciplines.',
                priority: 'Medium',
                status: 'Active',
                teamId: team._id,
                startDate: addDays(now, -5),
                deadline: addDays(now, 30),
                progressPercentage: Math.floor(Math.random() * 50) + 10
            }));

            // Completed Team Project
            allProjects.push(new Project({
                title: `${teamName} Completed Initiative`,
                projectName: `${teamName} Completed Initiative`,
                description: 'Successfully delivered collaborative workflow and signed off by client.',
                priority: 'Medium',
                status: 'Completed',
                teamId: team._id,
                startDate: addDays(now, -60),
                endDate: addDays(now, -10),
                deadline: addDays(now, -5),
                progressPercentage: 100
            }));
        }

        console.log(`Saving ${allTeams.length} teams...`);
        if(allTeams.length > 0) await Team.insertMany(allTeams);

        console.log(`Saving ${allProjects.length} projects...`);
        if(allProjects.length > 0) await Project.insertMany(allProjects);

        console.log('\n✅ Demo Projects and Teams Seeded Successfully!');
    } catch (error) {
        console.error('Fatal Seeding Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

seedProjectsAndTeams();
