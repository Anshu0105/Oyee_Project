const router = require('express').Router();
const adminAuth = require('../../middleware/adminAuth');
const StoreItem = require('../../models/StoreItem');
const StoreClaim = require('../../models/StoreClaim');

router.use(adminAuth);

router.get('/items', async (req, res) => {
  try {
    const items = await StoreItem.find().sort({ auraCost: 1 });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/items', async (req, res) => {
  try {
    const item = await StoreItem.create(req.body);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/items/:id', async (req, res) => {
  try {
    const item = await StoreItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/items/:id', async (req, res) => {
  try {
    await StoreItem.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/claims', async (req, res) => {
  try {
    const claims = await StoreClaim.find({ status: 'pending' }).populate('itemId').sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/claims/:id/approve', async (req, res) => {
  try {
    await StoreClaim.findByIdAndUpdate(req.params.id, { status: 'approved', processedBy: req.admin.id, processedAt: new Date() });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/claims/:id/reject', async (req, res) => {
  try {
    await StoreClaim.findByIdAndUpdate(req.params.id, { status: 'rejected', processedBy: req.admin.id, processedAt: new Date() });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
