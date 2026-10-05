const router = require('express').Router();
const { Op, fn, col, literal } = require('sequelize');
const { Order, User, Game, LiveChat, Ticket, Transaction, DLC } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers, totalOrders, totalGames, totalRevenue,
      pendingOrders, todayOrders, todayRevenue, weekRevenue,
      openTickets, activeChats, waitingChats, totalDLCs
    ] = await Promise.all([
      User.count({ where: { role: 'user' } }),
      Order.count(),
      Game.count({ where: { isActive: true } }),
      Transaction.sum('amount', { where: { status: 'success', type: 'purchase' } }),
      Order.count({ where: { status: { [Op.in]: ['paid', 'in_progress'] } } }),
      Order.count({ where: { createdAt: { [Op.gte]: today } } }),
      Transaction.sum('amount', { where: { status: 'success', createdAt: { [Op.gte]: today } } }),
      Transaction.sum('amount', { where: { status: 'success', createdAt: { [Op.gte]: thisWeek } } }),
      Ticket.count({ where: { status: 'open' } }),
      LiveChat.count({ where: { status: 'active' } }),
      LiveChat.count({ where: { status: 'waiting' } }),
      DLC.count({ where: { isActive: true } })
    ]);

    // نمودار فروش ۷ روز
    const salesChart = await Order.findAll({
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('finalPrice')), 'total']
      ],
      where: { createdAt: { [Op.gte]: thisWeek } },
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']],
      raw: true
    });

    // نمودار کاربران جدید ۷ روز
    const usersChart = await User.findAll({
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('COUNT', col('id')), 'count']
      ],
      where: { createdAt: { [Op.gte]: thisWeek } },
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']],
      raw: true
    });

    // پرفروش‌ترین بازی‌ها
    const topGames = await Order.findAll({
      attributes: ['GameId', [fn('COUNT', col('Order.id')), 'sales']],
      where: { status: 'completed', isDLC: false },
      include: [{ model: Game, attributes: ['id', 'title', 'coverImage'] }],
      group: ['Game.id', 'Game.title', 'Game.coverImage', 'Order.GameId'],
      order: [[fn('COUNT', col('Order.id')), 'DESC']],
      limit: 5
    });

    // آخرین سفارشات
    const recentOrders = await Order.findAll({
      include: [
        { model: Game, attributes: ['title'] },
        { model: User, attributes: ['username'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    // آخرین کاربران
    const recentUsers = await User.findAll({
      attributes: ['id', 'username', 'email', 'avatar', 'createdAt'],
      where: { role: 'user' },
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    // کاربران آنلاین (آخرین ۱۵ دقیقه)
    const onlineUsers = await User.count({
      where: {
        lastSeen: { [Op.gte]: new Date(Date.now() - 15 * 60 * 1000) }
      }
    });

    // توزیع سفارشات بر اساس وضعیت
    const orderStatus = await Order.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true
    });

    res.json({
      cards: {
        totalUsers, totalOrders, totalGames, totalDLCs,
        totalRevenue: totalRevenue || 0,
        pendingOrders, todayOrders,
        todayRevenue: todayRevenue || 0,
        weekRevenue: weekRevenue || 0,
        openTickets, activeChats, waitingChats,
        onlineUsers
      },
      salesChart,
      usersChart,
      topGames,
      recentOrders,
      recentUsers,
      orderStatus
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;