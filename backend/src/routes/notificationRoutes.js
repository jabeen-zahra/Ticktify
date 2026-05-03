const express = require('express');
const router  = express.Router();
const {
  getNotifications,
  markAllRead,
  markOneRead,
  deleteNotification,
  deleteAllRead,
  getUnreadCount,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/count',      getUnreadCount);
router.get('/',           getNotifications);
router.patch('/read-all', markAllRead);
router.delete('/read',    deleteAllRead);
router.patch('/:id/read', markOneRead);
router.delete('/:id',     deleteNotification);

module.exports = router;