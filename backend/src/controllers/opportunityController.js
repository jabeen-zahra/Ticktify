const Opportunity = require('../models/Opportunity');
const { sendSuccess, sendError, sendPaginated } = require('../utils/responseHelper');
const { DEFAULT_PAGE_SIZE, OPPORTUNITY_STATUS } = require('../config/constants');

// ── @desc    Get all active opportunities (with filters + pagination)
// ── @route   GET /api/opportunities
// ── @access  Public
const getOpportunities = async (req, res, next) => {
  try {
    const {
      type, category, city, degreeLevel, isOnline,
      search, page = 1, limit = DEFAULT_PAGE_SIZE, sort = '-createdAt'
    } = req.query;

    const filter = { status: OPPORTUNITY_STATUS.ACTIVE };

    if (type)        filter.type = type;
    if (category)    filter.category = category;
    if (city)        filter.city = city;
    if (isOnline)    filter.isOnline = isOnline === 'true';
    if (degreeLevel) filter.degreeLevel = { $in: [degreeLevel, 'open'] };

    // Full-text search
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [opportunities, total] = await Promise.all([
      Opportunity.find(filter)
        .populate('organizer', 'name organizerProfile.organizationName organizerProfile.status')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Opportunity.countDocuments(filter),
    ]);

    sendPaginated(res, opportunities, page, limit, total);
  } catch (err) {
    next(err);
  }
};

// ── @desc    Get single opportunity by ID or slug
// ── @route   GET /api/opportunities/:id
// ── @access  Public
const getOpportunity = async (req, res, next) => {
  try {
    const query = req.params.id.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: req.params.id }
      : { slug: req.params.id };

    const opportunity = await Opportunity.findOne(query)
      .populate('organizer', 'name email organizerProfile');

    if (!opportunity) return sendError(res, 'Opportunity not found', 404);

    // Increment view count
    opportunity.viewCount += 1;
    await opportunity.save({ validateBeforeSave: false });

    sendSuccess(res, { opportunity });
  } catch (err) {
    next(err);
  }
};

// ── @desc    Create opportunity
// ── @route   POST /api/opportunities
// ── @access  Private (organizer - approved)
const createOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.create({
      ...req.body,
      organizer: req.user.id,
      // First-time organizers go to pending; approved regulars go straight to active
      status: req.user.organizerProfile?.isFirstTimePoster
        ? OPPORTUNITY_STATUS.PENDING
        : OPPORTUNITY_STATUS.ACTIVE,
    });

    // Mark organizer as no longer first-time after first post
    if (req.user.organizerProfile?.isFirstTimePoster) {
      req.user.organizerProfile.isFirstTimePoster = false;
      await req.user.save({ validateBeforeSave: false });
    }

    sendSuccess(res, { opportunity }, 'Opportunity created', 201);
  } catch (err) {
    next(err);
  }
};

// ── @desc    Update opportunity
// ── @route   PUT /api/opportunities/:id
// ── @access  Private (owner organizer or admin)
const updateOpportunity = async (req, res, next) => {
  try {
    let opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return sendError(res, 'Opportunity not found', 404);

    // Only the owner or admin can update
    if (
      opportunity.organizer.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return sendError(res, 'Not authorized to update this opportunity', 403);
    }

    // Don't allow changing organizer field
    delete req.body.organizer;

    opportunity = await Opportunity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    sendSuccess(res, { opportunity }, 'Opportunity updated');
  } catch (err) {
    next(err);
  }
};

// ── @desc    Archive opportunity (soft delete — keep history)
// ── @route   DELETE /api/opportunities/:id
// ── @access  Private (owner or admin)
const archiveOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return sendError(res, 'Opportunity not found', 404);

    if (
      opportunity.organizer.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return sendError(res, 'Not authorized', 403);
    }

    opportunity.status = OPPORTUNITY_STATUS.ARCHIVED;
    await opportunity.save();

    sendSuccess(res, {}, 'Opportunity archived');
  } catch (err) {
    next(err);
  }
};

// ── @desc    Get opportunities posted by current organizer
// ── @route   GET /api/opportunities/my
// ── @access  Private (organizer)
const getMyOpportunities = async (req, res, next) => {
  try {
    const opportunities = await Opportunity.find({ organizer: req.user.id })
      .sort('-createdAt');
    sendSuccess(res, { opportunities, count: opportunities.length });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  archiveOpportunity,
  getMyOpportunities,
};
