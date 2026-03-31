const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Declaration = require('./models/Declaration');
const Violation = require('./models/Violation');
const Notification = require('./models/Notification');
const Order = require('./models/Order');
const Room = require('./models/Room');
const Audit = require('./models/Audit');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Seeding data...');

    // Seed users
    const hashedAdmin = await bcrypt.hash('admin123', 10);
    const hashedMod = await bcrypt.hash('mod456', 10);
    const hashedAna = await bcrypt.hash('ana789', 10);
    const hashedSup = await bcrypt.hash('sup321', 10);
    const hashedStudent = await bcrypt.hash('pass123', 10);

    const users = [
      { username: 'admin', password: hashedAdmin, role: 'employee', aura: 1000, tier: 'Starborn' },
      { username: 'EMP-001', password: hashedAdmin, role: 'employee', aura: 1000, tier: 'Starborn' },
      { username: 'EMP-002', password: hashedMod, role: 'employee', aura: 800, tier: 'Thunder' },
      { username: 'EMP-003', password: hashedAna, role: 'employee', aura: 600, tier: 'Thunder' },
      { username: 'EMP-004', password: hashedSup, role: 'employee', aura: 400, tier: 'Thunder' },
      { username: 'student1', password: hashedStudent, role: 'student', aura: 500, tier: 'Thunder' },
      { username: 'student2', password: hashedStudent, role: 'student', aura: 200, tier: 'Rising' },
      { username: 'student3', password: hashedStudent, role: 'student', aura: 50, tier: 'Ghost' },
    ];
    await User.insertMany(users);

    // Seed declarations
    const declarations = [
      { type: 'announcement', title: 'Welcome', message: 'Welcome to Oyee!', target: 'All Users', duration: '1 Hour', urgency: 'info', status: 'active' },
    ];
    await Declaration.insertMany(declarations);

    // Seed violations
    const violations = [
      { user: 'student1', message: 'Bad message', flagged: 'spam', time: new Date() },
    ];
    await Violation.insertMany(violations);

    // Seed notifications
    const notifications = [
      { type: '⚡', title: 'Aura Hunt Reminder', body: 'Double aura for the next 30 mins!', segment: 'All Users' },
    ];
    await Notification.insertMany(notifications);

    // Seed orders
    const orders = [
      { orderId: 'ORD-0041', item: '👕 OYEE Tee', auraCost: 500, user: 'student1', status: 'pending' },
    ];
    await Order.insertMany(orders);

    // Seed rooms
    const rooms = [
      { name: 'Engineering WiFi', type: 'WiFi', activeUsers: 94, status: 'Live', violations: 2 },
      { name: 'Delhi University', type: 'University', activeUsers: 67, status: 'Live', violations: 0 },
    ];
    await Room.insertMany(rooms);

    // Seed audit logs
    const audits = [
      { admin: 'admin', action: 'Login', target: 'Admin portal' },
    ];
    await Audit.insertMany(audits);

    console.log('Data seeded');
    process.exit();
  })
  .catch(err => console.log(err));