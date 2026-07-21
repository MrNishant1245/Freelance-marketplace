import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const isFreelancer = user?.role === 'freelancer';
  const isClient = user?.role === 'client';

  const stats = isFreelancer
    ? [
        { label: 'Total Earnings', value: `₹${user?.freelancerProfile?.totalEarnings || 0}`, icon: '💰' },
        { label: 'Completed Jobs', value: user?.freelancerProfile?.completedJobs || 0, icon: '✅' },
        { label: 'Rating', value: user?.freelancerProfile?.rating || '0.0', icon: '⭐' },
        { label: 'Skills', value: user?.freelancerProfile?.skills?.length || 0, icon: '🛠️' },
      ]
    : [
        { label: 'Total Spent', value: `₹${user?.clientProfile?.totalSpent || 0}`, icon: '💳' },
        { label: 'Posted Jobs', value: user?.clientProfile?.postedJobs || 0, icon: '📋' },
        { label: 'Hired Freelancers', value: user?.clientProfile?.hiredFreelancers || 0, icon: '👥' },
        { label: 'Rating', value: user?.clientProfile?.rating || '0.0', icon: '⭐' },
      ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'var(--font-body, system-ui)' }}>
      {/* ── Navbar ── */}
      <nav style={{
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 32px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 14,
          }}>FM</div>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>FreelanceMarket</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 600, fontSize: 14,
            }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: 0 }}>{user?.fullName}</p>
              <p style={{ fontSize: 11, color: '#64748b', margin: 0, textTransform: 'capitalize' }}>{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
              background: '#fff', cursor: 'pointer', fontSize: 13, color: '#64748b',
              fontWeight: 500, transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.target.style.background = '#fee2e2'; e.target.style.color = '#ef4444'; e.target.style.borderColor = '#fecaca'; }}
            onMouseLeave={e => { e.target.style.background = '#fff'; e.target.style.color = '#64748b'; e.target.style.borderColor = '#e2e8f0'; }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {/* ── Welcome Banner ── */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
          borderRadius: 16, padding: '28px 32px', marginBottom: 28,
          color: '#fff', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -20, right: -20,
            width: 150, height: 150, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }} />
          <div style={{
            position: 'absolute', bottom: -30, right: 80,
            width: 100, height: 100, borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }} />
          <p style={{ fontSize: 13, opacity: 0.85, margin: '0 0 4px' }}>Welcome back 👋</p>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 6px' }}>{user?.fullName}</h1>
          <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>
            {isFreelancer ? '🚀 Ready to find your next project?' : '🎯 Ready to hire top talent?'}
          </p>
          {!user?.isEmailVerified && (
            <div style={{
              marginTop: 14, padding: '8px 14px', borderRadius: 8,
              background: 'rgba(255,255,255,0.15)', display: 'inline-block',
              fontSize: 12,
            }}>
              ⚠️ Please verify your email to unlock all features
            </div>
          )}
        </div>

        {/* ── Stats ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16, marginBottom: 28,
        }}>
          {stats.map((stat, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 12, padding: '20px 24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <p style={{ fontSize: 22, margin: '0 0 8px' }}>{stat.icon}</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>{stat.value}</p>
              <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 20,
          background: '#fff', borderRadius: 10, padding: 4,
          border: '1px solid #e2e8f0', width: 'fit-content',
        }}>
          {['overview', 'profile', 'settings'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '8px 20px', borderRadius: 8, border: 'none',
              background: activeTab === tab ? '#3b82f6' : 'transparent',
              color: activeTab === tab ? '#fff' : '#64748b',
              fontWeight: 500, fontSize: 13, cursor: 'pointer',
              textTransform: 'capitalize', transition: 'all 0.2s',
            }}>
              {tab}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Profile Completion */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: '0 0 16px' }}>
                Profile Completion
              </h3>
              <div style={{ marginBottom: 12 }}>
                {[
                  { label: 'Email Verified', done: user?.isEmailVerified },
                  { label: 'Profile Photo', done: !!user?.profilePhoto },
                  { label: 'Bio Added', done: isFreelancer ? !!user?.freelancerProfile?.bio : !!user?.clientProfile?.bio },
                  { label: 'Skills Added', done: (user?.freelancerProfile?.skills?.length || 0) > 0 },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 0', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none',
                  }}>
                    <span style={{ fontSize: 16 }}>{item.done ? '✅' : '⭕'}</span>
                    <span style={{ fontSize: 13, color: item.done ? '#0f172a' : '#94a3b8' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: '0 0 16px' }}>
                Quick Actions
              </h3>
              {(isFreelancer ? [
                { label: 'Complete Your Profile', icon: '👤', color: '#3b82f6' },
                { label: 'Browse Available Jobs', icon: '🔍', color: '#10b981' },
                { label: 'Add Portfolio Items', icon: '🖼️', color: '#f59e0b' },
                { label: 'Set Your Availability', icon: '📅', color: '#6366f1' },
              ] : [
                { label: 'Post a Job', icon: '📝', color: '#3b82f6' },
                { label: 'Browse Freelancers', icon: '🔍', color: '#10b981' },
                { label: 'Manage Projects', icon: '📁', color: '#f59e0b' },
                { label: 'View Proposals', icon: '📨', color: '#6366f1' },
              ]).map((action, i) => (
                <button key={i} style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8,
                  border: '1px solid #e2e8f0', background: '#f8fafc',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                  marginBottom: 8, textAlign: 'left', transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                >
                  <span style={{ fontSize: 18 }}>{action.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{action.label}</span>
                  <span style={{ marginLeft: 'auto', color: '#94a3b8' }}>→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: '0 0 20px' }}>Your Profile</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: 'First Name', value: user?.firstName },
                { label: 'Last Name', value: user?.lastName },
                { label: 'Email', value: user?.email },
                { label: 'Role', value: user?.role },
                { label: 'Phone', value: user?.phone || 'Not added' },
                { label: 'Location', value: user?.location?.city || 'Not added' },
              ].map((field, i) => (
                <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{field.label}</p>
                  <p style={{ fontSize: 14, color: '#0f172a', margin: 0, fontWeight: 500 }}>{field.value}</p>
                </div>
              ))}
            </div>
            <button style={{
              marginTop: 20, padding: '10px 24px', borderRadius: 8,
              background: '#3b82f6', color: '#fff', border: 'none',
              cursor: 'pointer', fontSize: 13, fontWeight: 600,
            }}>
              Edit Profile
            </button>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: '0 0 20px' }}>Account Settings</h3>
            {[
              { label: 'Email Notifications', desc: 'Receive email updates about your account' },
              { label: 'Two Factor Authentication', desc: 'Add an extra layer of security' },
              { label: 'Profile Visibility', desc: 'Control who can see your profile' },
            ].map((setting, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 0', borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none',
              }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: '0 0 2px' }}>{setting.label}</p>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{setting.desc}</p>
                </div>
                <div style={{
                  width: 44, height: 24, borderRadius: 12,
                  background: '#3b82f6', cursor: 'pointer', position: 'relative',
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: 3, right: 3,
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
