import React, { useState } from 'react';

/* ── FormInput ───────────────────────────────────────────────────────────── */
export const FormInput = React.forwardRef(
  ({ label, error, type = 'text', hint, required, ...props }, ref) => {
    const [showPw, setShowPw] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPw ? 'text' : 'password') : type;

    return (
      <div className="form-group">
        {label && (
          <label className="form-label">
            {label}
            {required && <span style={{ color: 'var(--error)', marginLeft: 2 }}>*</span>}
          </label>
        )}
        <div className={isPassword ? 'form-input-wrapper' : undefined}>
          <input
            ref={ref}
            type={inputType}
            className={`form-input${error ? ' error' : ''}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              className="input-icon-btn"
              onClick={() => setShowPw((v) => !v)}
              tabIndex={-1}
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        {error && (
          <p className="field-error">
            <AlertCircle size={12} />
            {error}
          </p>
        )}
        {hint && !error && (
          <p style={{ fontSize: 12, color: 'var(--subtle)', marginTop: 2 }}>{hint}</p>
        )}
      </div>
    );
  }
);
FormInput.displayName = 'FormInput';

/* ── Inline SVG icons (no extra dep) ────────────────────────────────────── */
const Eye = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOff = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const AlertCircle = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

/* ── Alert banner ────────────────────────────────────────────────────────── */
export const Alert = ({ type = 'error', children }) => (
  <div className={`alert alert-${type}`}>
    {type === 'error' && <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />}
    {type === 'success' && <CheckCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />}
    {type === 'info' && <Info size={15} style={{ flexShrink: 0, marginTop: 1 }} />}
    <span>{children}</span>
  </div>
);
const CheckCircle = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const Info = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

/* ── Loading spinner ─────────────────────────────────────────────────────── */
export const Spinner = ({ dark = false }) => (
  <span className={`spinner${dark ? ' spinner-dark' : ''}`} role="status" aria-label="Loading" />
);

/* ── Password strength meter ─────────────────────────────────────────────── */
export const PasswordStrength = ({ password }) => {
  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', ok: /[a-z]/.test(password) },
    { label: 'Number', ok: /\d/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ['#e5e7eb', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  if (!password) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1, height: 3, borderRadius: 99,
              background: score >= i ? colors[score] : 'var(--border)',
              transition: 'background .25s',
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {checks.map((c) => (
            <span
              key={c.label}
              style={{
                fontSize: 11,
                color: c.ok ? 'var(--success)' : 'var(--subtle)',
                display: 'flex', alignItems: 'center', gap: 3,
              }}
            >
              <span style={{ fontSize: 10 }}>{c.ok ? '✓' : '○'}</span>
              {c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span style={{ fontSize: 11, fontWeight: 600, color: colors[score] }}>
            {labels[score]}
          </span>
        )}
      </div>
    </div>
  );
};
