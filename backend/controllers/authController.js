const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Predefined array of random food names
const foodNames = [
  'Crunchy Mango', 'Spicy Ramen', 'Fluffy Pancake', 'Zesty Lemon',
  'Bitter Lychee', 'Soggy Noodle', 'Tasty Strawberry', 'Juicy Guava', 
  'Mild Jackfruit', 'Crispy Dragonfruit', 'Tangy Persimmon', 'Smoky Papaya'
];

exports.loginUser = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    let user = await User.findOne({ email });

    // If user doesn't exist, create a new one with a random identity
    if (!user) {
      const randomFood = foodNames[Math.floor(Math.random() * foodNames.length)];
      user = new User({
        email,
        foodName: randomFood,
        aura: 0
      });
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, foodName: user.foodName },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
