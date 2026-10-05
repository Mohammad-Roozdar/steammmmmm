const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false
  }
);

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  phone: { type: DataTypes.STRING },
  password: { type: DataTypes.STRING, allowNull: false },
  avatar: { type: DataTypes.STRING },
  bio: { type: DataTypes.TEXT },
  role: { type: DataTypes.ENUM('user', 'admin', 'support'), defaultValue: 'user' },
  wallet: { type: DataTypes.BIGINT, defaultValue: 0 },
  isBanned: { type: DataTypes.BOOLEAN, defaultValue: false },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  lastSeen: { type: DataTypes.DATE },
  preferences: { type: DataTypes.TEXT, defaultValue: '{}' }
});

const Game = sequelize.define('Game', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, unique: true },
  steamAppId: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  shortDescription: { type: DataTypes.STRING(500) },
  coverImage: { type: DataTypes.STRING },
  bannerImage: { type: DataTypes.STRING },
  trailerUrl: { type: DataTypes.STRING },
  screenshots: { type: DataTypes.TEXT, defaultValue: '[]' },
  genres: { type: DataTypes.TEXT, defaultValue: '[]' },
  tags: { type: DataTypes.TEXT, defaultValue: '[]' },
  platforms: { type: DataTypes.TEXT, defaultValue: '["Windows"]' },
  developer: { type: DataTypes.STRING },
  publisher: { type: DataTypes.STRING },
  releaseDate: { type: DataTypes.DATE },
  basePrice: { type: DataTypes.BIGINT, allowNull: false },
  discount: { type: DataTypes.INTEGER, defaultValue: 0 },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
  rating: { type: DataTypes.FLOAT, defaultValue: 0 },
  ratingCount: { type: DataTypes.INTEGER, defaultValue: 0 }
});

const DLC = sequelize.define('DLC', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  coverImage: { type: DataTypes.STRING },
  steamAppId: { type: DataTypes.STRING },
  basePrice: { type: DataTypes.BIGINT, allowNull: false },
  discount: { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  GameId: { type: DataTypes.INTEGER, allowNull: false }
});

const Region = sequelize.define('Region', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING },
  code: { type: DataTypes.STRING },
  flag: { type: DataTypes.STRING },
  priceMultiplier: { type: DataTypes.FLOAT, defaultValue: 1.0 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderCode: { type: DataTypes.STRING, unique: true },
  status: {
    type: DataTypes.ENUM(
      'pending_payment', 'paid', 'in_progress',
      'completed', 'failed', 'refunded', 'cancelled'
    ),
    defaultValue: 'pending_payment'
  },
  isDLC: { type: DataTypes.BOOLEAN, defaultValue: false },
  DLCId: { type: DataTypes.INTEGER },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  unitPrice: { type: DataTypes.BIGINT },
  totalPrice: { type: DataTypes.BIGINT },
  finalPrice: { type: DataTypes.BIGINT },
  discountCode: { type: DataTypes.STRING },
  discountAmount: { type: DataTypes.BIGINT, defaultValue: 0 },
  paidAt: { type: DataTypes.DATE },
  completedAt: { type: DataTypes.DATE },
  steamUsername: { type: DataTypes.TEXT },
  steamPassword: { type: DataTypes.TEXT },
  steamGuardCode: { type: DataTypes.TEXT },
  adminNote: { type: DataTypes.TEXT },
  userNote: { type: DataTypes.TEXT },
  assignedAdminId: { type: DataTypes.INTEGER },
  priority: { type: DataTypes.ENUM('low', 'normal', 'high'), defaultValue: 'normal' }
});

const Transaction = sequelize.define('Transaction', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  amount: { type: DataTypes.BIGINT },
  type: { type: DataTypes.ENUM('deposit', 'purchase', 'refund', 'billboard') },
  status: { type: DataTypes.ENUM('pending', 'success', 'failed'), defaultValue: 'pending' },
  gateway: { type: DataTypes.STRING },
  refId: { type: DataTypes.STRING },
  authority: { type: DataTypes.STRING },
  description: { type: DataTypes.STRING }
});

const Coupon = sequelize.define('Coupon', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code: { type: DataTypes.STRING, unique: true },
  type: { type: DataTypes.ENUM('percent', 'fixed'), defaultValue: 'percent' },
  value: { type: DataTypes.INTEGER },
  minPurchase: { type: DataTypes.BIGINT, defaultValue: 0 },
  maxUses: { type: DataTypes.INTEGER, defaultValue: 100 },
  usedCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  expiresAt: { type: DataTypes.DATE },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const Wishlist = sequelize.define('Wishlist', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }
});

const Billboard = sequelize.define('Billboard', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING },
  company: { type: DataTypes.STRING },
  contactName: { type: DataTypes.STRING },
  contactPhone: { type: DataTypes.STRING },
  contactEmail: { type: DataTypes.STRING },
  image: { type: DataTypes.STRING },
  link: { type: DataTypes.STRING },
  position: {
    type: DataTypes.ENUM('home_top', 'home_middle', 'home_bottom', 'sidebar', 'game_detail'),
    defaultValue: 'home_top'
  },
  startDate: { type: DataTypes.DATE },
  endDate: { type: DataTypes.DATE },
  price: { type: DataTypes.BIGINT },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'expired', 'rejected'),
    defaultValue: 'pending'
  },
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
  clicks: { type: DataTypes.INTEGER, defaultValue: 0 },
  adminNote: { type: DataTypes.TEXT }
});

