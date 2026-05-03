const User         = require('../models/User');
const emailService = require('../utils/emailService');
const { sendSuccess, sendError, sendTokenResponse } = require('../utils/responseHelper');

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, university, degreeLevel, organizerProfile } = req.body;

    if (!name || !email || !password)
      return sendError(res, 'Name, email and password are required', 400);
    if (password.length < 8)
      return sendError(res, 'Password must be at least 8 characters', 400);
    if (role === 'admin')
      return sendError(res, 'Admin accounts cannot be created via registration', 403);

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser)
      return sendError(res, 'An account with this email already exists', 400);

    const userData = {
      name:        name.trim(),
      email:       email.toLowerCase().trim(),
      password,
      role:        role === 'organizer' ? 'organizer' : 'student',
      university:  university  || null,
      degreeLevel: degreeLevel || null,
    };

    if (userData.role === 'organizer') {
      userData.organizerProfile = {
        organizationName:  organizerProfile?.organizationName?.trim() || '',
        emailDomain:       organizerProfile?.emailDomain?.trim()       || '',
        status:            'pending',
        isFirstTimePoster: true,
      };
    }

    const user = await User.create(userData);

    emailService.sendWelcome(user).catch(() => {});

    return sendTokenResponse(user, 201, res);

  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message).join(', ');
      return sendError(res, messages, 400);
    }
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return sendError(res, 'Please provide email and password', 400);

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    const isMatch = user ? await user.matchPassword(password) : false;

    if (!user || !isMatch)
      return sendError(res, 'Invalid email or password', 401);

    if (!user.isActive)
      return sendError(res, 'Your account has been deactivated. Contact support.', 401);

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    return sendTokenResponse(user, 200, res);

  } catch (err) { next(err); }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -resetPasswordToken -resetPasswordExpire');
    if (!user) return sendError(res, 'User not found', 404);
    return sendSuccess(res, { user });
  } catch (err) { next(err); }
};

const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires:  new Date(Date.now() + 5000),
    httpOnly: true,
    sameSite: 'lax',
  });
  return sendSuccess(res, {}, 'Logged out successfully');
};

module.exports = { register, login, getMe, logout };