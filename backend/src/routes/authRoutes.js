const express = require('express');
const router  = express.Router();
const { register, login, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', (req, res, next) => register(req, res, next));
router.post('/login',    (req, res, next) => login(req, res, next));
router.post('/logout',   protect, (req, res, next) => logout(req, res, next));
router.get('/me',        protect, (req, res, next) => getMe(req, res, next));

module.exports = router;