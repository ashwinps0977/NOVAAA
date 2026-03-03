const mongoose = require('mongoose');
require('dotenv').config();

async function diagnose() {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/NOVAHR1';
        await mongoose.connect(mongoURI);

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collection Counts:');
        for (const coll of collections) {
            const count = await mongoose.connection.db.collection(coll.name).countDocuments();
            console.log(`${coll.name}: ${count}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Diagnostic failed:', error.message);
        process.exit(1);
    }
}

diagnose();
