const router = require('express').Router();
const { Game, Order, Wishlist, Review } = require('../models');
const { Op, fn, col, literal, Sequelize } = require('sequelize');
const { auth } = require('../middleware/auth');

// بازی‌های مشابه (بر اساس ژانر)
router.get('/similar/:gameId', async (req, res) => {
  try {
    const game = await Game.findByPk(req.params.gameId);
    if (!game) return res.status(404).json({ error: 'یافت نشد' });

    let genres = [];
    try { genres = JSON.parse(game.genres || '[]'); } catch {}

    const similar = await Game.findAll({
      where: {
        id: { [Op.ne]: game.id },
        isActive: true,
        [Op.or]: genres.length > 0
          ? genres.map(g => ({ genres: { [Op.like]: `%${g}%` } }))
          : [{ id: { [Op.ne]: game.id } }]
      },
      order: [['rating', 'DESC']],
      limit: 5
    });

    res.json(similar);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// پرفروش‌ترین‌ها
router.get('/top-selling', async (req, res) => {
  try {
    const top = await Order.findAll({
      attributes: [
        'GameId',
        [fn('COUNT', col('Order.id')), 'sales']
      ],
      where: { status: 'completed' },
      include: [{ model: Game, where: { isActive: true } }],
      group: ['Game.id', 'Game.title', 'Game.coverImage', 'Game.basePrice',
              'Game.discount', 'Game.rating', 'Game.isActive', 'Order.GameId'],
      order: [[fn('COUNT', col('Order.id')), 'DESC']],
      limit: 8,
      raw: false
    });
    res.json(top.map(t => t.Game));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// پرامتیازترین‌ها
router.get('/top-rated', async (req, res) => {
  try {
    const top = await Game.findAll({
      where: { isActive: true, ratingCount: { [Op.gt]: 0 } },
      order: [['rating', 'DESC']],
      limit: 8
    });
    res.json(top);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// «کاربرانی که این رو دیدن، اینا رو هم دیدن»
router.get('/also-viewed/:gameId', async (req, res) => {
  try {
    const game = await Game.findByPk(req.params.gameId);
    if (!game) return res.status(404).json({ error: 'یافت نشد' });

    let genres = [];
    try { genres = JSON.parse(game.genres || '[]'); } catch {}

    const result = await Game.findAll({
      where: {
        id: { [Op.ne]: game.id },
        isActive: true,
        [Op.or]: genres.map(g => ({ genres: { [Op.like]: `%${g}%` } }))
      },
      order: [['views', 'DESC']],
      limit: 5
    });

    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// پیشنهاد شخصی برای کاربر لاگین شده
router.get('/for-you', auth, async (req, res) => {
  try {
    // ژانرهای مورد علاقه کاربر از ویش‌لیست
    const wishes = await Wishlist.findAll({
      where: { UserId: req.user.id },
      include: [{ model: Game }]
    });

    const genreCount = {};
    wishes.forEach(w => {
      if (!w.Game) return;
      try {
        JSON.parse(w.Game.genres || '[]').forEach(g => {
          genreCount[g] = (genreCount[g] || 0) + 1;
        });
      } catch {}
    });

    const topGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([g]) => g);

    const wishIds = wishes.map(w => w.GameId);

    let where = { isActive: true };
    if (wishIds.length > 0) where.id = { [Op.notIn]: wishIds };

    if (topGenres.length > 0) {
      where[Op.or] = topGenres.map(g => ({ genres: { [Op.like]: `%${g}%` } }));
    }

    const recommended = await Game.findAll({
      where,
      order: [['rating', 'DESC'], ['views', 'DESC']],
      limit: 8
    });

    res.json(recommended);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;