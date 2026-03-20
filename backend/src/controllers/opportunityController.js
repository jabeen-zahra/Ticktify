const Opportunity = require('../models/Opportunity');
const { sendSuccess, sendError, sendPaginated } = require('../utils/responseHelper');
const { DEFAULT_PAGE_SIZE, OPPORTUNITY_STATUS } = require('../config/constants');

// ── GET /api/opportunities — public browsing ──────────────────────────────────
const getOpportunities = async (req, res) => {
  try {
    const {
      type, category, city, degreeLevel, isOnline,
      search, isFeatured, page = 1, limit = DEFAULT_PAGE_SIZE,
      sort = '-createdAt',
    } = req.query;

    const filter = { status: OPPORTUNITY_STATUS.ACTIVE };

    if (type)        filter.type     = type;
    if (category)    filter.category = category;
    if (city)        filter.city     = city;
    if (isOnline !== undefined) filter.isOnline = isOnline === 'true';
    if (isFeatured === 'true')  filter.isFeatured = true;
    if (degreeLevel) filter.degreeLevel = { $in: [degreeLevel, 'open'] };
    if (search)      filter.$text    = { $search: search };

    // Only show non-expired
    filter.deadline = { $gte: new Date() };

    const skip = (Number(page) - 1) * Number(limit);
    const [opportunities, total] = await Promise.all([
      Opportunity.find(filter)
        .populate('organizer', 'name organizerProfile.organizationName')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Opportunity.countDocuments(filter),
    ]);

    sendPaginated(res, opportunities, page, limit, total);
  } catch (err) { return sendError(res, err.message, 500); }
};

// ── GET /api/opportunities/featured ──────────────────────────────────────────
const getFeatured = async (req, res) => {
  try {
    const opportunities = await Opportunity.find({
      status: OPPORTUNITY_STATUS.ACTIVE,
      isFeatured: true,
      deadline: { $gte: new Date() },
    })
      .populate('organizer', 'name organizerProfile.organizationName')
      .sort('-createdAt')
      .limit(6)
      .lean();
    sendSuccess(res, { opportunities });
  } catch (err) { return sendError(res, err.message, 500); }
};

// ── GET /api/opportunities/my — organizer's own listings ─────────────────────
const getMyOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.find({ organizer: req.user.id })
      .sort('-createdAt').lean();
    sendSuccess(res, { opportunities, count: opportunities.length });
  } catch (err) { return sendError(res, err.message, 500); }
};

// ── GET /api/opportunities/:id ────────────────────────────────────────────────
const getOpportunity = async (req, res) => {
  try {
    const query = req.params.id.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: req.params.id }
      : { slug: req.params.id };

    const opportunity = await Opportunity.findOne(query)
      .populate('organizer', 'name email organizerProfile');

    if (!opportunity) return sendError(res, 'Opportunity not found', 404);

    opportunity.viewCount += 1;
    await opportunity.save({ validateBeforeSave: false });

    sendSuccess(res, { opportunity });
  } catch (err) { return sendError(res, err.message, 500); }
};

// ── POST /api/opportunities ───────────────────────────────────────────────────
const createOpportunity = async (req, res) => {
  try {
    const isFirstTime = req.user.organizerProfile?.isFirstTimePoster;
    const opportunity = await Opportunity.create({
      ...req.body,
      organizer: req.user.id,
      status: isFirstTime ? OPPORTUNITY_STATUS.PENDING : OPPORTUNITY_STATUS.ACTIVE,
    });

    if (isFirstTime) {
      const User = require('../models/User');
      await User.findByIdAndUpdate(req.user.id,
        { 'organizerProfile.isFirstTimePoster': false });
    }

    sendSuccess(res, { opportunity }, 'Opportunity created', 201);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map(e => e.message).join(', ');
      return sendError(res, msg, 400);
    }
    return sendError(res, err.message, 500);
  }
};

// ── PUT /api/opportunities/:id ────────────────────────────────────────────────
const updateOpportunity = async (req, res) => {
  try {
    let opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return sendError(res, 'Opportunity not found', 404);
    if (opportunity.organizer.toString() !== req.user.id && req.user.role !== 'admin')
      return sendError(res, 'Not authorized', 403);

    delete req.body.organizer;
    opportunity = await Opportunity.findByIdAndUpdate(req.params.id, req.body,
      { new: true, runValidators: true });

    sendSuccess(res, { opportunity }, 'Opportunity updated');
  } catch (err) { return sendError(res, err.message, 500); }
};

// ── DELETE /api/opportunities/:id (soft archive) ──────────────────────────────
const archiveOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return sendError(res, 'Opportunity not found', 404);
    if (opportunity.organizer.toString() !== req.user.id && req.user.role !== 'admin')
      return sendError(res, 'Not authorized', 403);

    opportunity.status = OPPORTUNITY_STATUS.ARCHIVED;
    await opportunity.save({ validateBeforeSave: false });
    sendSuccess(res, {}, 'Opportunity archived');
  } catch (err) { return sendError(res, err.message, 500); }
};

module.exports = {
  getOpportunities, getFeatured, getMyOpportunities,
  getOpportunity, createOpportunity, updateOpportunity, archiveOpportunity,
};
