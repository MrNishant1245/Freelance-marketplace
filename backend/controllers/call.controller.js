const mongoose = require('mongoose');
const { RtcTokenBuilder, RtcRole } = require('agora-token');
const Conversation = require('../models/Conversation.model');
const Call = require('../models/Call.model');

const TOKEN_TTL_SECONDS = 60 * 60; // 1 hour

// ─── GET /api/calls/token/:conversationId ─────────────────────────────────────
// Returns a short-lived Agora RTC token. Only the 2 participants of the
// conversation can get a token for that conversation's channel.
exports.getRtcToken = async (req, res) => {
  try {
    const appId          = process.env.AGORA_APP_ID || '8a61421f108d4b31a8b981f211eb5a7c';
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appId) {
      return res.status(500).json({
        success: false,
        message: 'Calling is not configured on the server (missing Agora App ID).',
      });
    }

    const { conversationId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ success: false, message: 'Invalid conversation id.' });
    }

    const conversation = await Conversation.findById(conversationId).select('participants isActive');
    if (!conversation || !conversation.isActive) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user.id
    );
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'You are not part of this conversation.' });
    }

    const channel = `conv_${conversationId}`;
    const uid     = req.user.id; // string uid (Mongo user id)

    let token = null;
    if (appCertificate && appCertificate.trim()) {
      token = RtcTokenBuilder.buildTokenWithUserAccount(
        appId,
        appCertificate,
        channel,
        uid,
        RtcRole.PUBLISHER,
        TOKEN_TTL_SECONDS,
        TOKEN_TTL_SECONDS
      );
    }

    return res.json({
      success: true,
      data: { appId, channel, uid, token, expiresIn: TOKEN_TTL_SECONDS },
    });
  } catch (error) {
    console.error('Agora token error:', error);
    return res.status(500).json({ success: false, message: 'Could not generate call token.' });
  }
};

// ─── GET /api/calls/history ───────────────────────────────────────────────────
// Query params: conversationId, callType ('all' | 'voice' | 'video'), page, limit
exports.getCallHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId, callType, limit = 50, page = 1 } = req.query;

    const query = {
      $or: [
        { caller: userId },
        { receiver: userId },
      ],
    };

    if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
      query.conversation = conversationId;
    }

    if (callType && callType !== 'all' && ['voice', 'video'].includes(callType)) {
      query.callType = callType;
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);

    const calls = await Call.find(query)
      .populate('caller', 'firstName lastName profilePhoto role email')
      .populate('receiver', 'firstName lastName profilePhoto role email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await Call.countDocuments(query);

    return res.json({
      success: true,
      data: calls,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)) || 1,
    });
  } catch (error) {
    console.error('getCallHistory error:', error);
    return res.status(500).json({ success: false, message: 'Could not retrieve call history.' });
  }
};

// ─── POST /api/calls/log ──────────────────────────────────────────────────────
// Body: { conversationId, receiverId, callerId, callType, status, duration, startedAt, endedAt }
exports.logCall = async (req, res) => {
  try {
    const myId = req.user.id;
    const {
      conversationId,
      receiverId,
      callerId,
      callType = 'video',
      status = 'completed',
      duration = 0,
      startedAt,
      endedAt,
    } = req.body;

    if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ success: false, message: 'Valid conversationId is required.' });
    }

    const actualCallerId = callerId && mongoose.Types.ObjectId.isValid(callerId) ? callerId : myId;
    const actualReceiverId = receiverId && mongoose.Types.ObjectId.isValid(receiverId) ? receiverId : null;

    if (!actualReceiverId) {
      // Find the conversation to get the other participant
      const conv = await Conversation.findById(conversationId);
      if (!conv) {
        return res.status(404).json({ success: false, message: 'Conversation not found.' });
      }
      const other = conv.participants.find((p) => p.toString() !== actualCallerId.toString());
      if (!other) {
        return res.status(400).json({ success: false, message: 'Could not determine call receiver.' });
      }
    }

    const end = endedAt ? new Date(endedAt) : new Date();
    const durSec = Math.max(0, parseInt(duration, 10) || 0);
    const start = startedAt ? new Date(startedAt) : new Date(end.getTime() - durSec * 1000);

    const call = await Call.create({
      conversation: conversationId,
      caller: actualCallerId,
      receiver: actualReceiverId || (await Conversation.findById(conversationId)).participants.find(p => p.toString() !== actualCallerId.toString()),
      callType: callType === 'voice' ? 'voice' : 'video',
      status: status || (durSec > 0 ? 'completed' : 'missed'),
      duration: durSec,
      startedAt: start,
      endedAt: end,
    });

    const populatedCall = await Call.findById(call._id)
      .populate('caller', 'firstName lastName profilePhoto role email')
      .populate('receiver', 'firstName lastName profilePhoto role email');

    // Notify peers via socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${actualCallerId}`).emit('callLogged', populatedCall);
      if (populatedCall.receiver?._id) {
        io.to(`user:${populatedCall.receiver._id}`).emit('callLogged', populatedCall);
      }
    }

    return res.status(201).json({
      success: true,
      data: populatedCall,
    });
  } catch (error) {
    console.error('logCall error:', error);
    return res.status(500).json({ success: false, message: 'Could not log call.' });
  }
};

// ─── DELETE /api/calls/:callId ────────────────────────────────────────────────
exports.deleteCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(callId)) {
      return res.status(400).json({ success: false, message: 'Invalid call id.' });
    }

    const call = await Call.findOne({
      _id: callId,
      $or: [{ caller: userId }, { receiver: userId }],
    });

    if (!call) {
      return res.status(404).json({ success: false, message: 'Call not found or unauthorized.' });
    }

    await Call.findByIdAndDelete(callId);
    return res.json({ success: true, message: 'Call removed from history.' });
  } catch (error) {
    console.error('deleteCall error:', error);
    return res.status(500).json({ success: false, message: 'Could not delete call.' });
  }
};

// ─── DELETE /api/calls/history/:conversationId ───────────────────────────────
exports.clearCallHistory = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ success: false, message: 'Invalid conversation id.' });
    }

    await Call.deleteMany({
      conversation: conversationId,
      $or: [{ caller: userId }, { receiver: userId }],
    });

    return res.json({ success: true, message: 'Call history cleared for this conversation.' });
  } catch (error) {
    console.error('clearCallHistory error:', error);
    return res.status(500).json({ success: false, message: 'Could not clear call history.' });
  }
};
