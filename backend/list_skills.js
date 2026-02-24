const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Skill = require('./src/models/Skill');

dotenv.config();

const listSkills = async () => {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI ? 'URI found' : 'URI MISSING');
        await mongoose.connect(process.env.MONGODB_URI);
        const uniqueSkills = await Skill.distinct('name');
        console.log('---START_SKILLS---');
        console.log(uniqueSkills.join(', '));
        console.log('---END_SKILLS---');
        process.exit(0);
    } catch (error) {
        console.error('SERVER ERROR:', error);
        process.exit(1);
    }
};

listSkills();
