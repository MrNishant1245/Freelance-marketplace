const express = require('express');
const router  = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  deleteMessage,
  getUnreadCount,
} = require('../controllers/message.controller');

// All routes require authentication
router.use(protect);

// Conversations
router.get('/',           getConversations);           // GET  /api/messages
router.post('/start',     getOrCreateConversation);    // POST /api/messages/start
router.get('/unread',     getUnreadCount);             // GET  /api/messages/unread

// Messages within a conversation
router.get('/:conversationId',         getMessages);   // GET  /api/messages/:id
router.post('/:conversationId',        sendMessage);   // POST /api/messages/:id
router.delete('/msg/:messageId',       deleteMessage); // DELETE /api/messages/msg/:id

module.exports = router;
