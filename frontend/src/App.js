import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import './styles/global.css';

import { AuthProvider } from './context/AuthContext';
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

const App = () => (
  <BrowserRouter>
    <AuthProvider>
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
        <Route path="/"  element={<Navigate to="/login" replace />} />
        <Route path="*"  element={<Navigate to="/login" replace />} />
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
