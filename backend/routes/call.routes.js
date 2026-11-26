const express = require('express');
const router  = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
  getRtcToken,
  getCallHistory,
  logCall,
  deleteCall,
  clearCallHistory,
} = require('../controllers/call.controller');

// All call routes require authentication
router.use(protect);

router.get('/token/:conversationId', getRtcToken);       // GET /api/calls/token/:id
router.get('/history', getCallHistory);                  // GET /api/calls/history
router.post('/log', logCall);                            // POST /api/calls/log
router.delete('/:callId', deleteCall);                   // DELETE /api/calls/:callId
router.delete('/history/:conversationId', clearCallHistory); // DELETE /api/calls/history/:conversationId

module.exports = router;
