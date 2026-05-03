const jwt = require('jsonwebtoken');

const sendSuccess = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, ...data });
};

const sendError = (res, message = 'Something went wrong', statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message });
};

const sendPaginated = (res, data, page, limit, total) => {
  return res.status(200).json({
    success:    true,
    count:      data.length,
    total,
    page:       Number(page),
    totalPages: Math.ceil(total / limit),
    data,
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  const cookieExpireDays = parseInt(process.env.JWT_COOKIE_EXPIRE, 10) || 7;

  const cookieOptions = {
    expires:  new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpire;

  res.cookie('token', token, cookieOptions);
  return res.status(statusCode).json({ success: true, token, user: userObj });
};

module.exports = { sendSuccess, sendError, sendPaginated, sendTokenResponse };