import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

const Icon = ({ name }) => {
  const icons = {
    chart:    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
    users:    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    briefcase:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
    card:     <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    flag:     <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
    logout:   <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    ban:      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
    check:    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
    trash:    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m5 0V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2"/></svg>,
    eye:      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    x:        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    alert:    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    rupee:    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="6" y1="3" x2="18" y2="3"/><line x1="6" y1="8" x2="18" y2="8"/><path d="M6 13h3a5 5 0 0 0 5-5"/><line x1="6" y1="13" x2="18" y2="13"/><line x1="9" y1="21" x2="18" y2="13"/></svg>,
    refund:   <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>,
    userx:    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>,
  };
  return icons[name] || null;
};

const initialUsers = [
  { id: 1, name: 'Arjun Sharma', initials: 'AS', color: 'green', role: 'freelancer', email: 'arjun@mail.com', phone: '+91 98765 11111', stat: '12 completed', rating: '4.9 ★', earn: '₹1.2L earned', status: 'active' },
  { id: 2, name: 'Dev Verma', initials: 'DV', color: 'blue', role: 'client', email: 'dev@mail.com', phone: '+91 98765 22222', stat: '8 posted', rating: '4.7 ★', earn: '₹2.5L spent', status: 'active' },
  { id: 3, name: 'Priya Mehta', initials: 'PM', color: 'orange', role: 'freelancer', email: 'priya@mail.com', phone: '+91 98765 33333', stat: '3 completed', rating: '4.5 ★', earn: '₹45,000 earned', status: 'suspended' },
  { id: 4, name: 'Nexus Labs', initials: 'NL', color: 'purple', role: 'client', email: 'nexus@mail.com', phone: '+91 98765 44444', stat: '4 posted', rating: '4.8 ★', earn: '₹1.8L spent', status: 'active' },
  { id: 5, name: 'Rahul Dev', initials: 'RD', color: 'teal', role: 'freelancer', email: 'rahul@mail.com', phone: '+91 98765 55555', stat: '6 completed', rating: '4.8 ★', earn: '₹78,000 earned', status: 'active' },
];

const initialJobs = [
  { id: 1, title: 'React Dashboard UI', client: 'Dev Verma', budget: '₹15,000', status: 'active' },
  { id: 2, title: 'Mobile App Design', client: 'Nexus Labs', budget: '₹25,000', status: 'active' },
  { id: 3, title: 'REST API Development', client: 'StartupXYZ', budget: '₹20,000', status: 'active' },
  { id: 4, title: 'Crypto trading bot (urgent)', client: 'AnonClient22', budget: '₹50,000', status: 'flagged' },
];

const transactions = [
  { id: 'TXN1042', from: 'Dev Verma', to: 'Arjun Sharma', amount: '₹12,000', status: 'completed', date: '2 days ago' },
  { id: 'TXN1041', from: 'Nexus Labs', to: 'Priya Mehta', amount: '₹22,000', status: 'completed', date: '4 days ago' },
  { id: 'TXN1040', from: 'StartupXYZ', to: 'Rahul Dev', amount: '₹14,500', status: 'refund_pending', date: '5 days ago' },
  { id: 'TXN1039', from: 'Dev Verma', to: 'Rahul Dev', amount: '₹8,000', status: 'completed', date: '1 week ago' },
];

