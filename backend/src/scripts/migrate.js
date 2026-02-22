const mongoose = require('mongoose');
require('dotenv').config();

const LOCAL_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/NOVAHR1';
const ATLAS_URI = 'mongodb+srv://markj:masosujo@cluster0.nnqcw2x.mongodb.net/NOVAHR1?retryWrites=true&w=majority';

async function migrate() {
    let localConn, atlasConn;
    try {
        console.log('📡 Connecting to local MongoDB...');
        localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
        console.log('✅ Connected to local MongoDB');

        console.log('📡 Connecting to MongoDB Atlas...');
        atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
        console.log('✅ Connected to MongoDB Atlas');

        const collections = await localConn.db.listCollections().toArray();
        console.log(`📊 Found ${collections.length} collections locally.`);

        for (const collInfo of collections) {
            const collName = collInfo.name;
            if (collName.startsWith('system.')) continue;

            console.log(`📦 Migrating collection: ${collName}...`);
            const localColl = localConn.db.collection(collName);
            const atlasColl = atlasConn.db.collection(collName);

            const documents = await localColl.find({}).toArray();
            if (documents.length > 0) {
                // Clear existing data in Atlas for this collection to avoid duplicates if re-run
                await atlasColl.deleteMany({});
                await atlasColl.insertMany(documents);
                console.log(`✅ Migrated ${documents.length} documents from ${collName}`);
            } else {
                console.log(`ℹ️ Collection ${collName} is empty. Skipping documents.`);
            }
        }

        console.log('\n🎉 Migration completed successfully!');

    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        if (localConn) await localConn.close();
        if (atlasConn) await atlasConn.close();
        process.exit();
    }
}

migrate();
