const router = require('express').Router();
const { Ticket, Message, Notification, User, Order } = require('../models');
const { auth } = require('../middleware/auth');
const { Op } = require('sequelize');

// 🤖 چت ربات — دریافت پیام‌های ربات
router.get('/bot/messages', auth, async (req, res) => {
  try {
    // نوتیفیکیشن‌ها رو به عنوان پیام ربات نشون میدیم
    const notifs = await Notification.findAll({
      where: { UserId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    const messages = notifs.map((n) => ({
      id: n.id,
      type: 'bot',
      content: `${n.icon || '🔔'} **${n.title}**\n${n.body}`,
      createdAt: n.createdAt,
      isRead: n.isRead,
      notifType: n.type
    }));

    // پیام خوش‌آمد
    const welcome = {
      id: 'welcome',
      type: 'bot',
      content: `👋 سلام ${req.user.username}!\n\nمن ربات SteamClub هستم. از این‌جا می‌تونی:\n\n🔔 اعلان‌های سفارش\n💰 تراکنش‌های کیف پول\n🎁 کدهای تخفیف\n📦 وضعیت سفارشات\n\nهمه رو ببینی. اگه سوالی داری، از کانال «پشتیبانی» استفاده کن!`,
      createdAt: new Date(0)
    };

    res.json([welcome, ...messages]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 🤖 پرسش از ربات (پاسخ‌های خودکار)
router.post('/bot/ask', auth, async (req, res) => {
  try {
    const { question } = req.body;
    const q = (question || '').toLowerCase().trim();

    let answer = '🤔 متوجه نشدم! لطفاً سوال رو واضح‌تر بپرس یا از کانال پشتیبانی استفاده کن.';

    if (q.includes('سفارش') || q.includes('order')) {
      const orders = await Order.findAll({
        where: { UserId: req.user.id },
        order: [['createdAt', 'DESC']],
        limit: 3
      });
      if (orders.length === 0) {
        answer = '📦 هنوز سفارشی نداری!';
      } else {
        answer = '📦 آخرین سفارشاتت:\n\n' + orders.map((o) =>
          `• ${o.orderCode} - ${o.status === 'completed' ? '✅ تکمیل' : o.status === 'paid' ? '💰 پرداخت شده' : '⏳ در انتظار'}`
        ).join('\n');
      }
    } else if (q.includes('کیف پول') || q.includes('موجودی') || q.includes('پول')) {
      const user = await User.findByPk(req.user.id);
      answer = `💰 موجودی فعلی: **${Number(user.wallet).toLocaleString('en-US')} تومان**\n\nبرای شارژ، از تب کیف پول استفاده کن.`;
    } else if (q.includes('تخفیف') || q.includes('کد')) {
      answer = '🎁 کدهای تخفیف فعال:\n\n• **WELCOME10** — ۱۰٪ تخفیف اولین خرید\n• **STEAM50** — ۵۰,۰۰۰ تومان تخفیف (حداقل خرید ۵۰۰,۰۰۰)\n\nموقع خرید، توی مودال پرداخت کد رو وارد کن.';
    } else if (q.includes('dlc') || q.includes('محتوا')) {
      answer = '🎁 DLCها توی صفحه هر بازی نمایش داده می‌شن. اگه بازی رو خریده باشی، می‌تونی DLCهاش رو جدا بخری.';
    } else if (q.includes('سلام') || q.includes('درود') || q.includes('hi')) {
      answer = `👋 سلام ${req.user.username}!\n\nچطور می‌تونم کمکت کنم؟`;
    } else if (q.includes('کتابخانه') || q.includes('بازی‌هام') || q.includes('بازی هام')) {
      answer = '📚 کتابخانه‌ات توی پروفایل → تب «کتابخانه» قابل مشاهده‌ست.';
    } else if (q.includes('پشتیبانی') || q.includes('ادمین') || q.includes('کمک')) {
      answer = '💬 برای ارتباط با پشتیبانی، از کانال «پشتیبانی» توی همین صفحه استفاده کن. ادمین‌ها به زودی جواب می‌دن.';
    }

    res.json({ answer, timestamp: new Date() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 💬 تیکت‌های چت کاربر (کانال پشتیبانی)
router.get('/support', auth, async (req, res) => {
  try {
    let ticket = await Ticket.findOne({
      where: { UserId: req.user.id, category: 'live_support', status: { [Op.ne]: 'closed' } },
      order: [['createdAt', 'DESC']]
    });

    if (!ticket) {
      ticket = await Ticket.create({
        subject: 'چت پشتیبانی',
        category: 'live_support',
        priority: 'normal',
        status: 'open',
        UserId: req.user.id
      });
      await Message.create({
        TicketId: ticket.id,
        content: `👋 سلام ${req.user.username}!\n\nکارشناسان ما در اسرع وقت پاسخ می‌دهند. لطفاً سوال یا مشکل خود را توضیح دهید.`,
        isAdmin: true
      });
    }

    const messages = await Message.findAll({
      where: { TicketId: ticket.id },
      order: [['createdAt', 'ASC']]
    });

    res.json({ ticket, messages });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ارسال پیام در کانال پشتیبانی
router.post('/support', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: 'پیام خالی است' });

    let ticket = await Ticket.findOne({
      where: { UserId: req.user.id, category: 'live_support', status: { [Op.ne]: 'closed' } }
    });

    if (!ticket) {
      ticket = await Ticket.create({
        subject: 'چت پشتیبانی',
        category: 'live_support',
        UserId: req.user.id
      });
    }

    const msg = await Message.create({
      TicketId: ticket.id,
      content: content.trim(),
      isAdmin: false
    });

    // نوتیف برای ادمین‌ها
    const admins = await User.findAll({ where: { role: 'admin' } });
    await Promise.all(admins.map(a => Notification.create({
      UserId: a.id,
      title: '💬 پیام پشتیبانی جدید',
      body: `${req.user.username}: ${content.substring(0, 50)}`,
      type: 'ticket',
      icon: '💬',
      color: 'blue',
      link: '/tickets'
    })));

    res.status(201).json(msg);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 🔔 تعداد پیام‌های نخوانده
router.get('/unread', auth, async (req, res) => {
  try {
    const botUnread = await Notification.count({
      where: { UserId: req.user.id, isRead: false }
    });

    // پیام‌های ادمین که کاربر نخونده
    const ticket = await Ticket.findOne({
      where: { UserId: req.user.id, category: 'live_support', status: { [Op.ne]: 'closed' } }
    });
    let supportUnread = 0;
    if (ticket) {
      supportUnread = await Message.count({
        where: { TicketId: ticket.id, isAdmin: true, readAt: null }
      });
    }

    res.json({ bot: botUnread, support: supportUnread });
  } catch (e) {
    res.json({ bot: 0, support: 0 });
  }
});

module.exports = router;