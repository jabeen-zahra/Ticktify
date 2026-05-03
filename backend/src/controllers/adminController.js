const User         = require('../models/User');
const Opportunity  = require('../models/Opportunity');
const Notification = require('../models/Notification');
const emailService = require('../utils/emailService');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { ORGANIZER_STATUS, OPPORTUNITY_STATUS } = require('../config/constants');

const getStats = async (req, res, next) => {
  try {
    const [
      totalStudents, totalOrganizers, pendingOrganizers,
      totalOpportunities, pendingListings, activeListings, totalBookmarks,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'organizer' }),
      User.countDocuments({ role: 'organizer', 'organizerProfile.status': 'pending' }),
      Opportunity.countDocuments(),
      Opportunity.countDocuments({ status: OPPORTUNITY_STATUS.PENDING }),
      Opportunity.countDocuments({ status: OPPORTUNITY_STATUS.ACTIVE }),
      Opportunity.aggregate([{ $group: { _id: null, total: { $sum: '$bookmarkCount' } } }]),
    ]);
    sendSuccess(res, {
      stats: {
        totalStudents, totalOrganizers, pendingOrganizers,
        totalOpportunities, pendingListings, activeListings,
        totalBookmarks: totalBookmarks[0]?.total || 0,
      },
    });
  } catch (err) { next(err); }
};

const getAllUsers = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
    const filter = {};
    const VALID_ROLES = ['student', 'organizer', 'admin'];
    if (req.query.role && VALID_ROLES.includes(req.query.role)) filter.role = req.query.role;
    if (req.query.search && typeof req.query.search === 'string') {
      const escaped = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 50);
      filter.$or = [
        { name:  { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
      ];
    }
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -resetPasswordToken -resetPasswordExpire')
        .sort('-createdAt').skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);
    sendSuccess(res, { users, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

const toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 'User not found', 404);
    if (user.role === 'admin') return sendError(res, 'Admin accounts cannot be deactivated', 403);
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    sendSuccess(res, { isActive: user.isActive },
      `User ${user.isActive ? 'activated' : 'deactivated'} successfully`);
  } catch (err) { next(err); }
};

const getPendingOrganizers = async (req, res, next) => {
  try {
    const organizers = await User.find({
      role: 'organizer',
      'organizerProfile.status': ORGANIZER_STATUS.PENDING,
    })
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort('createdAt').lean();
    sendSuccess(res, { organizers, count: organizers.length });
  } catch (err) { next(err); }
};

const reviewOrganizer = async (req, res, next) => {
  try {
    const { action, reason } = req.body;
    if (!['approve', 'reject'].includes(action))
      return sendError(res, "Action must be 'approve' or 'reject'", 400);

    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'organizer')
      return sendError(res, 'Organizer not found', 404);

    if (action === 'approve') {
      user.organizerProfile.status     = ORGANIZER_STATUS.APPROVED;
      user.organizerProfile.verifiedAt = new Date();
      user.organizerProfile.verifiedBy = req.user.id;
    } else {
      user.organizerProfile.status = ORGANIZER_STATUS.REJECTED;
    }
    await user.save({ validateBeforeSave: false });

    // In-app notification
    await Notification.create({
      user:    user._id,
      type:    action === 'approve' ? 'organizer_approved' : 'organizer_rejected',
      title:   action === 'approve' ? '🎉 Your organizer account is approved!' : 'Organizer application update',
      message: action === 'approve'
        ? 'You can now start posting opportunities on Ticktify!'
        : `Your application was not approved.${reason ? ' Reason: ' + reason : ' Contact support for details.'}`,
    });

    // Email notification — non-blocking
    if (action === 'approve') {
      emailService.sendOrganizerApproved(user).catch(() => {});
    } else {
      emailService.sendOrganizerRejected(user, reason).catch(() => {});
    }

    sendSuccess(res, { user }, `Organizer ${action}d successfully`);
  } catch (err) { next(err); }
};

