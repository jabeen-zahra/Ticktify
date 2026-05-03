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
      type:      String,
      required:  [true, 'Title is required'],
      trim:      true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    slug:             { type: String, unique: true, lowercase: true, index: true },
    description: {
      type:      String,
      required:  [true, 'Description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    shortDescription: { type: String, maxlength: [200, 'Short description cannot exceed 200 characters'] },

    type: {
      type:     String,
      enum:     OPPORTUNITY_TYPES,
      required: [true, 'Opportunity type is required'],
    },
    category: {
      type:     String,
      enum:     OPPORTUNITY_CATEGORIES,
      required: [true, 'Category is required'],
    },
    tags: [{ type: String, lowercase: true, trim: true, maxlength: 30 }],

    deadline:     { type: Date, required: [true, 'Deadline is required'] },
    eventDate:    { type: Date, default: null },
    eventEndDate: { type: Date, default: null },

    isOnline: { type: Boolean, default: false },
    city:     { type: String, enum: CITIES, default: 'other' },
    venue:    { type: String, trim: true, default: null },

    degreeLevel: {
      type:    [String],
      enum:    [...DEGREE_LEVELS, 'open'],
      default: ['open'],
    },
    teamSize: {
      min: { type: Number, min: 1, default: 1 },
      max: { type: Number, min: 1, default: 1 },
    },

    registrationLink: {
      type:     String,
      required: [true, 'Registration link is required'],
      trim:     true,
    },
    websiteLink: { type: String, trim: true, default: null },
    bannerImage: { type: String, trim: true, default: null },

    organizer: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Organizer is required'],
      index:    true,
    },

    prize:         { type: String, trim: true, default: null },
    isFeatured:    { type: Boolean, default: false },
    featuredUntil: { type: Date, default: null },

    status: {
      type:    String,
      enum:    Object.values(OPPORTUNITY_STATUS),
      default: OPPORTUNITY_STATUS.PENDING,
    },
    rejectionReason: { type: String, default: null },

    viewCount:     { type: Number, default: 0, min: 0 },
    bookmarkCount: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON:    { virtuals: true },
    toObject:  { virtuals: true },
  }
);

opportunitySchema.index({ status: 1, deadline: 1 });
opportunitySchema.index({ status: 1, type: 1, category: 1 });
opportunitySchema.index({ status: 1, isFeatured: 1 });
opportunitySchema.index({ organizer: 1, status: 1 });
opportunitySchema.index({ createdAt: -1 });
opportunitySchema.index(
  { title: 'text', description: 'text', tags: 'text' },
  { weights: { title: 10, tags: 5, description: 1 } }
);

// ── No next parameter — fixes "next is not a function" with mongoose/express v5 
opportunitySchema.pre('save', function () {
  if (this.isModified('title') || !this.slug) {
    const base = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 60)
      .replace(/-$/, '');
    this.slug = `${base}-${Date.now()}`;
  }
  if (this.teamSize.max < this.teamSize.min) {
    this.teamSize.max = this.teamSize.min;
  }
});

opportunitySchema.virtual('isExpired').get(function () {
  return this.deadline < new Date();
});

opportunitySchema.virtual('daysUntilDeadline').get(function () {
  const diff = this.deadline - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

module.exports = mongoose.model('Opportunity', opportunitySchema);