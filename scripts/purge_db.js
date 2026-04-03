const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../backend/.env' });

async function purgeDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('--- OYEEE DATABASE PURGE INITIATED ---');

    const collections = ['users', 'messages', 'directmessages', 'useractivities'];
    
    for (const col of collections) {
      const count = await mongoose.connection.collection(col).countDocuments();
      await mongoose.connection.collection(col).deleteMany({});
      console.log(`ERASED ${count} records from [${col}]`);
    }

    console.log('\n--- SYSTEM RESET COMPLETE. THE VOID IS NOW EMPTY. ---');
    await mongoose.connection.close();
  } catch (err) {
    console.error('Purge failure:', err);
  }
}

purgeDatabase();
