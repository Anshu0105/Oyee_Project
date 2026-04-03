const User = require('../models/User');

const adjectives = [
  'Crunchy', 'Spicy', 'Sweet', 'Salty', 'Sour', 'Fluffy', 'Crispy', 'Juicy', 'Tangy', 'Smoky',
  'Zesty', 'Creamy', 'Golden', 'Wild', 'Midnight', 'Electric', 'Neon', 'Cosmic', 'Vibrant', 'Silent'
];

const foods = [
  'Mango', 'Noodle', 'Popcorn', 'Taco', 'Sushi', 'Burger', 'Pizza', 'Donut', 'Cookie', 'Ramen',
  'Waffle', 'Pancake', 'Mochi', 'Berry', 'Honey', 'Coffee', 'Chai', 'Muffin', 'Brownie', 'Toast'
];

async function generateAuraName() {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const food = foods[Math.floor(Math.random() * foods.length)];
    const name = `${adj} ${food}`;

    const exists = await User.findOne({ auraName: name });
    if (!exists) return name;
    
    attempts++;
  }

  // Fallback with random number
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const food = foods[Math.floor(Math.random() * foods.length)];
  const num = Math.floor(Math.random() * 9999);
  return `${adj} ${food} ${num}`;
}

module.exports = { generateAuraName };
