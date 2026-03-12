const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { ORGANIZER_STATUS, OPPORTUNITY_STATUS } = require('../config/constants');

// ── @desc    Get dashboard stats
// ── @route   GET /api/admin/stats
// ── @access  Admin
const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalOrganizers, pendingOrganizers, totalOpportunities, pendingListings, activeListings] =
      await Promise.all([
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'organizer' }),
        User.countDocuments({ role: 'organizer', 'organizerProfile.status': 'pending' }),
        Opportunity.countDocuments(),
        Opportunity.countDocuments({ status: OPPORTUNITY_STATUS.PENDING }),
        Opportunity.countDocuments({ status: OPPORTUNITY_STATUS.ACTIVE }),
      ]);

    sendSuccess(res, {
      stats: { totalUsers, totalOrganizers, pendingOrganizers, totalOpportunities, pendingListings, activeListings },
    });
  } catch (err) {
    next(err);
  }
};

// ── @desc    Get all pending organizer applications
// ── @route   GET /api/admin/organizers/pending
// ── @access  Admin
const getPendingOrganizers = async (req, res, next) => {
  try {
    const organizers = await User.find({
      role: 'organizer',
      'organizerProfile.status': ORGANIZER_STATUS.PENDING,
    }).sort('createdAt');
    sendSuccess(res, { organizers, count: organizers.length });
  } catch (err) {
    next(err);
  }
};

// ── @desc    Approve or reject an organizer
// ── @route   PATCH /api/admin/organizers/:id/review
// ── @access  Admin
const reviewOrganizer = async (req, res, next) => {
  try {
    const { action, reason } = req.body; // action: 'approve' | 'reject'
    if (!['approve', 'reject'].includes(action)) {
      return sendError(res, 'Action must be approve or reject', 400);
    }

    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'organizer') {
      return sendError(res, 'Organizer not found', 404);
    }

    user.organizerProfile.status = action === 'approve'
      ? ORGANIZER_STATUS.APPROVED
      : ORGANIZER_STATUS.REJECTED;

    if (action === 'approve') {
      user.organizerProfile.verifiedAt = new Date();
      user.organizerProfile.verifiedBy = req.user.id;
    }

    await user.save();

    // Create in-app notification for the organizer
    await Notification.create({
      user:     user._id,
      type:     action === 'approve' ? 'organizer_approved' : 'organizer_rejected',
      title:    action === 'approve' ? 'Your organizer account is approved!' : 'Organizer application update',
      message:  action === 'approve'
        ? 'You can now start posting opportunities on Tictify.'
        : `Your application was not approved. Reason: ${reason || 'Not specified'}`,
    });

    sendSuccess(res, { user }, `Organizer ${action}d successfully`);
  } catch (err) {
    next(err);
  }
};

// ── @desc    Get all pending opportunity listings
// ── @route   GET /api/admin/listings/pending
// ── @access  Admin
const getPendingListings = async (req, res, next) => {
  try {
    const listings = await Opportunity.find({ status: OPPORTUNITY_STATUS.PENDING })
      .populate('organizer', 'name email organizerProfile')
      .sort('createdAt');
    sendSuccess(res, { listings, count: listings.length });
  } catch (err) {
    next(err);
  }
};

// ── @desc    Approve or reject a listing
// ── @route   PATCH /api/admin/listings/:id/review
// ── @access  Admin
const reviewListing = async (req, res, next) => {
  try {
    const { action, reason } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      return sendError(res, 'Action must be approve or reject', 400);
    }

    const listing = await Opportunity.findById(req.params.id).populate('organizer');
    if (!listing) return sendError(res, 'Listing not found', 404);

    listing.status = action === 'approve'
      ? OPPORTUNITY_STATUS.ACTIVE
      : OPPORTUNITY_STATUS.REJECTED;

    if (action === 'reject') listing.rejectionReason = reason || null;
    await listing.save();

    // Notify the organizer
    await Notification.create({
      user:     listing.organizer._id,
      type:     action === 'approve' ? 'listing_approved' : 'listing_rejected',
      title:    action === 'approve' ? `"${listing.title}" is now live!` : `Listing not approved`,
      message:  action === 'approve'
        ? 'Your opportunity listing has been approved and is now visible to students.'
        : `Your listing "${listing.title}" was rejected. Reason: ${reason || 'Not specified'}`,
      link:     `/opportunities/${listing.slug}`,
      refModel: 'Opportunity',
      refId:    listing._id,
    });

    sendSuccess(res, { listing }, `Listing ${action}d`);
  } catch (err) {
    next(err);
  }
};

// ── @desc    Toggle featured status of a listing
// ── @route   PATCH /api/admin/listings/:id/feature
// ── @access  Admin
const toggleFeatured = async (req, res, next) => {
  try {
    const listing = await Opportunity.findById(req.params.id);
    if (!listing) return sendError(res, 'Listing not found', 404);

    listing.isFeatured  = !listing.isFeatured;
    listing.featuredUntil = listing.isFeatured
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      : null;

    await listing.save();
    sendSuccess(res, { isFeatured: listing.isFeatured }, `Listing ${listing.isFeatured ? 'featured' : 'unfeatured'}`);
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats, getPendingOrganizers, reviewOrganizer, getPendingListings, reviewListing, toggleFeatured };
