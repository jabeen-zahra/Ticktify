const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');
const { sendSuccess } = require('../utils/responseHelper');

router.use(protect);

// Get all notifications for current user
router.get('/', async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort('-createdAt')
      .limit(30);
    const unreadCount = await Notification.countDocuments({ user: req.user.id, isRead: false });
    sendSuccess(res, { notifications, unreadCount });
  } catch (err) { next(err); }
});

// Mark all as read
router.patch('/read-all', async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
    sendSuccess(res, {}, 'All notifications marked as read');
  } catch (err) { next(err); }
});

// Mark single as read
router.patch('/:id/read', async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, { isRead: true });
    sendSuccess(res, {}, 'Marked as read');
  } catch (err) { next(err); }
});

module.exports = router;
