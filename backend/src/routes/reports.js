const router = require('express').Router();
const ExcelJS = require('exceljs');
const { Op, fn, col, literal } = require('sequelize');
const { Order, User, Game, Transaction, DLC, Review, Region } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');

// ============ 📊 گزارش فروش ============
router.get('/sales', auth, adminOnly, async (req, res) => {
  try {
    const { from, to, status } = req.query;

    const where = {};
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) where.createdAt[Op.lte] = new Date(to);
    }
    if (status && status !== 'all') where.status = status;

    const orders = await Order.findAll({
      where,
      include: [
        { model: Game, attributes: ['title'] },
        { model: DLC, attributes: ['title'] },
        { model: Region, attributes: ['name', 'flag'] },
        { model: User, attributes: ['id', 'username', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const summary = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + (Number(o.finalPrice) || 0), 0),
      totalDiscount: orders.reduce((sum, o) => sum + (Number(o.discountAmount) || 0), 0),
      completed: orders.filter(o => o.status === 'completed').length,
      pending: orders.filter(o => ['paid', 'in_progress'].includes(o.status)).length,
      failed: orders.filter(o => o.status === 'failed').length,
      byRegion: {},
      byStatus: {},
      byDay: {}
    };

    orders.forEach(o => {
      const region = o.Region?.name || 'نامشخص';
      const status = o.status;
      const day = new Date(o.createdAt).toISOString().split('T')[0];

      summary.byRegion[region] = (summary.byRegion[region] || 0) + Number(o.finalPrice || 0);
      summary.byStatus[status] = (summary.byStatus[status] || 0) + 1;
      summary.byDay[day] = (summary.byDay[day] || 0) + Number(o.finalPrice || 0);
    });

    res.json({ orders, summary });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============ 📥 خروجی Excel سفارشات ============
router.get('/sales/excel', auth, adminOnly, async (req, res) => {
  try {
    const { from, to, status } = req.query;

    const where = {};
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) where.createdAt[Op.lte] = new Date(to);
    }
    if (status && status !== 'all') where.status = status;

    const orders = await Order.findAll({
      where,
      include: [
        { model: Game, attributes: ['title'] },
        { model: DLC, attributes: ['title'] },
        { model: Region, attributes: ['name'] },
        { model: User, attributes: ['username', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SteamClub';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('سفارشات', {
      views: [{ rightToLeft: true }]
    });

    sheet.columns = [
      { header: 'کد سفارش', key: 'code', width: 18 },
      { header: 'تاریخ', key: 'date', width: 20 },
      { header: 'کاربر', key: 'user', width: 20 },
      { header: 'ایمیل', key: 'email', width: 25 },
      { header: 'بازی', key: 'game', width: 30 },
      { header: 'نوع', key: 'type', width: 12 },
      { header: 'ریجن', key: 'region', width: 15 },
      { header: 'قیمت اصلی', key: 'original', width: 15 },
      { header: 'تخفیف', key: 'discount', width: 15 },
      { header: 'قیمت نهایی', key: 'final', width: 15 },
      { header: 'کد تخفیف', key: 'coupon', width: 15 },
      { header: 'وضعیت', key: 'status', width: 15 }
    ];

    const statusMap = {
      pending_payment: 'در انتظار پرداخت',
      paid: 'پرداخت شده',
      in_progress: 'در حال انجام',
      completed: 'تکمیل شده',
      failed: 'ناموفق',
      refunded: 'مرجوعی',
      cancelled: 'لغو شده'
    };

    orders.forEach(o => {
      sheet.addRow({
        code: o.orderCode,
        date: new Date(o.createdAt).toLocaleString('fa-IR'),
        user: o.User?.username || '—',
        email: o.User?.email || '—',
        game: o.isDLC ? o.DLC?.title : o.Game?.title,
        type: o.isDLC ? 'DLC' : 'بازی',
        region: o.Region?.name || '—',
        original: Number(o.totalPrice || 0),
        discount: Number(o.discountAmount || 0),
        final: Number(o.finalPrice || 0),
        coupon: o.discountCode || '—',
        status: statusMap[o.status] || o.status
      });
    });

    // استایل هدر
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2A475E' }
    };
    sheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 30;

    // اضافه کردن ردیف جمع
    const totalRow = sheet.addRow({
      code: 'جمع کل',
      original: orders.reduce((s, o) => s + Number(o.totalPrice || 0), 0),
      discount: orders.reduce((s, o) => s + Number(o.discountAmount || 0), 0),
      final: orders.reduce((s, o) => s + Number(o.finalPrice || 0), 0)
    });
    totalRow.font = { bold: true };
    totalRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF66C0F4' } };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=orders-${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// ============ 👥 گزارش کاربران ============
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    // آمار هر کاربر
    const enriched = await Promise.all(users.map(async (u) => {
      const totalOrders = await Order.count({ where: { UserId: u.id } });
      const totalSpent = await Order.sum('finalPrice', {
        where: { UserId: u.id, status: 'completed' }
      }) || 0;
      const lastOrder = await Order.findOne({
        where: { UserId: u.id },
        order: [['createdAt', 'DESC']],
        attributes: ['createdAt']
      });

      return {
        ...u.toJSON(),
        totalOrders,
        totalSpent,
        lastOrderAt: lastOrder?.createdAt || null
      };
    }));

    res.json(enriched);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============ 📥 خروجی Excel کاربران ============
router.get('/users/excel', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('کاربران', {
      views: [{ rightToLeft: true }]
    });

    sheet.columns = [
      { header: 'شناسه', key: 'id', width: 8 },
      { header: 'نام کاربری', key: 'username', width: 20 },
      { header: 'ایمیل', key: 'email', width: 25 },
      { header: 'موبایل', key: 'phone', width: 15 },
      { header: 'نقش', key: 'role', width: 12 },
      { header: 'کیف پول', key: 'wallet', width: 15 },
      { header: 'وضعیت', key: 'status', width: 12 },
      { header: 'تاریخ عضویت', key: 'joined', width: 20 }
    ];

    for (const u of users) {
      const totalOrders = await Order.count({ where: { UserId: u.id } });
      const totalSpent = await Order.sum('finalPrice', {
        where: { UserId: u.id, status: 'completed' }
      }) || 0;

      const row = sheet.addRow({
        id: u.id,
        username: u.username,
        email: u.email,
        phone: u.phone || '—',
        role: u.role === 'admin' ? 'ادمین' : u.role === 'support' ? 'پشتیبان' : 'کاربر',
        wallet: Number(u.wallet || 0),
        status: u.isBanned ? 'مسدود' : 'فعال',
        joined: new Date(u.createdAt).toLocaleString('fa-IR')
      });

      row.getCell('totalOrders').value = totalOrders;
      row.getCell('totalSpent').value = Number(totalSpent);
    }

    // اضافه کردن ستون‌های اضافی
    sheet.spliceColumns(9, 0, [
      'تعداد سفارش',
      { key: 'totalOrders', width: 12 }
    ]);
    sheet.spliceColumns(10, 0, [
      'مجموع خرید',
      { key: 'totalSpent', width: 15 }
    ]);

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2A475E' } };
    sheet.getRow(1).alignment = { horizontal: 'center' };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=users-${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============ 🎮 گزارش بازی‌ها ============
router.get('/games', auth, adminOnly, async (req, res) => {
  try {
    const games = await Game.findAll({ order: [['createdAt', 'DESC']] });

    const enriched = await Promise.all(games.map(async (g) => {
      const sales = await Order.count({
        where: { GameId: g.id, status: 'completed', isDLC: false }
      });
      const revenue = await Order.sum('finalPrice', {
        where: { GameId: g.id, status: 'completed', isDLC: false }
      }) || 0;
      const dlcCount = await DLC.count({ where: { GameId: g.id } });
      const reviews = await Review.count({ where: { GameId: g.id } });

      return {
        ...g.toJSON(),
        sales,
        revenue,
        dlcCount,
        reviews
      };
    }));

    res.json(enriched);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============ 📥 خروجی Excel بازی‌ها ============
router.get('/games/excel', auth, adminOnly, async (req, res) => {
  try {
    const games = await Game.findAll({ order: [['createdAt', 'DESC']] });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('بازی‌ها', {
      views: [{ rightToLeft: true }]
    });

    sheet.columns = [
      { header: 'شناسه', key: 'id', width: 8 },
      { header: 'عنوان', key: 'title', width: 30 },
      { header: 'سازنده', key: 'developer', width: 20 },
      { header: 'قیمت پایه', key: 'basePrice', width: 15 },
      { header: 'تخفیف', key: 'discount', width: 10 },
      { header: 'قیمت نهایی', key: 'finalPrice', width: 15 },
      { header: 'موجودی', key: 'stock', width: 10 },
      { header: 'تعداد DLC', key: 'dlcCount', width: 12 },
      { header: 'فروش', key: 'sales', width: 10 },
      { header: 'درآمد', key: 'revenue', width: 15 },
      { header: 'امتیاز', key: 'rating', width: 10 },
      { header: 'وضعیت', key: 'status', width: 10 }
    ];

    for (const g of games) {
      const sales = await Order.count({
        where: { GameId: g.id, status: 'completed', isDLC: false }
      });
      const revenue = await Order.sum('finalPrice', {
        where: { GameId: g.id, status: 'completed', isDLC: false }
      }) || 0;
      const dlcCount = await DLC.count({ where: { GameId: g.id } });

      sheet.addRow({
        id: g.id,
        title: g.title,
        developer: g.developer || '—',
        basePrice: Number(g.basePrice),
        discount: g.discount + '%',
        finalPrice: Math.round(g.basePrice * (1 - g.discount / 100)),
        stock: g.stock,
        dlcCount,
        sales,
        revenue: Number(revenue),
        rating: g.rating || 0,
        status: g.isActive ? 'فعال' : 'غیرفعال'
      });
    }

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2A475E' } };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=games-${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============ 💰 گزارش تراکنش‌ها ============
router.get('/transactions', auth, adminOnly, async (req, res) => {
  try {
    const { from, to } = req.query;
    const where = {};
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) where.createdAt[Op.lte] = new Date(to);
    }

    const txs = await Transaction.findAll({
      where,
      include: [{ model: User, attributes: ['username', 'email'] }],
      order: [['createdAt', 'DESC']]
    });

    const summary = {
      totalDeposits: txs.filter(t => t.type === 'deposit' && t.status === 'success')
        .reduce((s, t) => s + Number(t.amount), 0),
      totalPurchases: txs.filter(t => t.type === 'purchase' && t.status === 'success')
        .reduce((s, t) => s + Math.abs(Number(t.amount)), 0),
      totalRefunds: txs.filter(t => t.type === 'refund' && t.status === 'success')
        .reduce((s, t) => s + Number(t.amount), 0),
      count: txs.length
    };

    res.json({ transactions: txs, summary });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============ 📥 خروجی Excel تراکنش‌ها ============
router.get('/transactions/excel', auth, adminOnly, async (req, res) => {
  try {
    const { from, to } = req.query;
    const where = {};
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) where.createdAt[Op.lte] = new Date(to);
    }

    const txs = await Transaction.findAll({
      where,
      include: [{ model: User, attributes: ['username', 'email'] }],
      order: [['createdAt', 'DESC']]
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('تراکنش‌ها', {
      views: [{ rightToLeft: true }]
    });

    sheet.columns = [
      { header: 'شناسه', key: 'id', width: 8 },
      { header: 'تاریخ', key: 'date', width: 20 },
      { header: 'کاربر', key: 'user', width: 20 },
      { header: 'نوع', key: 'type', width: 15 },
      { header: 'مبلغ', key: 'amount', width: 18 },
      { header: 'وضعیت', key: 'status', width: 12 },
      { header: 'توضیحات', key: 'desc', width: 30 },
      { header: 'شماره پیگیری', key: 'refId', width: 20 }
    ];

    const typeMap = {
      deposit: 'شارژ',
      purchase: 'خرید',
      refund: 'بازگشت',
      billboard: 'بیلبورد'
    };

    txs.forEach(t => {
      sheet.addRow({
        id: t.id,
        date: new Date(t.createdAt).toLocaleString('fa-IR'),
        user: t.User?.username || '—',
        type: typeMap[t.type] || t.type,
        amount: Number(t.amount),
        status: t.status === 'success' ? 'موفق' : t.status === 'pending' ? 'در انتظار' : 'ناموفق',
        desc: t.description || '—',
        refId: t.refId || '—'
      });
    });

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2A475E' } };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=transactions-${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;