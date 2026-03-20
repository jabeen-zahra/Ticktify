const Opportunity = require('../models/Opportunity');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { OPPORTUNITY_STATUS } = require('../config/constants');

// ── GET /api/organizer/profile ────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    sendSuccess(res, { user });
  } catch (err) { return sendError(res, err.message, 500); }
};

// ── PUT /api/organizer/profile ────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { organizationName, emailDomain, website, description } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: {
        'organizerProfile.organizationName': organizationName,
        'organizerProfile.emailDomain':      emailDomain,
        'organizerProfile.website':          website,
        'organizerProfile.description':      description,
      }},
      { new: true, runValidators: true }
    ).select('-password');
    sendSuccess(res, { user }, 'Profile updated');
  } catch (err) { return sendError(res, err.message, 500); }
};

// ── GET /api/organizer/stats ──────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const [total, active, pending, archived, totalBookmarks, totalViews] = await Promise.all([
      Opportunity.countDocuments({ organizer: req.user.id }),
      Opportunity.countDocuments({ organizer: req.user.id, status: OPPORTUNITY_STATUS.ACTIVE }),
      Opportunity.countDocuments({ organizer: req.user.id, status: OPPORTUNITY_STATUS.PENDING }),
      Opportunity.countDocuments({ organizer: req.user.id, status: OPPORTUNITY_STATUS.ARCHIVED }),
      Opportunity.aggregate([
        { $match: { organizer: req.user._id } },
        { $group: { _id: null, total: { $sum: '$bookmarkCount' } } }
      ]),
      Opportunity.aggregate([
        { $match: { organizer: req.user._id } },
        { $group: { _id: null, total: { $sum: '$viewCount' } } }
      ]),
    ]);
    sendSuccess(res, {
      stats: {
        total, active, pending, archived,
        totalBookmarks: totalBookmarks[0]?.total || 0,
        totalViews:     totalViews[0]?.total || 0,
      }
    });
  } catch (err) { return sendError(res, err.message, 500); }
};

// ── GET /api/organizer/listings ───────────────────────────────────────────────
const getListings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { organizer: req.user.id };
    if (status) filter.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [listings, total] = await Promise.all([
      Opportunity.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)).lean(),
      Opportunity.countDocuments(filter),
    ]);
    sendSuccess(res, { listings, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) { return sendError(res, err.message, 500); }
};

// ── POST /api/organizer/listings ──────────────────────────────────────────────
const createListing = async (req, res) => {
  try {
    const isFirstTime = req.user.organizerProfile?.isFirstTimePoster !== false;
    const listing = await Opportunity.create({
      ...req.body,
      organizer: req.user.id,
      status: isFirstTime ? OPPORTUNITY_STATUS.PENDING : OPPORTUNITY_STATUS.ACTIVE,
    });
    if (isFirstTime) {
      await User.findByIdAndUpdate(req.user.id,
        { 'organizerProfile.isFirstTimePoster': false });
    }
    const msg = isFirstTime
      ? 'Listing submitted for review — usually approved within 24 hours.'
      : 'Listing published successfully!';
    sendSuccess(res, { listing }, msg, 201);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return sendError(res, Object.values(err.errors).map(e => e.message).join(', '), 400);
    }
    return sendError(res, err.message, 500);
  }
};

// ── PUT /api/organizer/listings/:id ──────────────────────────────────────────
const updateListing = async (req, res) => {
  try {
    const listing = await Opportunity.findOne({ _id: req.params.id, organizer: req.user.id });
    if (!listing) return sendError(res, 'Listing not found', 404);
    if (listing.status === OPPORTUNITY_STATUS.ARCHIVED)
      return sendError(res, 'Cannot edit an archived listing', 400);

    delete req.body.organizer;
    delete req.body.status;

    const updated = await Opportunity.findByIdAndUpdate(req.params.id, req.body,
      { new: true, runValidators: true });
    sendSuccess(res, { listing: updated }, 'Listing updated');
  } catch (err) { return sendError(res, err.message, 500); }
};

// ── DELETE /api/organizer/listings/:id (soft archive) ────────────────────────
const archiveListing = async (req, res) => {
  try {
    const listing = await Opportunity.findOne({ _id: req.params.id, organizer: req.user.id });
    if (!listing) return sendError(res, 'Listing not found', 404);
    listing.status = OPPORTUNITY_STATUS.ARCHIVED;
    await listing.save({ validateBeforeSave: false });
    sendSuccess(res, {}, 'Listing archived');
  } catch (err) { return sendError(res, err.message, 500); }
};

module.exports = { getProfile, updateProfile, getStats, getListings, createListing, updateListing, archiveListing };
