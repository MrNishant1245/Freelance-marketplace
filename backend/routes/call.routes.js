const express = require('express');
const router  = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { getRtcToken } = require('../controllers/call.controller');

// All call routes require authentication
router.use(protect);

router.get('/token/:conversationId', getRtcToken); // GET /api/calls/token/:id

module.exports = router;
