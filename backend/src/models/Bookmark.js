const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      required: true,
    },
    // Student marks their own application progress
    applicationStatus: {
      type: String,
      enum: ['saved', 'applied', 'accepted', 'rejected'],
      default: 'saved',
    },
    // Receive email reminder 3 days before deadline
    emailReminder: {
      type: Boolean,
      default: true,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      maxlength: 500,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Prevent duplicate bookmarks ───────────────────────────────────────────────
bookmarkSchema.index({ user: 1, opportunity: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
