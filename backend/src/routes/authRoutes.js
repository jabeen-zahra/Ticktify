const express  = require('express');
const router   = express.Router();
const { register, login, getMe, logout } = require('../controllers/authController');
const { protect }  = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

router.post('/register', validate.register, register);
router.post('/login',    validate.login,    login);
router.get('/me',        protect, getMe);
router.post('/logout',   protect, logout);

module.exports = router;