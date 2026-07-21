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
} = require('../controllers/job.controller');

// ── Public / general listing ──
router.get('/', getJobs);

// ── SPECIFIC routes PEHLE — warna /:id inhe pakad leta hai ──
router.get('/my/posted',   protect, authorize('client'),     getMyJobs);
router.get('/my/assigned', protect, authorize('freelancer'), getMyAssignedJobs);
router.get('/saved',       protect, authorize('freelancer'), getSavedJobs);

// ── Dynamic :id routes LATER ──
router.get('/:id', getJobById);

// ── Client: post & manage own jobs ──
router.post('/',    protect, authorize('client'), createJob);
router.put('/:id',  protect, authorize('client'), updateJob);
router.delete('/:id', protect, deleteJob);

// ── Freelancer: proposals & saved jobs ──
router.post('/:id/proposals', protect, authorize('freelancer'), submitProposal);
router.put('/:id/submit',     protect, authorize('freelancer'), markJobSubmitted);
router.post('/:id/save',      protect, authorize('freelancer'), toggleSaveJob);

// ── Client: manage proposals & approve completion ──
router.put('/:id/proposals/:proposalId', protect, authorize('client'), updateProposalStatus);
router.put('/:id/complete',              protect, authorize('client'), markJobCompleted);

// ── Milestone Escrow & Dispute Resolution Routes ──
router.put('/:id/milestones', protect, authorize('client'), updateMilestones);
router.post('/:id/milestones/:milestoneId/fund', protect, authorize('client'), fundMilestone);
router.post('/:id/milestones/:milestoneId/release', protect, authorize('client'), releaseMilestone);
router.post('/:id/milestones/:milestoneId/dispute', protect, raiseMilestoneDispute);

module.exports = router;
