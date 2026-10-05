const router = require('express').Router();
const { Order, Game, DLC, Review, Region } = require('../models');
const { auth } = require('../middleware/auth');
const { Op } = require('sequelize');

router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { UserId: req.user.id, status: 'completed', isDLC: false },
      include: [
        { model: Game, include: [{ model: DLC, as: 'DLCs', required: false }] },
        { model: Region }
      ],
      order: [['completedAt', 'DESC']]
    });

    // DLCهای خریداری شده
    const dlcOrders = await Order.findAll({
      where: {
        UserId: req.user.id,
        isDLC: true,
        status: 'completed'
      },
      attributes: ['DLCId']
    });
    const ownedDLCs = dlcOrders.map(o => o.DLCId);

    const seen = new Set();
    const library = [];

    for (const order of orders) {
      if (!order.Game || seen.has(order.GameId)) continue;
      seen.add(order.GameId);

      const hasReview = await Review.findOne({
        where: { UserId: req.user.id, GameId: order.GameId }
      });

      library.push({
        ...order.Game.toJSON(),
        purchasedAt: order.completedAt || order.createdAt,
        orderCode: order.orderCode,
        region: order.Region,
        hasReview: !!hasReview,
        ownedDLCs
      });
    }

    res.json(library);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { UserId: req.user.id, status: 'completed', isDLC: false },
      include: [{ model: Game }]
    });

    const total = orders.length;
    const totalSpent = orders.reduce((sum, o) => sum + (Number(o.finalPrice) || 0), 0);

    const genreCount = {};
    orders.forEach(o => {
      if (!o.Game) return;
      try {
        JSON.parse(o.Game.genres || '[]').forEach(g => {
          genreCount[g] = (genreCount[g] || 0) + 1;
        });
      } catch {}
    });

    const topGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    res.json({ total, totalSpent, topGenres });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/check/:gameId', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      where: {
        UserId: req.user.id,
        GameId: req.params.gameId,
        isDLC: false,
        status: { [Op.in]: ['paid', 'in_progress', 'completed'] }
      }
    });
    res.json({ owned: !!order });
  } catch (e) {
    res.json({ owned: false });
  }
});

module.exports = router;