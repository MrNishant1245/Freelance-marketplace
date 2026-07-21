import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useAuth } from '../../context/AuthContext';
import AuthPanel from '../../components/auth/AuthPanel';
import { Alert, Spinner } from '../../components/common/FormElements';

const getRoleFromSearch = (search) => {
  const p = new URLSearchParams(search);
  const as = p.get('as');
  return ['freelancer', 'client', 'admin'].includes(as) ? as : 'client';
};

const ROLE_LABELS = { client: 'Client', freelancer: 'Freelancer', admin: 'Admin' };
const normalizeRole = (role) => String(role || '').trim().toLowerCase();

// ✅ Different dashboard based on role
const ROLE_REDIRECTS = {
  client: '/dashboard',
  freelancer: '/freelancer/dashboard',
  admin: '/admin',
};

const LoginPage = () => {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const panelRole = getRoleFromSearch(location.search);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [serverError, setServerError] = useState('');
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setServerError('Please enter email and password.');
      return;
    }
    setServerError('');
    setIsSubmitting(true);
    try {
      const result = await login({ email, password });
      const user = result?.data?.user;
      if (!user) throw new Error('No user data received');
      const userRole = normalizeRole(user.role);

      if (userRole !== panelRole) {
        await logout();
        setEmailNotVerified(false);
        setServerError(`Invalid ${ROLE_LABELS[panelRole]} account. Please use the correct portal and login with the matching user.`);
        return;
      }

      toast.success(`Welcome back, ${user.firstName}!`);
      const redirect = location.state?.from?.pathname || ROLE_REDIRECTS[userRole] || '/dashboard';
      navigate(redirect, { replace: true });
    } catch (err) {
      const response = err?.response?.data;
      if (response?.code === 'EMAIL_NOT_VERIFIED') {
        setEmailNotVerified(true);
        setServerError(`${response.message} Please verify your email or resend the link.`);
      } else {
        setEmailNotVerified(false);
        setServerError(response?.message || err?.message || 'Invalid email or password.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <AuthPanel role={panelRole} />
      <div className="auth-form-side">
        <div className="auth-card">
          <div style={{ marginBottom: 32 }}>
            <div style={logoMark}>FM</div>
            <h1 style={headingStyle}>Welcome back</h1>
            <p style={subStyle}>
              Sign in to your{' '}
              <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{ROLE_LABELS[panelRole]}</span>{' '}account
            </p>
          </div>

          {serverError && <Alert type="error">{serverError}</Alert>}

          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label className="form-label">Email address <span style={{ color: 'red' }}>*</span></label>
              <input type="email" className="form-input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">Password <span style={{ color: 'red' }}>*</span></label>
              <input type="password" className="form-input" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
              <Link to="/forgot-password" style={{ position: 'absolute', right: 0, top: 0, fontSize: 12.5, color: 'var(--brand)', fontWeight: 500 }}>Forgot password?</Link>
            </div>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-full btn-lg" style={{ marginTop: 8 }}>
              {isSubmitting ? <><Spinner /> Signing in…</> : 'Sign in'}
            </button>
          </form>

          <div style={roleSwitcher}>
            {['client', 'freelancer', 'admin'].map((r) => (
              <Link key={r} to={`/login?as=${r}`} style={{ ...roleTab, ...(panelRole === r ? roleTabActive : {}) }}>
                {ROLE_LABELS[r]}
              </Link>
            ))}
          </div>

          <div className="divider">or</div>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--brand)', fontWeight: 500 }}>Sign up free</Link>
          </p>

          <div style={unverifiedHint}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Email not verified?{' '}
            <Link to={`/resend-verification?email=${encodeURIComponent(email)}`} style={{ color: 'inherit', textDecoration: 'underline' }}>Resend verification email</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const logoMark = { width: 40, height: 40, borderRadius: 10, background: 'var(--brand)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, marginBottom: 16 };
const headingStyle = { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, color: 'var(--ink)', marginBottom: 6, lineHeight: 1.2 };
const subStyle = { fontSize: 14, color: 'var(--muted)' };
const roleSwitcher = { display: 'flex', marginTop: 24, border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden' };
const roleTab = { flex: 1, padding: '8px 4px', textAlign: 'center', fontSize: 12.5, fontWeight: 500, color: 'var(--muted)', textDecoration: 'none', transition: 'all .15s', background: 'transparent' };
const roleTabActive = { background: 'var(--brand)', color: '#fff' };
const unverifiedHint = { marginTop: 16, padding: '9px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: 12.5, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 };

export default LoginPage;
