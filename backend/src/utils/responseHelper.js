/**
 * Standard API response format for Tictify.
 * All controllers use these helpers for consistency.
 */

const sendSuccess = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
};

const sendError = (res, message = 'Something went wrong', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

const sendPaginated = (res, data, page, limit, total) => {
  return res.status(200).json({
    success: true,
    count:      data.length,
    total,
    page:       Number(page),
    totalPages: Math.ceil(total / limit),
    data,
  });
};

/**
 * Generate JWT and set as cookie + return token
 */
const sendTokenResponse = (user, statusCode, res) => {
  const jwt = require('jsonwebtoken');

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

  const cookieOptions = {
    expires: new Date(
      Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRE) || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.cookie('token', token, cookieOptions);

  // Remove sensitive fields before sending
  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpire;

  return res.status(statusCode).json({
    success: true,
    token,
    user: userObj,
  });
};

module.exports = { sendSuccess, sendError, sendPaginated, sendTokenResponse };
