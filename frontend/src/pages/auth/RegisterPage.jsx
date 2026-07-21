import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';

import { useAuth } from '../../context/AuthContext';
import AuthPanel from '../../components/auth/AuthPanel';
import RoleSelector from '../../components/auth/RoleSelector';
import { FormInput, Alert, Spinner, PasswordStrength } from '../../components/common/FormElements';

const schema = yup.object({
  firstName: yup.string().trim().required('First name is required').max(50),
  lastName:  yup.string().trim().required('Last name is required').max(50),
  email:     yup.string().email('Enter a valid email').required('Email is required'),
  password:  yup
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
  role: yup.string().oneOf(['freelancer', 'client'], 'Please choose a role').required('Please choose a role'),
  agreeTerms: yup.boolean().oneOf([true], 'You must accept the terms'),
});

const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [passwordValue, setPasswordValue] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema), mode: 'onSubmit' });

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setValue('role', role, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    console.log('✅ Register submitted!', data);
    setServerError('');
    setIsSubmitting(true);
    try {
      const { confirmPassword, agreeTerms, ...payload } = data;
      await registerUser(payload);
      toast.success('Account created! Please check your email to verify before signing in.');
      navigate(`/login?as=${payload.role}`, { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <AuthPanel role={selectedRole || 'client'} />

      <div className="auth-form-side">
        <div className="auth-card">

          <div style={{ marginBottom: 28 }}>
            <div style={logoMark}>FM</div>
            <h1 style={headingStyle}>Create your account</h1>
            <p style={subStyle}>
              Already have one?{' '}
              <Link to="/login" style={{ color: 'var(--brand)', fontWeight: 500 }}>Sign in</Link>
            </p>
          </div>

          {serverError && <Alert type="error">{serverError}</Alert>}

          <RoleSelector
            value={selectedRole}
            onChange={handleRoleChange}
            error={errors.role?.message}
          />

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FormInput
                label="First name"
                placeholder="Alex"
                required
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <FormInput
                label="Last name"
                placeholder="Johnson"
                required
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            <FormInput
              label="Email address"
              type="email"
              placeholder="alex@example.com"
              required
              error={errors.email?.message}
              {...register('email')}
            />

            <FormInput
              label="Password"
              type="password"
              placeholder="Min 8 chars, upper & number"
              required
              error={errors.password?.message}
              {...register('password', {
                onChange: (e) => setPasswordValue(e.target.value),
              })}
            />
            <PasswordStrength password={passwordValue} />

            <div style={{ marginTop: 16 }}>
              <FormInput
                label="Confirm password"
                type="password"
                placeholder="Repeat password"
                required
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>

            <label style={checkboxRow}>
              <input
                type="checkbox"
                style={{ accentColor: 'var(--brand)', width: 15, height: 15, flexShrink: 0 }}
                {...register('agreeTerms')}
              />
              <span style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.5 }}>
                I agree to the{' '}
                <Link to="/terms" style={{ color: 'var(--brand)' }}>Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" style={{ color: 'var(--brand)' }}>Privacy Policy</Link>
              </span>
            </label>
            {errors.agreeTerms && (
              <p style={{ fontSize: 12, color: 'var(--error)', marginTop: 4 }}>
                {errors.agreeTerms.message}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: 20 }}
            >
              {isSubmitting ? <><Spinner /> Creating account…</> : 'Create account'}
            </button>
          </form>

          <div style={verifyNote}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.7 3.4 2 2 0 0 1 3.68 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8 8a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45c.9.35 1.84.6 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            We'll send a verification link to your email after signup.
          </div>
        </div>
      </div>
    </div>
  );
};

const logoMark = {
  width: 40, height: 40, borderRadius: 10,
  background: 'var(--brand)', color: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontWeight: 800, fontSize: 15, marginBottom: 16,
};
const headingStyle = {
  fontFamily: 'var(--font-display)',
  fontSize: 26, fontWeight: 400,
  color: 'var(--ink)', marginBottom: 6,
};
const subStyle = { fontSize: 14, color: 'var(--muted)' };

const checkboxRow = {
  display: 'flex', alignItems: 'flex-start', gap: 10,
  marginTop: 16, cursor: 'pointer',
};

const verifyNote = {
  marginTop: 20,
  padding: '10px 14px',
  background: 'var(--brand-pale)',
  borderRadius: 'var(--r-md)',
  fontSize: 12.5,
  color: 'var(--brand)',
  display: 'flex',
  alignItems: 'center',
  gap: 7,
  fontWeight: 500,
};

export default RegisterPage;
