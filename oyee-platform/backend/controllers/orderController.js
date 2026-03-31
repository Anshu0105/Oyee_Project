const Order = require('../models/Order');

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ claimedAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, address } = req.body;
  try {
    const update = { status };
    if (address) update.address = address;
    if (status === 'shipped') update.shippedAt = new Date();
    if (status === 'delivered') update.deliveredAt = new Date();
    const order = await Order.findByIdAndUpdate(id, update, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};