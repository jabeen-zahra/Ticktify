const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');

// ── @desc    Update profile
// ── @route   PUT /api/users/profile
router.put('/profile', protect, async (req, res, next) => {
  try {
    const User = require('../models/User');
    const { name, university, degreeLevel, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { name, university, degreeLevel, avatar } },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
