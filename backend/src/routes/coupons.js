const router = require('express').Router();
const { Coupon } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');

// بررسی کد تخفیف
router.post('/check', auth, async (req, res) => {
  const { code, total } = req.body;
  const c = await Coupon.findOne({ where: { code, isActive: true } });
  if (!c) return res.status(404).json({ error: 'کد نامعتبر' });
  if (c.usedCount >= c.maxUses) return res.status(400).json({ error: 'ظرفیت پر شده' });
  if (c.expiresAt && new Date(c.expiresAt) < new Date()) return res.status(400).json({ error: 'منقضی شده' });
  if (total && total < c.minPurchase) return res.status(400).json({ error: `حداقل خرید ${c.minPurchase.toLocaleString()} تومان` });

  let discount = c.type === 'percent' ? Math.round(total * c.value / 100) : c.value;
  res.json({ code: c.code, discount, value: c.value, type: c.type });
});

// لیست کدها (ادمین)
router.get('/admin/all', auth, adminOnly, async (req, res) => {
  res.json(await Coupon.findAll({ order: [['createdAt', 'DESC']] }));
});

router.post('/admin', auth, adminOnly, async (req, res) => {
  res.status(201).json(await Coupon.create(req.body));
});

router.delete('/admin/:id', auth, adminOnly, async (req, res) => {
  await Coupon.destroy({ where: { id: req.params.id } });
  res.json({ message: 'حذف شد' });
});

module.exports = router;