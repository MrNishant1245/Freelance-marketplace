const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    // Always exactly 2 participants (client + freelancer)
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    // Optional: link conversation to a specific job
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      default: null,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    // Unread counts per participant
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Ensure a unique conversation per pair of participants
conversationSchema.index({ participants: 1 });

// Helper: get the other participant (not me)
conversationSchema.methods.getOtherParticipant = function (myId) {
  return this.participants.find((p) => p.toString() !== myId.toString());
};

module.exports = mongoose.model('Conversation', conversationSchema);
