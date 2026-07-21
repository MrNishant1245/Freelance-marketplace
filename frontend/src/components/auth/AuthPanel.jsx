import React from 'react';

const ROLE_CONFIG = {
  freelancer: {
    gradient: 'linear-gradient(145deg, #4c1d95 0%, #7c3aed 50%, #a78bfa 100%)',
    accent: '#c4b5fd',
    label: 'For Freelancers',
    headline: 'Your skills deserve the right stage.',
    sub: 'Find projects that match your expertise, build your portfolio, and grow your freelance career.',
    stats: [
      { value: '12k+', label: 'Active projects' },
      { value: '94%', label: 'Satisfaction rate' },
      { value: '$2.4M', label: 'Paid out monthly' },
    ],
    quotes: {
      text: '"I landed my first $10k project within two weeks of joining."',
      author: 'Priya M. — UI/UX Designer',
    },
    dots: ['#7c3aed', '#a78bfa', '#c4b5fd', '#ede9fe'],
  },
  client: {
    gradient: 'linear-gradient(145deg, #164e63 0%, #0891b2 50%, #67e8f9 100%)',
    accent: '#a5f3fc',
    label: 'For Clients',
    headline: 'The right talent, faster than ever.',
    sub: 'Post your project, receive proposals from vetted freelancers, and get work done on your terms.',
    stats: [
      { value: '8.5k+', label: 'Verified freelancers' },
      { value: '48h', label: 'Avg. first proposal' },
      { value: '98%', label: 'Projects delivered' },
    ],
    quotes: {
      text: '"We hired three developers in one week — quality was exceptional."',
      author: 'Rohan S. — CTO, Nexus Labs',
    },
    dots: ['#0891b2', '#22d3ee', '#67e8f9', '#cffafe'],
  },
  admin: {
    gradient: 'linear-gradient(145deg, #451a03 0%, #b45309 50%, #fbbf24 100%)',
    accent: '#fde68a',
    label: 'Admin Portal',
    headline: 'Platform oversight, in one place.',
    sub: 'Manage users, resolve disputes, oversee transactions, and keep the marketplace running smoothly.',
    stats: [
      { value: '20k+', label: 'Total users' },
      { value: '99.9%', label: 'Uptime SLA' },
      { value: '<2h', label: 'Dispute resolution' },
    ],
    quotes: {
      text: '"The admin dashboard gives us full visibility with zero friction."',
      author: 'Internal team note',
    },
    dots: ['#b45309', '#d97706', '#fbbf24', '#fde68a'],
  },
};

const DEFAULT = ROLE_CONFIG.client;

const AuthPanel = ({ role = 'client' }) => {
  const cfg = ROLE_CONFIG[role] || DEFAULT;

  return (
    <div
      className="auth-panel"
      style={{ background: cfg.gradient }}
      aria-hidden="true"
    >
      {/* Decorative blobs */}
      <div style={blob(cfg.dots[0], '60%', '-10%', 320)} />
      <div style={blob(cfg.dots[1], '-8%', '40%', 240)} />
      <div style={blob(cfg.dots[2], '70%', '75%', 200)} />

      {/* Top: brand mark */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={logoStyle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '.02em' }}>FreelanceMarket</span>
        </div>
        <span style={{
          display: 'inline-block', marginTop: 20,
          padding: '4px 12px', borderRadius: 99,
          background: 'rgba(255,255,255,.15)',
          fontSize: 11, fontWeight: 600,
          letterSpacing: '.08em', textTransform: 'uppercase',
          color: cfg.accent,
        }}>
          {cfg.label}
        </span>
      </div>

      {/* Middle: headline */}
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 0' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(26px, 3vw, 38px)',
          lineHeight: 1.2,
          color: '#fff',
          marginBottom: 16,
        }}>
          {cfg.headline}
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,.8)', lineHeight: 1.7, maxWidth: 340 }}>
          {cfg.sub}
        </p>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 28, marginTop: 36, flexWrap: 'wrap' }}>
          {cfg.stats.map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quote card */}
        <div style={quoteCard}>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.9)', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 8 }}>
            {cfg.quotes.text}
          </p>
          <p style={{ fontSize: 11.5, color: cfg.accent, fontWeight: 600 }}>— {cfg.quotes.author}</p>
        </div>
      </div>

      {/* Bottom: dot decoration */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 6 }}>
        {cfg.dots.map((c, i) => (
          <div key={i} style={{ width: i === 0 ? 20 : 6, height: 6, borderRadius: 99, background: c, opacity: i === 0 ? 1 : 0.5 }} />
        ))}
      </div>
    </div>
  );
};

const blob = (color, right, top, size) => ({
  position: 'absolute',
  right, top,
  width: size,
  height: size,
  borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%',
  background: color,
  opacity: 0.2,
  filter: 'blur(40px)',
  zIndex: 0,
  pointerEvents: 'none',
});

const logoStyle = {
  display: 'flex', alignItems: 'center', gap: 10,
  color: '#fff',
};

const quoteCard = {
  marginTop: 32,
  padding: '16px 20px',
  background: 'rgba(255,255,255,.1)',
  backdropFilter: 'blur(8px)',
  borderRadius: 12,
  borderLeft: '3px solid rgba(255,255,255,.35)',
  maxWidth: 360,
};

export default AuthPanel;
