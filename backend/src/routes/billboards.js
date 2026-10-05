const router = require('express').Router();
const { Billboard, Transaction, User, Notification } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');

// بیلبوردهای فعال (عمومی)
router.get('/active', async (req, res) => {
  const { position } = req.query;
  const where = {
    status: 'active',
    startDate: { [require('sequelize').Op.lte]: new Date() },
    endDate: { [require('sequelize').Op.gte]: new Date() }
  };
  if (position) where.position = position;

  const list = await Billboard.findAll({ where });
  res.json(list);
});

// درخواست بیلبورد (کاربر)
router.post('/', auth, async (req, res) => {
  const billboard = await Billboard.create({
    ...req.body,
    UserId: req.user.id,
    status: 'pending'
  });

  const admins = await User.findAll({ where: { role: 'admin' } });
  await Promise.all(admins.map(a => Notification.create({
    UserId: a.id,
    title: '📢 درخواست بیلبورد جدید',
    body: `${billboard.title} - ${billboard.company}`,
    type: 'billboard',
    link: '/billboards'
  })));

  res.status(201).json(billboard);
});

// بیلبوردهای خود کاربر
router.get('/my', auth, async (req, res) => {
  res.json(await Billboard.findAll({ where: { UserId: req.user.id }, order: [['createdAt', 'DESC']] }));
});

// ادمین: همه بیلبوردها
router.get('/admin/all', auth, adminOnly, async (req, res) => {
  const { status } = req.query;
  const where = status ? { status } : {};
  res.json(await Billboard.findAll({
    where,
    include: [{ model: User, attributes: ['id', 'username', 'email'] }],
    order: [['createdAt', 'DESC']]
  }));
});

// تغییر وضعیت (ادمین)
router.patch('/admin/:id', auth, adminOnly, async (req, res) => {
  const b = await Billboard.findByPk(req.params.id);
  if (!b) return res.status(404).json({ error: 'یافت نشد' });
  await b.update(req.body);
  res.json(b);
});

// حذف
router.delete('/:id', auth, async (req, res) => {
  const b = await Billboard.findByPk(req.params.id);
  if (!b) return res.status(404).json({ error: 'یافت نشد' });
  if (b.UserId !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'دسترسی ندارید' });
  await b.destroy();
  res.json({ message: 'حذف شد' });
});

// شمارش کلیک
router.post('/:id/click', async (req, res) => {
  const b = await Billboard.findByPk(req.params.id);
  if (b) await b.increment('clicks');
  res.json({ ok: true });
});

module.exports = router;