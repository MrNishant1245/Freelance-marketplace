import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { authAPI } from '../../api';
import { FormInput, Alert, Spinner, PasswordStrength } from '../../components/common/FormElements';

const schema = yup.object({
  password: yup
    .string()
    .min(8, 'Minimum 8 characters')
    .matches(/[A-Z]/, 'Must include an uppercase letter')
    .matches(/[a-z]/, 'Must include a lowercase letter')
    .matches(/\d/, 'Must include a number')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
});

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const [done, setDone] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema), mode: 'onBlur' });

  const onSubmit = async ({ password }) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      await authAPI.resetPassword(token, password);
      setDone(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {!done ? (
          <>
            <div style={iconCircle}>
              <LockIcon />
            </div>
            <h1 style={heading}>Set a new password</h1>
            <p style={subText}>Choose a strong password you haven't used before.</p>

            {serverError && (
              <div style={{ marginTop: 16 }}>
                <Alert type="error">
                  {serverError}{' '}
                  <Link to="/forgot-password" style={{ color: 'inherit', textDecoration: 'underline' }}>
                    Request new link →
                  </Link>
                </Alert>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ marginTop: 24 }}>
              <FormInput
                label="New password"
                type="password"
                placeholder="Min 8 chars, upper & number"
                required
                error={errors.password?.message}
                {...register('password', { onChange: (e) => setPasswordValue(e.target.value) })}
              />
              <PasswordStrength password={passwordValue} />

              <div style={{ marginTop: 16 }}>
                <FormInput
                  label="Confirm new password"
                  type="password"
                  placeholder="Repeat new password"
                  required
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary btn-full btn-lg"
                style={{ marginTop: 8 }}
              >
                {isSubmitting ? <><Spinner /> Updating…</> : 'Reset password'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div style={{ ...iconCircle, background: '#f0fdf4', color: 'var(--success)' }}>
              <CheckIcon />
            </div>
            <h1 style={heading}>Password updated!</h1>
            <p style={subText}>Your password has been changed. You'll be redirected to login shortly.</p>
            <Link to="/login" className="btn btn-primary btn-full" style={{ marginTop: 24, display: 'flex' }}>
              Go to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

const LockIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const CheckIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const pageStyle  = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', padding: 24 };
const cardStyle  = { width: '100%', maxWidth: 400, background: '#fff', borderRadius: 20, padding: '40px 36px', boxShadow: 'var(--shadow-lg)' };
const iconCircle = { width: 64, height: 64, borderRadius: '50%', background: 'var(--brand-pale)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 };
const heading    = { fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', marginBottom: 8 };
const subText    = { fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 };

export default ResetPasswordPage;
