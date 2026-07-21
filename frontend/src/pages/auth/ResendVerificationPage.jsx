import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';

import { authAPI } from '../../api';
import { FormInput, Alert, Spinner } from '../../components/common/FormElements';

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
});

const ResendVerificationPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const defaultEmail = params.get('email') || '';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema), defaultValues: { email: defaultEmail } });

  const onSubmit = async ({ email }) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      await authAPI.resendVerification(email);
      setSent(true);
      toast.success('Verification email sent. Check your inbox.');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Unable to send verification email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={headerRow}>
          <div>
            <div style={logoMark}>FM</div>
            <h1 style={heading}>Resend verification</h1>
            <p style={subText}>Enter your email to receive a fresh verification link.</p>
          </div>
          <Link to="/login" style={backLink}>Back to login</Link>
        </div>

        {serverError && <Alert type="error">{serverError}</Alert>}

        {!sent ? (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormInput
              label="Email address"
              type="email"
              required
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-full btn-lg" style={{ marginTop: 16 }}>
              {isSubmitting ? <><Spinner /> Sending…</> : 'Send verification email'}
            </button>
          </form>
        ) : (
          <div style={successBox}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Check your email</h2>
            <p style={{ marginTop: 10, color: 'var(--muted)', lineHeight: 1.7 }}>
              If an account exists for that email, a verification link has been sent. It may take a minute to arrive.
            </p>
            <Link to="/login" className="btn btn-outline btn-full" style={{ marginTop: 18 }}>
              Back to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--surface)',
  padding: 24,
};

const cardStyle = {
  width: '100%',
  maxWidth: 420,
  background: '#fff',
  borderRadius: 20,
  padding: '38px 34px',
  boxShadow: 'var(--shadow-lg)',
};

const headerRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 16,
  marginBottom: 24,
};

const logoMark = {
  width: 42,
  height: 42,
  borderRadius: 12,
  background: 'var(--brand)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 800,
  fontSize: 16,
};

const heading = {
  fontFamily: 'var(--font-display)',
  fontSize: 24,
  color: 'var(--ink)',
  margin: 0,
};

const subText = {
  fontSize: 14,
  color: 'var(--muted)',
  marginTop: 6,
  lineHeight: 1.7,
};

const backLink = {
  color: 'var(--brand)',
  textDecoration: 'none',
  fontWeight: 500,
  fontSize: 13,
};

const successBox = {
  padding: 24,
  borderRadius: 16,
  background: '#f0fdf4',
  border: '1px solid #d1fae5',
  textAlign: 'center',
};

export default ResendVerificationPage;
