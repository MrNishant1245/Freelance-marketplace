import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const schema = yup.object({
  firstName: yup.string().trim().required('First name is required').max(50),
  lastName: yup.string().trim().required('Last name is required').max(50),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup
    .string()
    .min(8, 'Min 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must include uppercase, lowercase, and number')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
  role: yup.string().oneOf(['freelancer', 'client']).required('Please select a role'),
});

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...submitData } = data;
      await registerUser(submitData);
      toast.success('Account created! Please check your email to verify.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setValue('role', role, { shouldValidate: true });
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>FM</div>
          <h1 style={styles.title}>Create your account</h1>
          <p style={styles.subtitle}>Join thousands of freelancers and clients</p>
        </div>

        {/* Role selector */}
        <div style={styles.roleSection}>
          <p style={styles.roleLabel}>I want to...</p>
          <div style={styles.roleGrid}>
            {[
              { value: 'client', label: 'Hire talent', desc: 'Post projects & find freelancers' },
              { value: 'freelancer', label: 'Find work', desc: 'Offer skills & get hired' },
            ].map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => handleRoleSelect(r.value)}
                style={{
                  ...styles.roleBtn,
                  ...(selectedRole === r.value ? styles.roleBtnActive : {}),
                }}
              >
                <span style={styles.roleBtnTitle}>{r.label}</span>
                <span style={styles.roleBtnDesc}>{r.desc}</span>
              </button>
            ))}
          </div>
          {errors.role && <p style={styles.error}>{errors.role.message}</p>}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>First name</label>
              <input {...register('firstName')} style={styles.input} placeholder="Alex" />
              {errors.firstName && <p style={styles.error}>{errors.firstName.message}</p>}
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Last name</label>
              <input {...register('lastName')} style={styles.input} placeholder="Johnson" />
              {errors.lastName && <p style={styles.error}>{errors.lastName.message}</p>}
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input {...register('email')} type="email" style={styles.input} placeholder="alex@example.com" />
            {errors.email && <p style={styles.error}>{errors.email.message}</p>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input {...register('password')} type="password" style={styles.input} placeholder="Min 8 chars, uppercase & number" />
            {errors.password && <p style={styles.error}>{errors.password.message}</p>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Confirm password</label>
            <input {...register('confirmPassword')} type="password" style={styles.input} placeholder="Repeat password" />
            {errors.confirmPassword && <p style={styles.error}>{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={isLoading} style={{ ...styles.btn, ...(isLoading ? styles.btnDisabled : {}) }}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fc', padding: '24px' },
  card: { width: '100%', maxWidth: 480, background: '#fff', borderRadius: 16, padding: '40px 36px', boxShadow: '0 2px 24px rgba(0,0,0,0.08)' },
  header: { textAlign: 'center', marginBottom: 28 },
  logo: { width: 48, height: 48, borderRadius: 12, background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  title: { fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 6px' },
  subtitle: { fontSize: 14, color: '#6b7280', margin: 0 },
  roleSection: { marginBottom: 24 },
  roleLabel: { fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8 },
  roleGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  roleBtn: { padding: '14px 12px', border: '2px solid #e5e7eb', borderRadius: 10, background: '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' },
  roleBtnActive: { borderColor: '#6366f1', background: '#eef2ff' },
  roleBtnTitle: { display: 'block', fontWeight: 600, color: '#111827', fontSize: 14, marginBottom: 2 },
  roleBtnDesc: { display: 'block', fontSize: 12, color: '#6b7280' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  field: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 14, fontWeight: 500, color: '#374151' },
  input: { padding: '10px 14px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 14, color: '#111827', outline: 'none', transition: 'border-color 0.15s' },
  error: { fontSize: 12, color: '#ef4444', margin: 0 },
  btn: { padding: '12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: 'pointer', marginTop: 4, transition: 'background 0.15s' },
  btnDisabled: { background: '#a5b4fc', cursor: 'not-allowed' },
  footer: { textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6b7280' },
  link: { color: '#6366f1', textDecoration: 'none', fontWeight: 500 },
};

export default Register;
