const User = require('../models/User');
const Violation = require('../models/Violation');
const Declaration = require('../models/Declaration');
const Notification = require('../models/Notification');
const Order = require('../models/Order');
const Room = require('../models/Room');
const Audit = require('../models/Audit');
const Message = require('../models/Message');

// Mock data for development
const mockData = {
  users: [
    { _id: '1', username: 'admin', role: 'employee', aura: 1000, tier: 'Starborn', banned: false, shadowBanned: false },
    { _id: '2', username: 'user1', role: 'student', aura: 500, tier: 'Thunder', banned: false, shadowBanned: false }
  ],
  violations: [
    { _id: '1', user: 'user1', message: 'This is spam content', flagged: 'spam', time: new Date(), type: 'spam' }
  ],
  declarations: [
    { _id: '1', type: 'announcement', title: 'Welcome', message: 'Welcome to Oyeee!', status: 'active', target: 'all', duration: 24, urgency: 'normal', popup: false }
  ],
  notifications: [],
  orders: [
    { _id: '1', orderId: 'ORD-001', item: 'T-Shirt', auraCost: 500, user: 'user1', status: 'pending', address: '123 Main St', claimedAt: null }
  ],
  rooms: [
    { _id: '1', name: 'WiFi Lounge', type: 'WiFi', activeUsers: 47, status: 'Live', violations: 2 }
  ],
  audits: []
};

exports.getDashboardStats = async (req, res) => {
  try {
    // Mock stats
    res.json({
      userCount: mockData.users.length,
      activeUsers: mockData.users.filter(u => !u.banned).length,
      violationCount: mockData.violations.length,
      declarationCount: mockData.declarations.filter(d => d.status === 'active').length,
      orderCount: mockData.orders.length,
      pendingOrders: mockData.orders.filter(o => o.status === 'pending').length,
      auraPrinted: mockData.users.reduce((sum, u) => sum + u.aura, 0),
      auraBurned: mockData.orders.reduce((sum, o) => sum + o.auraCost, 0)
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    res.json(mockData.users);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.banUser = async (req, res) => {
  try {
    const user = mockData.users.find(u => u._id === req.params.id);
    if (user) {
      user.banned = true;
      res.json({ msg: 'User banned' });
    } else {
      res.status(404).json({ msg: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.createDeclaration = async (req, res) => {
  const { type, title, message, target, duration, urgency, popup } = req.body;
  try {
    const declaration = {
      _id: Date.now().toString(),
      type, title, message, target, duration, urgency, popup, status: 'active'
    };
    mockData.declarations.push(declaration);
    res.json(declaration);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ claimedAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await Audit.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getRoomMessages = async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId }).populate('user', 'username').sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { username, role, tier } = req.body;
    
    // Support mock data
    const mockUser = mockData.users.find(u => u._id === req.params.id);
    if (mockUser) {
      if (username) mockUser.username = username;
      if (role) mockUser.role = role;
      if (tier) mockUser.tier = tier;
      return res.json({ msg: 'User updated', user: mockUser });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    if (username) user.username = username;
    if (role) user.role = role;
    if (tier) user.tier = tier;
    
    await user.save();
    res.json({ msg: 'User updated', user });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getActivityData = async (req, res) => {
  try {
    // Mock data for 7 days - in real app, you'd aggregate from logs
    const activityData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      activeUsers: [3200, 3100, 3300, 3400, 3500, 3600, 3241],
      messagesSent: [18000, 17500, 19000, 20000, 21000, 22000, 18400]
    };
    res.json(activityData);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getViolationData = async (req, res) => {
  try {
    // Aggregate violations by type
    const violations = await Violation.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    const violationData = {
      labels: violations.map(v => v._id || 'Other'),
      data: violations.map(v => v.count)
    };
    res.json(violationData);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getEconomyData = async (req, res) => {
  try {
    // Mock data for weekly economy - in real app, track daily
    const economyData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      printed: [1200, 1100, 1300, 1400, 1500, 1600, 1242],
      burned: [800, 900, 700, 600, 500, 400, 124]
    };
    res.json(economyData);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getRoomData = async (req, res) => {
  try {
    // Aggregate users by room type
    const rooms = await Room.aggregate([
      { $group: { _id: '$type', count: { $sum: '$activeUsers' } } }
    ]);
    const roomData = {
      labels: rooms.map(r => r._id),
      data: rooms.map(r => r.count)
    };
    res.json(roomData);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getHourlyData = async (req, res) => {
  try {
    // Mock hourly data - in real app, aggregate from logs
    const hourlyData = {
      labels: Array.from({length: 24}, (_, i) => `${i}:00`),
      data: Array.from({length: 24}, () => Math.floor(Math.random() * 200) + 50)
    };
    res.json(hourlyData);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getAnalyticsKPIs = async (req, res) => {
  try {
    // Mock analytics data - in real app, calculate from logs
    const analyticsData = {
      totalUsers: 3241,
      avgSession: '14m',
      retention7d: '62%',
      botCatchRate: '99.1%',
      userGrowth: '+18.4%',
      sessionChange: '+2m',
      retentionChange: '+5%'
    };
    res.json(analyticsData);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getModerationStats = async (req, res) => {
  try {
    const pendingReports = await Violation.countDocuments({ flagged: { $ne: null } });
    const shadowBanned = await User.countDocuments({ shadowBanned: true });
    const hardBanned = await User.countDocuments({ banned: true });
    const botCatches = await Violation.countDocuments();

    res.json({
      pendingReports,
      shadowBanned,
      hardBanned,
      botCatches
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.shadowBanUser = async (req, res) => {
  try {
    const { username, duration } = req.body;
    await User.findOneAndUpdate({ username }, { shadowBanned: true });
    // In real app, you'd set an expiration time based on duration
    res.json({ msg: 'User shadow banned' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.hardBanUser = async (req, res) => {
  try {
    const { username } = req.body;
    await User.findOneAndUpdate({ username }, { banned: true });
    res.json({ msg: 'User hard banned' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.adjustAura = async (req, res) => {
  try {
    const { username, points, reason } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.aura += points;
    await user.save();

    // Log the audit action
    await Audit.create({
      admin: req.user.username,
      action: points > 0 ? 'aura_grant' : 'aura_deduct',
      target: username,
      details: { points, reason }
    });

    res.json({ msg: 'Aura adjusted', newAura: user.aura });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getSystemHealth = async (req, res) => {
  try {
    // Mock system health data - in real app, you'd monitor actual services
    const healthData = {
      modules: [
        { name: 'Database', status: 'Healthy', uptime: '99.9%', load: 45 },
        { name: 'API Server', status: 'Healthy', uptime: '99.8%', load: 62 },
        { name: 'Socket.io', status: 'Healthy', uptime: '99.7%', load: 38 },
        { name: 'OyeeeBot', status: 'Healthy', uptime: '99.5%', load: 55 },
        { name: 'Cloudinary', status: 'Healthy', uptime: '100%', load: 12 },
        { name: 'Notifications', status: 'Warning', uptime: '98.2%', load: 78 },
      ],
      metrics: {
        cpu: 42,
        memory: 68,
        disk: 23,
        network: 15
      }
    };
    res.json(healthData);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};