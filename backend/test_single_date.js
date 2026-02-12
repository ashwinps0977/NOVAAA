const mongoose = require('mongoose');
const User = require('./src/models/User');
const Employee = require('./src/models/Employee');
const aiController = require('./src/controllers/aiController');

// Mock Express Objects
const mockRes = {
    status: function (code) {
        this.statusCode = code;
        return this;
    },
    json: function (data) {
        console.log('\n--- RESPONSE ---');
        console.log(`INPUT: ${this.currentMsg}`);
        console.log(`INTENT: ${data.intent}`);
        console.log(`REPLY: ${data.reply}`);
        console.log(`ACTION: ${data.action}`);
        if (data.data && Object.keys(data.data).length > 0) console.log(`DATA: ${JSON.stringify(data.data)}`);
    }
};

const runTest = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/NOVAHR1');

        const user = await User.findOne({ email: { $exists: true } });
        if (!user) process.exit(0);

        const flow = [
            "sick leave on 16th january 2026 due to head ache"
        ];

        for (const msg of flow) {
            const mockReq = {
                user: { id: user._id },
                body: { message: msg }
            };
            mockRes.currentMsg = msg;
            await aiController.processChat(mockReq, mockRes);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

runTest();
