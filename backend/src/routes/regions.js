const router = require('express').Router();
const { Region } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  res.json(await Region.findAll());
});

router.post('/', auth, adminOnly, async (req, res) => {
  res.status(201).json(await Region.create(req.body));
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  const region = await Region.findByPk(req.params.id);
  if (!region) return res.status(404).json({ error: 'یافت نشد' });
  await region.update(req.body);
  res.json(region);
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  await Region.destroy({ where: { id: req.params.id } });
  res.json({ message: 'حذف شد' });
});

module.exports = router;