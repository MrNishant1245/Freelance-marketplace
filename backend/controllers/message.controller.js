const Conversation = require('../models/Conversation.model');
const Message      = require('../models/Message.model');
const User         = require('../models/User.model');

// ─── Get all conversations for current user ───────────────────────────────────
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
      isActive: true,
    })
      .populate('participants', 'firstName lastName role profilePhoto')
      .populate({
        path: 'lastMessage',
        select: 'content createdAt sender attachments',
      })
      .populate('job', 'title status')
      .sort({ updatedAt: -1 });

    // Attach unread count for current user
    const result = conversations.map((conv) => ({
      ...conv.toObject(),
      unreadCount: conv.unreadCount.get(req.user.id.toString()) || 0,
      otherParticipant: conv.participants.find(
        (p) => p._id.toString() !== req.user.id.toString()
      ),
    }));

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('getConversations error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── Get or create a conversation with another user ──────────────────────────
const getOrCreateConversation = async (req, res) => {
  try {
    const { userId, jobId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId required.' });
    }

    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, userId] },
    })
      .populate('participants', 'firstName lastName role profilePhoto')
      .populate('lastMessage')
      .populate('job', 'title');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, userId],
        job: jobId || null,
      });
      conversation = await conversation.populate('participants', 'firstName lastName role profilePhoto');
    }

    return res.json({ success: true, data: conversation });
  } catch (err) {
    console.error('getOrCreateConversation error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── Get messages in a conversation ──────────────────────────────────────────
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip  = (page - 1) * limit;

    // Verify user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id,
    });
    if (!conversation) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const messages = await Message.find({
      conversation: conversationId,
      isDeleted: false,
    })
      .populate('sender', 'firstName lastName profilePhoto role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Mark all unread messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        'readBy.user': { $ne: req.user.id },
        sender: { $ne: req.user.id },
      },
      { $addToSet: { readBy: { user: req.user.id, readAt: new Date() } } }
    );

    // Reset unread count for this user in this conversation
    conversation.unreadCount.set(req.user.id.toString(), 0);
    await conversation.save();

    return res.json({
      success: true,
      data: messages.reverse(), // oldest first
      pagination: { page, limit },
    });
  } catch (err) {
    console.error('getMessages error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── Send a message ───────────────────────────────────────────────────────────
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, attachments } = req.body;

    if (!content?.trim() && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
    }

    // Verify user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id,
    });
    if (!conversation) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      content: content?.trim() || '',
      attachments: attachments || [],
      readBy: [{ user: req.user.id, readAt: new Date() }],
    });

    await message.populate('sender', 'firstName lastName profilePhoto role');

    // Update conversation: lastMessage + increment unread for other participants
    conversation.lastMessage = message._id;
    conversation.participants.forEach((participantId) => {
      if (participantId.toString() !== req.user.id.toString()) {
        const current = conversation.unreadCount.get(participantId.toString()) || 0;
        conversation.unreadCount.set(participantId.toString(), current + 1);
      }
    });
    await conversation.save();

    // Emit via Socket.io if available
    const io = req.app.get('io');
    if (io) {
      io.to(conversationId).emit('newMessage', message);
      // Notify other participants (for sidebar unread badge)
      conversation.participants.forEach((participantId) => {
        if (participantId.toString() !== req.user.id.toString()) {
          io.to(`user:${participantId}`).emit('conversationUpdated', {
            conversationId,
            lastMessage: message,
            unreadCount: conversation.unreadCount.get(participantId.toString()),
          });
        }
      });
    }

    return res.status(201).json({ success: true, data: message });
  } catch (err) {
    console.error('sendMessage error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── Delete a message (soft delete) ──────────────────────────────────────────
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findOne({
      _id: messageId,
      sender: req.user.id,
    });
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found or not yours.' });
    }

    message.isDeleted = true;
    message.content   = 'This message was deleted.';
    await message.save();

    const io = req.app.get('io');
    if (io) {
      io.to(message.conversation.toString()).emit('messageDeleted', { messageId });
    }

    return res.json({ success: true, message: 'Message deleted.' });
  } catch (err) {
    console.error('deleteMessage error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── Get total unread count for current user ──────────────────────────────────
const getUnreadCount = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
      isActive: true,
    });

    const total = conversations.reduce((sum, conv) => {
      return sum + (conv.unreadCount.get(req.user.id.toString()) || 0);
    }, 0);

    return res.json({ success: true, data: { unreadCount: total } });
  } catch (err) {
    console.error('getUnreadCount error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  deleteMessage,
  getUnreadCount,
};
