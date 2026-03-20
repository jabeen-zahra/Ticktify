const User = require('../models/User');
const Bookmark = require('../models/Bookmark');
const Notification = require('../models/Notification');
const Opportunity = require('../models/Opportunity');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// ── GET /api/student/profile ──────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    sendSuccess(res, { user });
  } catch (err) { return sendError(res, err.message, 500); }
};

// ── PUT /api/student/profile ──────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, university, degreeLevel, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { name, university, degreeLevel, avatar } },
      { new: true, runValidators: true }
    ).select('-password');
    sendSuccess(res, { user }, 'Profile updated');
  } catch (err) { return sendError(res, err.message, 500); }
};

// ── GET /api/student/stats ────────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const [
      totalBookmarks,
      applied,
      accepted,
      urgentDeadlines,
    ] = await Promise.all([
      Bookmark.countDocuments({ user: req.user.id }),
      Bookmark.countDocuments({ user: req.user.id, applicationStatus: 'applied' }),
      Bookmark.countDocuments({ user: req.user.id, applicationStatus: 'accepted' }),
      Bookmark.countDocuments({
        user: req.user.id,
        reminderSent: false,
      }).then(async () => {
        // Count bookmarks where deadline is within 7 days
        const bookmarks = await Bookmark.find({ user: req.user.id })
          .populate('opportunity', 'deadline status');
        return bookmarks.filter(b => {
          if (!b.opportunity || b.opportunity.status !== 'active') return false;
          const days = Math.ceil((new Date(b.opportunity.deadline) - new Date()) / (1000*60*60*24));
          return days > 0 && days <= 7;
        }).length;
      }),
    ]);

    sendSuccess(res, { stats: { totalBookmarks, applied, accepted, urgentDeadlines } });
  } catch (err) { return sendError(res, err.message, 500); }
};

// ── GET /api/student/bookmarks ────────────────────────────────────────────────
const getBookmarks = async (req, res) => {
  try {
    const { applicationStatus, page = 1, limit = 12 } = req.query;
    const filter = { user: req.user.id };
    if (applicationStatus) filter.applicationStatus = applicationStatus;

    const skip = (Number(page) - 1) * Number(limit);
    const [bookmarks, total] = await Promise.all([
      Bookmark.find(filter)
        .populate({
          path: 'opportunity',
          select: 'title type category deadline city isOnline organizer status slug prize bookmarkCount isFeatured registrationLink shortDescription',
          populate: { path: 'organizer', select: 'name organizerProfile.organizationName' },
        })
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Bookmark.countDocuments(filter),
    ]);

    sendSuccess(res, {
      bookmarks,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) { return sendError(res, err.message, 500); }
};

// ── POST /api/student/bookmarks/:opportunityId ────────────────────────────────
const addBookmark = async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.opportunityId);
    if (!opp) return sendError(res, 'Opportunity not found', 404);

    const existing = await Bookmark.findOne({ user: req.user.id, opportunity: req.params.opportunityId });
    if (existing) return sendError(res, 'Already bookmarked', 400);

    const bookmark = await Bookmark.create({
      user: req.user.id,
      opportunity: req.params.opportunityId,
      emailReminder: req.body.emailReminder ?? true,
    });

    await Opportunity.findByIdAndUpdate(req.params.opportunityId, { $inc: { bookmarkCount: 1 } });
    sendSuccess(res, { bookmark }, 'Bookmarked!', 201);
  } catch (err) { return sendError(res, err.message, 500); }
};

// ── DELETE /api/student/bookmarks/:opportunityId ──────────────────────────────
const removeBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({
      user: req.user.id, opportunity: req.params.opportunityId,
    });
    if (!bookmark) return sendError(res, 'Bookmark not found', 404);
    await Opportunity.findByIdAndUpdate(req.params.opportunityId, { $inc: { bookmarkCount: -1 } });
    sendSuccess(res, {}, 'Bookmark removed');
  } catch (err) { return sendError(res, err.message, 500); }
};

// ── PATCH /api/student/bookmarks/:opportunityId ───────────────────────────────
const updateBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findOneAndUpdate(
      { user: req.user.id, opportunity: req.params.opportunityId },
      { $set: { applicationStatus: req.body.applicationStatus, notes: req.body.notes, emailReminder: req.body.emailReminder } },
      { new: true, runValidators: true }
    ).populate('opportunity', 'title type deadline');
    if (!bookmark) return sendError(res, 'Bookmark not found', 404);
    sendSuccess(res, { bookmark });
  } catch (err) { return sendError(res, err.message, 500); }
};

// ── GET /api/student/notifications ───────────────────────────────────────────
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort('-createdAt').limit(30);
    const unreadCount = await Notification.countDocuments({ user: req.user.id, isRead: false });
    sendSuccess(res, { notifications, unreadCount });
  } catch (err) { return sendError(res, err.message, 500); }
};

// ── PATCH /api/student/notifications/read-all ────────────────────────────────
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
    sendSuccess(res, {}, 'All notifications marked as read');
  } catch (err) { return sendError(res, err.message, 500); }
};

// ── PATCH /api/student/notifications/:id/read ────────────────────────────────
const markOneRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, { isRead: true }
    );
    sendSuccess(res, {}, 'Marked as read');
  } catch (err) { return sendError(res, err.message, 500); }
};

module.exports = {
  getProfile, updateProfile, getStats,
  getBookmarks, addBookmark, removeBookmark, updateBookmark,
  getNotifications, markAllRead, markOneRead,
};
