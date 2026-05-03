const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ') &&
    req.headers.authorization.length > 7
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token && req.cookies.token !== 'none') {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized — no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id)
      .select('-password -resetPasswordToken -resetPasswordExpire');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User account no longer exists' });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account has been deactivated' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired — please login again' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied — role '${req.user.role}' is not permitted for this action`,
    });
  }
  next();
};

const requireApprovedOrganizer = (req, res, next) => {
  if (
    req.user.role !== 'organizer' ||
    req.user.organizerProfile?.status !== 'approved'
  ) {
    return res.status(403).json({
      success: false,
      message: 'Your organizer account is pending admin approval before you can post',
    });
  }
  next();
};

module.exports = { protect, authorize, requireApprovedOrganizer };