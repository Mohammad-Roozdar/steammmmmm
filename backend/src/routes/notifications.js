const router = require('express').Router();
const { Notification } = require('../models');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const list = await Notification.findAll({
      where: { UserId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 30
    });
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/:id/read', auth, async (req, res) => {
  try {
    const n = await Notification.findByPk(req.params.id);
    if (!n) return res.status(404).json({ error: 'یافت نشد' });
    await n.update({ isRead: true });
    res.json(n);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/read-all', auth, async (req, res) => {
  await Notification.update({ isRead: true }, { where: { UserId: req.user.id } });
  res.json({ ok: true });
});

router.delete('/:id', auth, async (req, res) => {
  await Notification.destroy({ where: { id: req.params.id, UserId: req.user.id } });
  res.json({ ok: true });
});

module.exports = router;