const express = require('express');
const router  = express.Router();
const {
  getOpportunities, getOpportunity, createOpportunity,
  updateOpportunity, archiveOpportunity, getMyOpportunities,
} = require('../controllers/opportunityController');
const { protect, authorize, requireApprovedOrganizer } = require('../middleware/authMiddleware');

// Public
router.get('/',    getOpportunities);
router.get('/my',  protect, authorize('organizer'), getMyOpportunities);
router.get('/:id', getOpportunity);

// Organizer only
router.post('/',    protect, authorize('organizer'), requireApprovedOrganizer, createOpportunity);
router.put('/:id',  protect, authorize('organizer', 'admin'), updateOpportunity);
router.delete('/:id', protect, authorize('organizer', 'admin'), archiveOpportunity);

module.exports = router;
