const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/responseHelper');

const getNotifications = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit = Math.min(50, parseInt(req.query.limit, 10) || 30);
    const skip  = (page - 1) * limit;

    const filter = { user: req.user.id };
    if (req.query.unreadOnly === 'true') filter.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ user: req.user.id, isRead: false }),
    ]);

    sendSuccess(res, { notifications, unreadCount, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ user: req.user.id, isRead: false });
    sendSuccess(res, { unreadCount: count });
  } catch (err) { next(err); }
};

const markAllRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    sendSuccess(res, { modifiedCount: result.modifiedCount }, 'All notifications marked as read');
  } catch (err) { next(err); }
};

const markOneRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: { isRead: true } },
      { new: true }
    );
    if (!notification) return sendError(res, 'Notification not found', 404);
    sendSuccess(res, { notification }, 'Marked as read');
  } catch (err) { next(err); }
};

const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id, user: req.user.id,
    });
    if (!notification) return sendError(res, 'Notification not found', 404);
    sendSuccess(res, {}, 'Notification deleted');
  } catch (err) { next(err); }
};

const deleteAllRead = async (req, res, next) => {
  try {
    const result = await Notification.deleteMany({ user: req.user.id, isRead: true });
    sendSuccess(res, { deletedCount: result.deletedCount }, 'Read notifications cleared');
  } catch (err) { next(err); }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAllRead,
  markOneRead,
  deleteNotification,
  deleteAllRead,
};