require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');

const { sequelize, User, Region, Coupon, Billboard } = require('./models');
const chatSocket = require('./sockets/chat');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/games', require('./routes/games'));
app.use('/api/regions', require('./routes/regions'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/billboards', require('./routes/billboards'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/loyalty', require('./routes/loyalty'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/library', require('./routes/library'));
app.use('/api/dlcs', require('./routes/dlcs'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/reports', require('./routes/reports'));

chatSocket(io);

async function seed() {
  const adminExists = await User.findOne({ where: { role: 'admin' } });
  if (!adminExists) {
    await User.create({
      username: 'admin',
      email: 'admin@steamclub.local',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin',
      isVerified: true
    });
    console.log('✅ ادمین: admin@steamclub.local / admin123');
  }

  const regionCount = await Region.count();
  if (regionCount === 0) {
    await Region.bulkCreate([
      { name: 'ایران', code: 'IR', flag: '🇮🇷', priceMultiplier: 1.0 },
      { name: 'ترکیه', code: 'TR', flag: '🇹🇷', priceMultiplier: 0.6 },
      { name: 'هند', code: 'IN', flag: '🇮🇳', priceMultiplier: 0.5 },
      { name: 'آرژانتین', code: 'AR', flag: '🇦🇷', priceMultiplier: 0.45 },
      { name: 'اوکراین', code: 'UA', flag: '🇺🇦', priceMultiplier: 0.55 },
      { name: 'برزیل', code: 'BR', flag: '🇧🇷', priceMultiplier: 0.6 },
      { name: 'روسیه', code: 'RU', flag: '🇷🇺', priceMultiplier: 0.55 },
      { name: 'چین', code: 'CN', flag: '🇨🇳', priceMultiplier: 0.65 }
    ]);
    console.log('✅ ریجن‌ها');
  }

  const couponCount = await Coupon.count();
  if (couponCount === 0) {
    await Coupon.bulkCreate([
      { code: 'WELCOME10', type: 'percent', value: 10, maxUses: 1000 },
      { code: 'STEAM50', type: 'fixed', value: 50000, minPurchase: 500000, maxUses: 100 }
    ]);
    console.log('✅ کدهای تخفیف');
  }

  const billboardCount = await Billboard.count();
  if (billboardCount === 0) {
    await Billboard.create({
      title: 'تبلیغ نمونه',
      company: 'شرکت نمونه',
      position: 'home_top',
      image: 'https://via.placeholder.com/1200x200/66c0f4/171a21?text=Ad+Space',
      link: 'https://example.com',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    console.log('✅ بیلبورد نمونه');
  }
}

sequelize.sync({ alter: true }).then(async () => {
  await seed();
  console.log('✅ دیتابیس آماده است');
  server.listen(process.env.PORT || 5000, () =>
    console.log(`🚀 سرور روی پورت ${process.env.PORT || 5000} اجرا شد`)
  );
}).catch(err => {
  console.error('❌ خطا:', err.message);
});