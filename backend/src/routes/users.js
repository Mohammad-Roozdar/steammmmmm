const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { User, Order, Wishlist } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/me', auth, async (req, res) => {
  try {
    const u = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    if (!u) return res.status(404).json({ error: 'کاربر یافت نشد' });

    const orderCount = await Order.count({ where: { UserId: req.user.id } });
    const wishCount = await Wishlist.count({ where: { UserId: req.user.id } });
    res.json({ ...u.toJSON(), orderCount, wishCount });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/me', auth, async (req, res) => {
  try {
    const { username, phone, bio, avatar } = req.body;
    const u = await User.findByPk(req.user.id);
    if (!u) return res.status(404).json({ error: 'یافت نشد' });
    await u.update({ username, phone, bio, avatar });
    res.json({ message: 'ذخیره شد' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/me/password', auth, async (req, res) => {
  try {
    const { current, newPassword } = req.body;
    const u = await User.findByPk(req.user.id);
    if (!u) return res.status(404).json({ error: 'یافت نشد' });
    if (!await bcrypt.compare(current, u.password))
      return res.status(400).json({ error: 'پسورد فعلی غلط' });
    await u.update({ password: await bcrypt.hash(newPassword, 10) });
    res.json({ message: 'تغییر کرد' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/me/appearance', auth, async (req, res) => {
  try {
    const { avatarFrame, wallpaper } = req.body;
    const u = await User.findByPk(req.user.id);
    if (!u) return res.status(404).json({ error: 'یافت نشد' });

    let prefs = {};
    try { prefs = JSON.parse(u.preferences || '{}'); } catch {}
    if (avatarFrame !== undefined) prefs.avatarFrame = avatarFrame;
    if (wallpaper !== undefined) prefs.wallpaper = wallpaper;

    await u.update({ preferences: JSON.stringify(prefs) });
    res.json({ message: 'ذخیره شد', preferences: prefs });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/me', auth, async (req, res) => {
  try {
    const { password } = req.body;
    const u = await User.findByPk(req.user.id);
    if (!u) return res.status(404).json({ error: 'یافت نشد' });
    if (!password) return res.status(400).json({ error: 'پسورد لازم است' });
    const ok = await bcrypt.compare(password, u.password);
    if (!ok) return res.status(400).json({ error: 'پسورد غلط' });

    await u.update({
      isBanned: true,
      username: `deleted_${u.id}_${Date.now()}`,
      email: `deleted_${u.id}_${Date.now()}@deleted.com`
    });
    res.json({ message: 'حساب حذف شد' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/admin/all', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/admin/:id', auth, adminOnly, async (req, res) => {
  try {
    const u = await User.findByPk(req.params.id);
    if (!u) return res.status(404).json({ error: 'یافت نشد' });
    await u.update(req.body);
    res.json(u);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;