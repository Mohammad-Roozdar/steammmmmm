const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuid } = require('uuid');
const { auth } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.query.type || 'games';
    const dir = path.join(__dirname, '../../uploads', type);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuid() + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('فقط عکس مجاز است'));
  }
});

// ✅ همه کاربران لاگین شده می‌تونن آپلود کنن
router.post('/', auth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'فایلی ارسال نشد' });
  const type = req.query.type || 'games';
  const url = `http://localhost:5000/uploads/${type}/${req.file.filename}`;
  res.json({ url, filename: req.file.filename });
});

// مدیریت خطا
router.use((err, req, res, next) => {
  console.error('Upload error:', err.message);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'حجم فایل بیشتر از ۵ مگابایت' });
  }
  res.status(400).json({ error: err.message || 'خطا در آپلود' });
});

module.exports = router;