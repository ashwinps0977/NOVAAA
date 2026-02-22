const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const User = require('./src/models/User');
const Employee = require('./src/models/Employee');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/NOVAHR1';
const CSV_PATH = path.join(__dirname, 'data', 'employees', 'Employees.csv');

function parseDate(dateStr) {
    if (!dateStr) return new Date();
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        // Assume DD/MM/YYYY
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
    }
    return new Date(dateStr);
}

async function importEmployees() {
    const logStream = fs.createWriteStream('import_debug.log');
    const log = (msg) => {
        console.log(msg);
        logStream.write(msg + '\n');
    };

    try {
        log('🚀 Starting Employee Import...');

        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        log('✅ Connected to MongoDB');

        // Read CSV file
        if (!fs.existsSync(CSV_PATH)) {
            log(`❌ CSV File not found at ${CSV_PATH}`);
            return;
        }
        const data = fs.readFileSync(CSV_PATH, 'utf8');
        const lines = data.split('\n');

        // Get headers
        const headers = lines[0].split(',').map(h => h.trim());
        log(`CSV Headers: ${headers.join(', ')}`);

        // Process each line (skip header)
        let processedCount = 0;
        let skipCount = 0;

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Simple CSV parser that handles quotes
            const values = [];
            let current = '';
            let inQuotes = false;
            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                if (char === '"' && line[j + 1] === '"') {
                    current += '"';
                    j++;
                } else if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim());

            const employeeData = {};
            headers.forEach((header, index) => {
                employeeData[header] = values[index];
            });

            const { name, email, password, role, department, position, phone, salary, joiningDate, project, status, Skill } = employeeData;

            if (!email || !name) {
                log(`⚠️ Skipping line ${i + 1}: Email or Name missing`);
                skipCount++;
                continue;
            }

            try {
                const salt = await bcrypt.genSalt(10);
                const passwordToHash = password || 'Password@123';
                const hashedPassword = await bcrypt.hash(passwordToHash, salt);

                // User Record
                let user = await User.findOne({ email });
                if (user) {
                    user.name = name;
                    user.password = hashedPassword;
                    user.role = role || 'employee';
                    await user.save();
                } else {
                    user = new User({
                        name,
                        email,
                        password: hashedPassword,
                        role: role || 'employee',
                        isVerified: true
                    });
                    await user.save();
                }

                // Employee Record
                let empId;
                if (employeeData._id && employeeData._id.includes('ObjectId')) {
                    const match = employeeData._id.match(/ObjectId\("([a-f\d]+)"\)/);
                    if (match) empId = match[1];
                }

                let employee = await Employee.findOne({ email });

                const employeeFields = {
                    name,
                    email,
                    password: hashedPassword,
                    role: role || 'employee',
                    department: department || 'IT',
                    position: position || 'Employee',
                    phone: phone || '',
                    currentSalary: parseFloat(salary) || 0,
                    joiningDate: parseDate(joiningDate),
                    project: project || '',
                    status: status || 'active',
                    learning: {
                        interestedSkills: Skill ? Skill.split(',').map(s => s.trim()) : []
                    }
                };

                if (employee) {
                    Object.assign(employee, employeeFields);
                    await employee.save();
                } else {
                    employee = new Employee(employeeFields);
                    if (empId && mongoose.Types.ObjectId.isValid(empId)) {
                        employee._id = empId;
                    }
                    await employee.save();
                }

                processedCount++;
                if (processedCount % 10 === 0) log(`Processed ${processedCount} employees...`);
            } catch (innerError) {
                log(`❌ Error processing ${email}: ${innerError.message}`);
            }
        }

        log(`\n🎉 Import Complete!`);
        log(`Total Processed: ${processedCount}`);
        log(`Total Skipped: ${skipCount}`);
        logStream.end();
        process.exit(0);
    } catch (error) {
        log(`❌ Fatal Import Error: ${error.message}`);
        if (error.stack) log(error.stack);
        logStream.end();
        process.exit(1);
    }
}

importEmployees();
