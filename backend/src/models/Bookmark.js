const mongoose = require('mongoose');
const { APPLICATION_STATUS } = require('../config/constants');

const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    opportunity: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Opportunity',
      required: true,
    },
    applicationStatus: {
      type:    String,
      enum:    Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.SAVED,
    },
    emailReminder: { type: Boolean, default: true },
    reminderSent:  { type: Boolean, default: false },
    notes: {
      type:      String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default:   null,
    },
  },
  { timestamps: true }
);

bookmarkSchema.index({ user: 1, opportunity: 1 }, { unique: true });
bookmarkSchema.index({ emailReminder: 1, reminderSent: 1, applicationStatus: 1 });

module.exports = mongoose.model('Bookmark', bookmarkSchema);