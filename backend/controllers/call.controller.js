const mongoose = require('mongoose');
const { RtcTokenBuilder, RtcRole } = require('agora-token');
const Conversation = require('../models/Conversation.model');

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
