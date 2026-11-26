import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { FormInput, Alert, Spinner } from '../../components/common/FormElements';

const schema = yup.object({
  email:    yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const AdminLoginPage = () => {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema), mode: 'onBlur' });

  const onSubmit = async (data) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      const result = await login(data);
      const user = result.data.user;
      if (user.role !== 'admin') {
        await logout();
        setServerError('Access denied. This portal is for administrators only.');
        return;
      }
      toast.success(`Welcome, ${user.firstName}.`);
      navigate('/admin', { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={pageStyle}>
      {/* Background grid */}
      <div style={gridBg} aria-hidden="true" />

      <div style={cardStyle}>
        {/* Top badge */}
        <div style={badgeRow}>
          <span style={badge}>
            <LockIcon />
            Admin Portal
          </span>
        </div>

        <div style={logoArea}>
          <div style={logoBox}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <h1 style={headingStyle}>FreelanceMarket</h1>
          <p style={subText}>Administrative access only. Unauthorised access is prohibited.</p>
        </div>

        <div style={dividerLine} />

        {serverError && <Alert type="error">{serverError}</Alert>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <FormInput
            label="Admin email"
            type="email"
            placeholder="admin@example.com"
            required
            autoComplete="username"
            error={errors.email?.message}
            {...register('email')}
          />
          <FormInput
            label="Password"
            type="password"
            placeholder="Admin password"
            required
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            style={{ ...submitBtn, ...(isSubmitting ? submitBtnDisabled : {}) }}
          >
            {isSubmitting ? (
              <>
                <span style={spinnerInline} />
                Authenticating…
              </>
            ) : (
              <>
                <LockIcon color="#fff" />
                Sign in to Admin Panel
              </>
            )}
          </button>
        </form>

        <div style={footerNote}>
          <ShieldIcon />
          All admin activity is logged and monitored.
        </div>

        <div style={backLinkRow}>
          <Link to="/login" style={backLinkStyle}>
            <ArrowLeftIcon />
            Not an admin? Go to regular login
          </Link>
        </div>
      </div>
    </div>
  );
};

/* ── Icons ─────────────────────────────────────────────────────────────── */
const LockIcon = ({ color = 'currentColor', size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const ShieldIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const ArrowLeftIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

/* ── Styles ─────────────────────────────────────────────────────────────── */
const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#0d0f12',
  padding: 24,
  position: 'relative',
};

const gridBg = {
  position: 'absolute',
  inset: 0,
  backgroundImage: `
    linear-gradient(rgba(251,191,36,.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(251,191,36,.04) 1px, transparent 1px)
  `,
  backgroundSize: '40px 40px',
  pointerEvents: 'none',
};

const cardStyle = {
  position: 'relative',
  width: '100%',
  maxWidth: 400,
  background: '#16181e',
  border: '1px solid rgba(251,191,36,.12)',
  borderRadius: 18,
  padding: '36px 32px',
  boxShadow: '0 0 60px rgba(251,191,36,.06), 0 24px 60px rgba(0,0,0,.5)',
  animation: 'fadeUp .4s ease both',
};

const badgeRow = {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: 24,
};

const badge = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '4px 12px',
  background: 'rgba(251,191,36,.08)',
  border: '1px solid rgba(251,191,36,.2)',
  borderRadius: 99,
  fontSize: 11.5,
  fontWeight: 600,
  color: '#fbbf24',
  letterSpacing: '.06em',
  textTransform: 'uppercase',
};

const logoArea = {
  textAlign: 'center',
  marginBottom: 24,
};
const logoBox = {
  width: 48, height: 48, borderRadius: 14,
  background: 'linear-gradient(135deg,#b45309,#fbbf24)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  margin: '0 auto 14px',
  boxShadow: '0 4px 16px rgba(180,83,9,.4)',
};
const headingStyle = {
  fontFamily: 'var(--font-display)',
  fontSize: 22,
  color: '#f9fafb',
  marginBottom: 8,
};
const subText = {
  fontSize: 12.5,
  color: '#6b7280',
  lineHeight: 1.6,
  maxWidth: 280,
  margin: '0 auto',
};

const dividerLine = {
  height: 1,
  background: 'rgba(255,255,255,.06)',
  margin: '20px 0',
};

const submitBtn = {
  width: '100%',
  padding: '12px',
  marginTop: 8,
  background: 'linear-gradient(135deg, #b45309, #d97706)',
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  transition: 'all .15s',
  boxShadow: '0 2px 12px rgba(180,83,9,.35)',
  fontFamily: 'var(--font-body)',
};
const submitBtnDisabled = {
  opacity: .55, cursor: 'not-allowed',
};
const spinnerInline = {
  display: 'inline-block',
  width: 16, height: 16,
  border: '2px solid rgba(255,255,255,.3)',
  borderTopColor: '#fff',
  borderRadius: '50%',
  animation: 'spin .7s linear infinite',
};

const footerNote = {
  marginTop: 20,
  padding: '10px 14px',
  background: 'rgba(255,255,255,.03)',
  border: '1px solid rgba(255,255,255,.07)',
  borderRadius: 8,
  fontSize: 12,
  color: '#6b7280',
  display: 'flex',
  alignItems: 'center',
  gap: 7,
};

const backLinkRow = {
  marginTop: 16,
  textAlign: 'center',
};

const backLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 12.5,
  color: '#9ca3af',
  textDecoration: 'none',
  fontWeight: 500,
};

export default AdminLoginPage;
