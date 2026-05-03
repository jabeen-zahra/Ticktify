const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');
const { ROLES, ORGANIZER_STATUS } = require('../config/constants');

const userSchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  [true, 'Name is required'],
      trim:      true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
      match:     [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type:      String,
      minlength: [8, 'Password must be at least 8 characters'],
      select:    false,
    },
    role: {
      type:    String,
      enum:    Object.values(ROLES),
      default: ROLES.STUDENT,
    },
    avatar:     { type: String, default: null },
    university: { type: String, trim: true, default: null },
    degreeLevel: {
      type:    String,
      enum:    ['undergraduate', 'graduate', 'phd', null],
      default: null,
    },

    organizerProfile: {
      organizationName:  { type: String, trim: true },
      emailDomain:       { type: String, trim: true, lowercase: true },
      website:           { type: String, trim: true },
      description:       { type: String, trim: true },
      status: {
        type:    String,
        enum:    Object.values(ORGANIZER_STATUS),
        default: ORGANIZER_STATUS.PENDING,
      },
      verifiedAt:        { type: Date, default: null },
      verifiedBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      isFirstTimePoster: { type: Boolean, default: true },
    },

    googleId:  { type: String, default: null },
    isActive:  { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },

    resetPasswordToken:  { type: String, select: false },
    resetPasswordExpire: { type: Date,   select: false },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });
userSchema.index({ 'organizerProfile.status': 1 });
userSchema.index({ isActive: 1 });

// ── Password hashing — sync to avoid bcryptjs v3 async API changes ────────────
userSchema.pre('save', function () {
  if (!this.isModified('password')) return;
  this.password = bcrypt.hashSync(this.password, 12);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compareSync(enteredPassword, this.password);
};

userSchema.methods.generatePasswordResetToken = function () {
  const rawToken    = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  this.resetPasswordToken  = hashedToken;
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  return rawToken;
};

userSchema.virtual('isApprovedOrganizer').get(function () {
  return (
    this.role === 'organizer' &&
    this.organizerProfile?.status === ORGANIZER_STATUS.APPROVED
  );
});

module.exports = mongoose.model('User', userSchema);