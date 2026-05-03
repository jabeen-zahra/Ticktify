const OPPORTUNITY_TYPES = ['event', 'competition', 'scholarship', 'workshop'];

const OPPORTUNITY_CATEGORIES = [
  'technology',
  'business',
  'design',
  'science',
  'arts',
  'social_impact',
  'research',
  'sports',
  'other',
];

// NOTE: Does NOT include 'open' — 'open' is a separate eligibility value
const DEGREE_LEVELS = ['undergraduate', 'graduate', 'phd'];

const CITIES = [
  'lahore',
  'karachi',
  'islamabad',
  'rawalpindi',
  'faisalabad',
  'peshawar',
  'quetta',
  'multan',
  'hyderabad',
  'other',
];

const ROLES = {
  STUDENT:   'student',
  ORGANIZER: 'organizer',
  ADMIN:     'admin',
};

const ORGANIZER_STATUS = {
  PENDING:  'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

const OPPORTUNITY_STATUS = {
  DRAFT:    'draft',
  PENDING:  'pending',
  ACTIVE:   'active',
  ARCHIVED: 'archived',
  REJECTED: 'rejected',
};

const APPLICATION_STATUS = {
  SAVED:    'saved',
  APPLIED:  'applied',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
};

const NOTIFICATION_TYPES = {
  DEADLINE_REMINDER:  'deadline_reminder',
  NEW_OPPORTUNITY:    'new_opportunity',
  ORGANIZER_APPROVED: 'organizer_approved',
  ORGANIZER_REJECTED: 'organizer_rejected',
  LISTING_APPROVED:   'listing_approved',
  LISTING_REJECTED:   'listing_rejected',
};

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE     = 50;
const PASSWORD_RESET_EXPIRE_MINUTES = 30;

module.exports = {
  OPPORTUNITY_TYPES,
  OPPORTUNITY_CATEGORIES,
  DEGREE_LEVELS,
  CITIES,
  ROLES,
  ORGANIZER_STATUS,
  OPPORTUNITY_STATUS,
  APPLICATION_STATUS,
  NOTIFICATION_TYPES,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  PASSWORD_RESET_EXPIRE_MINUTES,
};