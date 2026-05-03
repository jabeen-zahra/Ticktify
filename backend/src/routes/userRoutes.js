const express = require('express');
const router  = express.Router();
const { getMe, updateProfile, changePassword, changeEmail, deactivateAccount } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/me',              getMe);
router.put('/profile',         updateProfile);
router.put('/change-password', changePassword);
router.put('/change-email',    changeEmail);
router.delete('/me',           deactivateAccount);

module.exports = router;