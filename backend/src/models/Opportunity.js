const mongoose = require('mongoose');
const {
  OPPORTUNITY_TYPES,
  OPPORTUNITY_CATEGORIES,
  DEGREE_LEVELS,
  CITIES,
  OPPORTUNITY_STATUS,
} = require('../config/constants');

const opportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    shortDescription: {
      type: String,
      maxlength: [200, 'Short description cannot exceed 200 characters'],
    },

    // ── Classification ─────────────────────────────────────────────────────
    type: {
      type: String,
      enum: OPPORTUNITY_TYPES,
      required: [true, 'Opportunity type is required'],
    },
    category: {
      type: String,
      enum: OPPORTUNITY_CATEGORIES,
      required: [true, 'Category is required'],
    },
    tags: [{ type: String, lowercase: true, trim: true }],

    // ── Dates ──────────────────────────────────────────────────────────────
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    eventDate: {
      type: Date,   // For events/workshops — when it actually happens
      default: null,
    },
    eventEndDate: {
      type: Date,
      default: null,
    },

    // ── Location ───────────────────────────────────────────────────────────
    isOnline: {
      type: Boolean,
      default: false,
    },
    city: {
      type: String,
      enum: CITIES,
      default: 'online',
    },
    venue: {
      type: String,
      trim: true,
      default: null,
    },

    // ── Eligibility ────────────────────────────────────────────────────────
    degreeLevel: {
      type: [String],
      enum: [...DEGREE_LEVELS, 'open'],
      default: ['open'],
    },
    teamSize: {
      min: { type: Number, default: 1 },
      max: { type: Number, default: 1 },
    },

    // ── Links ──────────────────────────────────────────────────────────────
    registrationLink: {
      type: String,
      required: [true, 'Registration link is required'],
      trim: true,
    },
    websiteLink: {
      type: String,
      trim: true,
      default: null,
    },
    bannerImage: {
      type: String,
      default: null,
    },

    // ── Organizer ──────────────────────────────────────────────────────────
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ── Prizes / Funding ───────────────────────────────────────────────────
    prize: {
      type: String,
      trim: true,
      default: null,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    featuredUntil: {
      type: Date,
      default: null,
    },

    // ── Status & Moderation ────────────────────────────────────────────────
    status: {
      type: String,
      enum: Object.values(OPPORTUNITY_STATUS),
      default: OPPORTUNITY_STATUS.PENDING,
    },
    rejectionReason: {
      type: String,
      default: null,
    },

    // ── Metrics ────────────────────────────────────────────────────────────
    viewCount:     { type: Number, default: 0 },
    bookmarkCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON:    { virtuals: true },
    toObject:  { virtuals: true },
  }
);

// ── Indexes for common queries ────────────────────────────────────────────────
opportunitySchema.index({ status: 1, deadline: 1 });
opportunitySchema.index({ type: 1, category: 1 });
opportunitySchema.index({ organizer: 1 });
opportunitySchema.index({ isFeatured: 1 });
opportunitySchema.index({ title: 'text', description: 'text', tags: 'text' }); // Full-text search

// ── Auto-generate slug from title ─────────────────────────────────────────────
opportunitySchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() + '-' + Date.now();
  }
  next();
});

// ── Virtual: isExpired ────────────────────────────────────────────────────────
opportunitySchema.virtual('isExpired').get(function () {
  return this.deadline < new Date();
});

// ── Virtual: daysUntilDeadline ────────────────────────────────────────────────
opportunitySchema.virtual('daysUntilDeadline').get(function () {
  const diff = this.deadline - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Opportunity', opportunitySchema);
