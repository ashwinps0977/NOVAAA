const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../src/models/User');
const Employee = require('../src/models/Employee');
const Skill = require('../src/models/Skill');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/NOVAHR1';
const CSV_PATH = 'c:\\Users\\Sreej\\AppData\\Local\\Packages\\5319275A.WhatsAppDesktop_cv1g1gvanyjgm\\LocalState\\sessions\\8785C9C19119082CFC71940337184D1C1DC47B64\\transfers\\2026-08\\Employees.csv';

async function sync() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        if (!fs.existsSync(CSV_PATH)) {
            console.error(`❌ CSV not found at ${CSV_PATH}`);
            return;
        }

        const data = fs.readFileSync(CSV_PATH, 'utf8');
        const lines = data.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());

        let syncedCount = 0;

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Simple CSV parser that handles quotes
            const values = [];
            let current = '';
            let inQuotes = false;
            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim());

            const row = {};
            headers.forEach((h, idx) => row[h] = values[idx]);

            const email = row.email;
            const salaryValue = parseFloat(row.salary) || 0;
            const skillList = row.Skill;

            if (!email) continue;

            const employee = await Employee.findOne({ email });
            const user = await User.findOne({ email });

            if (employee && user) {
                // Update salary
                employee.salary = salaryValue;
                employee.currentSalary = salaryValue;
                await employee.save();

                // Update skills
                if (skillList) {
                    const skillNames = skillList.split(',').map(s => s.trim());

                    // Clear existing skills to sync fresh data from CSV
                    await Skill.deleteMany({ employee: user._id });

                    for (const sName of skillNames) {
                        if (!sName) continue;
                        const skill = new Skill({
                            name: sName,
                            category: 'Technical',
                            currentLevel: Math.floor(Math.random() * 3) + 3, // Random 3, 4, or 5
                            requiredLevel: 4,
                            employee: user._id
                        });
                        await skill.save();
                    }
                }
                syncedCount++;
                if (syncedCount % 10 === 0) console.log(`Synced ${syncedCount} employees...`);
            }
        }

        console.log(`\n🎉 Sync Complete! Total synced: ${syncedCount}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Sync Error:', error);
        process.exit(1);
    }
}

sync();
