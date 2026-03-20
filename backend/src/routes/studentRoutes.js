const express = require('express');
const router  = express.Router();
const {
  getProfile, updateProfile, getStats,
  getBookmarks, addBookmark, removeBookmark, updateBookmark,
  getNotifications, markAllRead, markOneRead,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('student'));

router.get('/profile',                         getProfile);
router.put('/profile',                         updateProfile);
router.get('/stats',                           getStats);

router.get('/bookmarks',                       getBookmarks);
router.post('/bookmarks/:opportunityId',        addBookmark);
router.delete('/bookmarks/:opportunityId',      removeBookmark);
router.patch('/bookmarks/:opportunityId',       updateBookmark);

router.get('/notifications',                   getNotifications);
router.patch('/notifications/read-all',        markAllRead);
router.patch('/notifications/:id/read',        markOneRead);

module.exports = router;
