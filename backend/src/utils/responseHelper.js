const jwt = require('jsonwebtoken');

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
    success:    true,
    count:      data.length,
    total,
    page:       Number(page),
    totalPages: Math.ceil(total / limit),
    data,
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  const cookieOptions = {
    expires:  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure:   false,
    sameSite: 'lax',
  };

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpire;

  // Express v5 fix — set cookie separately, then send json
  res.cookie('token', token, cookieOptions);
  res.status(statusCode).json({
    success: true,
    token,
    user: userObj,
  });
};

module.exports = { sendSuccess, sendError, sendPaginated, sendTokenResponse };
