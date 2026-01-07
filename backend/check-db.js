// check-db.js - Save this in your backend folder
const mongoose = require('mongoose');

async function checkDatabase() {
  try {
    await mongoose.connect('mongodb://localhost:27017/NOVAHR1');
    console.log('✅ Connected to NOVAHR1 database');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log('\n📂 Collections in NOVAHR1:');
    collections.forEach((col, index) => {
      console.log(`${index + 1}. ${col.name}`);
    });
    
    // If users collection exists, show some data
    if (collections.some(c => c.name === 'users')) {
      console.log('\n👥 Users collection data:');
      const users = await mongoose.connection.db.collection('users').find().toArray();
      console.log(`Total users: ${users.length}`);
      users.forEach(user => {
        console.log(`- ${user.name || user.email || 'Unnamed user'} (${user.role || 'no role'})`);
      });
    } else {
      console.log('\n❌ No users collection found');
      console.log('It will be created automatically when you register a user');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDatabase();