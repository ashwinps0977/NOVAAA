const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function diagnose() {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/NOVAHR1';
        console.log(`Connecting to: ${mongoURI}`);
        await mongoose.connect(mongoURI);
        console.log('✅ Connected\n');

        const admins = await User.find({ role: { $in: ['admin', 'hr'] } }, 'name email role');
        console.log('Admin/HR Users:');
        console.log(JSON.stringify(admins, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('❌ Diagnostic failed:', error.message);
        process.exit(1);
    }
}

diagnose();
