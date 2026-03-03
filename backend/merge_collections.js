const mongoose = require('mongoose');
require('dotenv').config();

async function merge() {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/NOVAHR1';
        console.log(`Connecting to: ${mongoURI}`);
        await mongoose.connect(mongoURI);
        console.log('✅ Connected\n');

        const db = mongoose.connection.db;
        const sourceColl = 'employee_perfromace';
        const targetColl = 'employee_performance';

        const sourceCount = await db.collection(sourceColl).countDocuments();
        console.log(`Source collection '${sourceColl}' has ${sourceCount} documents.`);

        if (sourceCount > 0) {
            const docs = await db.collection(sourceColl).find().toArray();
            console.log(`Inserting ${docs.length} documents into '${targetColl}'...`);

            // Filter out docs that might already exist (if any) or just insert all if it's a clean move
            // Since it's a seed error probably, we can just insert them all.
            await db.collection(targetColl).insertMany(docs);
            console.log('✅ Insertion complete.');

            console.log(`Deleting ${sourceColl}...`);
            await db.collection(sourceColl).drop();
            console.log('✅ Deletion complete.');
        } else {
            console.log('No documents to merge.');
        }

        const finalCount = await db.collection(targetColl).countDocuments();
        console.log(`Final count in '${targetColl}': ${finalCount}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Merge failed:', error.message);
        process.exit(1);
    }
}

merge();
