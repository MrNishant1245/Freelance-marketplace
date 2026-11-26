import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { authAPI } from '../../api';
import { FormInput, Alert, Spinner } from '../../components/common/FormElements';

const schema = yup.object({ email: yup.string().email('Enter a valid email').required('Email is required') });

const ForgotPasswordPage = () => {
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, getValues, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async ({ email }) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <Link to="/login" style={backLink}>
          <ArrowLeft size={14} /> Back to login
        </Link>

        {!sent ? (
          <>
            <div style={iconCircle}>
              <KeyIcon />
            </div>
            <h1 style={heading}>Forgot your password?</h1>
            <p style={subText}>No worries. Enter your email and we'll send you a reset link.</p>

            {serverError && <Alert type="error">{serverError}</Alert>}

            <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ marginTop: 24 }}>
              <FormInput
                label="Email address"
                type="email"
                placeholder="you@example.com"
                required
                error={errors.email?.message}
                {...register('email')}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary btn-full btn-lg"
                style={{ marginTop: 8 }}
              >
                {isSubmitting ? <><Spinner /> Sending…</> : 'Send reset link'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div style={{ ...iconCircle, background: '#f0fdf4', color: 'var(--success)' }}>
              <MailIcon />
            </div>
            <h1 style={heading}>Check your inbox</h1>
            <p style={subText}>
              If an account exists for <strong>{getValues('email')}</strong>, you'll receive a password reset link shortly.
            </p>
            <div style={tipBox}>
              <span>💡</span>
              <span>Didn't receive it? Check your spam folder or wait a few minutes.</span>
            </div>
            <button
              onClick={() => setSent(false)}
              style={{ ...linkBtn, marginTop: 20 }}
            >
              Try a different email
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const ArrowLeft = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
const KeyIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);
const MailIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const pageStyle  = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', padding: 24 };
const cardStyle  = { width: '100%', maxWidth: 400, background: '#fff', borderRadius: 20, padding: '40px 36px', boxShadow: 'var(--shadow-lg)' };
const backLink   = { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)', textDecoration: 'none', marginBottom: 28, fontWeight: 500 };
const iconCircle = { width: 64, height: 64, borderRadius: '50%', background: 'var(--brand-pale)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 };
const heading    = { fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', marginBottom: 8 };
const subText    = { fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 };
const tipBox     = { marginTop: 20, padding: '12px 14px', background: 'var(--surface)', borderRadius: 10, fontSize: 13, color: 'var(--muted)', display: 'flex', gap: 8, lineHeight: 1.6 };
const linkBtn    = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)', fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-body)', padding: 0, display: 'block', width: '100%', textAlign: 'center' };

export default ForgotPasswordPage;
