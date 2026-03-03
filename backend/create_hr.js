const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createHR() {
    try {
        const mongoURI = process.env.MONGODB_URI;
        await mongoose.connect(mongoURI);
        console.log('Connected');

        const User = mongoose.model('User', new mongoose.Schema({
            name: String,
            email: { type: String, unique: true },
            password: { type: String, required: true },
            role: { type: String, enum: ['employee', 'hr', 'admin'], default: 'employee' }
        }));

        const email = 'verify_hr@nova.com';
        const password = 'password123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.deleteMany({ email });
        const user = new User({
            name: 'Verify HR',
            email,
            password: hashedPassword,
            role: 'hr'
        });

        await user.save();
        console.log('✅ HR User created: verify_hr@nova.com / password123');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createHR();
