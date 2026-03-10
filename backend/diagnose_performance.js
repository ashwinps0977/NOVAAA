const mongoose = require('mongoose');
const EmployeePerformance = require('./src/models/EmployeePerformance');
require('dotenv').config();

async function diagnose() {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/NOVAHR1';
        console.log(`Connecting to: ${mongoURI}`);
        await mongoose.connect(mongoURI);
        console.log('✅ Connected\n');

        const count = await EmployeePerformance.countDocuments();
        console.log(`EmployeePerformance: ${count} documents`);

        if (count > 0) {
            const sample = await EmployeePerformance.findOne();
            console.log('Sample Performance Record:', JSON.stringify(sample, null, 2));
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Diagnostic failed:', error.message);
        process.exit(1);
    }
}

diagnose();
