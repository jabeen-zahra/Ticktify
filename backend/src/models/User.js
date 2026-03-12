const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES, ORGANIZER_STATUS } = require('../config/constants');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never return password in queries by default
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.STUDENT,
    },
    avatar: {
      type: String,
      default: null,
    },
    university: {
      type: String,
      trim: true,
      default: null,
    },
    degreeLevel: {
      type: String,
      enum: ['undergraduate', 'graduate', 'phd', null],
      default: null,
    },

    // ── Organizer-specific fields ──────────────────────────────────────────
    organizerProfile: {
      organizationName: { type: String, trim: true },
      emailDomain:      { type: String, trim: true },   // e.g. "fast.edu.pk"
      website:          { type: String, trim: true },
      description:      { type: String, trim: true },
      status:           {
        type: String,
        enum: Object.values(ORGANIZER_STATUS),
        default: ORGANIZER_STATUS.PENDING,
      },
      verifiedAt:       { type: Date, default: null },
      verifiedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      isFirstTimePoster: { type: Boolean, default: true }, // Require approval for first post
    },

    // ── OAuth ──────────────────────────────────────────────────────────────
    googleId: {
      type: String,
      default: null,
    },

    // ── Account state ─────────────────────────────────────────────────────
    isActive:   { type: Boolean, default: true },
    lastLogin:  { type: Date, default: null },

    // ── Password reset ────────────────────────────────────────────────────
    resetPasswordToken:   String,
    resetPasswordExpire:  Date,
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// ── Hash password before saving ───────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare password ────────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ── Virtual: isOrganizer ──────────────────────────────────────────────────────
userSchema.virtual('isApprovedOrganizer').get(function () {
  return (
    this.role === 'organizer' &&
    this.organizerProfile?.status === ORGANIZER_STATUS.APPROVED
  );
});

module.exports = mongoose.model('User', userSchema);
