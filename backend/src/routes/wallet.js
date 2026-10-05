const router = require('express').Router();
const { User, Transaction, Order, Notification } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/transactions', auth, async (req, res) => {
  try {
    const txs = await Transaction.findAll({
      where: { UserId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.json(txs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/charge', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount < 10000) {
      return res.status(400).json({ error: 'حداقل مبلغ شارژ ۱۰,۰۰۰ تومان' });
    }
    if (amount > 100000000) {
      return res.status(400).json({ error: 'حداکثر ۱۰۰,۰۰۰,۰۰۰ تومان' });
    }

    const tx = await Transaction.create({
      UserId: req.user.id,
      amount,
      type: 'deposit',
      status: 'success',
      gateway: 'simulator',
      description: 'شارژ کیف پول',
      refId: 'TXN' + Date.now()
    });

    const u = await User.findByPk(req.user.id);
    await u.increment('wallet', { by: amount });
    await u.reload();

    await Notification.create({
      UserId: req.user.id,
      title: '💰 کیف پول شارژ شد',
      body: `${amount.toLocaleString('en-US')} تومان به کیف پول اضافه شد`,
      type: 'wallet',
      icon: '💰',
      color: 'green',
      link: '/profile'
    });

    res.json({ success: true, transaction: tx, newBalance: u.wallet });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/pay/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'یافت نشد' });
    if (order.UserId !== req.user.id) return res.status(403).json({ error: 'دسترسی ندارید' });
    if (order.status !== 'pending_payment') return res.status(400).json({ error: 'قابل پرداخت نیست' });

    const u = await User.findByPk(req.user.id);
    const price = order.finalPrice || order.totalPrice;

    if (u.wallet < price) {
      return res.status(400).json({
        error: 'موجودی کافی نیست',
        wallet: u.wallet,
        needed: price - u.wallet
      });
    }

    await u.decrement('wallet', { by: price });
    await order.update({ status: 'paid', paidAt: new Date() });

    await Transaction.create({
      UserId: req.user.id,
      OrderId: order.id,
      amount: -price,
      type: 'purchase',
      status: 'success',
      description: `پرداخت سفارش ${order.orderCode}`,
      refId: 'PAY' + Date.now()
    });

    await Notification.create({
      UserId: req.user.id,
      title: '✅ پرداخت موفق',
      body: `سفارش ${order.orderCode} در حال انجام است`,
      type: 'order',
      icon: '✅',
      color: 'green',
      link: '/orders'
    });

    res.json({ success: true, order });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/admin/stats', auth, adminOnly, async (req, res) => {
  try {
    const totalDeposits = await Transaction.sum('amount', {
      where: { type: 'deposit', status: 'success' }
    });
    const totalPurchases = await Transaction.sum('amount', {
      where: { type: 'purchase', status: 'success' }
    });
    const recentTx = await Transaction.findAll({
      include: [{ model: User, attributes: ['username', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    res.json({
      totalDeposits: Math.abs(totalDeposits || 0),
      totalPurchases: Math.abs(totalPurchases || 0),
      recentTx
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;