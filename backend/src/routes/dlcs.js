const router = require('express').Router();
const { DLC, Game, Order } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const { Op } = require('sequelize');

router.get('/game/:gameId', async (req, res) => {
  try {
    const dlcs = await DLC.findAll({
      where: { GameId: req.params.gameId, isActive: true },
      order: [['createdAt', 'DESC']]
    });
    res.json(dlcs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { GameId, title, basePrice } = req.body;
    if (!GameId || !title || !basePrice)
      return res.status(400).json({ error: 'همه فیلدها الزامی است' });

    const game = await Game.findByPk(GameId);
    if (!game) return res.status(404).json({ error: 'بازی یافت نشد' });

    const dlc = await DLC.create(req.body);
    res.status(201).json(dlc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const d = await DLC.findByPk(req.params.id);
    if (!d) return res.status(404).json({ error: 'یافت نشد' });
    await d.update(req.body);
    res.json(d);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await DLC.destroy({ where: { id: req.params.id } });
    res.json({ message: 'حذف شد' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/check/:dlcId', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      where: {
        UserId: req.user.id,
        DLCId: req.params.dlcId,
        status: { [Op.in]: ['paid', 'in_progress', 'completed'] }
      }
    });
    res.json({ owned: !!order });
  } catch (e) {
    res.json({ owned: false });
  }
});

module.exports = router;