const getAllListings = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
    const filter = {};
    const VALID_STATUSES = Object.values(OPPORTUNITY_STATUS);
    if (req.query.status && VALID_STATUSES.includes(req.query.status)) filter.status = req.query.status;
    const VALID_TYPES = ['event', 'competition', 'scholarship', 'workshop'];
    if (req.query.type && VALID_TYPES.includes(req.query.type)) filter.type = req.query.type;
    const skip = (page - 1) * limit;
    const [listings, total] = await Promise.all([
      Opportunity.find(filter)
        .populate('organizer', 'name email organizerProfile.organizationName')
        .sort('-createdAt').skip(skip).limit(limit).lean(),
      Opportunity.countDocuments(filter),
    ]);
    sendSuccess(res, { listings, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

const getPendingListings = async (req, res, next) => {
  try {
    const listings = await Opportunity.find({ status: OPPORTUNITY_STATUS.PENDING })
      .populate('organizer', 'name email organizerProfile')
      .sort('createdAt').lean();
    sendSuccess(res, { listings, count: listings.length });
  } catch (err) { next(err); }
};

const reviewListing = async (req, res, next) => {
  try {
    const { action, reason } = req.body;
    if (!['approve', 'reject'].includes(action))
      return sendError(res, "Action must be 'approve' or 'reject'", 400);

    const listing = await Opportunity.findById(req.params.id)
      .populate('organizer', 'name email _id organizerProfile');
    if (!listing) return sendError(res, 'Listing not found', 404);

    listing.status = action === 'approve' ? OPPORTUNITY_STATUS.ACTIVE : OPPORTUNITY_STATUS.REJECTED;
    if (action === 'reject') listing.rejectionReason = reason || null;
    await listing.save({ validateBeforeSave: false });

    // In-app notification
    await Notification.create({
      user:     listing.organizer._id,
      type:     action === 'approve' ? 'listing_approved' : 'listing_rejected',
      title:    action === 'approve'
        ? `✅ "${listing.title}" is now live!`
        : 'Listing not approved',
      message:  action === 'approve'
        ? 'Your listing is now visible to students across Pakistan.'
        : `"${listing.title}" was not approved.${reason ? ' Reason: ' + reason : ''}`,
      refModel: 'Opportunity',
      refId:    listing._id,
    });

    // Email notification — non-blocking
    if (action === 'approve') {
      emailService.sendListingApproved(listing.organizer, listing).catch(() => {});
    } else {
      emailService.sendListingRejected(listing.organizer, listing, reason).catch(() => {});
    }

    sendSuccess(res, { listing }, `Listing ${action}d successfully`);
  } catch (err) { next(err); }
};

const toggleFeatured = async (req, res, next) => {
  try {
    const listing = await Opportunity.findById(req.params.id);
    if (!listing) return sendError(res, 'Listing not found', 404);
    listing.isFeatured    = !listing.isFeatured;
    listing.featuredUntil = listing.isFeatured
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null;
    await listing.save({ validateBeforeSave: false });
    sendSuccess(res, { isFeatured: listing.isFeatured },
      `Listing ${listing.isFeatured ? 'featured' : 'unfeatured'} successfully`);
  } catch (err) { next(err); }
};

const archiveListing = async (req, res, next) => {
  try {
    const listing = await Opportunity.findByIdAndUpdate(
      req.params.id, { status: OPPORTUNITY_STATUS.ARCHIVED }, { new: true }
    );
    if (!listing) return sendError(res, 'Listing not found', 404);
    sendSuccess(res, { listing }, 'Listing archived successfully');
  } catch (err) { next(err); }
};

module.exports = {
  getStats, getAllUsers, toggleUserActive,
  getPendingOrganizers, reviewOrganizer,
  getAllListings, getPendingListings, reviewListing,
  toggleFeatured, archiveListing,
};