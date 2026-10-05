const router = require('express').Router();
const { User, Order, Review, Notification, Transaction } = require('../models');
const { auth } = require('../middleware/auth');

router.get('/my-stats', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const completedOrders = await Order.count({
      where: { UserId: req.user.id, status: 'completed' }
    });
    const totalSpent = await Order.sum('finalPrice', {
      where: { UserId: req.user.id, status: 'completed' }
    }) || 0;
    const reviewCount = await Review.count({ where: { UserId: req.user.id } });

    let level = 'برنز';
    let levelColor = 'from-orange-700 to-orange-500';
    let levelIcon = '🥉';
    let nextLevel = 'نقره';
    let neededForNext = 5;

    if (completedOrders >= 30) {
      level = 'الماس'; levelColor = 'from-cyan-500 to-blue-500'; levelIcon = '💎';
      nextLevel = null; neededForNext = 0;
    } else if (completedOrders >= 15) {
      level = 'طلایی'; levelColor = 'from-yellow-500 to-amber-500'; levelIcon = '🥇';
      nextLevel = 'الماس'; neededForNext = 30 - completedOrders;
    } else if (completedOrders >= 5) {
      level = 'نقره‌ای'; levelColor = 'from-gray-400 to-gray-500'; levelIcon = '🥈';
      nextLevel = 'طلایی'; neededForNext = 15 - completedOrders;
    } else {
      neededForNext = 5 - completedOrders;
    }

    const points = completedOrders * 10 + reviewCount * 5;
    const cashback = Math.floor(totalSpent * 0.02);

    res.json({
      completedOrders, totalSpent, reviewCount,
      points, cashback, level, levelColor, levelIcon,
      nextLevel, neededForNext
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/redeem-cashback', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const totalSpent = await Order.sum('finalPrice', {
      where: { UserId: req.user.id, status: 'completed' }
    }) || 0;

    const cashback = Math.floor(totalSpent * 0.02);
    if (cashback < 1000) return res.status(400).json({ error: 'کش‌بک کمتر از ۱۰۰۰ تومان' });

    await user.increment('wallet', { by: cashback });
    await Transaction.create({
      UserId: req.user.id,
      amount: cashback,
      type: 'deposit',
      status: 'success',
      description: 'کش‌بک وفاداری',
      refId: 'CB' + Date.now()
    });
    await Notification.create({
      UserId: req.user.id,
      title: '💰 کش‌بک دریافت شد',
      body: `${cashback.toLocaleString('en-US')} تومان اضافه شد`,
      type: 'wallet',
      icon: '💰',
      color: 'green',
      link: '/profile'
    });

    res.json({ success: true, cashback });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;