import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';

const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) return `Today at ${timeStr}`;
  if (isYesterday) return `Yesterday at ${timeStr}`;

  return `${date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })} at ${timeStr}`;
};

const CallHistoryModal = ({
  isOpen,
  onClose,
  conversationId,
  currentOtherUser,
  myId,
  onStartVoiceCall,
  onStartVideoCall,
  isDarkMode = false
}) => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState('current'); // 'current' | 'all'
  const [filterType, setFilterType] = useState('all'); // 'all' | 'voice' | 'video' | 'missed'
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch calls whenever modal opens or scope changes
  useEffect(() => {
    if (!isOpen) return;

    const fetchCalls = async () => {
      setLoading(true);
      try {
        const params = {};
        if (scope === 'current' && conversationId) {
          params.conversationId = conversationId;
        }
        const res = await api.get('/calls/history', { params });
        if (res.data?.success) {
          setCalls(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch call history:', err);
        toast.error('Could not load call history');
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
  }, [isOpen, scope, conversationId]);

  // Filtered calls
  const filteredCalls = useMemo(() => {
    return calls.filter((c) => {
      // Type filter
      if (filterType === 'voice' && c.callType !== 'voice') return false;
      if (filterType === 'video' && c.callType !== 'video') return false;
      if (filterType === 'missed' && c.status !== 'missed' && c.status !== 'declined') return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const otherPerson = (c.caller?._id === myId || c.caller === myId) ? c.receiver : c.caller;
        const name = `${otherPerson?.firstName || ''} ${otherPerson?.lastName || ''}`.toLowerCase();
        const role = (otherPerson?.role || '').toLowerCase();
        if (!name.includes(query) && !role.includes(query)) return false;
      }

      return true;
    });
  }, [calls, filterType, searchQuery, myId]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = calls.length;
    const voiceCount = calls.filter((c) => c.callType === 'voice').length;
    const videoCount = calls.filter((c) => c.callType === 'video').length;
    const totalDuration = calls.reduce((acc, c) => acc + (c.duration || 0), 0);
    return { total, voiceCount, videoCount, totalDuration };
  }, [calls]);

  // Delete single call
  const handleDeleteCall = async (callId, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/calls/${callId}`);
      setCalls((prev) => prev.filter((c) => c._id !== callId));
      toast.success('Call log removed');
    } catch (err) {
      console.error('Failed to delete call:', err);
      toast.error('Could not delete call record');
    }
  };

  // Clear all history for current conversation
  const handleClearHistory = async () => {
    if (!conversationId) return;
    if (!window.confirm('Are you sure you want to clear call history for this conversation?')) return;

    try {
      await api.delete(`/calls/history/${conversationId}`);
      setCalls([]);
      toast.success('Call history cleared');
    } catch (err) {
      console.error('Failed to clear history:', err);
      toast.error('Could not clear call history');
    }
  };

  if (!isOpen) return null;

  // Theme palettes
  const bg = isDarkMode ? '#0f172a' : '#ffffff';
  const cardBg = isDarkMode ? '#1e293b' : '#f8fafc';
  const border = isDarkMode ? '#334155' : '#e2e8f0';
  const textMain = isDarkMode ? '#f8fafc' : '#0f172a';
  const textMuted = isDarkMode ? '#94a3b8' : '#64748b';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1050,
        padding: 16,
        fontFamily: "'DM Sans', sans-serif",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 580,
          maxWidth: '100%',
          maxHeight: '90vh',
          background: bg,
          borderRadius: 20,
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
          border: `1px solid ${border}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeInModal 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ── */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: isDarkMode ? '#141e33' : '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: isDarkMode ? 'rgba(37, 99, 235, 0.2)' : '#eff6ff',
                color: '#2563eb',
                display: 'grid',
                placeItems: 'center',
                fontSize: 20,
              }}
            >
              📞
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: textMain }}>Call History</div>
              <div style={{ fontSize: 13, color: textMuted }}>
                {scope === 'current' && currentOtherUser
                  ? `Calls with ${currentOtherUser.firstName || 'User'}`
                  : 'All voice and video sessions'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            style={{
              background: 'none',
              border: 'none',
              fontSize: 22,
              color: textMuted,
              cursor: 'pointer',
              width: 34,
              height: 34,
              borderRadius: 8,
              display: 'grid',
              placeItems: 'center',
              transition: 'background 0.2s ease',
            }}
          >
            ✕
          </button>
        </div>

        {/* ── Scope Tabs & Quick Stats ── */}
        <div style={{ padding: '14px 24px', borderBottom: `1px solid ${border}` }}>
          {/* Scope switcher */}
          {conversationId && (
            <div
              style={{
                display: 'flex',
                background: isDarkMode ? '#1e293b' : '#f1f5f9',
                borderRadius: 10,
                padding: 3,
                marginBottom: 12,
              }}
            >
              <button
                type="button"
                onClick={() => setScope('current')}
                style={{
                  flex: 1,
                  padding: '7px 12px',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: scope === 'current' ? (isDarkMode ? '#0f172a' : '#ffffff') : 'transparent',
                  color: scope === 'current' ? '#2563eb' : textMuted,
                  boxShadow: scope === 'current' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                💬 This Chat ({currentOtherUser?.firstName || 'User'})
              </button>
              <button
                type="button"
                onClick={() => setScope('all')}
                style={{
                  flex: 1,
                  padding: '7px 12px',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: scope === 'all' ? (isDarkMode ? '#0f172a' : '#ffffff') : 'transparent',
                  color: scope === 'all' ? '#2563eb' : textMuted,
                  boxShadow: scope === 'all' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                🌐 All Calls
              </button>
            </div>
          )}

          {/* Stats Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 8,
              background: isDarkMode ? '#1e293b' : '#f8fafc',
              padding: '10px 14px',
              borderRadius: 12,
              border: `1px solid ${border}`,
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: textMain }}>{stats.total}</div>
              <div style={{ fontSize: 11, color: textMuted }}>Total Calls</div>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>{stats.voiceCount}</div>
              <div style={{ fontSize: 11, color: textMuted }}>📞 Voice</div>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#3b82f6' }}>{stats.videoCount}</div>
              <div style={{ fontSize: 11, color: textMuted }}>📹 Video</div>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#8b5cf6' }}>
                {formatDuration(stats.totalDuration)}
              </div>
              <div style={{ fontSize: 11, color: textMuted }}>Total Duration</div>
            </div>
          </div>
        </div>

        {/* ── Filters & Search ── */}
        <div
          style={{
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            borderBottom: `1px solid ${border}`,
            flexWrap: 'wrap',
          }}
        >
          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'voice', label: '📞 Voice' },
              { id: 'video', label: '📹 Video' },
              { id: 'missed', label: '📵 Missed' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterType(f.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 99,
                  border: filterType === f.id ? '1px solid #2563eb' : `1px solid ${border}`,
                  background: filterType === f.id ? (isDarkMode ? 'rgba(37,99,235,0.2)' : '#eff6ff') : 'transparent',
                  color: filterType === f.id ? '#2563eb' : textMuted,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search box if all calls */}
          {scope === 'all' && (
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: `1px solid ${border}`,
                background: isDarkMode ? '#1e293b' : '#ffffff',
                color: textMain,
                fontSize: 12,
                outline: 'none',
                width: 150,
              }}
            />
          )}
        </div>

        {/* ── Call List ── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: textMuted, fontSize: 14 }}>
              Loading call history...
            </div>
          ) : filteredCalls.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>📞</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: textMain }}>No call records found</div>
              <div style={{ fontSize: 13, color: textMuted, marginTop: 4, maxWidth: 300, margin: '6px auto 0' }}>
                {filterType !== 'all'
                  ? 'No calls match the selected filter.'
                  : 'Start a voice or video call in the conversation to build your call logs.'}
              </div>
            </div>
          ) : (
            filteredCalls.map((call) => {
              const isOutgoing = call.caller?._id === myId || call.caller === myId;
              const otherUser = isOutgoing ? call.receiver : call.caller;
              const isVoice = call.callType === 'voice';
              const isMissed = call.status === 'missed' || call.status === 'declined';

              return (
                <div
                  key={call._id}
                  style={{
                    background: cardBg,
                    border: `1px solid ${border}`,
                    borderRadius: 14,
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Left: Avatar & Type Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ position: 'relative' }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          background: isVoice ? '#059669' : '#2563eb',
                          color: '#fff',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: 16,
                          fontWeight: 700,
                        }}
                      >
                        {otherUser?.firstName?.slice(0, 1) || 'U'}
                        {otherUser?.lastName?.slice(0, 1) || ''}
                      </div>
                      <div
                        style={{
                          position: 'absolute',
                          bottom: -2,
                          right: -2,
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          background: isMissed ? '#ef4444' : (isVoice ? '#10b981' : '#3b82f6'),
                          border: `2px solid ${cardBg}`,
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: 10,
                        }}
                      >
                        {isMissed ? '✕' : (isVoice ? '📞' : '📹')}
                      </div>
                    </div>

                    <div>
                      {/* Name & Direction */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: textMain }}>
                          {otherUser?.firstName || 'User'} {otherUser?.lastName || ''}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '1px 7px',
                            borderRadius: 99,
                            background: isMissed
                              ? 'rgba(239, 68, 68, 0.15)'
                              : (isOutgoing ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)'),
                            color: isMissed ? '#ef4444' : (isOutgoing ? '#10b981' : '#3b82f6'),
                          }}
                        >
                          {isMissed
                            ? (call.status === 'declined' ? '🚫 Declined' : '📵 Missed')
                            : (isOutgoing ? '↗️ Outgoing' : '↙️ Incoming')}
                        </span>
                      </div>

                      {/* Date & Time */}
                      <div style={{ fontSize: 12, color: textMuted, marginTop: 3 }}>
                        {formatDateTime(call.startedAt || call.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Right: Duration & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Call Duration Badge */}
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: isMissed ? '#ef4444' : textMain,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          justifyContent: 'flex-end',
                        }}
                      >
                        <span>⏱️</span>
                        <span>{isMissed ? '0s' : formatDuration(call.duration)}</span>
                      </div>
                      <div style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>
                        {isVoice ? 'Voice Call' : 'Video Call'}
                      </div>
                    </div>

                    {/* Quick Call Back Button */}
                    {otherUser && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          if (isVoice && onStartVoiceCall) {
                            onStartVoiceCall(otherUser);
                          } else if (onStartVideoCall) {
                            onStartVideoCall(otherUser);
                          }
                        }}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          border: 'none',
                          background: isVoice ? '#059669' : '#2563eb',
                          color: '#fff',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: 14,
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        }}
                        title={`Call back (${isVoice ? 'Voice' : 'Video'})`}
                      >
                        {isVoice ? '📞' : '📹'}
                      </button>
                    )}

                    {/* Delete Call Log Button */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCall(call._id, e)}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        border: 'none',
                        background: 'transparent',
                        color: textMuted,
                        cursor: 'pointer',
                        fontSize: 14,
                        display: 'grid',
                        placeItems: 'center',
                        transition: 'color 0.2s',
                      }}
                      title="Remove from history"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Modal Footer ── */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: `1px solid ${border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: isDarkMode ? '#141e33' : '#f8fafc',
          }}
        >
          {conversationId && calls.length > 0 ? (
            <button
              type="button"
              onClick={handleClearHistory}
              style={{
                background: 'none',
                border: 'none',
                color: '#ef4444',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>🗑️</span>
              <span>Clear History for This Chat</span>
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              border: `1px solid ${border}`,
              background: isDarkMode ? '#1e293b' : '#ffffff',
              color: textMain,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInModal {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default CallHistoryModal;
