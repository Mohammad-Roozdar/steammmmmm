const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: 'همه فیلدها الزامی است' });

  const exists = await User.findOne({ where: { email } });
  if (exists) return res.status(400).json({ error: 'ایمیل تکراری' });

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, password: hash });
  res.json({ message: 'ثبت‌نام موفق', userId: user.id });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user || !await bcrypt.compare(password, user.password))
    return res.status(400).json({ error: 'اطلاعات غلط' });

  const token = jwt.sign(
    { id: user.id, role: user.role, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

module.exports = router;