const reports = [
  { id: 1, type: 'user', title: 'User reported: Priya Mehta', desc: 'Reported by Dev Verma for non-delivery and unresponsiveness after payment.', meta: 'Reported 1 day ago · Reason: Non-delivery', icon: 'userx', color: 'coral' },
  { id: 2, type: 'job', title: 'Job flagged: "Crypto trading bot (urgent)"', desc: 'Auto-flagged for suspicious keywords and unverified client account.', meta: 'Flagged 3 hours ago · Reason: Policy violation', icon: 'briefcase', color: 'amber' },
];

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const [users, setUsers] = useState(initialUsers);
  const [jobs, setJobs] = useState(initialJobs);

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [jobSearch, setJobSearch] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState('all');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailUser, setDetailUser] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const toggleSuspend = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === 'suspended' ? 'active' : 'suspended' } : u
      )
    );
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      toast.success(`${deleteTarget.name}'s account deleted.`);
      setDeleteTarget(null);
    }
  };

  const removeJob = (id) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
    toast.success('Job removed.');
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const filteredJobs = jobs.filter((j) => {
    const matchesStatus = jobStatusFilter === 'all' || j.status === jobStatusFilter;
    const matchesSearch =
      j.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
      j.client.toLowerCase().includes(jobSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const freelancerCount = users.filter((u) => u.role === 'freelancer').length;
  const clientCount = users.filter((u) => u.role === 'client').length;
  const activeJobCount = jobs.filter((j) => j.status === 'active').length;
  const flaggedJobCount = jobs.filter((j) => j.status === 'flagged').length;

  return (
    <div className="ad-shell">
      <aside className="ad-sidebar">
        <div className="ad-logo">
          <div className="ad-logo-mark">FM</div>
          <span className="ad-logo-text">Admin Panel</span>
        </div>
        <nav className="ad-nav">
          {[
            { id: 'overview', label: 'Overview', icon: 'chart' },
            { id: 'users', label: 'Users', icon: 'users' },
            { id: 'jobs', label: 'Jobs', icon: 'briefcase' },
            { id: 'payments', label: 'Payments', icon: 'card' },
            { id: 'reports', label: 'Reports', icon: 'flag' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`ad-nav-btn ${activeTab === item.id ? 'ad-nav-btn--active' : ''}`}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.id === 'reports' && reports.length > 0 && (
                <span className="ad-nav-badge">{reports.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="ad-sidebar-bottom">
          <button onClick={handleLogout} className="ad-logout-btn">
            <Icon name="logout" /> Logout
          </button>
        </div>
      </aside>

      <main className="ad-main">
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <div className="ad-page-head">
              <h1 className="ad-page-title">Platform overview</h1>
              <p className="ad-page-sub">Key metrics across the marketplace</p>
            </div>
            <div className="ad-stats-grid">
              <div className="ad-stat-card">
                <div className="ad-stat-top">
                  <div className="ad-stat-icon ad-stat-icon--blue"><Icon name="users" /></div>
                  <span className="ad-stat-trend ad-stat-trend--up">+12%</span>
                </div>
                <div className="ad-stat-val">{users.length}</div>
                <div className="ad-stat-label">Total users</div>
              </div>
              <div className="ad-stat-card">
                <div className="ad-stat-top">
                  <div className="ad-stat-icon ad-stat-icon--teal"><Icon name="briefcase" /></div>
                  <span className="ad-stat-trend ad-stat-trend--up">+8%</span>
                </div>
                <div className="ad-stat-val">{activeJobCount}</div>
                <div className="ad-stat-label">Active jobs</div>
              </div>
              <div className="ad-stat-card">
                <div className="ad-stat-top">
                  <div className="ad-stat-icon ad-stat-icon--amber"><Icon name="rupee" /></div>
                  <span className="ad-stat-trend ad-stat-trend--up">+19%</span>
                </div>
                <div className="ad-stat-val">₹18.6L</div>
                <div className="ad-stat-label">Revenue (month)</div>
              </div>
              <div className="ad-stat-card">
                <div className="ad-stat-top">
                  <div className="ad-stat-icon ad-stat-icon--coral"><Icon name="flag" /></div>
                  <span className="ad-stat-trend ad-stat-trend--down">{reports.length}</span>
                </div>
                <div className="ad-stat-val">{reports.length}</div>
                <div className="ad-stat-label">Pending reports</div>
              </div>
            </div>

            <div className="ad-card">
              <div className="ad-card-head">
                <span className="ad-card-title">Platform breakdown</span>
              </div>
              <div className="ad-breakdown-row">
                <div className="ad-breakdown-item">
                  <span className="ad-breakdown-label">Freelancers</span>
                  <span className="ad-breakdown-value">{freelancerCount}</span>
                </div>
                <div className="ad-breakdown-item">
                  <span className="ad-breakdown-label">Clients</span>
                  <span className="ad-breakdown-value">{clientCount}</span>
                </div>
                <div className="ad-breakdown-item">
                  <span className="ad-breakdown-label">Flagged jobs</span>
                  <span className="ad-breakdown-value">{flaggedJobCount}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {activeTab === 'users' && (
          <div>
            <div className="ad-page-head">
              <h1 className="ad-page-title">Manage users</h1>
              <p className="ad-page-sub">Freelancers and clients on the platform</p>
            </div>

            <div className="ad-tabs-row">
              <button className={`ad-tab-btn ${userRoleFilter === 'all' ? 'ad-tab-btn--active' : ''}`} onClick={() => setUserRoleFilter('all')}>
                All ({users.length})
              </button>
              <button className={`ad-tab-btn ${userRoleFilter === 'freelancer' ? 'ad-tab-btn--active' : ''}`} onClick={() => setUserRoleFilter('freelancer')}>
                Freelancers ({freelancerCount})
              </button>
              <button className={`ad-tab-btn ${userRoleFilter === 'client' ? 'ad-tab-btn--active' : ''}`} onClick={() => setUserRoleFilter('client')}>
                Clients ({clientCount})
              </button>
            </div>

            <div className="ad-search-row">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="ad-search-input"
              />
            </div>

            <div className="ad-card ad-card--table">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Jobs/Posted</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <button className="ad-user-cell" onClick={() => setDetailUser(u)}>
                          <div className={`ad-avatar ad-avatar--${u.color}`}>{u.initials}</div>
                          <div>
                            <div className="ad-uname">{u.name}</div>
                            <div className="ad-uemail">{u.email}</div>
                          </div>
                        </button>
                      </td>
                      <td>{u.role === 'freelancer' ? 'Freelancer' : 'Client'}</td>
                      <td>{u.stat}</td>
                      <td>
                        <span className={`ad-pill ${u.status === 'suspended' ? 'ad-pill--danger' : 'ad-pill--success'}`}>
                          {u.status === 'suspended' ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td>
                        <div className="ad-row-actions">
                          <button
                            className={`ad-act-btn ${u.status === 'suspended' ? 'ad-act-btn--success' : 'ad-act-btn--danger'}`}
                            onClick={() => toggleSuspend(u.id)}
                          >
                            <Icon name={u.status === 'suspended' ? 'check' : 'ban'} />
                            {u.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                          </button>
                          <button className="ad-act-btn ad-act-btn--danger" onClick={() => setDeleteTarget(u)}>
                            <Icon name="trash" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="5" className="ad-empty-row">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* JOBS */}
        {activeTab === 'jobs' && (
          <div>
            <div className="ad-page-head">
              <h1 className="ad-page-title">Manage jobs</h1>
              <p className="ad-page-sub">All job postings across the marketplace</p>
            </div>

            <div className="ad-tabs-row">
              <button className={`ad-tab-btn ${jobStatusFilter === 'all' ? 'ad-tab-btn--active' : ''}`} onClick={() => setJobStatusFilter('all')}>
                All ({jobs.length})
              </button>
              <button className={`ad-tab-btn ${jobStatusFilter === 'active' ? 'ad-tab-btn--active' : ''}`} onClick={() => setJobStatusFilter('active')}>
                Active ({activeJobCount})
              </button>
              <button className={`ad-tab-btn ${jobStatusFilter === 'flagged' ? 'ad-tab-btn--active' : ''}`} onClick={() => setJobStatusFilter('flagged')}>
                Flagged ({flaggedJobCount})
              </button>
            </div>

            <div className="ad-search-row">
              <input
                type="text"
                placeholder="Search jobs by title or client..."
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                className="ad-search-input"
              />
            </div>

            <div className="ad-card ad-card--table">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Job title</th>
                    <th>Client</th>
                    <th>Budget</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((j) => (
                    <tr key={j.id}>
                      <td className="ad-job-title">{j.title}</td>
                      <td>{j.client}</td>
                      <td>{j.budget}</td>
                      <td>
                        <span className={`ad-pill ${j.status === 'flagged' ? 'ad-pill--warning' : 'ad-pill--success'}`}>
                          {j.status === 'flagged' ? 'Flagged' : 'Active'}
                        </span>
                      </td>
                      <td>
                        <div className="ad-row-actions">
                          <button className="ad-act-btn"><Icon name="eye" /> View</button>
                          <button className="ad-act-btn ad-act-btn--danger" onClick={() => removeJob(j.id)}>
                            <Icon name="x" /> Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredJobs.length === 0 && (
                    <tr>
                      <td colSpan="5" className="ad-empty-row">No jobs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAYMENTS */}
        {activeTab === 'payments' && (
          <div>
            <div className="ad-page-head">
              <h1 className="ad-page-title">Payments & transactions</h1>
              <p className="ad-page-sub">All platform transactions and commission</p>
            </div>

            <div className="ad-stats-grid ad-stats-grid--3">
              <div className="ad-stat-card">
                <div className="ad-stat-top">
                  <div className="ad-stat-icon ad-stat-icon--amber"><Icon name="rupee" /></div>
                </div>
                <div className="ad-stat-val">₹18.6L</div>
                <div className="ad-stat-label">Total volume (month)</div>
              </div>
              <div className="ad-stat-card">
                <div className="ad-stat-top">
                  <div className="ad-stat-icon ad-stat-icon--teal"><Icon name="card" /></div>
                </div>
                <div className="ad-stat-val">₹1.86L</div>
                <div className="ad-stat-label">Commission earned (10%)</div>
              </div>
              <div className="ad-stat-card">
                <div className="ad-stat-top">
                  <div className="ad-stat-icon ad-stat-icon--coral"><Icon name="refund" /></div>
                </div>
                <div className="ad-stat-val">
                  {transactions.filter((t) => t.status === 'refund_pending').length}
                </div>
                <div className="ad-stat-label">Pending refunds</div>
              </div>
            </div>

            <div className="ad-card ad-card--table">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>From → To</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id}>
                      <td>#{t.id}</td>
                      <td>{t.from} → {t.to}</td>
                      <td>{t.amount}</td>
                      <td>
                        <span className={`ad-pill ${t.status === 'refund_pending' ? 'ad-pill--warning' : 'ad-pill--success'}`}>
                          {t.status === 'refund_pending' ? 'Refund pending' : 'Completed'}
                        </span>
                      </td>
                      <td>{t.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORTS */}
        {activeTab === 'reports' && (
          <div>
            <div className="ad-page-head">
              <h1 className="ad-page-title">Reported users & jobs</h1>
              <p className="ad-page-sub">Review flagged content and take action</p>
            </div>

            <div className="ad-card">
              {reports.map((r) => (
                <div key={r.id} className="ad-report-row">
                  <div className={`ad-report-icon ad-report-icon--${r.color}`}>
                    <Icon name={r.icon} />
                  </div>
                  <div className="ad-report-body">
                    <div className="ad-report-title">{r.title}</div>
                    <div className="ad-report-desc">{r.desc}</div>
                    <div className="ad-report-meta">{r.meta}</div>
                  </div>
                  <div className="ad-row-actions ad-row-actions--center">
                    <button
                      className="ad-act-btn ad-act-btn--success"
                      onClick={() => toast.success('Report dismissed.')}
                    >
                      <Icon name="check" /> Dismiss
                    </button>
                    <button
                      className="ad-act-btn ad-act-btn--danger"
                      onClick={() => toast.success(r.type === 'user' ? 'User suspended.' : 'Job removed.')}
                    >
                      <Icon name={r.type === 'user' ? 'ban' : 'trash'} />
                      {r.type === 'user' ? 'Suspend' : 'Remove'}
                    </button>
                  </div>
                </div>
              ))}
              {reports.length === 0 && <p className="ad-empty-row">No pending reports.</p>}
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="ad-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ad-modal-icon ad-modal-icon--coral"><Icon name="alert" /></div>
            <div className="ad-modal-title">Delete this account?</div>
            <div className="ad-modal-desc">
              This will permanently remove {deleteTarget.name}'s account and all associated data. This action cannot be undone.
            </div>
            <div className="ad-modal-actions">
              <button className="ad-modal-btn" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="ad-modal-btn ad-modal-btn--danger" onClick={confirmDelete}>Delete permanently</button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {detailUser && (
        <div className="ad-overlay" onClick={() => setDetailUser(null)}>
          <div className="ad-modal ad-modal--detail" onClick={(e) => e.stopPropagation()}>
            <button className="ad-close-x" onClick={() => setDetailUser(null)} aria-label="Close">
              <Icon name="x" />
            </button>
            <div className="ad-detail-head">
              <div className={`ad-avatar ad-avatar--${detailUser.color} ad-avatar--lg`}>{detailUser.initials}</div>
              <div>
                <div className="ad-detail-name">{detailUser.name}</div>
                <div className="ad-detail-sub">
                  {detailUser.role === 'freelancer' ? 'Freelancer' : 'Client'} · {detailUser.email}
                </div>
              </div>
            </div>
            <div className="ad-detail-grid">
              <div className="ad-detail-item">
                <div className="ad-detail-label">Phone</div>
                <div className="ad-detail-value">{detailUser.phone}</div>
              </div>
              <div className="ad-detail-item">
                <div className="ad-detail-label">{detailUser.role === 'freelancer' ? 'Jobs' : 'Posted'}</div>
                <div className="ad-detail-value">{detailUser.stat}</div>
              </div>
              <div className="ad-detail-item">
                <div className="ad-detail-label">Rating</div>
                <div className="ad-detail-value">{detailUser.rating}</div>
              </div>
              <div className="ad-detail-item">
                <div className="ad-detail-label">{detailUser.role === 'freelancer' ? 'Earnings' : 'Spent'}</div>
                <div className="ad-detail-value">{detailUser.earn}</div>
              </div>
            </div>
            <div className="ad-modal-actions">
              <button className="ad-modal-btn" onClick={() => setDetailUser(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
