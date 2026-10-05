const router = require('express').Router();
const { Ticket, Message, User } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  const { subject, content, priority, category } = req.body;
  const ticket = await Ticket.create({
    subject, priority, category, UserId: req.user.id
  });
  await Message.create({ TicketId: ticket.id, content, isAdmin: false });
  res.status(201).json(ticket);
});

router.get('/my', auth, async (req, res) => {
  res.json(await Ticket.findAll({
    where: { UserId: req.user.id },
    order: [['createdAt', 'DESC']]
  }));
});

router.get('/admin/all', auth, adminOnly, async (req, res) => {
  res.json(await Ticket.findAll({
    include: [{ model: User, attributes: ['id', 'username'] }],
    order: [['updatedAt', 'DESC']]
  }));
});

router.get('/:id/messages', auth, async (req, res) => {
  const ticket = await Ticket.findByPk(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'یافت نشد' });
  if (ticket.UserId !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'دسترسی ندارید' });

  const messages = await Message.findAll({
    where: { TicketId: ticket.id },
    order: [['createdAt', 'ASC']]
  });
  res.json({ ticket, messages });
});

router.post('/:id/messages', auth, async (req, res) => {
  const ticket = await Ticket.findByPk(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'یافت نشد' });
  const isAdmin = req.user.role === 'admin';
  if (ticket.UserId !== req.user.id && !isAdmin)
    return res.status(403).json({ error: 'دسترسی ندارید' });

  const msg = await Message.create({
    TicketId: ticket.id, content: req.body.content, isAdmin
  });
  await ticket.update({ status: isAdmin ? 'answered' : 'open' });
  res.status(201).json(msg);
});

module.exports = router;