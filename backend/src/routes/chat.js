const router = require('express').Router();
const { LiveChat, LiveMessage, User } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const { v4: uuid } = require('uuid');

router.post('/start', async (req, res) => {
  const { name, email, userId } = req.body;
  const sessionId = uuid();
  const chat = await LiveChat.create({
    sessionId, guestName: name, guestEmail: email, UserId: userId || null
  });
  res.json({ sessionId, chatId: chat.id });
});

router.get('/session/:sessionId', async (req, res) => {
  const chat = await LiveChat.findOne({
    where: { sessionId: req.params.sessionId }
  });
  if (!chat) return res.status(404).json({ error: 'یافت نشد' });
  const messages = await LiveMessage.findAll({
    where: { LiveChatId: chat.id },
    order: [['createdAt', 'ASC']]
  });
  res.json({ chat, messages });
});

router.get('/admin/all', auth, adminOnly, async (req, res) => {
  const chats = await LiveChat.findAll({
    include: [{ model: User, attributes: ['id', 'username'] }],
    order: [['updatedAt', 'DESC']]
  });
  res.json(chats);
});

module.exports = router;