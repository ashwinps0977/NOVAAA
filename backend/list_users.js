const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function diagnose() {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/NOVAHR1';
        await mongoose.connect(mongoURI);

        const users = await User.find({}, 'name email role');
        console.log('All Users:');
        console.log(JSON.stringify(users, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('❌ Diagnostic failed:', error.message);
        process.exit(1);
    }
}

diagnose();
