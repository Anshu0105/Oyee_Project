const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Seeding employees...');
    const hashedAdmin = await bcrypt.hash('admin123', 10);
    const hashedMod = await bcrypt.hash('mod456', 10);
    const hashedAna = await bcrypt.hash('ana789', 10);
    const hashedSup = await bcrypt.hash('sup321', 10);

    const emps = [
      { username: 'EMP-001', password: hashedAdmin, role: 'employee', aura: 1000, tier: 'Starborn' },
      { username: 'EMP-002', password: hashedMod, role: 'employee', aura: 800, tier: 'Thunder' },
      { username: 'EMP-003', password: hashedAna, role: 'employee', aura: 600, tier: 'Thunder' },
      { username: 'EMP-004', password: hashedSup, role: 'employee', aura: 400, tier: 'Thunder' }
    ];

    for (let emp of emps) {
      await User.updateOne({ username: emp.username }, { $set: emp }, { upsert: true });
    }

    console.log('Employees seeded');
    process.exit();
  })
  .catch(err => {
    console.log(err);
    process.exit(1);
  });
