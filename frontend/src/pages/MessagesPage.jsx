import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { profileAPI, reviewAPI, jobAPI } from '../api';
import { tokenStorage } from '../utils/tokenStorage';
import toast from 'react-hot-toast';
import { getSocket } from '../utils/socket';
import AgoraCall from '../components/common/AgoraCall';

// ─── API helpers ──────────────────────────────────────────────────────────────
const msgAPI = {
  getConversations: ()             => api.get('/messages'),
  getMessages:      (convId, page) => api.get(`/messages/${convId}?page=${page}&limit=50`),
  sendMessage:      (convId, body) => api.post(`/messages/${convId}`, body),
  deleteMessage:    (msgId)        => api.delete(`/messages/msg/${msgId}`),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const getInitials = (user) => {
  if (!user) return '?';
  return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
};

const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const isImageFile = (nameOrUrl = '') => IMAGE_EXT.some((ext) => nameOrUrl.toLowerCase().includes(ext));

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const renderHighlightedText = (text = '', query = '') => {
  if (!query || !query.trim() || typeof text !== 'string') return text;
  const safeQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${safeQuery})`, 'gi'));
  return parts.map((part, index) =>
    part.toLowerCase() === query.trim().toLowerCase() ? (
      <mark key={index} style={{ background: '#fde047', color: '#0f172a', padding: '1px 4px', borderRadius: 3, fontWeight: 700 }}>
        {part}
      </mark>
    ) : (
      part
    )
  );
};

// ─── Get other participant from conversation ───────────────────────────────────
const getOtherParticipant = (conv, myId) => {
  if (conv.otherParticipant) return conv.otherParticipant;
  if (!conv.participants) return null;
  return conv.participants.find(p => (p._id || p).toString() !== myId?.toString())
    || conv.participants[0];
};

const playRingtone = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    const ctx = new AudioContext();
    
    const playTone = () => {
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      if (type === 'incoming') {
        osc1.frequency.value = 440;
        osc2.frequency.value = 480;
      } else {
        osc1.frequency.value = 400;
        osc2.frequency.value = 450;
      }
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      
      osc1.start();
      osc2.start();
      
      setTimeout(() => {
        try {
          osc1.stop();
          osc2.stop();
        } catch (err) {}
      }, type === 'incoming' ? 1800 : 1200);
    };
    
    playTone();
    const interval = setInterval(playTone, type === 'incoming' ? 4000 : 3000);
    return {
      stop: () => {
        clearInterval(interval);
        try {
          ctx.close();
        } catch (e) {}
      }
    };
  } catch (err) {
    console.error('Failed to play ringtone:', err);
    return null;
  }
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ name }) => {
  const icons = {
    paperclip: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>,
    file:      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>,
    x:         <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    download:  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    search:    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    phone:     <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.78 19.78 0 0 1 2 6.18 2 2 0 0 1 4 4h3a2 2 0 0 1 2 1.72 12.55 12.55 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 11.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.55 12.55 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    video:     <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
    star:      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polygon points="12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21 12 17.27"/></svg>,
  };
  return icons[name] || null;
};

const BackIcon = ({ size = 28, color = '#111' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="22" stroke={color} strokeWidth="2" fill="transparent" />
    <path d="M29 16L20 24L29 32" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

// ─── Sub-components ───────────────────────────────────────────────────────────
const Avatar = ({ user, size = 38, color = '#25eb81' }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.35, flexShrink: 0 }}>
    {user?.profilePhoto
      ? <img src={user.profilePhoto} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
      : getInitials(user)}
  </div>
);

const EmptyState = ({ icon, title, sub }) => {
  const { isDarkMode } = useAuth();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, padding: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 40 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: isDarkMode ? '#e6eef8' : '#111' }}>{title}</div>
      {sub && <div style={{ fontSize: 13, color: isDarkMode ? '#9aa3b3' : '#a3a3a3', maxWidth: 260, lineHeight: 1.6 }}>{sub}</div>}
    </div>
  );
};

// ─── Attachment renderer ──────────────────────────────────────────────────────
const AttachmentList = ({ attachments, isMe }) => {
  if (!attachments?.length) return null;
  const { isDarkMode } = useAuth();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 6 }}>
      {attachments.map((att, i) =>
        (att.type === 'image' || isImageFile(att.name || att.url)) ? (
          <a key={i} href={att.url} target="_blank" rel="noreferrer" style={{ display: 'block' }}>
            <img src={att.url} alt={att.name || 'image'} style={{ maxWidth: 220, maxHeight: 180, borderRadius: 10, display: 'block', objectFit: 'cover' }} />
          </a>
        ) : (
          <a
            key={i}
            href={att.url}
            target="_blank"
            rel="noreferrer noopener"
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10,
              background: isMe ? 'rgba(255,255,255,0.18)' : (isDarkMode ? '#071422' : '#fff'),
              border: isMe ? '1px solid rgba(255,255,255,0.28)' : (isDarkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid #e5e7eb'),
              color: isMe ? '#fff' : (isDarkMode ? '#e6eef8' : '#111'), textDecoration: 'none', maxWidth: 320,
            }}
          >
            <Icon name="file" />
            <div style={{ flex: 1, fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {att.name || 'File'}
            </div>
            <span style={{ fontSize: 12, color: isMe ? '#f9fafb' : (isDarkMode ? '#9aa3b3' : '#737373') }}>Open</span>
          </a>
        )
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const MessagesPage = ({ userType = 'client' }) => {
  const { user, isDarkMode } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const token     = tokenStorage.getAccess(); // ✅ tab-specific token

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv]       = useState(null);
  const [messages, setMessages]           = useState([]);
  const [input, setInput]                 = useState('');
  const [loading, setLoading]             = useState(true);
  const [msgLoading, setMsgLoading]       = useState(false);
  const [sending, setSending]             = useState(false);
  const [isTyping, setIsTyping]           = useState(false);
  const [typingUsers, setTypingUsers]     = useState([]);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  // Built-in Video Call & Screen Share
  const [videoCallActive, setVideoCallActive] = useState(false);
  const [videoCallState, setVideoCallState] = useState({ isMuted: false, isVideoOff: false, isScreenSharing: false });
  const [videoCallDuration, setVideoCallDuration] = useState(0);
  const [incomingCall, setIncomingCall] = useState(null);
  const [outgoingCall, setOutgoingCall] = useState(null);
  const ringtoneRef = useRef(null);
  const callTimeoutRef = useRef(null);

  // In-Chat Search state
  const [inChatSearchOpen, setInChatSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);

  const matchingMessages = chatSearchQuery.trim()
    ? messages.filter((m) => m.content && m.content.toLowerCase().includes(chatSearchQuery.toLowerCase()))
    : [];

  const scrollToMessage = (msgId) => {
    const el = document.getElementById(`chat-msg-${msgId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleNextMatch = () => {
    if (!matchingMessages.length) return;
    const nextIdx = (activeMatchIndex + 1) % matchingMessages.length;
    setActiveMatchIndex(nextIdx);
    scrollToMessage(matchingMessages[nextIdx]._id);
  };

  const handlePrevMatch = () => {
    if (!matchingMessages.length) return;
    const prevIdx = (activeMatchIndex - 1 + matchingMessages.length) % matchingMessages.length;
    setActiveMatchIndex(prevIdx);
    scrollToMessage(matchingMessages[prevIdx]._id);
  };

  const handleChatSearchChange = (e) => {
    const query = e.target.value;
    setChatSearchQuery(query);
    setActiveMatchIndex(0);
    if (query.trim()) {
      const matches = messages.filter((m) => m.content && m.content.toLowerCase().includes(query.toLowerCase()));
      if (matches.length > 0) {
        setTimeout(() => scrollToMessage(matches[0]._id), 100);
      }
    }
  };

  // WhatsApp Alert & Voice Messages
  const [whatsAppAlertsActive, setWhatsAppAlertsActive] = useState(true);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceRecordDuration, setVoiceRecordDuration] = useState(0);

  // Auto-Translation state
  const [translatedMessages, setTranslatedMessages] = useState({});
  const [playingVoiceId, setPlayingVoiceId] = useState(null);

  // Translation helpers
  const translationDictionary = {
    "hello": "नमस्ते (Hello)",
    "how are you?": "आप कैसे हैं? (How are you?)",
    "i have reviewed the screen share": "मैंने स्क्रीन शेयर की समीक्षा कर ली है (I have reviewed the screen share)",
    "please submit the project update": "कृपया प्रोजेक्ट अपडेट सबमिट करें (Please submit the project update)",
    "project is ready for review": "प्रोजेक्ट समीक्षा के लिए तैयार है (Project is ready for review)",
    "thank you for your feedback": "आपके फीडबैक के लिए धन्यवाद (Thank you for your feedback)",
    "let's join a call": "आइए कॉल पर जुड़ते हैं (Let's join a call)",
    "sure, let's connect": "ज़रूर, आइए कनेक्ट करते हैं (Sure, let's connect)",
    "done": "हो गया (Done)"
  };

  const getTranslation = (text) => {
    const clean = text.toLowerCase().trim().replace(/[?.!]/g, '');
    if (translationDictionary[clean]) return translationDictionary[clean];
    if (text.match(/^[a-zA-Z\s,.'"]+$/)) {
      return `[अनुवादित]: ${text} (Hindi translation simulation active)`;
    } else {
      return `[Translated]: ${text} (English translation simulation active)`;
    }
  };

  const toggleTranslation = (msgId, text) => {
    setTranslatedMessages(prev => ({
      ...prev,
      [msgId]: prev[msgId] ? null : getTranslation(text)
    }));
  };

  // Timers for calls and recording
  useEffect(() => {
    let timer = null;
    if (isRecordingVoice) {
      timer = setInterval(() => {
        setVoiceRecordDuration(prev => prev + 1);
      }, 1000);
    } else {
      setVoiceRecordDuration(0);
    }
    return () => clearInterval(timer);
  }, [isRecordingVoice]);

  useEffect(() => {
    let timer = null;
    if (videoCallActive) {
      timer = setInterval(() => {
        setVideoCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setVideoCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [videoCallActive]);

  useEffect(() => {
    if (incomingCall) {
      if (ringtoneRef.current) ringtoneRef.current.stop();
      ringtoneRef.current = playRingtone('incoming');
    } else if (outgoingCall) {
      if (ringtoneRef.current) ringtoneRef.current.stop();
      ringtoneRef.current = playRingtone('outgoing');
    } else {
      if (ringtoneRef.current) {
        ringtoneRef.current.stop();
        ringtoneRef.current = null;
      }
    }
    return () => {
      if (ringtoneRef.current) {
        ringtoneRef.current.stop();
        ringtoneRef.current = null;
      }
    };
  }, [incomingCall, outgoingCall]);

  const formatCallDuration = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };
  const [search, setSearch]               = useState('');
  const [searchStatus, setSearchStatus]   = useState('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating]   = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewInfo, setReviewInfo]       = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError]     = useState('');
  const [pendingFiles, setPendingFiles]   = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [menuOpen, setMenuOpen]           = useState(false);
  const [mutedConversations, setMutedConversations] = useState({});
  const [favoriteConversations, setFavoriteConversations] = useState({});
  const [selectMode, setSelectMode]       = useState(false);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [blockedUsers, setBlockedUsers]   = useState(new Set());
  const [contactInfoOpen, setContactInfoOpen] = useState(false);

  const fileInputRef = useRef(null);
  const searchInputRef = useRef(null);
  const menuRef      = useRef(null);
  const bottomRef    = useRef(null);
  const typingTimer  = useRef(null);
  const socketRef    = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);

  const myId        = user?._id || user?.id;
  const activeOther = activeConv ? getOtherParticipant(activeConv, myId) : null;
  const accentColor = userType === 'freelancer' ? '#16a34a' : '#2563eb';

  // ── Socket setup ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    const s = getSocket(token);
    socketRef.current = s;

    s.on('newMessage', (msg) => {
      setMessages(prev => prev.some(m => m._id === msg._id) ? prev : [...prev, msg]);
      setConversations(prev =>
        prev.map(c => c._id === msg.conversation ? { ...c, lastMessage: msg } : c)
      );
    });
    s.on('conversationUpdated', (data) => {
      setConversations(prev =>
        prev.map(c => c._id === data.conversationId
          ? { ...c, lastMessage: data.lastMessage, unreadCount: data.unreadCount }
          : c)
      );
    });
    s.on('userTyping',        ({ userId }) => setTypingUsers(p => [...new Set([...p, userId])]));
    s.on('userStoppedTyping', ({ userId }) => setTypingUsers(p => p.filter(id => id !== userId)));
    s.on('messageDeleted',    ({ messageId }) =>
      setMessages(p => p.map(m => m._id === messageId ? { ...m, isDeleted: true, content: 'This message was deleted.' } : m))
    );

    s.on('incomingCall', ({ conversationId, callerName, callerId, callType }) => {
      setIncomingCall({ conversationId, callerName, callerId, callType: callType || 'video' });
    });
    s.on('callAccepted', ({ conversationId }) => {
      if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
      setOutgoingCall(null);
      setVideoCallActive(true);
      setVideoCallDuration(0);
      setVideoCallState({ isMuted: false, isVideoOff: false, isScreenSharing: false });
      toast.success('Call connected!', { icon: '📞' });
    });
    s.on('callDeclined', ({ conversationId }) => {
      if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
      setOutgoingCall(null);
      toast.error('Call declined by user.', { icon: '📞' });
    });
    s.on('callEnded', ({ conversationId }) => {
      if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
      setIncomingCall(null);
      setOutgoingCall(null);
      setVideoCallActive(false);
      toast.error('Call ended.', { icon: '📞' });
    });

    return () => {
      s.off('newMessage'); s.off('conversationUpdated');
      s.off('userTyping'); s.off('userStoppedTyping'); s.off('messageDeleted');
      s.off('incomingCall'); s.off('callAccepted');
      s.off('callDeclined'); s.off('callEnded');
    };
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [menuRef]);

  const focusSearch = () => {
    setMenuOpen(false);
    setTimeout(() => searchInputRef.current?.focus(), 0);
  };

  const handleSearchInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const findMatchingConversation = (queryText) => {
    const query = (queryText || search).trim().toLowerCase();
    if (!query) return null;
    return conversations.find((c) => {
      const other = getOtherParticipant(c, myId);
      const name = `${other?.firstName || ''} ${other?.lastName || ''}`.toLowerCase();
      const preview = (c.lastMessage?.content || '').toLowerCase();
      const jobTitle = c.job?.title?.toLowerCase() || '';
      return (
        name.includes(query) ||
        preview.includes(query) ||
        jobTitle.includes(query)
      );
    });
  };

  const handleSearch = () => {
    const rawValue = searchInputRef.current?.value ?? search;
    const query = rawValue.trim();
    if (!query) {
      setSearchStatus('Type a name or keyword to search conversations.');
      focusSearch();
      return;
    }

    setSearch(query);
    const match = findMatchingConversation(query);
    if (match) {
      setSearchStatus('');
      selectConversation(match);
    } else {
      setSearchStatus('No matching conversation found.');
    }
  };

  const loadReviewInfo = useCallback(async (jobId) => {
    if (!jobId) return;
    setReviewLoading(true);
    setReviewInfo(null);
    try {
      const res = await reviewAPI.getReviewStatusForJob(jobId);
      setReviewInfo(res.data?.data || null);
    } catch (err) {
      console.error('Review status fetch error:', err);
      setReviewInfo(null);
    } finally {
      setReviewLoading(false);
    }
  }, []);

  const openReviewModal = () => {
    if (!activeConv?.job?._id) return;
    setReviewError('');
    setReviewRating(0);
    setReviewComment('');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!activeConv?.job?._id) return;
    if (reviewRating < 1 || reviewRating > 5) {
      setReviewError('Please choose a rating between 1 and 5 stars.');
      return;
    }
    const comment = reviewComment.trim();
    if (!comment) {
      setReviewError('Please add a comment for your review.');
      return;
    }

    setReviewLoading(true);
    setReviewError('');

    try {
      const res = await reviewAPI.submitReview({
        jobId: activeConv.job._id,
        rating: reviewRating,
        comment,
      });
      setReviewInfo({
        canReview: false,
        alreadyReviewed: true,
        existingReview: res.data?.data,
      });
      setReviewModalOpen(false);
      alert('Review submitted successfully.');
    } catch (err) {
      console.error('Review submit error:', err);
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleReviewAction = () => {
    if (!activeConv?.job?._id) return;
    if (reviewInfo?.alreadyReviewed || reviewInfo?.canReview) {
      setReviewError('');
      setReviewModalOpen(true);
      return;
    }
    setSearchStatus('Review is not available for this job yet.');
  };

  const handleVoiceCall = () => {
    if (!activeConv || !activeOther) return;
    const callerName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Someone';
    const targetUserId = activeOther._id || activeOther;

    socketRef.current?.emit('callUser', {
      conversationId: activeConv._id,
      targetUserId,
      callerName,
      callerId: myId,
      callType: 'voice',
    });

    setOutgoingCall({ conversationId: activeConv._id, targetUserId, callType: 'voice' });
    toast.success(`Voice calling ${activeOther.firstName || 'user'}...`, { icon: '📞' });

    if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
    callTimeoutRef.current = setTimeout(() => {
      handleEndCall();
      toast.error('No answer from user.', { icon: '📞' });
    }, 15000);
  };

  const handleVideoCall = () => {
    if (!activeConv || !activeOther) return;
    const callerName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Someone';
    const targetUserId = activeOther._id || activeOther;

    socketRef.current?.emit('callUser', {
      conversationId: activeConv._id,
      targetUserId,
      callerName,
      callerId: myId,
      callType: 'video',
    });

    setOutgoingCall({ conversationId: activeConv._id, targetUserId, callType: 'video' });
    toast.success(`Calling ${activeOther.firstName || 'user'}...`, { icon: '📞' });

    if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
    callTimeoutRef.current = setTimeout(() => {
      handleEndCall();
      toast.error('No answer from user.', { icon: '📞' });
    }, 15000);
  };

  const handleAcceptCall = () => {
    if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
    if (!incomingCall) return;
    const { conversationId, callerId } = incomingCall;

    socketRef.current?.emit('acceptCall', {
      conversationId,
      targetUserId: callerId
    });

    setIncomingCall(null);
    setVideoCallActive(true);
    setVideoCallDuration(0);
    setVideoCallState({ isMuted: false, isVideoOff: false, isScreenSharing: false });
  };

  const handleDeclineCall = () => {
    if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
    if (!incomingCall) return;
    const { conversationId, callerId } = incomingCall;

    socketRef.current?.emit('declineCall', {
      conversationId,
      targetUserId: callerId
    });

    setIncomingCall(null);
  };

  const handleEndCall = () => {
    if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
    if (outgoingCall) {
      socketRef.current?.emit('endCall', {
        conversationId: outgoingCall.conversationId,
        targetUserId: outgoingCall.targetUserId
      });
      setOutgoingCall(null);
      return;
    }

    if (activeConv && activeOther) {
      socketRef.current?.emit('endCall', {
        conversationId: activeConv._id,
        targetUserId: activeOther._id || activeOther
      });
    }

    setIncomingCall(null);
    setOutgoingCall(null);
    setVideoCallActive(false);
  };

  const toggleSelectMode = () => {
    setMenuOpen(false);
    setSelectMode((prev) => {
      if (prev) setSelectedMessages(new Set());
      return !prev;
    });
  };

  const toggleMute = () => {
    if (!activeConv) return;
    setMenuOpen(false);
    setMutedConversations((prev) => ({
      ...prev,
      [activeConv._id]: !prev[activeConv._id],
    }));
  };

  const toggleFavorite = () => {
    if (!activeConv) return;
    setMenuOpen(false);
    setFavoriteConversations((prev) => ({
      ...prev,
      [activeConv._id]: !prev[activeConv._id],
    }));
  };

  const handleContactInfo = () => {
    setMenuOpen(false);
    setContactInfoOpen(true);
  };

  const handleCloseChat = () => {
    setMenuOpen(false);
    navigate(userType === 'freelancer' ? '/freelancer/dashboard' : '/dashboard');
  };

  const handleBlockUser = () => {
    if (!activeOther) return;
    setMenuOpen(false);
    setBlockedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(activeOther._id)) {
        next.delete(activeOther._id);
        alert('User unblocked.');
      } else {
        next.add(activeOther._id);
        alert('User blocked.');
      }
      return next;
    });
  };

  const handleReport = () => {
    setMenuOpen(false);
    alert('User reported. Our team will review this conversation.');
  };

  const handleClearChat = () => {
    if (!activeConv) return;
    if (!window.confirm('Clear all messages in this chat?')) return;
    setMessages([]);
    setMenuOpen(false);
    setSelectMode(false);
    setSelectedMessages(new Set());
  };

  const handleDeleteConversation = () => {
    if (!activeConv) return;
    if (!window.confirm('Delete this conversation? This removes it from your list.')) return;
    setConversations((prev) => prev.filter((c) => c._id !== activeConv._id));
    setActiveConv(null);
    setMessages([]);
    setMenuOpen(false);
    setSelectMode(false);
    setSelectedMessages(new Set());
  };

  const toggleMessageSelection = (messageId) => {
    setSelectedMessages((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) next.delete(messageId);
      else next.add(messageId);
      return next;
    });
  };

  const handleDeleteSelectedMessages = async () => {
    if (selectedMessages.size === 0) return;
    if (!window.confirm(`Delete ${selectedMessages.size} selected message(s)?`)) return;
    const ids = Array.from(selectedMessages);
    for (const id of ids) {
      await handleDelete(id);
    }
    setSelectedMessages(new Set());
    setSelectMode(false);
  };

  const handleCloseContactInfo = () => setContactInfoOpen(false);

  const isBlocked = activeOther ? blockedUsers.has(activeOther._id) : false;

  // ── Select conversation ───────────────────────────────────────────────────────
  const selectConversation = useCallback(async (conv) => {
    let targetConv = conv;
    if (conv.isVirtual) {
      try {
        setMsgLoading(true);
        const res = await api.post('/messages/start', { userId: conv.recipientId, jobId: conv.jobId });
        const realConv = res.data?.data;
        if (realConv) {
          // Replace virtual conversation in local state
          setConversations(prev => prev.map(c => c._id === conv._id ? realConv : c));
          targetConv = realConv;
          const path = userType === 'freelancer' ? '/freelancer/messages' : '/messages';
          navigate(`${path}?conversation=${realConv._id}`, { replace: true });
        } else {
          throw new Error("Invalid server response");
        }
      } catch (err) {
        console.error('Failed to create/start virtual conversation:', err);
        toast.error('Failed to start conversation.');
        setMsgLoading(false);
        return;
      }
    }

    if (activeConv) socketRef.current?.emit('leaveConversation', activeConv._id);
    setActiveConv(targetConv);
    setMessages([]);
    setMsgLoading(true);
    setPendingFiles([]);
    try {
      const res = await msgAPI.getMessages(targetConv._id, 1);
      setMessages(res.data?.data || []);
    } catch (err) {
      console.error('Load messages error:', err);
    } finally {
      setMsgLoading(false);
    }
    socketRef.current?.emit('joinConversation', targetConv._id);
    setConversations(prev => prev.map(c => c._id === targetConv._id ? { ...c, unreadCount: 0 } : c));
  }, [activeConv, userType, navigate]);

  const selectConversationRef = useRef(selectConversation);
  useEffect(() => {
    selectConversationRef.current = selectConversation;
  }, [selectConversation]);

  const playSynthVoiceTone = (msgId) => {
    setPlayingVoiceId(msgId);
    toast.success('Playing voice note preview...', { icon: '🔊' });
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const melody = [262, 330, 392, 440, 523, 659, 784, 880];
        melody.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.15);
          gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (idx + 1) * 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.15);
          osc.stop(ctx.currentTime + (idx + 1) * 0.15);
        });
      }
    } catch (err) {
      console.error('Audio synthesizer error:', err);
    }

    setTimeout(() => {
      setPlayingVoiceId(prev => prev === msgId ? null : prev);
    }, 1500);
  };

  const playVoiceNoteAudio = (msgId, content, attachments = []) => {
    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.pause();
      } catch (err) {}
      audioPlayerRef.current = null;
    }

    if (playingVoiceId === msgId) {
      setPlayingVoiceId(null);
      return;
    }

    let audioUrl = null;
    if (attachments && attachments.length > 0) {
      const audioAtt = attachments.find(att => att.url && (att.type === 'audio' || att.url.endsWith('.webm') || att.url.endsWith('.mp3') || att.url.endsWith('.wav') || att.url.endsWith('.ogg')));
      if (audioAtt) audioUrl = audioAtt.url;
      else if (attachments[0]?.url) audioUrl = attachments[0].url;
    }

    if (!audioUrl && content) {
      if (content.includes('url:')) {
        audioUrl = content.split('url:')[1]?.trim();
      } else {
        const match = content.match(/https?:\/\/[^\s]+/);
        if (match) audioUrl = match[0];
      }
    }

    if (audioUrl) {
      setPlayingVoiceId(msgId);
      toast.success('Playing voice message...', { icon: '🔊' });
      try {
        const audio = new Audio(audioUrl);
        audioPlayerRef.current = audio;
        audio.onended = () => {
          setPlayingVoiceId(null);
          audioPlayerRef.current = null;
        };
        audio.onerror = (e) => {
          console.warn('Audio URL play error, fallback to synth:', e);
          playSynthVoiceTone(msgId);
        };
        audio.play().catch(playErr => {
          console.warn('Audio play promise rejected, fallback to synth:', playErr);
          playSynthVoiceTone(msgId);
        });
        return;
      } catch (err) {
        console.warn('Audio init failed, fallback to synth:', err);
      }
    }

    playSynthVoiceTone(msgId);
  };

  const startRecordingAudio = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('Microphone access is not supported by your browser or context.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      let options = {};
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      }
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size === 0) return;

        const fileName = `voicenote-${Date.now()}.webm`;
        const audioFile = new File([audioBlob], fileName, { type: 'audio/webm' });

        setUploadingFiles(true);
        const loadingToastId = toast.loading('Uploading voice note...');
        try {
          const formData = new FormData();
          formData.append('file', audioFile);
          const res = await profileAPI.uploadFile(formData);
          const url  = res.data?.data?.url || res.data?.url || res.data?.fileUrl;
          if (url) {
            toast.dismiss(loadingToastId);
            toast.success('Voice note uploaded! Click send to share.');
            setInput(`[Voice Message] url:${url}`);
          } else {
            throw new Error("Invalid response url");
          }
        } catch (uploadErr) {
          toast.dismiss(loadingToastId);
          toast.error('Failed to upload voice note.');
          console.error('Voice note upload error:', uploadErr);
        } finally {
          setUploadingFiles(false);
        }
      };

      mediaRecorder.start(250);
      setIsRecordingVoice(true);
      setVoiceRecordDuration(0);
      toast('Recording voice note... speak now.', { icon: '🎤' });
    } catch (err) {
      console.error('Failed to access microphone:', err);
      toast.error('Could not access microphone.');
    }
  };

  const stopRecordingAudio = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecordingVoice(false);
    }
  };

  // ── Load conversations ────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res  = await msgAPI.getConversations();
        let convs = res.data?.data || [];

        // Fetch jobs to load virtual conversations for hired partners
        try {
          let jobsRes;
          if (userType === 'client') {
            jobsRes = await jobAPI.getMyPostedJobs();
          } else {
            jobsRes = await jobAPI.getMyAssignedJobs();
          }
          const jobsList = jobsRes.data?.data || [];

          jobsList.forEach(job => {
            if (userType === 'client' && job.hiredFreelancer && ['in_progress', 'submitted', 'completed'].includes(job.status)) {
              const partner = job.hiredFreelancer;
              const alreadyExists = convs.some(c => {
                const otherParticipantId = c.otherParticipant?._id || c.otherParticipant;
                return otherParticipantId && otherParticipantId.toString() === partner._id.toString();
              });
              if (!alreadyExists) {
                convs.push({
                  _id: `virtual-${partner._id}-${job._id}`,
                  participants: [user, partner],
                  otherParticipant: partner,
                  lastMessage: { content: "Click to start chatting!", createdAt: new Date().toISOString() },
                  unreadCount: 0,
                  job: { title: job.title },
                  isVirtual: true,
                  recipientId: partner._id,
                  jobId: job._id
                });
              }
            } else if (userType === 'freelancer' && job.client && ['in_progress', 'submitted', 'completed'].includes(job.status)) {
              const partner = job.client;
              const alreadyExists = convs.some(c => {
                const otherParticipantId = c.otherParticipant?._id || c.otherParticipant;
                return otherParticipantId && otherParticipantId.toString() === partner._id.toString();
              });
              if (!alreadyExists) {
                convs.push({
                  _id: `virtual-${partner._id}-${job._id}`,
                  participants: [user, partner],
                  otherParticipant: partner,
                  lastMessage: { content: "Click to start chatting!", createdAt: new Date().toISOString() },
                  unreadCount: 0,
                  job: { title: job.title },
                  isVirtual: true,
                  recipientId: partner._id,
                  jobId: job._id
                });
              }
            }
          });
        } catch (jobErr) {
          console.error('Failed to load jobs for virtual conversations:', jobErr);
        }

        setConversations(convs);

        const queryParams = new URLSearchParams(window.location.search);
        const targetConvId = queryParams.get('conversation');
        if (targetConvId) {
          const match = convs.find(c => c._id === targetConvId);
          if (match) {
            selectConversationRef.current(match);
            return;
          }
        }
        if (convs.length > 0) selectConversationRef.current(convs[0]);
      } catch (err) {
        console.error('Load conversations error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, userType]);

  // ── Scroll to bottom ──────────────────────────────────────────────────────────
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // ── Auto-select conversation from query parameter ────────────────────────────
  useEffect(() => {
    if (conversations.length === 0) return;
    const queryParams = new URLSearchParams(location.search);
    const targetConvId = queryParams.get('conversation');
    if (targetConvId) {
      const match = conversations.find(c => c._id === targetConvId);
      if (match && (!activeConv || activeConv._id !== match._id)) {
        selectConversationRef.current(match);
      }
      const startCall = queryParams.get('startCall');
      if (startCall === 'true') {
        setVideoCallActive(true);
        setVideoCallDuration(0);
        setVideoCallState({ isMuted: false, isVideoOff: false, isScreenSharing: false });
        // Clear startCall query parameter from URL
        const newSearch = new URLSearchParams(location.search);
        newSearch.delete('startCall');
        navigate({ search: newSearch.toString() }, { replace: true });
      }
    }
  }, [location.search, conversations, activeConv, navigate]);

  // ── File attach ───────────────────────────────────────────────────────────────
  const handleAttachClick = () => fileInputRef.current?.click();

  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    setUploadingFiles(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await profileAPI.uploadFile(formData);
        // ✅ Handle nested data.data.url from Cloudinary
        const url  = res.data?.data?.url || res.data?.url || res.data?.fileUrl;
        const name = res.data?.data?.originalName || file.name;
        const uploadedType = res.data?.data?.fileType || file.type || '';
        const type = uploadedType.startsWith('image/') ? 'image' : 'file';
        if (url) {
          setPendingFiles(prev => [...prev, { name, url, size: file.size, type }]);
        } else {
          alert(`Upload failed: ${file.name}`);
        }
      }
    } catch (err) {
      alert('File upload error: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingFiles(false);
    }
  };

  const removePendingFile = (idx) => setPendingFiles(prev => prev.filter((_, i) => i !== idx));

  // ── Send message ──────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (isBlocked) {
      return alert('You cannot send messages to a blocked user.');
    }
    const text = input.trim();
    if ((!text && pendingFiles.length === 0) || !activeConv || sending || uploadingFiles) return;
    setSending(true);
    const attachmentsToSend = pendingFiles;
    setInput('');
    setPendingFiles([]);

    const optimistic = {
      _id: `temp-${Date.now()}`,
      content: text,
      attachments: attachmentsToSend,
      sender: { _id: myId, firstName: user?.firstName, lastName: user?.lastName },
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      const res = await msgAPI.sendMessage(activeConv._id, { content: text, attachments: attachmentsToSend });
      setMessages(prev => prev.map(m => m._id === optimistic._id ? res.data.data : m));
      if (whatsAppAlertsActive) {
        toast.success('WhatsApp copy alert sync dispatched successfully!', { duration: 2500, icon: '💬' });
      }
    } catch (err) {
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
      setInput(text);
      setPendingFiles(attachmentsToSend);
      console.error('Send error:', err);
    } finally {
      setSending(false);
    }
  };

  // ── Typing ────────────────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!activeConv || !socketRef.current) return;
    if (!isTyping) { setIsTyping(true); socketRef.current.emit('typing', { conversationId: activeConv._id }); }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      setIsTyping(false);
      socketRef.current.emit('stopTyping', { conversationId: activeConv._id });
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleDelete = async (msgId) => {
    setMessages((prev) => prev.map((msg) => msg._id === msgId ? {
      ...msg,
      isDeleted: true,
      content: 'This message was deleted.',
    } : msg));

    try {
      await msgAPI.deleteMessage(msgId);
    } catch (err) {
      console.error(err);
    }
  };

  // ── Filtered convs ────────────────────────────────────────────────────────────
  const filteredConvs = conversations.filter(c => {
    if (!search.trim()) return true;
    const other = getOtherParticipant(c, myId);
    const name = `${other?.firstName || ''} ${other?.lastName || ''}`.toLowerCase();
    const preview = (c.lastMessage?.content || '').toLowerCase();
    const jobTitle = c.job?.title?.toLowerCase() || '';
    return (
      name.includes(search.toLowerCase()) ||
      preview.includes(search.toLowerCase()) ||
      jobTitle.includes(search.toLowerCase())
    );
  });

  const canSend = !isBlocked && (input.trim().length > 0 || pendingFiles.length > 0) && !sending && !uploadingFiles;

  const styles = {
    ...s,
    shell: { ...s.shell, background: isDarkMode ? '#071622' : s.shell.background },
    backBtn: { ...s.backBtn, color: isDarkMode ? '#16a34a' : s.backBtn.color },
    sidebar: { ...s.sidebar, background: isDarkMode ? '#0d1b23' : s.sidebar.background, borderRight: isDarkMode ? '1px solid rgba(255,255,255,0.03)' : s.sidebar.borderRight },
    sidebarHeader: { ...s.sidebarHeader, borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.03)' : s.sidebarHeader.borderBottom },
    convItemActive: { ...s.convItemActive, background: isDarkMode ? 'rgba(255,255,255,0.02)' : s.convItemActive.background },
    chatHeader: { ...s.chatHeader, background: isDarkMode ? '#071422' : s.chatHeader.background, borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.04)' : s.chatHeader.borderBottom },
    inputArea: { ...s.inputArea, background: isDarkMode ? '#071422' : s.inputArea.background, borderTop: isDarkMode ? '1px solid rgba(255,255,255,0.03)' : s.inputArea.borderTop },
    attachBtn: { ...s.attachBtn, border: isDarkMode ? '1.5px solid rgba(255,255,255,0.04)' : s.attachBtn.border, background: isDarkMode ? '#071422' : s.attachBtn.background, color: isDarkMode ? '#9aa3b3' : s.attachBtn.color },
    textarea: { ...s.textarea, border: isDarkMode ? '1.5px solid rgba(255,255,255,0.04)' : s.textarea.border, background: isDarkMode ? '#071422' : 'transparent', color: isDarkMode ? '#e6eef8' : '#111' },
    pendingWrap: { ...s.pendingWrap, background: isDarkMode ? '#071422' : s.pendingWrap.background },
    pendingChip: { ...s.pendingChip, background: isDarkMode ? '#071422' : s.pendingChip.background, border: isDarkMode ? '1px solid rgba(255,255,255,0.03)' : s.pendingChip.border },
    pendingIconBox: { ...s.pendingIconBox, background: isDarkMode ? 'rgba(255,255,255,0.02)' : s.pendingIconBox.background, color: isDarkMode ? '#9aa3b3' : s.pendingIconBox.color },
    pendingName: { ...s.pendingName, color: isDarkMode ? '#e6eef8' : s.pendingName.color },
    menuBtn: { ...s.menuBtn, border: isDarkMode ? '1px solid rgba(255,255,255,0.03)' : s.menuBtn.border, background: isDarkMode ? '#071422' : s.menuBtn.background, color: isDarkMode ? '#e6eef8' : s.menuBtn.color },
    actionIcon: { ...s.actionIcon, border: isDarkMode ? '1px solid rgba(255,255,255,0.03)' : s.actionIcon.border, background: isDarkMode ? '#071422' : s.actionIcon.background, color: isDarkMode ? '#e6eef8' : s.actionIcon.color },
    actionIconCircle: { ...s.actionIconCircle, border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : s.actionIconCircle.border, background: isDarkMode ? '#071422' : s.actionIconCircle.background, color: isDarkMode ? '#e6eef8' : s.actionIconCircle.color },
    menuPanel: { ...s.menuPanel, background: isDarkMode ? '#071422' : s.menuPanel.background, border: isDarkMode ? '1px solid rgba(255,255,255,0.03)' : s.menuPanel.border },
    menuItem: { ...s.menuItem, color: isDarkMode ? '#e6eef8' : s.menuItem.color },
    centerMsg: { ...s.centerMsg, color: isDarkMode ? '#9aa3b3' : s.centerMsg.color },
  };

  return (
    <div style={styles.shell}>
      <style>{`
        @keyframes voiceWaveJump {
          from { transform: scaleY(1); }
          to { transform: scaleY(2.0); }
        }
      `}</style>
      {/* ── Sidebar ── */}
      <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
          <button onClick={() => navigate(userType === 'freelancer' ? '/freelancer/dashboard' : '/dashboard')} style={styles.backBtn} aria-label="Back">
            <BackIcon size={22} color={isDarkMode ? '#16a34a' : '#111'} />
          </button>
          <span style={{ fontWeight: 600, fontSize: 15, color: isDarkMode ? accentColor : '#111' }}>Messages</span>
          <div style={{ width: 48 }} />
        </div>
        <div style={styles.searchWrap}>
          <div style={styles.searchInputWrap}>
            <input ref={searchInputRef} placeholder="Search conversations…" value={search}
              onChange={e => { setSearch(e.target.value); setSearchStatus(''); }}
              onKeyDown={handleSearchInputKeyDown} style={styles.searchInput} />
            <button onClick={handleSearch} style={styles.searchBtn} type="button">Search</button>
          </div>
          {searchStatus && <div style={styles.searchStatus}>{searchStatus}</div>}
        </div>
        <div style={styles.convList}>
          {loading ? (
            <div style={styles.centerMsg}>Loading…</div>
          ) : filteredConvs.length === 0 ? (
            <div style={styles.centerMsg}>No conversations yet.</div>
          ) : filteredConvs.map(conv => {
            const other    = getOtherParticipant(conv, myId);
            const isActive = activeConv?._id === conv._id;
            const lastPreview = conv.lastMessage?.content
              || (conv.lastMessage?.attachments?.length ? '📎 Attachment' : 'No messages yet');
            return (
              <div key={conv._id} onClick={() => selectConversation(conv)}
                style={{ ...s.convItem, ...(isActive ? { ...s.convItemActive, borderLeft: `3px solid ${accentColor}` } : {}) }}>
                <Avatar user={other} color={accentColor} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 13.5, color: isDarkMode ? '#16a34a' : '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {other?.firstName} {other?.lastName}
                    </span>
                    <span style={{ fontSize: 11, color: '#a3a3a3', flexShrink: 0 }}>
                      {formatTime(conv.lastMessage?.createdAt)}
                    </span>
                  </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                    <span style={{ fontSize: 12.5, color: isDarkMode ? '#9fe9b0' : '#737373', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                      {lastPreview}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span style={{ ...s.unreadBadge, background: accentColor }}>{conv.unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Chat area ── */}
      <div style={styles.chatArea}>
        {!activeConv ? (
          <EmptyState icon="💬" title="Select a conversation" sub="Choose a conversation from the left to start chatting." />
        ) : (
          <>
            {/* Header */}
            <div style={styles.chatHeader}>
              {(() => {
                const other = getOtherParticipant(activeConv, myId);
                return (
                  <>
                    <Avatar user={other} size={38} color={accentColor} />
                    <div style={{ marginLeft: 12, flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#111', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span>{other?.firstName} {other?.lastName}</span>
                        {favoriteConversations[activeConv._id] && <span style={{ fontSize: 14 }}>⭐</span>}
                      </div>
                      <div style={{ fontSize: 12, color: '#a3a3a3', textTransform: 'capitalize' }}>
                        {other?.role}
                        {activeConv.job && <> · {activeConv.job.title}{activeConv.job.status ? ` · ${activeConv.job.status.replace('_', ' ')}` : ''}</>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {activeConv.job?.status === 'completed' && (
                        <button onClick={handleReviewAction} style={{
                          ...styles.actionIconCircle,
                          color: reviewInfo?.canReview ? '#2563eb' : reviewInfo?.alreadyReviewed ? '#f59e0b' : (isDarkMode ? '#e6eef8' : '#111'),
                          borderColor: reviewInfo?.canReview ? '#2563eb' : (isDarkMode ? 'rgba(255,255,255,0.04)' : '#e5e7eb'),
                          background: reviewInfo?.alreadyReviewed ? '#fef3c7' : (isDarkMode ? '#071422' : '#fff'),
                        }} type="button" disabled={reviewLoading || (!reviewInfo?.canReview && !reviewInfo?.alreadyReviewed)} title={reviewInfo?.canReview ? 'Rate this job' : reviewInfo?.alreadyReviewed ? 'Reviewed' : 'Review'}>
                          <Icon name="star" />
                        </button>
                      )}
                      <button onClick={handleVideoCall} style={styles.actionIconCircle} title="Start Video Call" type="button"><Icon name="video" /></button>
                      <button onClick={handleVoiceCall} style={styles.actionIconCircle} title="Start Voice Call" type="button"><Icon name="phone" /></button>
                      <button onClick={() => setInChatSearchOpen((prev) => !prev)} style={{
                        ...styles.actionIconCircle,
                        ...(inChatSearchOpen ? { background: isDarkMode ? 'rgba(37,99,235,0.2)' : '#eff6ff', borderColor: '#2563eb', color: '#2563eb' } : {})
                      }} title="Search Chat" type="button"><Icon name="search" /></button>
                      <div style={{ position: 'relative' }} ref={menuRef}>
                        <button onClick={() => setMenuOpen((prev) => !prev)} style={styles.actionIconCircle} title="More Options" type="button">
                          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="5" r="2" />
                            <circle cx="12" cy="12" r="2" />
                            <circle cx="12" cy="19" r="2" />
                          </svg>
                        </button>
                        {menuOpen && (
                          <div style={styles.menuPanel}>
                            <button onClick={() => { setMenuOpen(false); setInChatSearchOpen(true); }} style={styles.menuItem} type="button">🔍 Search in chat</button>
                            <button onClick={handleContactInfo} style={styles.menuItem} type="button">📇 Contact info</button>
                            <button onClick={toggleSelectMode} style={styles.menuItem} type="button">
                              {selectMode ? 'Exit selection' : '☑️ Select messages'}
                            </button>
                            <button onClick={toggleMute} style={styles.menuItem} type="button">
                              {mutedConversations[activeConv._id] ? '🔔 Unmute notifications' : '🔕 Mute notifications'}
                            </button>
                            <button onClick={toggleFavorite} style={styles.menuItem} type="button">
                              {favoriteConversations[activeConv._id] ? '⭐ Remove from favorites' : '⭐ Add to favorites'}
                            </button>
                            <button onClick={handleBlockUser} style={styles.menuItem} type="button">
                              {isBlocked ? '🔓 Unblock user' : '🚫 Block user'}
                            </button>
                            <button onClick={handleReport} style={styles.menuItem} type="button">🚩 Report user</button>
                            <button onClick={handleClearChat} style={styles.menuItem} type="button">🧹 Clear chat</button>
                            <button onClick={handleDeleteConversation} style={styles.menuItemDanger} type="button">🗑️ Delete chat</button>
                            <button onClick={handleCloseChat} style={styles.menuItem} type="button">❌ Close chat</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {inChatSearchOpen && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px',
                background: isDarkMode ? '#0d1b23' : '#f8fafc',
                borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e5e7eb'
              }}>
                <div style={{ color: isDarkMode ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center' }}>
                  <Icon name="search" />
                </div>
                <input
                  autoFocus
                  type="text"
                  placeholder="Search messages in this chat..."
                  value={chatSearchQuery}
                  onChange={handleChatSearchChange}
                  style={{
                    flex: 1, padding: '8px 14px', borderRadius: 8,
                    border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1',
                    background: isDarkMode ? '#071422' : '#fff',
                    color: isDarkMode ? '#e6eef8' : '#0f172a',
                    fontSize: 13.5, outline: 'none', fontFamily: "'DM Sans', sans-serif"
                  }}
                />
                {chatSearchQuery.trim() && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: 600 }}>
                    {matchingMessages.length > 0 ? (
                      <>
                        <span>{activeMatchIndex + 1} of {matchingMessages.length}</span>
                        <button onClick={handlePrevMatch} style={{ background: 'none', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer', padding: '2px 6px', fontSize: 11, color: isDarkMode ? '#fff' : '#111' }} title="Previous match">▲</button>
                        <button onClick={handleNextMatch} style={{ background: 'none', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer', padding: '2px 6px', fontSize: 11, color: isDarkMode ? '#fff' : '#111' }} title="Next match">▼</button>
                      </>
                    ) : (
                      <span style={{ color: '#ef4444' }}>No results</span>
                    )}
                  </div>
                )}
                <button onClick={() => { setInChatSearchOpen(false); setChatSearchQuery(''); }} style={{
                  background: 'none', border: 'none', color: isDarkMode ? '#94a3b8' : '#64748b',
                  cursor: 'pointer', fontSize: 16, padding: '4px 8px', display: 'flex', alignItems: 'center'
                }} title="Close search bar" type="button">✕</button>
              </div>
            )}

            {selectMode && (
              <div style={styles.selectBar}>
                <span>{selectedMessages.size} selected</span>
                <div>
                  <button onClick={() => setSelectedMessages(new Set())} style={styles.selectAction}>Clear</button>
                  <button onClick={handleDeleteSelectedMessages} style={styles.selectActionDanger}>Delete</button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div style={styles.msgList}>
              {msgLoading ? (
                <div style={styles.centerMsg}>Loading messages…</div>
              ) : messages.length === 0 ? (
                <EmptyState icon="👋" title="Say hello!" sub="Send your first message to get started." />
              ) : messages.map(msg => {
                const isMe = (msg.sender?._id || msg.sender) === myId;
                const selected = selectedMessages.has(msg._id);
                const isTargetMatch = matchingMessages[activeMatchIndex]?._id === msg._id;
                const textContent = translatedMessages[msg._id] ? translatedMessages[msg._id] : msg.content;
                return (
                  <div id={`chat-msg-${msg._id}`} key={msg._id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 8, gap: 8, alignItems: 'flex-end', transition: 'all 0.2s ease' }}>
                    {!isMe && <Avatar user={msg.sender} size={28} color={accentColor} />}
                    <div style={{ maxWidth: '65%', position: 'relative' }}>
                      {selectMode && (
                        <button onClick={() => toggleMessageSelection(msg._id)} style={{
                          position: 'absolute', top: -4, right: -34, width: 28, height: 28, borderRadius: 999,
                            border: `1px solid ${selected ? accentColor : (isDarkMode ? 'rgba(255,255,255,0.04)' : '#d1d5db')}`, background: selected ? accentColor : (isDarkMode ? '#071422' : '#fff'), color: selected ? '#fff' : (isDarkMode ? '#9aa3b3' : '#6b7280'), cursor: 'pointer'
                        }} type="button">
                          ✓
                        </button>
                      )}
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: isMe ? accentColor : (isDarkMode ? '#0b2f20' : '#f3f4f6'),
                        color: isMe ? '#fff' : (isDarkMode ? '#dff7e8' : '#111'),
                        fontSize: 13.5, lineHeight: 1.5,
                        opacity: msg.isOptimistic ? 0.7 : 1,
                        fontStyle: msg.isDeleted ? 'italic' : 'normal',
                        boxShadow: isTargetMatch ? '0 0 0 3px #2563eb, 0 4px 12px rgba(37,99,235,0.3)' : 'none',
                        transition: 'box-shadow 0.2s ease'
                      }}>
                        {!msg.isDeleted && <AttachmentList attachments={msg.attachments} isMe={isMe} />}
                        {msg.content?.startsWith('[Voice Message]') ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 200, padding: '4px 0' }}>
                            <button 
                              style={{ width: 32, height: 32, borderRadius: '50%', background: isMe ? '#fff' : accentColor, border: 'none', color: isMe ? accentColor : '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center', fontWeight: 700 }}
                              onClick={() => playVoiceNoteAudio(msg._id, msg.content, msg.attachments)}
                            >
                              {playingVoiceId === msg._id ? '⏸' : '▶'}
                            </button>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: 12 }}>🎤 Voice Note</div>
                              <div style={{ height: 16, display: 'flex', alignItems: 'flex-end', gap: 2.5, marginTop: 4 }}>
                                {[2, 4, 6, 8, 3, 5, 7, 6, 4, 3, 5, 7, 8, 4, 3, 6, 5, 2].map((h, hIdx) => {
                                  const isPlaying = playingVoiceId === msg._id;
                                  return (
                                    <span 
                                      key={hIdx} 
                                      style={{ 
                                        width: 2.5, 
                                        height: `${h * 1.5}px`, 
                                        background: isMe ? 'rgba(255,255,255,0.75)' : 'rgba(37, 99, 235, 0.75)', 
                                        borderRadius: 1,
                                        transformOrigin: 'bottom',
                                        animation: isPlaying ? `voiceWaveJump 0.4s ease-in-out ${hIdx * 0.03}s infinite alternate` : 'none'
                                      }} 
                                    />
                                  );
                                })}
                              </div>
                            </div>
                            <span style={{ fontSize: 11, opacity: 0.8 }}>0:08</span>
                          </div>
                        ) : (
                          renderHighlightedText(textContent, chatSearchQuery)
                        )}
                        {!msg.isDeleted && !msg.content?.startsWith('[Voice Message]') && (
                          <div style={{ marginTop: 6, display: 'flex', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => toggleTranslation(msg._id, msg.content)}
                              style={{
                                background: 'none', border: 'none', padding: 0,
                                color: isMe ? '#e0e7ff' : '#4f46e5', fontSize: 10.5, fontWeight: 700,
                                cursor: 'pointer', opacity: 0.85
                              }}
                            >
                              🌐 {translatedMessages[msg._id] ? 'Show Original' : 'Translate (Hindi/English)'}
                            </button>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                        <span style={{ fontSize: 11, color: '#a3a3a3' }}>{formatTime(msg.createdAt)}</span>
                        {isMe && !msg.isDeleted && !msg.isOptimistic && !selectMode && (
                          <button onClick={() => handleDelete(msg._id)} style={styles.deleteBtn} title="Delete">🗑</button>
                        )}
                      </div>
                    </div>
                    {isMe && <Avatar user={user} size={28} color={accentColor} />}
                  </div>
                );
              })}
              {typingUsers.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ padding: '8px 14px', background: isDarkMode ? '#0b1720' : '#f3f4f6', borderRadius: '16px 16px 16px 4px', fontSize: 13 }}>
                    <span style={{ letterSpacing: 2, color: isDarkMode ? '#e6eef8' : undefined }}>●●●</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Pending files preview */}
            {pendingFiles.length > 0 && (
              <div style={styles.pendingWrap}>
                {pendingFiles.map((f, i) => (
                  <div key={i} style={styles.pendingChip}>
                    {isImageFile(f.name)
                      ? <img src={f.url} alt={f.name} style={styles.pendingThumb} />
                      : <div style={styles.pendingIconBox}><Icon name="file" /></div>}
                    <div style={{ minWidth: 0 }}>
                      <div style={styles.pendingName}>{f.name}</div>
                      <div style={styles.pendingSize}>{formatFileSize(f.size)}</div>
                    </div>
                    <button onClick={() => removePendingFile(i)} style={styles.pendingRemove}><Icon name="x" /></button>
                  </div>
                ))}
              </div>
            )}

            {/* WhatsApp Alert & Voice Record Status strip */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isDarkMode ? '#071422' : '#f8fafc', padding: '6px 16px', borderTop: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.04)' : '#e5e7eb'}`, borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.04)' : '#e5e7eb'}`, fontSize: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#16a34a', fontWeight: 700, cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={whatsAppAlertsActive} 
                  onChange={(e) => {
                    setWhatsAppAlertsActive(e.target.checked);
                    toast.success(`WhatsApp notification sync ${e.target.checked ? 'activated' : 'deactivated'}.`);
                  }} 
                  style={{ accentColor: '#16a34a' }}
                />
                💬 Sync copy to WhatsApp (+91 98*** ***54)
              </label>

              {isRecordingVoice && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontWeight: 700 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }} />
                  <span>Recording Voice Note... ({voiceRecordDuration}s)</span>
                  <button 
                    onClick={() => {
                      setIsRecordingVoice(false);
                      setInput('[Voice Message] 🎤 Voice Note (0:08)');
                      toast.success('Voice note recorded. Press Send to transmit.');
                    }}
                    style={{ border: 'none', background: '#ef4444', color: '#fff', borderRadius: 4, padding: '2px 8px', fontSize: 10, cursor: 'pointer' }}
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* WhatsApp Style Input Bar matching Image 2 */}
            {emojiPickerOpen && (
              <div style={{
                position: 'absolute', bottom: 75, left: 20, zIndex: 10,
                background: isDarkMode ? '#0d1b23' : '#ffffff',
                border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                borderRadius: 16, padding: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6, width: 310
              }}>
                {['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😍', '🥰', '😘', '😜', '😎', '🥳', '👍', '👎', '👏', '🙌', '🙏', '🔥', '✨', '🎉', '❤️', '💡', '🚀', '💯', '🤝', '✅', '⭐', '💬', '📞', '📷'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setInput((prev) => prev + emoji);
                      setEmojiPickerOpen(false);
                    }}
                    style={{
                      background: 'none', border: 'none', fontSize: 20, cursor: 'pointer',
                      padding: 6, borderRadius: 8, transition: 'background 0.15s'
                    }}
                    type="button"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px',
              background: isDarkMode ? '#071422' : '#ffffff',
              borderTop: isDarkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid #f0f0f0',
              position: 'relative'
            }}>
              <input ref={fileInputRef} type="file" multiple accept="*/*" style={{ display: 'none' }} onChange={handleFilesSelected} />

              {/* Left Group: Attachment & Emoji Picker */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={handleAttachClick}
                  disabled={uploadingFiles}
                  style={{
                    width: 38, height: 38, borderRadius: '50%', border: 'none',
                    background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                    color: isDarkMode ? '#9aa3b3' : '#64748b', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  title="Attach file"
                  type="button"
                >
                  {uploadingFiles ? '…' : <Icon name="paperclip" />}
                </button>

                <button
                  onClick={() => setEmojiPickerOpen((prev) => !prev)}
                  style={{
                    width: 38, height: 38, borderRadius: '50%', border: 'none',
                    background: emojiPickerOpen ? (isDarkMode ? 'rgba(37,99,235,0.2)' : '#e0e7ff') : (isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9'),
                    color: emojiPickerOpen ? '#2563eb' : (isDarkMode ? '#9aa3b3' : '#64748b'),
                    fontSize: 18, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  title="Insert emoji"
                  type="button"
                >
                  😃
                </button>
              </div>

              {/* Text Area */}
              <textarea
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message…"
                rows={1}
                style={{
                  flex: 1, padding: '10px 16px',
                  border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                  borderRadius: 24, fontSize: 13.5, fontFamily: "'DM Sans', sans-serif",
                  outline: 'none', lineHeight: 1.5, maxHeight: 120, overflowY: 'auto',
                  background: isDarkMode ? '#0d1b23' : '#f8fafc',
                  color: isDarkMode ? '#e6eef8' : '#0f172a'
                }}
              />

              {/* Right Action: Mic when empty, Send when typing/attached */}
              {!input.trim() && pendingFiles.length === 0 ? (
                <button
                  onClick={() => {
                    if (isRecordingVoice) {
                      stopRecordingAudio();
                    } else {
                      startRecordingAudio();
                    }
                  }}
                  style={{
                    width: 42, height: 42, borderRadius: '50%', border: 'none',
                    background: isRecordingVoice ? '#ef4444' : accentColor,
                    color: '#ffffff', fontSize: 18, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}
                  title={isRecordingVoice ? 'Stop recording' : 'Record voice note'}
                  type="button"
                >
                  {isRecordingVoice ? '⏹' : '🎤'}
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!canSend}
                  style={{
                    width: 42, height: 42, borderRadius: '50%', border: 'none',
                    background: accentColor, color: '#ffffff', fontSize: 16,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, opacity: canSend ? 1 : 0.5
                  }}
                  title="Send message"
                  type="button"
                >
                  {sending ? '…' : '➤'}
                </button>
              )}
            </div>

            {contactInfoOpen && activeOther && (
              <div style={styles.modalOverlay} onClick={handleCloseContactInfo}>
                <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                  <div style={styles.modalHeader}>
                    <div>
                      <div style={styles.modalTitle}>Contact info</div>
                      <div style={styles.modalSubtitle}>{activeOther.firstName} {activeOther.lastName}</div>
                    </div>
                    <button onClick={handleCloseContactInfo} style={styles.modalClose} type="button">✕</button>
                  </div>
                  <div style={styles.modalBody}>
                    <div style={styles.modalRow}><strong>Role:</strong> {activeOther.role}</div>
                    <div style={styles.modalRow}><strong>Email:</strong> {activeOther.email || 'Not available'}</div>
                    <div style={styles.modalRow}><strong>Member since:</strong> {new Date(activeOther.createdAt || activeOther.updatedAt || Date.now()).toLocaleDateString()}</div>
                    <div style={styles.modalRow}><strong>Status:</strong> {isBlocked ? 'Blocked' : 'Active'}</div>
                  </div>
                </div>
              </div>
            )}

            {reviewModalOpen && activeConv?.job && (
              <div style={styles.modalOverlay} onClick={() => setReviewModalOpen(false)}>
                <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                  <div style={styles.modalHeader}>
                    <div>
                      <div style={styles.modalTitle}>{reviewInfo?.alreadyReviewed ? 'Your review' : 'Rate this job'}</div>
                      <div style={styles.modalSubtitle}>{activeConv.job.title}</div>
                    </div>
                    <button onClick={() => setReviewModalOpen(false)} style={styles.modalClose} type="button">✕</button>
                  </div>
                  <div style={styles.modalBody}>
                    {reviewInfo?.alreadyReviewed && reviewInfo.existingReview ? (
                      <>
                        <div style={styles.modalRow}><strong>Rating:</strong> {reviewInfo.existingReview.rating} / 5</div>
                        <div style={styles.modalRow}><strong>Comment:</strong></div>
                        <div style={{ ...styles.modalRow, whiteSpace: 'pre-wrap' }}>{reviewInfo.existingReview.comment}</div>
                      </>
                    ) : (
                      <>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} type="button" onClick={() => setReviewRating(star)}
                              style={{
                                border: '1px solid #e5e7eb', borderRadius: 10, background: star <= reviewRating ? '#fde68a' : '#fff', color: '#111', width: 40, height: 40, cursor: 'pointer', fontSize: 18,
                              }}>
                              ★
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Write your review..."
                          rows={5}
                          style={{ padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: 12, width: '100%', fontSize: 13.5, fontFamily: "'DM Sans', sans-serif", minHeight: 120 }}
                        />
                        {reviewError && <div style={{ color: '#dc2626', marginTop: 10, fontSize: 13 }}>{reviewError}</div>}
                        <button type="button" onClick={handleSubmitReview}
                          disabled={reviewLoading}
                          style={{ marginTop: 14, width: '100%', borderRadius: 10, border: 'none', padding: '12px 16px', background: '#2563eb', color: '#fff', cursor: 'pointer' }}>
                          {reviewLoading ? 'Submitting…' : 'Submit review'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* Real Agora Video Call Overlay */}
            {videoCallActive && activeOther && (
              <AgoraCall
                conversationId={activeConv._id}
                remoteName={`${activeOther.firstName || ''} ${activeOther.lastName || ''}`.trim() || 'User'}
                remoteAvatar={<Avatar user={activeOther} size={100} color={accentColor} />}
                durationText={formatCallDuration(videoCallDuration)}
                onHangUp={() => {
                  handleEndCall();
                  toast.error(`Call disconnected. Total duration: ${formatCallDuration(videoCallDuration)}`, { icon: '📞' });
                }}
              />
            )}
          </>
        )}
      </div>

      {/* ── Incoming Call Modal ── */}
      {incomingCall && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.95)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: '#fff', zIndex: 1100, fontFamily: "'DM Sans', sans-serif"
        }}>
          <div style={{
            width: 110, height: 110, borderRadius: '50%',
            background: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, fontWeight: 700, textTransform: 'uppercase',
            boxShadow: '0 0 0 0 rgba(37, 99, 235, 0.7)',
            animation: 'pulseCall 1.8s infinite'
          }}>
            {incomingCall.callerName?.slice(0, 2)}
          </div>
          <h2 style={{ marginTop: 24, fontSize: 22, fontWeight: 700 }}>Incoming Video Call</h2>
          <p style={{ marginTop: 8, fontSize: 15, color: '#94a3b8' }}>{incomingCall.callerName} is calling you...</p>
          <div style={{ display: 'flex', gap: 24, marginTop: 40 }}>
            <button 
              onClick={handleAcceptCall}
              style={{
                width: 60, height: 60, borderRadius: '50%', background: '#10b981',
                border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)'
              }}
              title="Accept Call"
            >
              📞
            </button>
            <button 
              onClick={handleDeclineCall}
              style={{
                width: 60, height: 60, borderRadius: '50%', background: '#ef4444',
                border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3)'
              }}
              title="Decline Call"
            >
              ❌
            </button>
          </div>
        </div>
      )}

      {/* ── Outgoing Call Modal ── */}
      {outgoingCall && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.95)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: '#fff', zIndex: 1100, fontFamily: "'DM Sans', sans-serif"
        }}>
          <div style={{
            width: 110, height: 110, borderRadius: '50%',
            background: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, fontWeight: 700, textTransform: 'uppercase',
            boxShadow: '0 0 0 0 rgba(37, 99, 235, 0.7)',
            animation: 'pulseCall 1.8s infinite'
          }}>
            {activeOther?.firstName?.slice(0, 1)}{activeOther?.lastName?.slice(0, 1)}
          </div>
          <h2 style={{ marginTop: 24, fontSize: 22, fontWeight: 700 }}>Calling...</h2>
          <p style={{ marginTop: 8, fontSize: 15, color: '#94a3b8' }}>Ringing {activeOther?.firstName} {activeOther?.lastName}...</p>
          <div style={{ marginTop: 40 }}>
            <button 
              onClick={handleEndCall}
              style={{
                width: 60, height: 60, borderRadius: '50%', background: '#ef4444',
                border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3)'
              }}
              title="Cancel Call"
            >
              🛑
            </button>
          </div>
        </div>
      )}

      <style>{`
        * { box-sizing: border-box; } 
        textarea { resize: none; }
        @keyframes pulseCall {
          0% {
            box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.6);
          }
          70% {
            box-shadow: 0 0 0 20px rgba(37, 99, 235, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
          }
        }
      `}</style>
    </div>
  );
};

const s = {
  shell:          { display: 'flex', height: '100vh', background: '#fafafa', fontFamily: "'DM Sans', sans-serif", overflow: 'hidden' },
  sidebar:        { width: 320, background: '#fff', borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  sidebarHeader:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 12px', borderBottom: '1px solid #f0f0f0' },
  backBtn:        { background: 'none', border: 'none', fontSize: 13.5, color: '#2563eb', cursor: 'pointer', fontWeight: 500, padding: '6px 10px', borderRadius: 8 },
  searchWrap:     { padding: '12px 16px', borderBottom: '1px solid #f0f0f0' },
  searchInputWrap: { display: 'flex', gap: 8, alignItems: 'center' },
  searchInput:    { flex: 1, padding: '9px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13.5, outline: 'none', fontFamily: "'DM Sans', sans-serif" },
  searchBtn:      { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontSize: 13.5 },
  searchStatus:   { marginTop: 8, fontSize: 12.5, color: '#6b7280' },
  convList:       { flex: 1, overflowY: 'auto' },
  convItem:       { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer', borderLeft: '3px solid transparent', transition: 'background .1s' },
  convItemActive: { background: '#f5f9ff' },
  unreadBadge:    { color: '#fff', borderRadius: 99, fontSize: 10, fontWeight: 700, padding: '2px 7px', minWidth: 18, textAlign: 'center' },
  chatArea:       { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  chatHeader:     { display: 'flex', alignItems: 'center', padding: '14px 20px', background: '#fff', borderBottom: '1px solid #f0f0f0', flexShrink: 0 },
  msgList:        { flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column' },
  inputArea:      { display: 'flex', alignItems: 'flex-end', gap: 10, padding: '14px 20px', background: '#fff', borderTop: '1px solid #f0f0f0', flexShrink: 0 },
  attachBtn:      { width: 42, height: 42, borderRadius: '50%', border: '1.5px solid #e5e7eb', background: '#fff', color: '#525252', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  textarea:       { flex: 1, padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 12, fontSize: 13.5, fontFamily: "'DM Sans', sans-serif", outline: 'none', lineHeight: 1.5, maxHeight: 120, overflowY: 'auto' },
  sendBtn:        { width: 42, height: 42, borderRadius: '50%', border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  deleteBtn:      { background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, opacity: 0.5, padding: 0 },
  centerMsg:      { textAlign: 'center', padding: 32, color: '#a3a3a3', fontSize: 13 },
  pendingWrap:    { display: 'flex', gap: 8, flexWrap: 'wrap', padding: '10px 20px 0', background: '#fff', flexShrink: 0 },
  pendingChip:    { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#f5f5f5', border: '1px solid #e5e7eb', borderRadius: 10, maxWidth: 220 },
  pendingThumb:   { width: 32, height: 32, borderRadius: 6, objectFit: 'cover', flexShrink: 0 },
  pendingIconBox: { width: 32, height: 32, borderRadius: 6, background: '#e5e7eb', color: '#525252', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  pendingName:    { fontSize: 12, color: '#111', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 },
  pendingSize:    { fontSize: 10.5, color: '#a3a3a3' },
  pendingRemove:  { background: 'none', border: 'none', color: '#737373', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 2, flexShrink: 0 },
  menuBtn:       { width: 36, height: 36, borderRadius: 999, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', color: '#111', fontSize: 18, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headerActions: { display: 'flex', alignItems: 'center', gap: 10 },
  actionIcon:    { width: 38, height: 38, borderRadius: 999, border: '1px solid #e5e7eb', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#111' },
  actionIconCircle: { width: 38, height: 38, borderRadius: '50%', border: '1px solid #e2e8f0', background: '#ffffff', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', outline: 'none' },
  reviewBtn:      { border: '1px solid #e5e7eb', borderRadius: 999, padding: '10px 14px', background: '#fff', color: '#111', cursor: 'pointer', fontSize: 13.5, minWidth: 82 },
  reviewBtnActive:{ borderColor: '#2563eb', background: '#2563eb', color: '#fff' },
  menuPanel:     { position: 'absolute', right: 0, top: 48, width: 220, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 10, boxShadow: '0 12px 40px rgba(15, 23, 42, 0.08)', zIndex: 5, display: 'flex', flexDirection: 'column', gap: 6 },
  menuItem:      { border: 'none', background: 'none', textAlign: 'left', width: '100%', padding: '10px 12px', borderRadius: 10, cursor: 'pointer', color: '#111', fontSize: 13.5 },
  menuItemDanger: { border: 'none', background: 'none', textAlign: 'left', width: '100%', padding: '10px 12px', borderRadius: 10, cursor: 'pointer', color: '#dc2626', fontSize: 13.5 },
  selectBar:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #e5e7eb' },
  selectAction:  { border: '1px solid #e5e7eb', background: '#fff', color: '#111', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', marginLeft: 8 },
  selectActionDanger: { border: '1px solid #fecaca', background: '#fff1f2', color: '#b91c1c', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', marginLeft: 8 },
  modalOverlay:  { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, padding: 16 },
  modalContent:  { width: 320, maxWidth: '100%', background: '#fff', borderRadius: 18, padding: 20, boxShadow: '0 16px 50px rgba(15, 23, 42, 0.15)' },
  modalHeader:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  modalTitle:    { fontSize: 16, fontWeight: 700, color: '#111' },
  modalSubtitle: { fontSize: 13, color: '#6b7280' },
  modalClose:    { border: 'none', background: 'none', fontSize: 18, cursor: 'pointer', color: '#6b7280' },
  modalBody:     { display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 },
  modalRow:      { fontSize: 13, color: '#111', lineHeight: 1.5 },
};

export default MessagesPage;
