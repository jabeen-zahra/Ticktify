const User = require('../models/User');
const jwt = require('jsonwebtoken');

const sendError = (res, message, statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message });
};

const sendSuccess = (res, data = {}, message = 'Success') => {
  return res.status(200).json({ success: true, message, ...data });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    'tictify_super_secret_key_2024_abc123xyz',
    { expiresIn: '7d' }
  );

  const userObj = user.toObject();
  delete userObj.password;

  res.cookie('token', token, {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
  });

  return res.status(statusCode).json({
    success: true,
    token,
    user: userObj,
  });
};

const register = async (req, res) => {
  try {
    console.log('REGISTER BODY:', JSON.stringify(req.body));

    const { name, email, password, role, university, degreeLevel, organizerProfile } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Name, email and password are required', 400);
    }
    if (role === 'admin') {
      return sendError(res, 'Admin accounts cannot be created via registration', 403);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return sendError(res, 'An account with this email already exists', 400);
    }

    const userData = {
      name:        name.trim(),
      email:       email.toLowerCase().trim(),
      password,
      role:        role || 'student',
      university:  university || null,
      degreeLevel: degreeLevel || null,
    };

    if (role === 'organizer') {
      userData.organizerProfile = {
        organizationName:  organizerProfile?.organizationName || '',
        emailDomain:       organizerProfile?.emailDomain || '',
        status:            'pending',
        isFirstTimePoster: true,
      };
    }

    console.log('CREATING USER:', userData.email, userData.role);
    const user = await User.create(userData);
    console.log('USER CREATED:', user._id);

    return sendTokenResponse(user, 201, res);

  } catch (err) {
    console.error('REGISTER ERROR:', err.name, err.message);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message).join(', ');
      return sendError(res, messages, 400);
    }
    return sendError(res, err.message || 'Server error', 500);
  }
};

const login = async (req, res) => {
  try {
    console.log('LOGIN ATTEMPT:', req.body.email);
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Please provide email and password', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) return sendError(res, 'Invalid email or password', 401);
    if (!user.isActive) return sendError(res, 'Your account has been deactivated', 401);

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return sendError(res, 'Invalid email or password', 401);

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    return sendTokenResponse(user, 200, res);

  } catch (err) {
    console.error('LOGIN ERROR:', err.name, err.message);
    return sendError(res, err.message || 'Server error', 500);
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return sendError(res, 'User not found', 404);
    return sendSuccess(res, { user });
  } catch (err) {
    return sendError(res, err.message || 'Server error', 500);
  }
};

const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5000),
    httpOnly: true,
  });
  return sendSuccess(res, {}, 'Logged out successfully');
};

module.exports = { register, login, getMe, logout };