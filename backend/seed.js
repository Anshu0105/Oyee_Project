require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('./models/Room');

const initialRooms = [
  { name: 'WiFi Room', type: 'WiFi' },
  { name: 'University Room', type: 'University' },
  { name: 'Nearby Rooms', type: 'Nearby' },
  { name: '1-on-1 Anon', type: 'Direct' }
];

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB for seeding');
    await Room.deleteMany({}); // clearing old rooms
    await Room.insertMany(initialRooms);
    console.log('Seeded initial rooms:', initialRooms.map(r => r.name).join(', '));
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error seeding DB:', err);
  });
