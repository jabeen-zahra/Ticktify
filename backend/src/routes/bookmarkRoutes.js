const express = require('express');
const router  = express.Router();
const { getBookmarks, addBookmark, removeBookmark, updateBookmark, checkBookmark } = require('../controllers/bookmarkController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('student'));

router.get('/', getBookmarks);
// IMPORTANT: /check/:id before /:id
router.get('/check/:opportunityId', checkBookmark);
router.post('/:opportunityId',      addBookmark);
router.delete('/:opportunityId',    removeBookmark);
router.patch('/:opportunityId',     updateBookmark);

module.exports = router;