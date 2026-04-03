const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../backend/.env' });

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  auraName: String,
  aura: Number,
  role: String,
  createdAt: Date
});

const User = mongoose.model('User', UserSchema);

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('--- OYEEE USER REPOSITORY ---');
    
    const users = await User.find({}).sort({ createdAt: -1 });
    
    console.table(users.map(u => ({
        Identity: u.auraName || 'Unnamed',
        Handle: u.username,
        Email: u.email,
        Aura: u.aura || 0,
        Role: u.role,
        Joined: u.createdAt ? u.createdAt.toISOString().split('T')[0] : 'Unknown'
    })));
    
    console.log(`\nTOTAL USERS: ${users.length}`);
    await mongoose.connection.close();
  } catch (err) {
    console.error('Database connection error:', err);
  }
}

listUsers();
