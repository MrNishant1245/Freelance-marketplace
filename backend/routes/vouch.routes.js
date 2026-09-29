const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
  requestSkillVouch,
  getPendingVouches,
  respondSkillVouch,
  getUserVouches,
} = require('../controllers/vouch.controller');

router.post('/request', protect, requestSkillVouch);
router.get('/pending', protect, getPendingVouches);
router.post('/:vouchId/respond', protect, respondSkillVouch);
router.get('/user/:userId', getUserVouches);

module.exports = router;
