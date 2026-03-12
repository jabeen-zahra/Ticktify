const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Protect: require valid JWT ────────────────────────────────────────────────
const protect = async (req, res, next) => {
  let token;

  // Check Authorization header (Bearer token)
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Alternatively check cookie
  else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized — no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or deactivated' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

// ── Authorize: restrict to specific roles ─────────────────────────────────────
// Usage: authorize('admin') or authorize('admin', 'organizer')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized for this action`,
      });
    }
    next();
  };
};

// ── Organizer must be approved ────────────────────────────────────────────────
const requireApprovedOrganizer = (req, res, next) => {
  if (
    req.user.role !== 'organizer' ||
    req.user.organizerProfile?.status !== 'approved'
  ) {
    return res.status(403).json({
      success: false,
      message: 'Your organizer account is pending approval',
    });
  }
  next();
};

module.exports = { protect, authorize, requireApprovedOrganizer };
