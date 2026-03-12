const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['deadline_reminder', 'new_opportunity', 'organizer_approved', 'organizer_rejected', 'listing_approved', 'listing_rejected'],
      required: true,
    },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    link:    { type: String, default: null },     // Frontend route to navigate to
    isRead:  { type: Boolean, default: false },
    // Reference to related document (optional)
    refModel: { type: String, enum: ['Opportunity', 'User', null], default: null },
    refId:    { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
