require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ userId: 'admin001' });
  if (existing) {
    console.log('Admin user already exists');
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash('admin123', 10);
  await User.create({
    userId: 'admin001',
    identity: 'SUPREME_ADMIN',
    emailDomain: 'admin.oyeee',
    auraPoints: 9999,
    isAdmin: true,
    passwordHash,
    status: 'offline',
  });

  console.log('✅ Admin user created: userId=admin001 password=admin123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
