const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const {
  createDispute,
  submitDisputeStatement,
  generateAIDisputeMediation,
  acceptAIDisputeSettlement,
  adminResolveDispute,
  getJobDispute,
} = require('../controllers/dispute.controller');

router.post('/', protect, createDispute);
router.get('/job/:jobId', protect, getJobDispute);
router.post('/:disputeId/statement', protect, submitDisputeStatement);
router.post('/:disputeId/generate-ai', protect, generateAIDisputeMediation);
router.post('/:disputeId/accept-ai', protect, acceptAIDisputeSettlement);
router.post('/:disputeId/admin-resolve', protect, authorize('admin'), adminResolveDispute);

module.exports = router;
