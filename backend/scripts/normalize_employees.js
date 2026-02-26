const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Employee = require('../src/models/Employee');
const User = require('../src/models/User');
const Skill = require('../src/models/Skill');

dotenv.config();

const normalize = async () => {
    try {
        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const employees = await Employee.find();
        console.log(`📊 Found ${employees.length} employees to normalize`);

        for (const emp of employees) {
            console.log(`🔄 Normalizing: ${emp.name} (${emp.position})`);

            // 1. Randomize joiningDate (2018-2025)
            const startYear = 2018;
            const endYear = 2025;
            const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
            const month = Math.floor(Math.random() * 12);
            const day = Math.floor(Math.random() * 28) + 1;
            emp.joiningDate = new Date(year, month, day);

            // 2. Calculate yearsInCompany
            const now = new Date();
            let yearsInCompany = now.getFullYear() - emp.joiningDate.getFullYear();
            if (now.getMonth() < emp.joiningDate.getMonth() || (now.getMonth() === emp.joiningDate.getMonth() && now.getDate() < emp.joiningDate.getDate())) {
                yearsInCompany--;
            }
            emp.yearsInCompany = Math.max(0, yearsInCompany);

            // 3. Assign totalExperience based on position logic
            const pos = emp.position.toLowerCase();
            let minExp, maxExp;

            if (pos.includes('manager')) {
                minExp = 6; maxExp = 12;
            } else if (pos.includes('lead') || pos.includes('senior')) {
                minExp = 3; maxExp = 8;
            } else {
                minExp = 0; maxExp = 5;
            }

            emp.totalExperience = Math.floor(Math.random() * (maxExp - minExp + 1)) + minExp;

            // Consistency check: totalExperience must be >= yearsInCompany
            if (emp.totalExperience < emp.yearsInCompany) {
                emp.totalExperience = emp.yearsInCompany + Math.floor(Math.random() * 2);
            }

            // 4. Performance fields (random between requested ranges)
            emp.performanceScore = Math.floor(Math.random() * (95 - 60 + 1)) + 60;
            emp.taskCompletionRate = Math.floor(Math.random() * (100 - 60 + 1)) + 60;
            emp.onTimeDeliveryRate = Math.floor(Math.random() * (100 - 60 + 1)) + 60;
            emp.currentCapacity = Math.floor(Math.random() * (80 - 30 + 1)) + 30;

            await emp.save();

            // 5. Update skills for this employee
            // Note: Skill.employee points to User._id in current model
            const user = await User.findOne({ email: emp.email });
            if (user) {
                const skills = await Skill.find({ employee: user._id });
                for (const skill of skills) {
                    skill.currentLevel = Math.floor(Math.random() * 5) + 1;
                    skill.yearsOfExperience = Math.floor(Math.random() * (emp.totalExperience + 1));
                    await skill.save();
                }
            }
        }

        console.log('✅ Normalization complete for all employees');
        process.exit(0);
    } catch (error) {
        console.error('❌ Normalization failed:', error);
        process.exit(1);
    }
};

normalize();
