const express = require('express');
const router  = express.Router();
const { getBookmarks, addBookmark, removeBookmark, updateBookmark } = require('../controllers/bookmarkController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('student'));

router.get('/',                        getBookmarks);
router.post('/:opportunityId',         addBookmark);
router.delete('/:opportunityId',       removeBookmark);
router.patch('/:opportunityId',        updateBookmark);

module.exports = router;
