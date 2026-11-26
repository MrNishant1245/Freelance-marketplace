import React from 'react';

const ROLES = [
  {
    value: 'client',
    title: "I'm a Client",
    desc: 'Post projects & hire talent',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    activeColor: 'var(--client)',
    activeBg: 'var(--client-pale)',
    activeBorder: 'var(--client)',
  },
  {
    value: 'freelancer',
    title: "I'm a Freelancer",
    desc: 'Offer skills & find work',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    activeColor: 'var(--freelancer)',
    activeBg: 'var(--freelancer-pale)',
    activeBorder: 'var(--freelancer)',
  },
];

const RoleSelector = ({ value, onChange, error }) => {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-3)', marginBottom: 8 }}>
        I want to…
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {ROLES.map((role) => {
          const active = value === role.value;
          return (
            <button
              key={role.value}
              type="button"
              onClick={() => onChange(role.value)}
              style={{
                padding: '14px 12px',
                border: `2px solid ${active ? role.activeBorder : 'var(--border)'}`,
                borderRadius: 'var(--r-md)',
                background: active ? role.activeBg : 'var(--white)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all .18s',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
              aria-pressed={active}
            >
              <span style={{ color: active ? role.activeColor : 'var(--muted)' }}>
                {role.icon}
              </span>
              <span style={{ display: 'block', fontWeight: 600, fontSize: 13.5, color: active ? role.activeColor : 'var(--ink)' }}>
                {role.title}
              </span>
              <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>
                {role.desc}
              </span>
            </button>
          );
        })}
      </div>
      {error && (
        <p style={{ fontSize: 12, color: 'var(--error)', marginTop: 6 }}>{error}</p>
      )}
    </div>
  );
};

export default RoleSelector;
