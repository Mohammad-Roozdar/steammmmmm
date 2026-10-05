const router = require('express').Router();
const { Op } = require('sequelize');
const { Order, Game, DLC, Region, User, Notification, Coupon } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const { encrypt, decrypt } = require('../utils/crypto');

router.post('/', auth, async (req, res) => {
  const { gameId, regionId, steamUsername, steamPassword, steamGuardCode, userNote, discountCode, dlcId } = req.body;

  try {
    // 🚫 جلوگیری از خرید دوباره
    if (dlcId) {
      const existingDLC = await Order.findOne({
        where: {
          UserId: req.user.id,
          DLCId: dlcId,
          status: { [Op.in]: ['paid', 'in_progress', 'completed'] }
        }
      });
      if (existingDLC) {
        return res.status(400).json({
          error: 'شما قبلاً این DLC رو خریداری کرده‌اید',
          alreadyOwned: true
        });
      }
    } else {
      const existing = await Order.findOne({
        where: {
          UserId: req.user.id,
          GameId: gameId,
          isDLC: false,
          status: { [Op.in]: ['paid', 'in_progress', 'completed'] }
        }
      });
      if (existing) {
        return res.status(400).json({
          error: 'شما قبلاً این بازی رو خریداری کرده‌اید! از بخش کتابخانه ببینید.',
          alreadyOwned: true
        });
      }
    }

    let item, itemTitle;
    if (dlcId) {
      item = await DLC.findByPk(dlcId);
      if (!item) return res.status(404).json({ error: 'DLC یافت نشد' });
      itemTitle = item.title;
    } else {
      item = await Game.findByPk(gameId);
      if (!item || !item.isActive) return res.status(400).json({ error: 'بازی موجود نیست' });
      itemTitle = item.title;
    }

    const region = await Region.findByPk(regionId);
    const unitPrice = Math.round(
      item.basePrice * (region?.priceMultiplier || 1) * (1 - (item.discount || 0) / 100)
    );

    let finalPrice = unitPrice;
    let discountAmount = 0;
    let usedCode = null;

    if (discountCode) {
      const c = await Coupon.findOne({ where: { code: discountCode, isActive: true } });
      if (c && c.usedCount < c.maxUses) {
        discountAmount = c.type === 'percent'
          ? Math.round(unitPrice * c.value / 100)
          : c.value;
        finalPrice = Math.max(0, unitPrice - discountAmount);
        usedCode = c.code;
        await c.increment('usedCount');
      }
    }

    const orderCode = 'SC-' + Date.now().toString().slice(-8);

    const order = await Order.create({
      orderCode,
      UserId: req.user.id,
      GameId: gameId,
      DLCId: dlcId || null,
      isDLC: !!dlcId,
      RegionId: regionId,
      quantity: 1,
      unitPrice,
      totalPrice: unitPrice,
      discountCode: usedCode,
      discountAmount,
      finalPrice,
      status: 'pending_payment',
      steamUsername: encrypt(steamUsername),
      steamPassword: encrypt(steamPassword),
      steamGuardCode: encrypt(steamGuardCode),
      userNote
    });

    // نوتیف ادمین‌ها
    const admins = await User.findAll({ where: { role: 'admin' } });
    await Promise.all(admins.map(a => Notification.create({
      UserId: a.id,
      title: dlcId ? '🎁 سفارش DLC جدید' : '🛒 سفارش جدید',
      body: `${itemTitle} - ${finalPrice.toLocaleString('en-US')} تومان`,
      type: 'order',
      icon: dlcId ? '🎁' : '🛒',
      color: 'blue',
      link: `/orders`
    })));

    // نوتیف کاربر
    await Notification.create({
      UserId: req.user.id,
      title: '✅ سفارش شما ثبت شد',
      body: `سفارش ${itemTitle} در انتظار پرداخت است`,
      type: 'order',
      icon: '✅',
      color: 'green',
      link: `/orders`
    });

    res.status(201).json({
      message: 'سفارش ثبت شد',
      orderCode,
      totalPrice: finalPrice,
      orderId: order.id
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/my', auth, async (req, res) => {
  const orders = await Order.findAll({
    where: { UserId: req.user.id },
    include: [Game, DLC, Region],
    order: [['createdAt', 'DESC']]
  });
  res.json(orders.map(o => {
    const j = o.toJSON();
    delete j.steamUsername;
    delete j.steamPassword;
    delete j.steamGuardCode;
    return j;
  }));
});

router.get('/admin/all', auth, adminOnly, async (req, res) => {
  const { status, search, page = 1, limit = 20, sort = 'DESC' } = req.query;
  const where = {};
  if (status && status !== 'all') where.status = status;
  if (search) where.orderCode = { [Op.like]: `%${search}%` };

  const { count, rows } = await Order.findAndCountAll({
    where,
    include: [
      Game, DLC, Region,
      { model: User, attributes: ['id', 'username', 'email', 'phone'] },
      { model: User, as: 'assignedAdmin', attributes: ['id', 'username'] }
    ],
    order: [['createdAt', sort]],
    limit: parseInt(limit),
    offset: (page - 1) * limit
  });

  res.json({ orders: rows, total: count, page: +page, totalPages: Math.ceil(count / limit) });
});

router.get('/admin/:id', auth, adminOnly, async (req, res) => {
  const order = await Order.findByPk(req.params.id, {
    include: [Game, DLC, Region, { model: User, attributes: ['id', 'username', 'email', 'phone'] }]
  });
  if (!order) return res.status(404).json({ error: 'یافت نشد' });

  const data = order.toJSON();
  data.steamUsername = decrypt(order.steamUsername);
  data.steamPassword = decrypt(order.steamPassword);
  data.steamGuardCode = decrypt(order.steamGuardCode);
  res.json(data);
});

router.patch('/admin/:id/status', auth, adminOnly, async (req, res) => {
  const { status, adminNote } = req.body;
  const order = await Order.findByPk(req.params.id);
  if (!order) return res.status(404).json({ error: 'یافت نشد' });

  const updates = { status, adminNote };
  if (status === 'in_progress' && !order.assignedAdminId)
    updates.assignedAdminId = req.user.id;
  if (status === 'completed') updates.completedAt = new Date();

  await order.update(updates);

  if (status === 'completed' && !order.isDLC) {
    const game = await Game.findByPk(order.GameId);
    if (game && game.stock > 0) await game.decrement('stock');
  }

  const statusMap = {
    paid: '💰 پرداخت تایید شد',
    in_progress: '⏳ در حال انجام',
    completed: '✅ تکمیل شد',
    failed: '❌ ناموفق',
    refunded: '↩️ مرجوع شد'
  };

  await Notification.create({
    UserId: order.UserId,
    title: statusMap[status] || status,
    body: `سفارش ${order.orderCode}`,
    type: 'order',
    icon: status === 'completed' ? '✅' : '📦',
    color: status === 'completed' ? 'green' : 'blue',
    link: '/orders'
  });

  res.json(order);
});

module.exports = router;