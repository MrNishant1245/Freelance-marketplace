import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api';

const STATUS = { loading: 'loading', success: 'success', error: 'error' };

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState(STATUS.loading);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await authAPI.verifyEmail(token);
        setMessage(data.message);
        setStatus(STATUS.success);
        // Auto-redirect to login after 4 seconds
        setTimeout(() => navigate('/login'), 4000);
      } catch (err) {
        setMessage(err.response?.data?.message || 'Verification failed.');
        setStatus(STATUS.error);
      }
    };
    if (token) verify();
  }, [token, navigate]);

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={iconCircle(status)}>
          {status === STATUS.loading && <Spinner />}
          {status === STATUS.success && <CheckIcon />}
          {status === STATUS.error && <XIcon />}
        </div>

        <h1 style={heading}>
          {status === STATUS.loading && 'Verifying your email…'}
          {status === STATUS.success && 'Email verified!'}
          {status === STATUS.error && 'Verification failed'}
        </h1>

        <p style={body}>
          {status === STATUS.loading && 'Please wait while we confirm your email address.'}
          {status === STATUS.success && message}
          {status === STATUS.error && message}
        </p>

        {status === STATUS.success && (
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            Redirecting you to login in a few seconds…
          </p>
        )}

        {status === STATUS.error && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
            <Link to="/resend-verification" style={btnStyle('var(--brand)')}>
              Resend verification email
            </Link>
            <Link to="/login" style={btnStyle('var(--surface)', 'var(--ink-3)', '1.5px solid var(--border)')}>
              Back to login
            </Link>
          </div>
        )}

        {status === STATUS.success && (
          <Link to="/login" style={{ ...btnStyle('var(--brand)'), marginTop: 20, display: 'block' }}>
            Go to login
          </Link>
        )}
      </div>
    </div>
  );
};

const iconCircle = (status) => ({
  width: 72, height: 72,
  borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  margin: '0 auto 24px',
  background: status === STATUS.success ? '#f0fdf4'
    : status === STATUS.error ? '#fef2f2'
    : 'var(--brand-pale)',
  color: status === STATUS.success ? 'var(--success)'
    : status === STATUS.error ? 'var(--error)'
    : 'var(--brand)',
});

const pageStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', padding: 24 };
const cardStyle = { width: '100%', maxWidth: 400, background: '#fff', borderRadius: 20, padding: '48px 36px', boxShadow: 'var(--shadow-lg)', textAlign: 'center' };
const heading  = { fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--ink)', marginBottom: 12 };
const body     = { fontSize: 14.5, color: 'var(--muted)', lineHeight: 1.7 };
const btnStyle = (bg, color = '#fff', border = 'none') => ({
  display: 'block',
  padding: '11px',
  background: bg,
  color,
  border,
  borderRadius: 10,
  fontWeight: 600,
  fontSize: 14,
  textDecoration: 'none',
  cursor: 'pointer',
  fontFamily: 'var(--font-body)',
  textAlign: 'center',
});

const Spinner = () => (
  <div style={{ width: 28, height: 28, border: '3px solid rgba(26,86,219,.15)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
);
const CheckIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const XIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

export default VerifyEmailPage;
