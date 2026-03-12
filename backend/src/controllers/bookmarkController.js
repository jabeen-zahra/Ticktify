const Bookmark = require('../models/Bookmark');
const Opportunity = require('../models/Opportunity');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// ── @desc    Get all bookmarks for current student
// ── @route   GET /api/bookmarks
// ── @access  Private (student)
const getBookmarks = async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user.id })
      .populate({
        path: 'opportunity',
        select: 'title type category deadline city isOnline organizer status slug bannerImage',
        populate: { path: 'organizer', select: 'name organizerProfile.organizationName' },
      })
      .sort('-createdAt');

    sendSuccess(res, { bookmarks, count: bookmarks.length });
  } catch (err) {
    next(err);
  }
};

// ── @desc    Add a bookmark
// ── @route   POST /api/bookmarks/:opportunityId
// ── @access  Private (student)
const addBookmark = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.opportunityId);
    if (!opportunity) return sendError(res, 'Opportunity not found', 404);

    const existing = await Bookmark.findOne({
      user: req.user.id,
      opportunity: req.params.opportunityId,
    });
    if (existing) return sendError(res, 'Already bookmarked', 400);

    const bookmark = await Bookmark.create({
      user:        req.user.id,
      opportunity: req.params.opportunityId,
      emailReminder: req.body.emailReminder ?? true,
    });

    // Increment bookmark count on opportunity
    opportunity.bookmarkCount += 1;
    await opportunity.save({ validateBeforeSave: false });

    sendSuccess(res, { bookmark }, 'Bookmarked successfully', 201);
  } catch (err) {
    next(err);
  }
};

// ── @desc    Remove a bookmark
// ── @route   DELETE /api/bookmarks/:opportunityId
// ── @access  Private (student)
const removeBookmark = async (req, res, next) => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({
      user:        req.user.id,
      opportunity: req.params.opportunityId,
    });

    if (!bookmark) return sendError(res, 'Bookmark not found', 404);

    // Decrement bookmark count
    await Opportunity.findByIdAndUpdate(req.params.opportunityId, {
      $inc: { bookmarkCount: -1 },
    });

    sendSuccess(res, {}, 'Bookmark removed');
  } catch (err) {
    next(err);
  }
};

// ── @desc    Update bookmark (application status, notes)
// ── @route   PATCH /api/bookmarks/:opportunityId
// ── @access  Private (student)
const updateBookmark = async (req, res, next) => {
  try {
    const bookmark = await Bookmark.findOneAndUpdate(
      { user: req.user.id, opportunity: req.params.opportunityId },
      { $set: { applicationStatus: req.body.applicationStatus, notes: req.body.notes, emailReminder: req.body.emailReminder } },
      { new: true, runValidators: true }
    );

    if (!bookmark) return sendError(res, 'Bookmark not found', 404);
    sendSuccess(res, { bookmark });
  } catch (err) {
    next(err);
  }
};

module.exports = { getBookmarks, addBookmark, removeBookmark, updateBookmark };
