const express = require('express');
const router  = express.Router();
const {
  getOpportunities, getFeatured, getMyOpportunities,
  getOpportunity, createOpportunity, updateOpportunity, archiveOpportunity,
} = require('../controllers/opportunityController');
const { protect, authorize, requireApprovedOrganizer } = require('../middleware/authMiddleware');

// Public
router.get('/',         getOpportunities);
router.get('/featured', getFeatured);

// IMPORTANT: specific named paths BEFORE /:id param
router.get('/organizer/my', protect, authorize('organizer'), getMyOpportunities);

router.post('/', protect, authorize('organizer'), requireApprovedOrganizer, createOpportunity);

// Param routes last
router.get('/:id',    getOpportunity);
router.put('/:id',    protect, authorize('organizer', 'admin'), updateOpportunity);
router.delete('/:id', protect, authorize('organizer', 'admin'), archiveOpportunity);

module.exports = router;