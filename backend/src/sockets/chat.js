const { LiveChat, LiveMessage } = require('../models');

module.exports = (io) => {
  const chatNS = io.of('/chat');

  chatNS.on('connection', (socket) => {
    console.log('🔌 اتصال چت:', socket.id);

    socket.on('user:join', async ({ sessionId, name, email, userId }) => {
      let chat = await LiveChat.findOne({ where: { sessionId } });
      if (!chat) {
        chat = await LiveChat.create({
          sessionId, guestName: name, guestEmail: email, UserId: userId || null
        });
        chatNS.to('admins').emit('chat:new', chat);
      }
      socket.join(`chat:${chat.id}`);
      socket.chatId = chat.id;

      const messages = await LiveMessage.findAll({
        where: { LiveChatId: chat.id },
        order: [['createdAt', 'ASC']]
      });
      socket.emit('chat:history', { chat, messages });
    });

    socket.on('admin:join', () => {
      socket.join('admins');
      socket.isAdmin = true;
    });

    socket.on('admin:open', async (chatId) => {
      socket.join(`chat:${chatId}`);
      const chat = await LiveChat.findByPk(chatId);
      if (chat) {
        await chat.update({ status: 'active', unreadAdmin: 0 });
        const messages = await LiveMessage.findAll({
          where: { LiveChatId: chatId },
          order: [['createdAt', 'ASC']]
        });
        socket.emit('chat:history', { chat, messages });
        chatNS.to(`chat:${chatId}`).emit('chat:opened', chat);
      }
    });

    socket.on('message:send', async ({ chatId, content, senderType, senderName }) => {
      const msg = await LiveMessage.create({
        LiveChatId: chatId, content, senderType, senderName
      });
      const chat = await LiveChat.findByPk(chatId);
      await chat.update({
        lastMessage: content.substring(0, 100),
        unreadAdmin: senderType === 'user' ? chat.unreadAdmin + 1 : 0,
        unreadUser: senderType === 'admin' ? chat.unreadUser + 1 : 0
      });

      chatNS.to(`chat:${chatId}`).emit('message:new', msg);
      chatNS.to('admins').emit('chat:update', chat);
    });

    socket.on('typing', ({ chatId, who }) => {
      socket.to(`chat:${chatId}`).emit('typing', { who });
    });

    socket.on('chat:close', async (chatId) => {
      const chat = await LiveChat.findByPk(chatId);
      if (chat) {
        await chat.update({ status: 'closed' });
        chatNS.to(`chat:${chatId}`).emit('chat:closed', chat);
        chatNS.to('admins').emit('chat:update', chat);
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ قطع اتصال:', socket.id);
    });
  });
};