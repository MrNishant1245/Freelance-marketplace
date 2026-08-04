import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import './styles/global.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { GuestRoute, ProtectedRoute, RoleRoute } from './components/auth/ProtectedRoute';

import RegisterPage          from './pages/auth/RegisterPage';
import LoginPage             from './pages/auth/LoginPage';
import AdminLoginPage        from './pages/auth/AdminLoginPage';
import VerifyEmailPage       from './pages/auth/VerifyEmailPage';
import ResendVerificationPage from './pages/auth/ResendVerificationPage';
import ForgotPasswordPage    from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage     from './pages/auth/ResetPasswordPage';
import ClientDashboard       from './pages/dashboard/ClientDashboard';
import FreelancerDashboard   from './pages/dashboard/FreelancerDashboard';
import AdminDashboard        from './pages/dashboard/AdminDashboard';
import PostJobPage           from './pages/client/PostJobPage';
import MessagesPage          from './pages/MessagesPage';
import ProfilePage           from './pages/ProfilePage';
import PaymentPage           from './pages/PaymentPage';
import { getSocket }         from './utils/socket';
import { tokenStorage }      from './utils/tokenStorage';
import LandingPage           from './pages/LandingPage';
import CategoryLandingPage   from './pages/CategoryLandingPage';

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

const CallManager = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [incomingCall, setIncomingCall] = useState(null);
  const ringtoneRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const token = tokenStorage.getAccess();
    if (!token) return;

    const s = getSocket(token);

    s.on('incomingCall', ({ conversationId, callerName, callerId }) => {
      setIncomingCall({ conversationId, callerName, callerId });
    });

    s.on('callEnded', () => {
      setIncomingCall(null);
    });

    return () => {
      s.off('incomingCall');
      s.off('callEnded');
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (incomingCall) {
      // Auto decline/timeout after 15 seconds
      const timer = setTimeout(() => {
        handleDeclineCall();
      }, 15000);

      if (ringtoneRef.current) ringtoneRef.current.stop();
      ringtoneRef.current = playRingtone('incoming');

      return () => {
        clearTimeout(timer);
        if (ringtoneRef.current) {
          ringtoneRef.current.stop();
          ringtoneRef.current = null;
        }
      };
    }
  }, [incomingCall]);

  const handleAcceptCall = () => {
    if (!incomingCall) return;
    const { conversationId, callerId } = incomingCall;
    const s = getSocket(tokenStorage.getAccess());
    s?.emit('acceptCall', {
      conversationId,
      targetUserId: callerId
    });
    setIncomingCall(null);
    const messagesPath = user?.role === 'freelancer' ? '/freelancer/messages' : '/messages';
    navigate(`${messagesPath}?conversation=${conversationId}&startCall=true`);
  };

  const handleDeclineCall = () => {
    if (!incomingCall) return;
    const { conversationId, callerId } = incomingCall;
    const s = getSocket(tokenStorage.getAccess());
    s?.emit('declineCall', {
      conversationId,
      targetUserId: callerId
    });
    setIncomingCall(null);
  };

  if (!incomingCall) return null;

  const accentColor = user?.role === 'freelancer' ? '#16a34a' : '#2563eb';

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.96)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      color: '#fff', zIndex: 9999, fontFamily: "'DM Sans', sans-serif"
    }}>
      <style>{`
        @keyframes pulseCallGlobal {
          0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.6); }
          70% { box-shadow: 0 0 0 20px rgba(37, 99, 235, 0); }
          100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
        }
      `}</style>
      <div style={{
        width: 110, height: 110, borderRadius: '50%',
        background: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36, fontWeight: 700, textTransform: 'uppercase',
        boxShadow: '0 0 0 0 rgba(37, 99, 235, 0.7)',
        animation: 'pulseCallGlobal 1.8s infinite'
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
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <CallManager />
      <Routes>
        {/* ── Guest only ── */}
        <Route path="/register"              element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/login"                 element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/admin/login"           element={<GuestRoute><AdminLoginPage /></GuestRoute>} />
        <Route path="/forgot-password"       element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
        <Route path="/reset-password/:token" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />

        {/* ── Public ── */}
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        <Route path="/resend-verification" element={<ResendVerificationPage />} />
        <Route path="/categories/:categorySlug" element={<CategoryLandingPage />} />

        {/* ── Client Routes ── */}
        <Route path="/dashboard" element={
          <RoleRoute roles={['client']}><ClientDashboard /></RoleRoute>
        } />
        <Route path="/post-job" element={
          <RoleRoute roles={['client']}><PostJobPage /></RoleRoute>
        } />
        <Route path="/messages" element={
          <RoleRoute roles={['client']}><MessagesPage userType="client" /></RoleRoute>
        } />
        <Route path="/payment" element={
          <RoleRoute roles={['client']}><PaymentPage /></RoleRoute>
        } />

        {/* ── Freelancer Routes ── */}
        <Route path="/freelancer/dashboard" element={
          <RoleRoute roles={['freelancer']}><FreelancerDashboard /></RoleRoute>
        } />
        <Route path="/freelancer/messages" element={
          <RoleRoute roles={['freelancer']}><MessagesPage userType="freelancer" /></RoleRoute>
        } />

        {/* ── Shared Profile (both roles) ── */}
        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />

        {/* ── Admin ── */}
        <Route path="/admin"   element={<RoleRoute roles={['admin']}><AdminDashboard /></RoleRoute>} />
        <Route path="/admin/*" element={<RoleRoute roles={['admin']}><AdminDashboard /></RoleRoute>} />

        {/* ── Default ── */}
        <Route path="/"  element={<LandingPage />} />
        <Route path="*"  element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster position="top-right" toastOptions={{
        style: { fontFamily: 'var(--font-body)', fontSize: 13.5, borderRadius: 10 },
        success: { iconTheme: { primary: 'var(--success)', secondary: '#fff' } },
        error:   { iconTheme: { primary: 'var(--error)',   secondary: '#fff' } },
      }} />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
