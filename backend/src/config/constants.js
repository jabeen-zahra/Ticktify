// ── Opportunity Categories ────────────────────────────────────────────────────
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

const DEGREE_LEVELS = ['undergraduate', 'graduate', 'phd', 'open'];

const CITIES = ['lahore', 'karachi', 'islamabad', 'peshawar', 'quetta', 'online', 'other'];

// ── User Roles ────────────────────────────────────────────────────────────────
const ROLES = {
  STUDENT:   'student',
  ORGANIZER: 'organizer',
  ADMIN:     'admin',
};

// ── Organizer Status ──────────────────────────────────────────────────────────
const ORGANIZER_STATUS = {
  PENDING:  'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// ── Opportunity Status ────────────────────────────────────────────────────────
const OPPORTUNITY_STATUS = {
  DRAFT:    'draft',
  PENDING:  'pending',    // awaiting admin review (first-time organizers)
  ACTIVE:   'active',
  ARCHIVED: 'archived',   // past deadline — kept for history
  REJECTED: 'rejected',
};

// ── Pagination ────────────────────────────────────────────────────────────────
const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 50;

module.exports = {
  OPPORTUNITY_TYPES,
  OPPORTUNITY_CATEGORIES,
  DEGREE_LEVELS,
  CITIES,
  ROLES,
  ORGANIZER_STATUS,
  OPPORTUNITY_STATUS,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
};
