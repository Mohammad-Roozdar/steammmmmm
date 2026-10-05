const router = require('express').Router();
const { Game } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const games = await Game.findAll({ where: { isActive: true } });
  res.json(games);
});

router.get('/:id', async (req, res) => {
  const game = await Game.findByPk(req.params.id);
  if (!game) return res.status(404).json({ error: 'یافت نشد' });
  await game.increment('views');
  res.json(game);
});

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const game = await Game.create(req.body);
    res.status(201).json(game);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  const game = await Game.findByPk(req.params.id);
  if (!game) return res.status(404).json({ error: 'یافت نشد' });
  await game.update(req.body);
  res.json(game);
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  await Game.destroy({ where: { id: req.params.id } });
  res.json({ message: 'حذف شد' });
});

module.exports = router;