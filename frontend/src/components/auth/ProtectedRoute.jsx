import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ✅ Central role → dashboard map
const ROLE_HOME = {
  client:     '/dashboard',
  freelancer: '/freelancer/dashboard',
  admin:      '/admin',
};

const normalizeRole = (role) => String(role || '').trim().toLowerCase();

/* ── Full-page loader ─────────────────────────────────────────────────── */
const PageLoader = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 12px' }} />
      <p style={{ fontSize: 13, color: 'var(--muted)' }}>Loading…</p>
    </div>
  </div>
);

/* ── ProtectedRoute: require auth ─────────────────────────────────────── */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

/* ── RoleRoute: require specific roles ───────────────────────────────── */
export const RoleRoute = ({ children, roles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const userRole = normalizeRole(user?.role);
  const allowedRoles = roles.map(normalizeRole);

  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ FIX: based on role, redirect to correct dashboard
  if (!allowedRoles.includes(userRole)) {
    const fallback = ROLE_HOME[userRole] || '/login';
    return <Navigate to={fallback} replace />;
  }

  return children;
};

const getLoginPanelRole = (location) => {
  if (!location?.search) return null;
  const params = new URLSearchParams(location.search);
  const as = params.get('as');
  return ['freelancer', 'client', 'admin'].includes(as) ? as : null;
};

/* ── GuestRoute: redirect if already logged in ───────────────────────── */
export const GuestRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoader />;

  if (isAuthenticated) {
    const loginRole = getLoginPanelRole(location);
    const userRole = normalizeRole(user?.role);

    // Allow wrong-role users to stay on the login page for a different portal,
    // instead of immediately redirecting them to their current dashboard.
    if (
      (location.pathname === '/login' && loginRole && loginRole !== userRole) ||
      (location.pathname === '/admin/login' && userRole !== 'admin')
    ) {
      return children;
    }

    const redirect = ROLE_HOME[userRole] || '/login';
    return <Navigate to={redirect} replace />;
  }

  return children;
};