const Review = sequelize.define('Review', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  rating: { type: DataTypes.INTEGER },
  comment: { type: DataTypes.TEXT },
  likes: { type: DataTypes.INTEGER, defaultValue: 0 },
  dislikes: { type: DataTypes.INTEGER, defaultValue: 0 },
  isApproved: { type: DataTypes.BOOLEAN, defaultValue: true }
});

// مدل جدید برای ذخیره لایک/دیس‌لایک کاربر
const ReviewReaction = sequelize.define('ReviewReaction', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  type: { type: DataTypes.ENUM('like', 'dislike') },
  UserId: { type: DataTypes.INTEGER, allowNull: false },
  ReviewId: { type: DataTypes.INTEGER, allowNull: false }
});

const Ticket = sequelize.define('Ticket', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  subject: { type: DataTypes.STRING },
  priority: { type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'), defaultValue: 'normal' },
  status: { type: DataTypes.ENUM('open', 'answered', 'closed'), defaultValue: 'open' },
  category: { type: DataTypes.STRING }
});

const Message = sequelize.define('Message', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  content: { type: DataTypes.TEXT },
  isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
  attachment: { type: DataTypes.STRING },
  readAt: { type: DataTypes.DATE }
});

const LiveChat = sequelize.define('LiveChat', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  guestName: { type: DataTypes.STRING },
  guestEmail: { type: DataTypes.STRING },
  sessionId: { type: DataTypes.STRING, unique: true },
  status: { type: DataTypes.ENUM('waiting', 'active', 'closed'), defaultValue: 'waiting' },
  lastMessage: { type: DataTypes.TEXT },
  unreadAdmin: { type: DataTypes.INTEGER, defaultValue: 0 },
  unreadUser: { type: DataTypes.INTEGER, defaultValue: 0 }
});

const LiveMessage = sequelize.define('LiveMessage', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  content: { type: DataTypes.TEXT },
  senderType: { type: DataTypes.ENUM('user', 'admin', 'system', 'bot'), defaultValue: 'user' },
  senderName: { type: DataTypes.STRING }
});

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING },
  body: { type: DataTypes.TEXT },
  type: { type: DataTypes.ENUM('order', 'chat', 'system', 'ticket', 'billboard', 'wallet', 'coupon', 'library') },
  icon: { type: DataTypes.STRING },
  color: { type: DataTypes.STRING },
  link: { type: DataTypes.STRING },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false }
});

const ActivityLog = sequelize.define('ActivityLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  action: { type: DataTypes.STRING },
  details: { type: DataTypes.TEXT },
  ip: { type: DataTypes.STRING }
});

const PageView = sequelize.define('PageView', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  path: { type: DataTypes.STRING },
  ip: { type: DataTypes.STRING },
  userAgent: { type: DataTypes.STRING }
});

Order.belongsTo(User); User.hasMany(Order);
Order.belongsTo(Game); Game.hasMany(Order);
Order.belongsTo(DLC); DLC.hasMany(Order);
Order.belongsTo(Region);
Order.belongsTo(User, { as: 'assignedAdmin', foreignKey: 'assignedAdminId' });

Game.hasMany(DLC, { as: 'DLCs', foreignKey: 'GameId' });
DLC.belongsTo(Game);

Transaction.belongsTo(User); User.hasMany(Transaction);
Transaction.belongsTo(Order);

Ticket.belongsTo(User); User.hasMany(Ticket);
Message.belongsTo(Ticket); Ticket.hasMany(Message);
Message.belongsTo(User);

LiveChat.belongsTo(User); User.hasMany(LiveChat);
LiveMessage.belongsTo(LiveChat); LiveChat.hasMany(LiveMessage);

Review.belongsTo(User); Review.belongsTo(Game); Game.hasMany(Review);

Wishlist.belongsTo(User); Wishlist.belongsTo(Game);
User.belongsToMany(Game, { through: Wishlist, as: 'wishlist' });
Game.belongsToMany(User, { through: Wishlist, as: 'favoritedBy' });

Billboard.belongsTo(User); User.hasMany(Billboard);
Billboard.belongsTo(Transaction);

Coupon.belongsTo(User, { as: 'creator' });

Notification.belongsTo(User); User.hasMany(Notification);
ActivityLog.belongsTo(User);

ReviewReaction.belongsTo(User);
ReviewReaction.belongsTo(Review);
Review.hasMany(ReviewReaction, { as: 'reactions', foreignKey: 'ReviewId' });

module.exports = {
  sequelize, User, Game, DLC, Region, Order, Transaction,
  Ticket, Message, LiveChat, LiveMessage, Review, ReviewReaction,
  Notification, ActivityLog, Wishlist, Billboard, Coupon, PageView
};