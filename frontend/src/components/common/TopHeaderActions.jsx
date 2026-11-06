import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileAPI } from '../../api';
import toast from 'react-hot-toast';

const Icon = ({ name, size = 16 }) => {
  const icons = {
    sun:       <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
    moon:      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
    bell:      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    mail:      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>,
    user:      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    edit:      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    switch:    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="16 3 21 8 16 13"/><line x1="21" y1="8" x2="9" y2="8"/><polyline points="8 21 3 16 8 11"/><line x1="3" y1="16" x2="15" y2="16"/></svg>,
    logout:    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    plus:      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  };
  return icons[name] || null;
};

const TopHeaderActions = ({ currentCurrency, onCurrencyChange }) => {
  const { user, isDarkMode, toggleDarkMode, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [selectedCurrency, setSelectedCurrency] = useState(
    currentCurrency || localStorage.getItem('selectedCurrency') || 'INR'
  );
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      const cur = localStorage.getItem('selectedCurrency') || 'INR';
      setSelectedCurrency(cur);
    };
    window.addEventListener('currencyChange', handleStorageChange);
    return () => window.removeEventListener('currencyChange', handleStorageChange);
  }, []);

  const handleCurrencySelect = (e) => {
    const val = e.target.value;
    setSelectedCurrency(val);
    localStorage.setItem('selectedCurrency', val);
    if (onCurrencyChange) onCurrencyChange(val);
    window.dispatchEvent(new Event('currencyChange'));
  };

  const firstName = user?.firstName || user?.name || 'User';
  const role = user?.role || 'client';

  const mockNotifications = [
    { id: 1, label: '🔔 Welcome to FreelanceHub!' },
    { id: 2, label: '💬 You have new messages' },
  ];

  return (
    <div className="top-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end', flexShrink: 0 }}>
      {/* Currency Selector */}
      <select
        value={selectedCurrency}
        onChange={handleCurrencySelect}
        style={{
          padding: '4px 10px',
          borderRadius: 8,
          background: isDarkMode ? '#0f172a' : '#ffffff',
          border: isDarkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e2e8f0',
          color: isDarkMode ? '#cbd5e1' : '#475569',
          fontSize: 12.5,
          fontWeight: 600,
          cursor: 'pointer',
          outline: 'none',
          height: 34,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <option value="INR">₹ INR</option>
        <option value="USD">$ USD</option>
        <option value="EUR">€ EUR</option>
        <option value="GBP">£ GBP</option>
      </select>

      {/* Dark mode toggle */}
      <button 
        type="button"
        onClick={() => toggleDarkMode && toggleDarkMode()} 
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          border: isDarkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e2e8f0',
          background: isDarkMode ? '#0f172a' : '#ffffff',
          color: isDarkMode ? '#cbd5e1' : '#475569',
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
          flexShrink: 0
        }}
        title="Switch Theme"
      >
        <Icon name={isDarkMode ? 'sun' : 'moon'} />
      </button>

      {/* Notifications bell */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setNotificationsOpen((prev) => !prev)}
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            border: isDarkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e2e8f0',
            background: isDarkMode ? '#0f172a' : '#ffffff',
            color: isDarkMode ? '#cbd5e1' : '#475569',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            position: 'relative',
            flexShrink: 0
          }}
          aria-label="Notifications"
          title="Notifications"
        >
          <Icon name="bell" />
        </button>
        {notificationsOpen && (
          <div style={{
            position: 'absolute', top: '44px', right: 0,
            background: isDarkMode ? '#071422' : '#ffffff',
            border: isDarkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e2e8f0',
            borderRadius: 12, padding: '12px 14px', width: 220, zIndex: 100,
            boxShadow: '0 10px 25px rgba(0,0,0,0.18)', color: isDarkMode ? '#f8fafc' : '#0f172a'
          }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Notifications</div>
            {mockNotifications.map(n => (
              <div key={n.id} style={{ fontSize: 12, padding: '6px 0', borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9' }}>
                {n.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Messages Mail button */}
      <button 
        type="button" 
        onClick={() => navigate('/messages')}
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          border: isDarkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e2e8f0',
          background: isDarkMode ? '#0f172a' : '#ffffff',
          color: isDarkMode ? '#cbd5e1' : '#475569',
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          position: 'relative'
        }} 
        aria-label="Messages"
        title="Messages"
      >
        <Icon name="mail" />
      </button>

      {/* User Avatar Menu */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          style={{ cursor: 'pointer', width: 34, height: 34, borderRadius: '50%', background: isDarkMode ? '#1f2937' : '#111827', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 'bold', fontSize: 13, boxShadow: '0 2px 6px rgba(17, 24, 39, 0.2)', flexShrink: 0 }}
        >
          {firstName[0]?.toUpperCase()}
        </div>
        {userMenuOpen && (
          <div style={{ position: 'absolute', top: '48px', right: '0', background: isDarkMode ? '#071422' : '#fff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)', border: isDarkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e2e8f0', width: '220px', zIndex: 100, padding: '8px 0', display: 'flex', flexDirection: 'column' }}>
            <button onClick={() => { setUserMenuOpen(false); navigate('/profile'); }} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 16px', background: 'none', border: 'none', fontSize: '13.5px', color: isDarkMode ? '#cbd5e1' : '#334155', fontWeight: '500', textAlign: 'left', cursor: 'pointer' }}>
              <span style={{ marginRight: '12px', color: isDarkMode ? '#94a3b8' : '#64748b' }}><Icon name="user" size={16} /></span>
              View Profile
            </button>

            <button onClick={() => { setUserMenuOpen(false); navigate('/profile', { state: { edit: true } }); }} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 16px', background: 'none', border: 'none', fontSize: '13.5px', color: isDarkMode ? '#cbd5e1' : '#334155', fontWeight: '500', textAlign: 'left', cursor: 'pointer' }}>
              <span style={{ marginRight: '12px', color: isDarkMode ? '#94a3b8' : '#64748b' }}><Icon name="edit" size={16} /></span>
              Edit Profile
            </button>

            <div style={{ height: '1px', background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9', margin: '6px 0' }} />

            <button onClick={async () => {
              setUserMenuOpen(false);
              const targetRole = role === 'freelancer' ? 'client' : 'freelancer';
              try {
                const res = await profileAPI.updateProfile({ role: targetRole });
                if (res.data?.success || res.data?.user) {
                  updateUser && updateUser({ ...user, role: targetRole });
                  toast.success(`Switched to ${targetRole === 'freelancer' ? 'Freelancer' : 'Client'} Mode! 🚀`);
                  navigate(targetRole === 'freelancer' ? '/freelancer/dashboard' : '/dashboard');
                }
              } catch (err) {
                toast.error('Failed to switch mode');
              }
            }} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 16px', background: 'none', border: 'none', fontSize: '13.5px', color: '#7c3aed', fontWeight: '500', textAlign: 'left', cursor: 'pointer' }}>
              <span style={{ marginRight: '12px', color: '#7c3aed' }}><Icon name="switch" size={16} /></span>
              Switch to {role === 'freelancer' ? 'Client' : 'Freelancer'}
            </button>

            <div style={{ height: '1px', background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9', margin: '6px 0' }} />

            <button onClick={() => { setUserMenuOpen(false); logout && logout(); navigate('/login'); }} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 16px', background: 'none', border: 'none', fontSize: '13.5px', color: '#dc2626', fontWeight: '500', textAlign: 'left', cursor: 'pointer' }}>
              <span style={{ marginRight: '12px', color: '#ef4444' }}><Icon name="logout" size={16} /></span>
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Primary Action Button */}
      <button 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '0 16px',
          height: 34,
          background: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          flexShrink: 0,
          cursor: 'pointer',
          whiteSpace: 'nowrap'
        }} 
        onClick={() => navigate('/post-job')}
      >
        <Icon name="plus" size={16} /> Post a Job
      </button>
    </div>
  );
};

export default TopHeaderActions;
