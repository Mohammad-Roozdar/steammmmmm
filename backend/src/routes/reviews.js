const router = require('express').Router();
const { Review, Game, User, ReviewReaction } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const { fn, col, Op } = require('sequelize');

router.get('/game/:gameId', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { GameId: req.params.gameId, isApproved: true },
      include: [{ model: User, attributes: ['id', 'username', 'avatar'] }],
      order: [['likes', 'DESC'], ['createdAt', 'DESC']],
      limit: 50
    });

    const stats = await Review.findAll({
      where: { GameId: req.params.gameId, isApproved: true },
      attributes: [
        [fn('COUNT', col('id')), 'total'],
        [fn('AVG', col('rating')), 'avg']
      ],
      raw: true
    });

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const allRatings = await Review.findAll({
      where: { GameId: req.params.gameId, isApproved: true },
      attributes: ['rating'],
      raw: true
    });
    allRatings.forEach(r => {
      if (distribution[r.rating] !== undefined) distribution[r.rating]++;
    });

    // اگه کاربر لاگین باشه، واکنش‌هاش رو بگیر
    let userReactions = {};
    if (req.headers.authorization) {
      try {
        const jwt = require('jsonwebtoken');
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const reactions = await ReviewReaction.findAll({
          where: {
            UserId: decoded.id,
            ReviewId: { [Op.in]: reviews.map(r => r.id) }
          }
        });
        reactions.forEach(r => {
          userReactions[r.ReviewId] = r.type;
        });
      } catch {}
    }

    res.json({
      reviews,
      total: parseInt(stats[0]?.total || 0),
      average: parseFloat(stats[0]?.avg || 0),
      distribution,
      userReactions
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/game/:gameId', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ error: 'امتیاز بین ۱ تا ۵' });
    if (!comment || comment.trim().length < 3)
      return res.status(400).json({ error: 'نظر کوتاه است' });

    const existing = await Review.findOne({
      where: { UserId: req.user.id, GameId: req.params.gameId }
    });
    if (existing) return res.status(400).json({ error: 'قبلاً نظر داده‌اید' });

    const review = await Review.create({
      UserId: req.user.id,
      GameId: req.params.gameId,
      rating, comment,
      isApproved: true
    });

    await updateGameRating(req.params.gameId);

    const full = await Review.findByPk(review.id, {
      include: [{ model: User, attributes: ['id', 'username', 'avatar'] }]
    });

    res.status(201).json(full);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 👍👎 لایک/دیس‌لایک نظر
router.post('/:id/react', auth, async (req, res) => {
  try {
    const { type } = req.body; // 'like' or 'dislike'
    if (!['like', 'dislike'].includes(type))
      return res.status(400).json({ error: 'نوع نامعتبر' });

    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ error: 'یافت نشد' });

    const existing = await ReviewReaction.findOne({
      where: { UserId: req.user.id, ReviewId: req.params.id }
    });

    if (existing) {
      if (existing.type === type) {
        // حذف واکنش
        if (type === 'like') await review.decrement('likes');
        else await review.decrement('dislikes');
        await existing.destroy();
        return res.json({ action: 'removed', likes: review.likes, dislikes: review.dislikes });
      } else {
        // تغییر واکنش
        if (existing.type === 'like') await review.decrement('likes');
        else await review.decrement('dislikes');
        if (type === 'like') await review.increment('likes');
        else await review.increment('dislikes');
        await existing.update({ type });
        await review.reload();
        return res.json({ action: 'changed', likes: review.likes, dislikes: review.dislikes });
      }
    } else {
      // واکنش جدید
      await ReviewReaction.create({
        UserId: req.user.id,
        ReviewId: req.params.id,
        type
      });
      if (type === 'like') await review.increment('likes');
      else await review.increment('dislikes');
      await review.reload();
      return res.json({ action: 'added', likes: review.likes, dislikes: review.dislikes });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ error: 'یافت نشد' });
    if (review.UserId !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'دسترسی ندارید' });
    const gameId = review.GameId;
    await review.destroy();
    await updateGameRating(gameId);
    res.json({ message: 'حذف شد' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

async function updateGameRating(gameId) {
  const stats = await Review.findAll({
    where: { GameId: gameId, isApproved: true },
    attributes: [
      [fn('AVG', col('rating')), 'avg'],
      [fn('COUNT', col('id')), 'count']
    ],
    raw: true
  });
  const avg = parseFloat(stats[0]?.avg || 0);
  const count = parseInt(stats[0]?.count || 0);
  await Game.update(
    { rating: avg.toFixed(1), ratingCount: count },
    { where: { id: gameId } }
  );
}

module.exports = router;