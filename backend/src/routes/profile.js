const router = require('express').Router();
const { User, Order, Review, Wishlist, Transaction, Game, ActivityLog } = require('../models');
const { auth } = require('../middleware/auth');
const { Op, fn, col } = require('sequelize');

router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const [totalOrders, completedOrders, pendingOrders, totalSpent, totalSaved, reviewCount, wishCount] = await Promise.all([
      Order.count({ where: { UserId: userId } }),
      Order.count({ where: { UserId: userId, status: 'completed' } }),
      Order.count({ where: { UserId: userId, status: { [Op.in]: ['paid', 'in_progress'] } } }),
      Order.sum('finalPrice', { where: { UserId: userId, status: 'completed' } }) || 0,
      Order.sum('discountAmount', { where: { UserId: userId } }) || 0,
      Review.count({ where: { UserId: userId } }),
      Wishlist.count({ where: { UserId: userId } })
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    let monthlyOrders = [];
    try {
      monthlyOrders = await Order.findAll({
        attributes: [
          [fn('DATE_FORMAT', col('createdAt'), '%Y-%m'), 'month'],
          [fn('COUNT', col('id')), 'count'],
          [fn('SUM', col('finalPrice')), 'total']
        ],
        where: { UserId: userId, createdAt: { [Op.gte]: sixMonthsAgo }, status: 'completed' },
        group: [fn('DATE_FORMAT', col('createdAt'), '%Y-%m')],
        order: [[fn('DATE_FORMAT', col('createdAt'), '%Y-%m'), 'ASC']],
        raw: true
      });
    } catch (e) { monthlyOrders = []; }

    const wishes = await Wishlist.findAll({
      where: { UserId: userId },
      include: [{ model: Game, attributes: ['genres'] }]
    });

    const genreCount = {};
    wishes.forEach((w) => {
      if (!w.Game) return;
      try {
        JSON.parse(w.Game.genres || '[]').forEach((g) => {
          genreCount[g] = (genreCount[g] || 0) + 1;
        });
      } catch {}
    });

    const topGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    res.json({ totalOrders, completedOrders, pendingOrders, totalSpent, totalSaved, reviewCount, wishCount, monthlyOrders, topGenres });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/my-reviews', auth, async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { UserId: req.user.id },
      include: [{ model: Game, attributes: ['id', 'title', 'coverImage'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/sessions', auth, async (req, res) => {
  try {
    const sessions = await ActivityLog.findAll({
      where: { UserId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    res.json(sessions);
  } catch (e) { res.json([]); }
});

router.get('/export', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, { attributes: { exclude: ['password'] } });
    const orders = await Order.findAll({ where: { UserId: userId }, include: [Game] });
    const reviews = await Review.findAll({ where: { UserId: userId }, include: [Game] });
    const transactions = await Transaction.findAll({ where: { UserId: userId } });
    res.json({
      exportDate: new Date(),
      user: user.toJSON(),
      orders: orders.map(o => { const j = o.toJSON(); delete j.steamUsername; delete j.steamPassword; delete j.steamGuardCode; return j; }),
      reviews: reviews.map(r => r.toJSON()),
      transactions: transactions.map(t => t.toJSON())
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/achievements', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const completedOrders = await Order.count({ where: { UserId: userId, status: 'completed' } });
    const reviewCount = await Review.count({ where: { UserId: userId } });
    const totalSpent = await Order.sum('finalPrice', { where: { UserId: userId, status: 'completed' } }) || 0;
    const wishCount = await Wishlist.count({ where: { UserId: userId } });

    res.json([
      { id: 'first_buy', icon: '🎮', title: 'اولین خرید', desc: 'اولین بازی رو خریدی', unlocked: completedOrders >= 1 },
      { id: 'buyer_5', icon: '🎯', title: 'مشتاق', desc: '۵ بازی خریدی', unlocked: completedOrders >= 5 },
      { id: 'buyer_15', icon: '🔥', title: 'گیمر حرفه‌ای', desc: '۱۵ بازی خریدی', unlocked: completedOrders >= 15 },
      { id: 'buyer_30', icon: '👑', title: 'سلطان', desc: '۳۰ بازی خریدی', unlocked: completedOrders >= 30 },
      { id: 'first_review', icon: '💬', title: 'نظر ده', desc: 'اولین نظرت رو نوشتی', unlocked: reviewCount >= 1 },
      { id: 'reviewer', icon: '✍️', title: 'منتقد', desc: '۵ نظر نوشتی', unlocked: reviewCount >= 5 },
      { id: 'wisher', icon: '❤️', title: 'رؤیایی', desc: '۱۰ بازی لایک کردی', unlocked: wishCount >= 10 },
      { id: 'big_spender', icon: '💎', title: 'سرمایه‌گذار', desc: 'بیش از ۵ میلیون خرید', unlocked: totalSpent >= 5000000 }
    ]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/heatmap', auth, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { UserId: req.user.id, createdAt: { [Op.gte]: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } },
      attributes: ['createdAt'], raw: true
    });
    const reviews = await Review.findAll({
      where: { UserId: req.user.id, createdAt: { [Op.gte]: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } },
      attributes: ['createdAt'], raw: true
    });
    const activity = {};
    [...orders, ...reviews].forEach((item) => {
      const date = new Date(item.createdAt).toISOString().split('T')[0];
      activity[date] = (activity[date] || 0) + 1;
    });
    res.json(activity);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/timeline', auth, async (req, res) => {
  try {
    const events = [];
    const orders = await Order.findAll({
      where: { UserId: req.user.id },
      include: [{ model: Game, attributes: ['title'] }],
      order: [['createdAt', 'DESC']], limit: 5
    });
    orders.forEach((o) => events.push({
      type: 'order', icon: '🛒', title: 'سفارش جدید',
      desc: o.Game?.title || 'نامشخص', date: o.createdAt, color: 'text-blue-400'
    }));

    const reviews = await Review.findAll({
      where: { UserId: req.user.id },
      include: [{ model: Game, attributes: ['title'] }],
      order: [['createdAt', 'DESC']], limit: 5
    });
    reviews.forEach((r) => events.push({
      type: 'review', icon: '⭐', title: 'نظر جدید',
      desc: `${r.Game?.title || 'نامشخص'} - ${r.rating} ستاره`, date: r.createdAt, color: 'text-yellow-400'
    }));

    const txs = await Transaction.findAll({
      where: { UserId: req.user.id },
      order: [['createdAt', 'DESC']], limit: 5
    });
    txs.forEach((t) => events.push({
      type: 'transaction', icon: t.type === 'deposit' ? '💰' : '💸',
      title: t.type === 'deposit' ? 'شارژ کیف پول' : 'پرداخت',
      desc: `${Math.abs(t.amount).toLocaleString('en-US')} تومان`,
      date: t.createdAt, color: t.type === 'deposit' ? 'text-green-400' : 'text-red-400'
    }));

    events.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(events.slice(0, 15));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/top-games', auth, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { UserId: req.user.id, status: 'completed', isDLC: false },
      include: [{ model: Game }],
      order: [['createdAt', 'DESC']], limit: 10
    });
    const games = orders.map((o) => o.Game).filter(Boolean);
    const unique = [];
    const seen = new Set();
    games.forEach((g) => { if (!seen.has(g.id)) { seen.add(g.id); unique.push(g); } });
    res.json(unique);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;