const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const {
  createJob,
  getJobs,
  getJobById,
  getMyJobs,
  getMyAssignedJobs,
  updateJob,
  deleteJob,
  submitProposal,
  updateProposalStatus,
  markJobSubmitted,
  markJobCompleted,
  toggleSaveJob,
  getSavedJobs,
  updateMilestones,
  fundMilestone,
  releaseMilestone,
  raiseMilestoneDispute,
  getProposalCoachFeedback,
  getBudgetRealityCheck,
  addBuildLog,
  toggleBuildLogChecklist,
  claimNoGhostDeposit,
  inviteSubHire,
  respondSubHire,
  getFairQueueStatus,
} = require('../controllers/job.controller');

// ── Public / general listing ──
router.get('/', getJobs);

// ── SPECIFIC routes PEHLE — warna /:id inhe pakad leta hai ──
router.get('/my/posted',   protect, authorize('client'),     getMyJobs);
router.get('/my/assigned', protect, authorize('freelancer'), getMyAssignedJobs);
router.get('/saved',       protect, authorize('freelancer'), getSavedJobs);

// ── AI Budget Reality-Check at Posting Time ──
router.post('/budget-check', protect, getBudgetRealityCheck);

// ── Dynamic :id routes LATER ──
router.get('/:id', getJobById);
router.get('/:id/fair-queue', getFairQueueStatus);

// ── Client: post & manage own jobs ──
router.post('/',    protect, authorize('client'), createJob);
router.put('/:id',  protect, authorize('client'), updateJob);
router.delete('/:id', protect, deleteJob);

// ── Freelancer: proposals & proposal coach ──
router.post('/:id/proposals', protect, authorize('freelancer'), submitProposal);
router.post('/:id/proposal-coach', protect, authorize('freelancer'), getProposalCoachFeedback);
router.put('/:id/submit',     protect, authorize('freelancer'), markJobSubmitted);
router.post('/:id/save',      protect, authorize('freelancer'), toggleSaveJob);
router.post('/:id/claim-no-ghost', protect, authorize('freelancer'), claimNoGhostDeposit);

// ── Build Logs / WIP Timeline ──
router.post('/:id/build-logs', protect, addBuildLog);
router.put('/:id/build-logs/checklist', protect, toggleBuildLogChecklist);

// ── Sub-Hire / Team Split ──
router.post('/:id/sub-hire', protect, authorize('freelancer'), inviteSubHire);
router.post('/:id/sub-hire/respond', protect, respondSubHire);

// ── Client: manage proposals & approve completion ──
router.put('/:id/proposals/:proposalId', protect, authorize('client'), updateProposalStatus);
router.put('/:id/complete',              protect, authorize('client'), markJobCompleted);

// ── Milestone Escrow & Dispute Resolution Routes ──
router.put('/:id/milestones', protect, authorize('client'), updateMilestones);
router.post('/:id/milestones/:milestoneId/fund', protect, authorize('client'), fundMilestone);
router.post('/:id/milestones/:milestoneId/release', protect, authorize('client'), releaseMilestone);
router.post('/:id/milestones/:milestoneId/dispute', protect, raiseMilestoneDispute);

module.exports = router;
