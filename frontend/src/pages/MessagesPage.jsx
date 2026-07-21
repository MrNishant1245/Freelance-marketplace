import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import api, { profileAPI, reviewAPI } from '../api';
import { tokenStorage } from '../utils/tokenStorage';

// ─── Socket singleton ─────────────────────────────────────────────────────────
let socket = null;
const getSocket = (token) => {
  if (!socket || !socket.connected) {
    socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};

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

// ─── Get other participant from conversation ───────────────────────────────────
const getOtherParticipant = (conv, myId) => {
  if (conv.otherParticipant) return conv.otherParticipant;
  if (!conv.participants) return null;
  return conv.participants.find(p => (p._id || p).toString() !== myId?.toString())
    || conv.participants[0];
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

    return () => {
      s.off('newMessage'); s.off('conversationUpdated');
      s.off('userTyping'); s.off('userStoppedTyping'); s.off('messageDeleted');
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
    if (!activeOther?.phone) {
      return alert('No phone number available for this user.');
    }
    window.location.href = `tel:${activeOther.phone}`;
  };

  const handleVideoCall = () => {
    if (!activeConv) return;
    const room = `freelance-market-place-${activeConv._id}`;
    window.open(`https://meet.jit.si/${encodeURIComponent(room)}`, '_blank', 'noopener,noreferrer');
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

  // ── Load conversations ────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res  = await msgAPI.getConversations();
        const convs = res.data?.data || [];
        setConversations(convs);
        if (convs.length > 0) selectConversation(convs[0]);
      } catch (err) {
        console.error('Load conversations error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Scroll to bottom ──────────────────────────────────────────────────────────
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // ── Select conversation ───────────────────────────────────────────────────────
  const selectConversation = useCallback(async (conv) => {
    if (activeConv) socketRef.current?.emit('leaveConversation', activeConv._id);
    setActiveConv(conv);
    setMessages([]);
    setMsgLoading(true);
    setPendingFiles([]);
    try {
      const res = await msgAPI.getMessages(conv._id, 1);
      setMessages(res.data?.data || []);
    } catch (err) {
      console.error('Load messages error:', err);
    } finally {
      setMsgLoading(false);
    }
    socketRef.current?.emit('joinConversation', conv._id);
    setConversations(prev => prev.map(c => c._id === conv._id ? { ...c, unreadCount: 0 } : c));
  }, [activeConv]);

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
    menuPanel: { ...s.menuPanel, background: isDarkMode ? '#071422' : s.menuPanel.background, border: isDarkMode ? '1px solid rgba(255,255,255,0.03)' : s.menuPanel.border },
    menuItem: { ...s.menuItem, color: isDarkMode ? '#e6eef8' : s.menuItem.color },
    centerMsg: { ...s.centerMsg, color: isDarkMode ? '#9aa3b3' : s.centerMsg.color },
  };

  return (
    <div style={styles.shell}>
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
                    <div style={styles.headerActions}>
                      {activeConv.job?.status === 'completed' && (
                        <button onClick={handleReviewAction} style={{
                          ...styles.actionIcon,
                          color: reviewInfo?.canReview ? '#2563eb' : reviewInfo?.alreadyReviewed ? '#f59e0b' : (isDarkMode ? '#e6eef8' : '#111'),
                          borderColor: reviewInfo?.canReview ? '#2563eb' : (isDarkMode ? 'rgba(255,255,255,0.04)' : '#e5e7eb'),
                          background: reviewInfo?.alreadyReviewed ? '#fef3c7' : (isDarkMode ? '#071422' : '#fff'),
                        }} type="button" disabled={reviewLoading || (!reviewInfo?.canReview && !reviewInfo?.alreadyReviewed)} title={reviewInfo?.canReview ? 'Rate this job' : reviewInfo?.alreadyReviewed ? 'Reviewed' : 'Review'}>
                          <Icon name="star" />
                        </button>
                      )}
                      <button onClick={handleVideoCall} style={styles.actionIcon} type="button"><Icon name="video" /></button>
                      <button onClick={handleVoiceCall} style={styles.actionIcon} type="button"><Icon name="phone" /></button>
                      <button onClick={handleSearch} style={styles.actionIcon} type="button"><Icon name="search" /></button>
                    </div>
                    <div style={{ position: 'relative' }} ref={menuRef}>
                      <button onClick={() => setMenuOpen((prev) => !prev)} style={styles.menuBtn} type="button">
                        ⋮
                      </button>
                      {menuOpen && (
                        <div style={styles.menuPanel}>
                          <button onClick={handleSearch} style={styles.menuItem} type="button">Search</button>
                          <button onClick={handleContactInfo} style={styles.menuItem} type="button">Contact info</button>
                          <button onClick={toggleSelectMode} style={styles.menuItem} type="button">
                            {selectMode ? 'Exit selection' : 'Select messages'}
                          </button>
                          <button onClick={toggleMute} style={styles.menuItem} type="button">
                            {mutedConversations[activeConv._id] ? 'Unmute notifications' : 'Mute notifications'}
                          </button>
                          <button onClick={toggleFavorite} style={styles.menuItem} type="button">
                            {favoriteConversations[activeConv._id] ? 'Remove from favorites' : 'Add to favorites'}
                          </button>
                          <button onClick={handleBlockUser} style={styles.menuItem} type="button">
                            {isBlocked ? 'Unblock' : 'Block'} user
                          </button>
                          <button onClick={handleReport} style={styles.menuItem} type="button">Report</button>
                          <button onClick={handleClearChat} style={styles.menuItem} type="button">Clear chat</button>
                          <button onClick={handleDeleteConversation} style={styles.menuItemDanger} type="button">Delete chat</button>
                          <button onClick={handleCloseChat} style={styles.menuItem} type="button">Close chat</button>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

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
                return (
                  <div key={msg._id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 8, gap: 8, alignItems: 'flex-end' }}>
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
                      }}>
                        {!msg.isDeleted && <AttachmentList attachments={msg.attachments} isMe={isMe} />}
                        {msg.content}
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

            {/* Input */}
            <div style={styles.inputArea}>
              <input ref={fileInputRef} type="file" multiple
                accept="*/*"
                style={{ display: 'none' }} onChange={handleFilesSelected} />
              <button onClick={handleAttachClick} disabled={uploadingFiles}
                style={{ ...styles.attachBtn, opacity: uploadingFiles ? 0.5 : 1 }} title="Attach file" type="button">
                {uploadingFiles ? '…' : <Icon name="paperclip" />}
              </button>
              <textarea value={input} onChange={handleInputChange} onKeyDown={handleKeyDown}
                placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                rows={1} style={styles.textarea} />
              <button onClick={handleSend} disabled={!canSend}
                style={{ ...styles.sendBtn, background: accentColor, opacity: canSend ? 1 : 0.5 }}>
                {sending ? '…' : '➤'}
              </button>
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
          </>
        )}
      </div>

      <style>{`* { box-sizing: border-box; } textarea { resize: none; }`}</style>
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
  headerActions: { display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 },
  actionIcon:    { width: 36, height: 36, borderRadius: 999, border: '1px solid #e5e7eb', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#111' },
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
