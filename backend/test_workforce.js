const mongoose = require('mongoose');
const hrAnalyticsController = require('./src/controllers/hrAnalyticsController');
require('dotenv').config();

async function diagnose() {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/NOVAHR1';
        await mongoose.connect(mongoURI);

        const req = { useTestMode: false };
        const res = {
            json: (data) => {
                console.log('Workforce Stats Response:');
                console.log(JSON.stringify(data, null, 2));
            },
            status: (code) => {
                console.log(`Status: ${code}`);
                return res;
            }
        };

        await hrAnalyticsController.getWorkforceStats(req, res);

        process.exit(0);
    } catch (error) {
        console.error('❌ Diagnostic failed:', error.message);
        process.exit(1);
    }
}

diagnose();
