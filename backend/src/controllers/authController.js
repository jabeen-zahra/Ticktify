const User = require('../models/User');
const { sendTokenResponse, sendSuccess, sendError } = require('../utils/responseHelper');

// ── @desc    Register a new user (student or organizer)
// ── @route   POST /api/auth/register
// ── @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, university, degreeLevel, organizerProfile } = req.body;

    // Only allow student or organizer registration publicly
    if (role === 'admin') {
      return sendError(res, 'Admin accounts cannot be created via registration', 403);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'Email already in use', 400);
    }

    const userData = { name, email, password, role: role || 'student', university, degreeLevel };

    // Attach organizer profile if registering as organizer
    if (role === 'organizer' && organizerProfile) {
      userData.organizerProfile = {
        ...organizerProfile,
        status: 'pending', // Always pending on registration
      };
    }

    const user = await User.create(userData);
    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// ── @desc    Login
// ── @route   POST /api/auth/login
// ── @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Please provide email and password', 400);
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Account has been deactivated', 401);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 401);
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ── @desc    Get currently logged in user
// ── @route   GET /api/auth/me
// ── @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    sendSuccess(res, { user });
  } catch (err) {
    next(err);
  }
};

// ── @desc    Logout (clear cookie)
// ── @route   POST /api/auth/logout
// ── @access  Private
const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  sendSuccess(res, {}, 'Logged out successfully');
};

module.exports = { register, login, getMe, logout };
