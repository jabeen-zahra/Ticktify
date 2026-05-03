const mongoose = require('mongoose');
const { NOTIFICATION_TYPES } = require('../config/constants');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },
    type: {
      type:     String,
      enum:     Object.values(NOTIFICATION_TYPES),
      required: true,
    },
    title:   { type: String, required: true, maxlength: 120 },
    message: { type: String, required: true, maxlength: 500 },
    link:    { type: String, default: null },
    isRead:  { type: Boolean, default: false },
    refModel: {
      type:    String,
      enum:    ['Opportunity', 'User', null],
      default: null,
    },
    refId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
// Auto-delete notifications older than 90 days
notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 }
);

module.exports = mongoose.model('Notification', notificationSchema);