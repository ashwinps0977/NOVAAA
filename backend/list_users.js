const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nova_hr_db');
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const listUsers = async () => {
    await connectDB();
    const users = await User.find({}, 'name email role');
    console.log(users);
    process.exit(0);
};

listUsers();
