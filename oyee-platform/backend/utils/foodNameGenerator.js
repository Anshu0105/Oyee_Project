// Food name generator
const foods = ['Pizza', 'Burger', 'Salad', 'Pasta'];

module.exports = {
  generate: () => foods[Math.floor(Math.random() * foods.length)]
};