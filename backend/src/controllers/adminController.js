const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { ORGANIZER_STATUS, OPPORTUNITY_STATUS } = require('../config/constants');

// ── Stats ─────────────────────────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalOrganizers, pendingOrganizers,
           totalOpportunities, pendingListings, activeListings] = await Promise.all([
      User.countDocuments({ role:'student' }),
      User.countDocuments({ role:'organizer' }),
      User.countDocuments({ role:'organizer', 'organizerProfile.status':'pending' }),
      Opportunity.countDocuments(),
      Opportunity.countDocuments({ status:OPPORTUNITY_STATUS.PENDING }),
      Opportunity.countDocuments({ status:OPPORTUNITY_STATUS.ACTIVE }),
    ]);
    sendSuccess(res, { stats:{ totalUsers, totalOrganizers, pendingOrganizers, totalOpportunities, pendingListings, activeListings } });
  } catch (err) { return sendError(res, err.message, 500); }
};

// ── All Users ─────────────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { page=1, limit=20, role, search } = req.query;
    const filter = {};
    if (role)   filter.role = role;
    if (search) filter.$or = [
      { name:  { $regex: search, $options:'i' } },
      { email: { $regex: search, $options:'i' } },
    ];
    const skip = (Number(page)-1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort('-createdAt').skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ]);
    sendSuccess(res, { users, total, page:Number(page), totalPages:Math.ceil(total/Number(limit)) });
  } catch (err) { return sendError(res, err.message, 500); }
};

// ── Toggle User Active ────────────────────────────────────────────────────────
const toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 'User not found', 404);
    if (user.role === 'admin') return sendError(res, 'Cannot deactivate admin', 403);
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave:false });
    sendSuccess(res, { isActive:user.isActive }, `User ${user.isActive?'activated':'deactivated'}`);
  } catch (err) { return sendError(res, err.message, 500); }
};

// ── Pending Organizers ────────────────────────────────────────────────────────
const getPendingOrganizers = async (req, res) => {
  try {
    const organizers = await User.find({ role:'organizer', 'organizerProfile.status':ORGANIZER_STATUS.PENDING })
      .select('-password').sort('createdAt');
    sendSuccess(res, { organizers, count:organizers.length });
  } catch (err) { return sendError(res, err.message, 500); }
};

// ── Review Organizer ──────────────────────────────────────────────────────────
const reviewOrganizer = async (req, res) => {
  try {
    const { action, reason } = req.body;
    if (!['approve','reject'].includes(action)) return sendError(res, 'Action must be approve or reject', 400);
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'organizer') return sendError(res, 'Organizer not found', 404);

    user.organizerProfile.status = action === 'approve' ? ORGANIZER_STATUS.APPROVED : ORGANIZER_STATUS.REJECTED;
    if (action === 'approve') {
      user.organizerProfile.verifiedAt = new Date();
      user.organizerProfile.verifiedBy = req.user.id;
    }
    await user.save({ validateBeforeSave:false });

    await Notification.create({
      user: user._id,
      type: action === 'approve' ? 'organizer_approved' : 'organizer_rejected',
      title: action === 'approve' ? 'Your organizer account is approved!' : 'Organizer application update',
      message: action === 'approve'
        ? 'You can now start posting opportunities on Tictify.'
        : `Your application was not approved. ${reason ? 'Reason: '+reason : ''}`,
    });

    sendSuccess(res, { user }, `Organizer ${action}d successfully`);
  } catch (err) { return sendError(res, err.message, 500); }
};

// ── All Listings (admin view) ─────────────────────────────────────────────────
const getAllListings = async (req, res) => {
  try {
    const { page=1, limit=20, status, type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type)   filter.type   = type;
    const skip = (Number(page)-1) * Number(limit);
    const [listings, total] = await Promise.all([
      Opportunity.find(filter)
        .populate('organizer','name email organizerProfile')
        .sort('-createdAt').skip(skip).limit(Number(limit)),
      Opportunity.countDocuments(filter),
    ]);
    sendSuccess(res, { listings, total, page:Number(page), totalPages:Math.ceil(total/Number(limit)) });
  } catch (err) { return sendError(res, err.message, 500); }
};

// ── Pending Listings ──────────────────────────────────────────────────────────
const getPendingListings = async (req, res) => {
  try {
    const listings = await Opportunity.find({ status:OPPORTUNITY_STATUS.PENDING })
      .populate('organizer','name email organizerProfile').sort('createdAt');
    sendSuccess(res, { listings, count:listings.length });
  } catch (err) { return sendError(res, err.message, 500); }
};

// ── Review Listing ────────────────────────────────────────────────────────────
const reviewListing = async (req, res) => {
  try {
    const { action, reason } = req.body;
    if (!['approve','reject'].includes(action)) return sendError(res, 'Action must be approve or reject', 400);
    const listing = await Opportunity.findById(req.params.id).populate('organizer');
    if (!listing) return sendError(res, 'Listing not found', 404);

    listing.status = action === 'approve' ? OPPORTUNITY_STATUS.ACTIVE : OPPORTUNITY_STATUS.REJECTED;
    if (action === 'reject') listing.rejectionReason = reason || null;
    await listing.save({ validateBeforeSave:false });

    await Notification.create({
      user:     listing.organizer._id,
      type:     action === 'approve' ? 'listing_approved' : 'listing_rejected',
      title:    action === 'approve' ? `"${listing.title}" is now live!` : 'Listing not approved',
      message:  action === 'approve'
        ? 'Your listing is now visible to students.'
        : `Listing "${listing.title}" was rejected. ${reason ? 'Reason: '+reason : ''}`,
      refModel: 'Opportunity', refId: listing._id,
    });

    sendSuccess(res, { listing }, `Listing ${action}d`);
  } catch (err) { return sendError(res, err.message, 500); }
};

// ── Toggle Featured ───────────────────────────────────────────────────────────
const toggleFeatured = async (req, res) => {
  try {
    const listing = await Opportunity.findById(req.params.id);
    if (!listing) return sendError(res, 'Listing not found', 404);
    listing.isFeatured   = !listing.isFeatured;
    listing.featuredUntil = listing.isFeatured ? new Date(Date.now()+30*24*60*60*1000) : null;
    await listing.save({ validateBeforeSave:false });
    sendSuccess(res, { isFeatured:listing.isFeatured }, `Listing ${listing.isFeatured?'featured':'unfeatured'}`);
  } catch (err) { return sendError(res, err.message, 500); }
};

// ── Force Archive Listing ─────────────────────────────────────────────────────
const archiveListing = async (req, res) => {
  try {
    const listing = await Opportunity.findByIdAndUpdate(req.params.id,
      { status: OPPORTUNITY_STATUS.ARCHIVED }, { new:true });
    if (!listing) return sendError(res, 'Listing not found', 404);
    sendSuccess(res, { listing }, 'Listing archived');
  } catch (err) { return sendError(res, err.message, 500); }
};

module.exports = {
  getStats, getAllUsers, toggleUserActive,
  getPendingOrganizers, reviewOrganizer,
  getAllListings, getPendingListings, reviewListing,
  toggleFeatured, archiveListing,
};
