const { body, param, query, validationResult } = require('express-validator');
const {
  OPPORTUNITY_TYPES,
  OPPORTUNITY_CATEGORIES,
  CITIES,
  DEGREE_LEVELS,
} = require('../config/constants');

const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors:  errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const register = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Za-z]/).withMessage('Password must contain at least one letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),

  body('role')
    .optional()
    .isIn(['student', 'organizer']).withMessage("Role must be 'student' or 'organizer'"),

  body('university')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }).withMessage('University name cannot exceed 100 characters'),

  body('degreeLevel')
    .optional({ nullable: true })
    .isIn([...DEGREE_LEVELS, null])
    .withMessage(`degreeLevel must be one of: ${DEGREE_LEVELS.join(', ')}`),

  body('organizerProfile.organizationName')
    .if(body('role').equals('organizer'))
    .notEmpty().withMessage('Organization name is required for organizer accounts')
    .trim()
    .isLength({ max: 120 }).withMessage('Organization name cannot exceed 120 characters'),

  // ── Email domain: any .edu domain is always allowed ──────────────────────
  body('organizerProfile.emailDomain')
    .optional({ nullable: true })
    .trim()
    .custom((value) => {
      if (!value) return true;

      // Any .edu domain is always allowed (lhr.nu.edu.pk, fast.edu.pk, mit.edu etc.)
      if (value.includes('.edu')) return true;

      // Other accepted domains
      const ACCEPTED = ['.org', '.gov', '.com', '.net', '.pk', '.io', '.ac'];
      if (ACCEPTED.some(ext => value.includes(ext))) return true;

      throw new Error('Domain must be .edu, .org, .gov, .com, .net, .pk or .ac');
    }),

  runValidation,
];

const login = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),

  runValidation,
];

const createOpportunity = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 120 }).withMessage('Title cannot exceed 120 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 50, max: 5000 }).withMessage('Description must be 50–5000 characters'),

  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Short description cannot exceed 200 characters'),

  body('type')
    .notEmpty().withMessage('Opportunity type is required')
    .isIn(OPPORTUNITY_TYPES)
    .withMessage(`Type must be one of: ${OPPORTUNITY_TYPES.join(', ')}`),

  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(OPPORTUNITY_CATEGORIES)
    .withMessage(`Category must be one of: ${OPPORTUNITY_CATEGORIES.join(', ')}`),

  body('deadline')
    .notEmpty().withMessage('Deadline is required')
    .isISO8601().withMessage('Deadline must be a valid date (ISO 8601)')
    .custom((val) => {
      if (new Date(val) <= new Date()) throw new Error('Deadline must be in the future');
      return true;
    }),

  body('eventDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('eventDate must be a valid ISO 8601 date'),

  body('registrationLink')
    .notEmpty().withMessage('Registration link is required')
    .isURL({ require_protocol: true }).withMessage('Registration link must be a valid URL'),

  body('websiteLink')
    .optional({ nullable: true })
    .isURL({ require_protocol: true }).withMessage('Website link must be a valid URL'),

  body('city')
    .optional()
    .isIn(CITIES).withMessage(`City must be one of: ${CITIES.join(', ')}`),

  body('isOnline')
    .optional()
    .isBoolean().withMessage('isOnline must be true or false'),

  body('degreeLevel')
    .optional()
    .isArray().withMessage('degreeLevel must be an array'),

  body('degreeLevel.*')
    .optional()
    .isIn([...DEGREE_LEVELS, 'open'])
    .withMessage(`Each degreeLevel must be one of: ${[...DEGREE_LEVELS, 'open'].join(', ')}`),

  body('teamSize.min')
    .optional()
    .isInt({ min: 1 }).withMessage('teamSize.min must be a positive integer'),

  body('teamSize.max')
    .optional()
    .isInt({ min: 1 }).withMessage('teamSize.max must be a positive integer'),

  body('tags')
    .optional()
    .isArray({ max: 10 }).withMessage('Tags must be an array with max 10 items'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 }).withMessage('Each tag cannot exceed 30 characters'),

  runValidation,
];

const updateOpportunity = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 120 }).withMessage('Title cannot exceed 120 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 50, max: 5000 }).withMessage('Description must be 50–5000 characters'),

  body('type')
    .optional()
    .isIn(OPPORTUNITY_TYPES)
    .withMessage(`Type must be one of: ${OPPORTUNITY_TYPES.join(', ')}`),

  body('category')
    .optional()
    .isIn(OPPORTUNITY_CATEGORIES)
    .withMessage(`Category must be one of: ${OPPORTUNITY_CATEGORIES.join(', ')}`),

  body('deadline')
    .optional()
    .isISO8601().withMessage('Deadline must be a valid date')
    .custom((val) => {
      if (new Date(val) <= new Date()) throw new Error('Deadline must be in the future');
      return true;
    }),

  body('registrationLink')
    .optional()
    .isURL({ require_protocol: true }).withMessage('Registration link must be a valid URL'),

  body('websiteLink')
    .optional({ nullable: true })
    .isURL({ require_protocol: true }).withMessage('Website link must be a valid URL'),

  body('city')
    .optional()
    .isIn(CITIES).withMessage(`City must be one of: ${CITIES.join(', ')}`),

  runValidation,
];

const reviewAction = [
  body('action')
    .notEmpty().withMessage('Action is required')
    .isIn(['approve', 'reject']).withMessage("Action must be 'approve' or 'reject'"),

  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters'),

  runValidation,
];

const updateBookmark = [
  body('applicationStatus')
    .optional()
    .isIn(['saved', 'applied', 'accepted', 'rejected'])
    .withMessage('applicationStatus must be one of: saved, applied, accepted, rejected'),

  body('notes')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),

  body('emailReminder')
    .optional()
    .isBoolean().withMessage('emailReminder must be true or false'),

  runValidation,
];

const updateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 characters'),

  body('university')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }).withMessage('University cannot exceed 100 characters'),

  body('avatar')
    .optional({ nullable: true })
    .trim()
    .isURL({ require_protocol: true }).withMessage('Avatar must be a valid URL'),

  body('degreeLevel')
    .optional({ nullable: true })
    .isIn(['undergraduate', 'graduate', 'phd', null])
    .withMessage('degreeLevel must be one of: undergraduate, graduate, phd'),

  runValidation,
];

const changePassword = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/[A-Za-z]/).withMessage('Password must contain at least one letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),

  body('confirmNewPassword')
    .notEmpty().withMessage('Password confirmation is required')
    .custom((val, { req }) => {
      if (val !== req.body.newPassword) throw new Error('Passwords do not match');
      return true;
    }),

  runValidation,
];

const objectIdParam = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} — must be a valid MongoDB ObjectId`),
  runValidation,
];

const paginationQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),

  runValidation,
];

module.exports = {
  validate: {
    register,
    login,
    createOpportunity,
    updateOpportunity,
    reviewAction,
    updateBookmark,
    updateProfile,
    changePassword,
    objectIdParam,
    paginationQuery,
  },
  runValidation,
};