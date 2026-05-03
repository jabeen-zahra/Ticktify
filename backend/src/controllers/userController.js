const User         = require('../models/User');
const emailService = require('../utils/emailService');
const { sendSuccess, sendError, sendTokenResponse } = require('../utils/responseHelper');

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -resetPasswordToken -resetPasswordExpire');
    if (!user) return sendError(res, 'User not found', 404);
    sendSuccess(res, { user });
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = {};

    if (req.body.name !== undefined) {
      if (typeof req.body.name !== 'string' || req.body.name.trim().length < 2)
        return sendError(res, 'Name must be at least 2 characters', 400);
      allowedFields.name = req.body.name.trim().slice(0, 80);
    }
    if (req.body.university !== undefined)
      allowedFields.university = req.body.university?.trim() || null;
    if (req.body.avatar !== undefined)
      allowedFields.avatar = req.body.avatar?.trim() || null;
    if (req.body.degreeLevel !== undefined && req.user.role === 'student') {
      const VALID = ['undergraduate', 'graduate', 'phd'];
      if (req.body.degreeLevel && !VALID.includes(req.body.degreeLevel))
        return sendError(res, `degreeLevel must be one of: ${VALID.join(', ')}`, 400);
      allowedFields.degreeLevel = req.body.degreeLevel || null;
    }

    if (Object.keys(allowedFields).length === 0)
      return sendError(res, 'No valid fields provided for update', 400);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: allowedFields },
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpire');

    sendSuccess(res, { user }, 'Profile updated successfully');
  } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword)
      return sendError(res, 'All three password fields are required', 400);
    if (newPassword.length < 8)
      return sendError(res, 'New password must be at least 8 characters', 400);
    if (newPassword !== confirmNewPassword)
      return sendError(res, 'New passwords do not match', 400);
    if (currentPassword === newPassword)
      return sendError(res, 'New password must be different from current password', 400);

    const user = await User.findById(req.user.id).select('+password');
    if (!user) return sendError(res, 'User not found', 404);

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return sendError(res, 'Current password is incorrect', 401);

    user.password = newPassword;
    await user.save();

    // ── Email: password changed security alert — non-blocking ─────────────
    emailService.sendPasswordChanged(user).catch(() => {});

    return sendTokenResponse(user, 200, res);
  } catch (err) { next(err); }
};

const changeEmail = async (req, res, next) => {
  try {
    const { newEmail, currentPassword } = req.body;

    if (!newEmail || !currentPassword)
      return sendError(res, 'New email and current password are required', 400);
    if (!/^\S+@\S+\.\S+$/.test(newEmail))
      return sendError(res, 'Please enter a valid email address', 400);

    const normalizedEmail = newEmail.toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: req.user.id } });
    if (existing) return sendError(res, 'This email is already in use by another account', 409);

    const user = await User.findById(req.user.id).select('+password');
    if (!user) return sendError(res, 'User not found', 404);

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return sendError(res, 'Current password is incorrect', 401);

    const oldEmail = user.email;
    user.email = normalizedEmail;
    await user.save({ validateBeforeSave: true });

    // ── Email: notify OLD address that email was changed ──────────────────
    emailService.send({
      to:      oldEmail,
      subject: '📧 Your Ticktify email address was changed',
      html: `
        <div style="font-family:sans-serif;background:#08090F;color:#F0F4FF;padding:32px;border-radius:12px;">
          <h2 style="color:#CBFF47;">Email Address Changed</h2>
          <p style="color:#8892A4;">Your Ticktify account email was changed to
            <strong style="color:#F0F4FF;">${normalizedEmail}</strong>.
          </p>
          <div style="background:#1a1025;border:1px solid rgba(255,85,85,0.2);border-radius:10px;padding:16px;margin:16px 0;">
            <p style="margin:0;color:#FF5555;font-size:13px;">
              ⚠️ If you did NOT make this change, contact
              <a href="mailto:support@ticktify.pk" style="color:#CBFF47;">support@ticktify.pk</a> immediately.
            </p>
          </div>
        </div>`,
      text: `Your Ticktify email was changed to ${normalizedEmail}. If this wasn't you, contact support@ticktify.pk immediately.`,
    }).catch(() => {});

    return sendTokenResponse(user, 200, res);
  } catch (err) { next(err); }
};

const deactivateAccount = async (req, res, next) => {
  try {
    const { currentPassword } = req.body;
    if (!currentPassword)
      return sendError(res, 'Password confirmation required to deactivate account', 400);

    const user = await User.findById(req.user.id).select('+password');
    if (!user) return sendError(res, 'User not found', 404);

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return sendError(res, 'Password is incorrect', 401);

    user.isActive = false;
    await user.save({ validateBeforeSave: false });

    // ── Email: account deactivated confirmation ────────────────────────────
    emailService.send({
      to:      user.email,
      subject: 'Your Ticktify account has been deactivated',
      html: `
        <div style="font-family:sans-serif;background:#08090F;color:#F0F4FF;padding:32px;border-radius:12px;">
          <h2 style="color:#F0F4FF;">Account Deactivated</h2>
          <p style="color:#8892A4;">
            Your Ticktify account has been deactivated as requested.
            Your data is preserved — contact
            <a href="mailto:support@ticktify.pk" style="color:#CBFF47;">support@ticktify.pk</a>
            to restore access anytime.
          </p>
        </div>`,
      text: `Your Ticktify account has been deactivated. Contact support@ticktify.pk to restore access.`,
    }).catch(() => {});

    res.cookie('token', 'none', {
      expires:  new Date(Date.now() + 5000),
      httpOnly: true,
      sameSite: 'lax',
    });

    sendSuccess(res, {}, 'Account deactivated. Contact support to restore access.');
  } catch (err) { next(err); }
};

module.exports = { getMe, updateProfile, changePassword, changeEmail, deactivateAccount };