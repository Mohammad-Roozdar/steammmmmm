const router = require('express').Router();
const { Wishlist, Game } = require('../models');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const items = await Wishlist.findAll({
    where: { UserId: req.user.id },
    include: [Game]
  });
  res.json(items);
});

router.post('/:gameId', auth, async (req, res) => {
  const exists = await Wishlist.findOne({
    where: { UserId: req.user.id, GameId: req.params.gameId }
  });
  if (exists) {
    await exists.destroy();
    return res.json({ liked: false });
  }
  await Wishlist.create({ UserId: req.user.id, GameId: req.params.gameId });
  res.json({ liked: true });
});

module.exports = router;