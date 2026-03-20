const express = require('express');
const router  = express.Router();
const {
  getOpportunities, getFeatured, getMyOpportunities,
  getOpportunity, createOpportunity, updateOpportunity, archiveOpportunity,
} = require('../controllers/opportunityController');
const { protect, authorize, requireApprovedOrganizer } = require('../middleware/authMiddleware');

// Public
router.get('/',          getOpportunities);
router.get('/featured',  getFeatured);
router.get('/:id',       getOpportunity);

// Organizer
router.get('/organizer/my', protect, authorize('organizer'), getMyOpportunities);
router.post('/',    protect, authorize('organizer'), requireApprovedOrganizer, createOpportunity);
router.put('/:id',  protect, authorize('organizer', 'admin'), updateOpportunity);
router.delete('/:id', protect, authorize('organizer', 'admin'), archiveOpportunity);

module.exports = router;
