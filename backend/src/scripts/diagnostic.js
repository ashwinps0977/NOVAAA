const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const logFile = 'diagnostic_log.txt';
const log = (msg) => {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
};

const testConnect = async () => {
    if (fs.existsSync(logFile)) fs.unlinkSync(logFile);

    const atlasURI = process.env.MONGODB_URI;
    const localURI = 'mongodb://127.0.0.1:27017/NOVAHR1';

    log('--- DB Connectivity Diagnostic ---');

    // Get Public IP
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        log(`🌍 Your Public IP: ${data.ip}`);
        log(`🚨 ACTION: Whitelist this IP in Atlas Console if FAILED below.\n`);
    } catch (err) {
        log('⚠️ Could not fetch public IP.');
    }

    // Test Atlas
    if (atlasURI) {
        log(`📡 Testing Atlas: ${atlasURI.substring(0, 30)}...`);
        try {
            await mongoose.connect(atlasURI, { serverSelectionTimeoutMS: 8000 });
            log('✅ ATLAS: SUCCESS');
            await mongoose.disconnect();
        } catch (err) {
            log(`❌ ATLAS: FAILED - ${err.message}`);
        }
    } else {
        log('➖ ATLAS: No URI provided in .env');
    }

    // Test Local
    log('\n📡 Testing Local MongoDB...');
    try {
        await mongoose.connect(localURI, { serverSelectionTimeoutMS: 3000 });
        log('✅ LOCAL: SUCCESS');
        await mongoose.disconnect();
    } catch (err) {
        log(`❌ LOCAL: FAILED - ${err.message}`);
    }

    log('\n--- Diagnostic End ---');
};

testConnect();
