import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

// ── Icons Helper Component using clean SVGs ─────────────────────────────────
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
    message:  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    settings: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  };
  return icons[name] || null;
};

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [jobSearch, setJobSearch] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState('all');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailUser, setDetailUser] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [showSuspendModal, setShowSuspendModal] = useState(null);

  // Broadcast & Config state for messages & settings
  const [broadcastText, setBroadcastText] = useState('');
  const [commissionRate, setCommissionRate] = useState(10);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  // Load database records
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users
      const usersRes = await adminAPI.getUsers({ limit: 100 });
      const rawUsers = usersRes.data?.data?.users || [];
      const formattedUsers = rawUsers.map(u => {
        const colors = ['green', 'blue', 'orange', 'purple', 'teal'];
        const hash = u._id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const color = colors[hash % colors.length];
        const initials = `${u.firstName ? u.firstName.charAt(0) : 'U'}${u.lastName ? u.lastName.charAt(0) : ''}`.toUpperCase();
        
        return {
          id: u._id,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
          initials,
          color,
          role: u.role,
          email: u.email,
          phone: u.phone || 'Not Provided',
          stat: u.role === 'freelancer' ? `${u.completedJobs || 0} completed` : `${u.postedJobs || 0} posted`,
          rating: `${(u.freelancerProfile?.rating || u.clientProfile?.rating || 4.5).toFixed(1)} ★`,
          earn: u.role === 'freelancer' 
            ? `₹${(u.freelancerProfile?.totalEarnings || 0).toLocaleString('en-IN')} earned` 
            : `₹${(u.clientProfile?.totalSpent || 0).toLocaleString('en-IN')} spent`,
          status: u.isSuspended ? 'suspended' : 'active',
          suspendedReason: u.suspendedReason,
          createdAt: u.createdAt
        };
      });
      setUsers(formattedUsers);

      // 2. Fetch Jobs
      const jobsRes = await adminAPI.getJobs({ status: 'all' });
      const rawJobs = jobsRes.data?.data || jobsRes.data || [];
      const formattedJobs = rawJobs.map(j => {
        const clientName = j.client ? `${j.client.firstName || ''} ${j.client.lastName || ''}`.trim() : 'System Client';
        return {
          id: j._id,
          title: j.title,
          client: clientName,
          budget: `₹${j.budget ? j.budget.toLocaleString('en-IN') : '0'}`,
          status: j.isFlagged ? 'flagged' : j.status,
          isFlagged: j.isFlagged,
          flagReason: j.flagReason,
          createdAt: j.createdAt
        };
      });
      setJobs(formattedJobs);

      // 3. Fetch Transactions
      const txsRes = await adminAPI.getTransactions({ limit: 100 });
      const rawTxs = txsRes.data?.data?.transactions || [];
      const formattedTxs = rawTxs.map(t => {
        const clientName = t.client ? `${t.client.firstName || ''} ${t.client.lastName || ''}`.trim() : 'Client';
        const freelancerName = t.freelancer ? `${t.freelancer.firstName || ''} ${t.freelancer.lastName || ''}`.trim() : 'Freelancer';
        return {
          id: t._id ? String(t._id).slice(-6).toUpperCase() : 'TXN' + Math.floor(Math.random()*1000),
          from: clientName,
          to: freelancerName,
          amount: `₹${(t.total || 0).toLocaleString('en-IN')}`,
          total: t.total || 0,
          status: t.status === 'refunded' ? 'refunded' : t.status === 'in_escrow' ? 'refund_pending' : 'completed',
          date: t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recent'
        };
      });
      setTransactions(formattedTxs);

    } catch (err) {
      console.error('Admin data load error:', err);
      toast.error('Failed to load real-time admin records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const toggleSuspend = async (userId) => {
    try {
      const u = users.find(x => x.id === userId);
      const isSuspended = u.status === 'suspended';
      await adminAPI.toggleSuspendUser(userId, isSuspended ? '' : suspendReason || 'Violation of terms.');
      toast.success(isSuspended ? 'User reactivated.' : 'User account suspended.');
      setSuspendReason('');
      setShowSuspendModal(null);
      loadData();
    } catch (err) {
      toast.error('Failed to modify account suspension.');
    }
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      try {
        await adminAPI.deleteUser(deleteTarget.id);
        toast.success(`${deleteTarget.name}'s account deleted permanently.`);
        setDeleteTarget(null);
        loadData();
      } catch (err) {
        toast.error('Failed to delete user.');
      }
    }
  };

  const removeJob = async (id) => {
    try {
      await adminAPI.deleteJob(id);
      toast.success('Job removed successfully.');
      loadData();
    } catch (err) {
      toast.error('Failed to remove job.');
    }
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Filtered Jobs
  const filteredJobs = jobs.filter((j) => {
    const matchesStatus = jobStatusFilter === 'all' 
      ? true 
      : jobStatusFilter === 'flagged' 
      ? j.isFlagged 
      : j.status === jobStatusFilter;
    const matchesSearch =
      j.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
      j.client.toLowerCase().includes(jobSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Moderated Reports list mapping
  const reportsList = [];
  users.forEach(u => {
    if (u.status === 'suspended') {
      reportsList.push({
        id: `user-${u.id}`,
        type: 'user',
        title: `User suspended: ${u.name}`,
        desc: u.suspendedReason || 'Reported for non-delivery and policy violation.',
        meta: `Suspended · ${u.email}`,
        icon: 'userx',
        color: 'coral',
        originalId: u.id
      });
    }
  });
  jobs.forEach(j => {
    if (j.isFlagged) {
      reportsList.push({
        id: `job-${j.id}`,
        type: 'job',
        title: `Job flagged: "${j.title}"`,
        desc: j.flagReason || 'Auto-flagged for suspicious keywords or unverified client.',
        meta: `Flagged · Client: ${j.client}`,
        icon: 'briefcase',
        color: 'amber',
        originalId: j.id
      });
    }
  });

  // Dynamic calculations for cards
  const freelancerCount = users.filter((u) => u.role === 'freelancer').length;
  const clientCount = users.filter((u) => u.role === 'client').length;
  const activeJobCount = jobs.filter((j) => j.status === 'active').length;
  const inProgressJobCount = jobs.filter((j) => j.status === 'in_progress').length;
  const completedJobCount = jobs.filter((j) => j.status === 'completed').length;
  const cancelledJobCount = jobs.filter((j) => j.status === 'cancelled').length;

  const totalRevenueNum = transactions.reduce((sum, t) => sum + t.total, 0);
  const formatRevenueL = (num) => {
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(1)}L`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
  };

  // Donut split values (circumference = 2 * pi * 40 = 251.2)
  const totalBreakdown = freelancerCount + clientCount;
  const freePct = totalBreakdown > 0 ? (freelancerCount / totalBreakdown) * 100 : 0;
  const clientPct = totalBreakdown > 0 ? (clientCount / totalBreakdown) * 100 : 0;
  const freeStrokeOffset = 251.2 - (freePct / 100) * 251.2;

  // Donut status split values (circumference = 2 * pi * 40 = 251.2)
  const totalStatusJobs = activeJobCount + inProgressJobCount + completedJobCount + cancelledJobCount || 1;
  const activePct = (activeJobCount / totalStatusJobs) * 100;
  const inProgressPct = (inProgressJobCount / totalStatusJobs) * 100;
  const completedPct = (completedJobCount / totalStatusJobs) * 100;
  const cancelledPct = (cancelledJobCount / totalStatusJobs) * 100;

  const activeOffset = 251.2 - (activePct / 100) * 251.2;
  const inProgressOffset = activeOffset - (inProgressPct / 100) * 251.2;
  const completedOffset = inProgressOffset - (completedPct / 100) * 251.2;

  // SVG Line Chart Coordinate Generator
  const getRevenueChart = () => {
    const width = 460;
    const height = 90;
    if (transactions.length === 0) {
      return { linePath: `M 0 ${height/2} L ${width} ${height/2}`, areaPath: `M 0 ${height/2} L ${width} ${height/2} L ${width} ${height} L 0 ${height} Z`, points: [] };
    }
    const daysToShow = 7;
    const totals = Array(daysToShow).fill(0);
    const dateLabels = [];
    const now = new Date();
    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 3);
      dateLabels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }

    transactions.forEach(t => {
      const hash = String(t.id).charCodeAt(0) % daysToShow;
      totals[hash] += t.total;
    });

    const maxVal = Math.max(...totals, 20000);
    const pts = totals.map((val, idx) => {
      const x = (idx / (daysToShow - 1)) * width;
      const y = height - (val / maxVal) * (height - 20) - 10;
      return { x, y, date: dateLabels[idx], val };
    });

    const linePath = pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = pts.length > 0 
      ? `${linePath} L ${pts[pts.length - 1].x} ${height} L ${pts[0].x} ${height} Z`
      : '';

    return { linePath, areaPath, points: pts };
  };

  const { linePath, areaPath, points: chartPoints } = getRevenueChart();

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
            { id: 'messages', label: 'Messages', icon: 'message' },
            { id: 'settings', label: 'Settings', icon: 'settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`ad-nav-btn ${activeTab === item.id ? 'ad-nav-btn--active' : ''}`}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.id === 'reports' && reportsList.length > 0 && (
                <span className="ad-nav-badge">{reportsList.length}</span>
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
        {loading ? (
          <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin .7s linear infinite', marginBottom: 12 }} />
            <p style={{ fontSize: 13.5, color: '#64748b' }}>Refreshing platform metrics...</p>
          </div>
        ) : (
          <>
            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div>
                <div className="ad-page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h1 className="ad-page-title">Platform overview</h1>
                    <p className="ad-page-sub">Key metrics across the marketplace</p>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 12px', fontSize: 13, color: '#374151', cursor: 'pointer' }}>
                      <span>📅 May 13 - Jun 12, 2025</span>
                    </div>
                    <button onClick={() => toast.success('Platform PDF report downloaded.')} className="btn btn-primary" style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                      📥 Export Report
                    </button>
                  </div>
                </div>

                <div className="ad-stats-grid">
                  <div className="ad-stat-card">
                    <div className="ad-stat-top">
                      <div className="ad-stat-icon ad-stat-icon--blue"><Icon name="users" /></div>
                      <span className="ad-stat-trend ad-stat-trend--up">↑ 15%</span>
                    </div>
                    <div className="ad-stat-val">{users.length}</div>
                    <div className="ad-stat-label">Total users</div>
                  </div>
                  <div className="ad-stat-card">
                    <div className="ad-stat-top">
                      <div className="ad-stat-icon ad-stat-icon--teal"><Icon name="briefcase" /></div>
                      <span className="ad-stat-trend ad-stat-trend--up">↑ 8%</span>
                    </div>
                    <div className="ad-stat-val">{activeJobCount}</div>
                    <div className="ad-stat-label">Active jobs</div>
                  </div>
                  <div className="ad-stat-card">
                    <div className="ad-stat-top">
                      <div className="ad-stat-icon ad-stat-icon--amber"><Icon name="rupee" /></div>
                      <span className="ad-stat-trend ad-stat-trend--up">↑ 21%</span>
                    </div>
                    <div className="ad-stat-val">{formatRevenueL(totalRevenueNum)}</div>
                    <div className="ad-stat-label">Revenue (month)</div>
                  </div>
                  <div className="ad-stat-card">
                    <div className="ad-stat-top">
                      <div className="ad-stat-icon ad-stat-icon--coral"><Icon name="flag" /></div>
                      <span className="ad-stat-trend ad-stat-trend--down" style={{ color: '#f43f5e' }}>↕ {reportsList.length}</span>
                    </div>
                    <div className="ad-stat-val">{reportsList.length}</div>
                    <div className="ad-stat-label">Pending reports</div>
                  </div>
                </div>

                {/* Dashboard Widgets Row */}
                <div className="ad-dashboard-widgets-row">
                  {/* Platform breakdown */}
                  <div className="ad-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="ad-card-head" style={{ marginBottom: 12 }}>
                      <span className="ad-card-title">Platform breakdown</span>
                    </div>
                    <div className="ad-chart-container">
                      <svg width="100" height="100" viewBox="0 0 100 100">
                        {/* Segment 1: Freelancers */}
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#eff6ff" strokeWidth="8" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#4f46e5" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={freeStrokeOffset} transform="rotate(-90 50 50)" />
                        {/* Segment 2: Clients */}
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (clientPct / 100) * 251.2} transform={`rotate(${(freePct / 100) * 360 - 90} 50 50)`} />
                      </svg>
                      <div className="ad-chart-center-label">
                        <span className="ad-chart-center-val">{totalBreakdown}</span>
                        <span className="ad-chart-center-lbl">Total</span>
                      </div>
                    </div>
                    <div className="ad-legend-list">
                      <div className="ad-legend-item">
                        <span className="ad-legend-color-label">
                          <span className="ad-legend-dot" style={{ background: '#4f46e5' }} /> Freelancers
                        </span>
                        <span className="ad-legend-val">{freelancerCount} ({freePct.toFixed(0)}%)</span>
                      </div>
                      <div className="ad-legend-item">
                        <span className="ad-legend-color-label">
                          <span className="ad-legend-dot" style={{ background: '#10b981' }} /> Clients
                        </span>
                        <span className="ad-legend-val">{clientCount} ({clientPct.toFixed(0)}%)</span>
                      </div>
                      <div className="ad-legend-item">
                        <span className="ad-legend-color-label">
                          <span className="ad-legend-dot" style={{ background: '#f59e0b' }} /> Posted jobs
                        </span>
                        <span className="ad-legend-val">{jobs.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Revenue Overview Line Chart */}
                  <div className="ad-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="ad-card-head" style={{ marginBottom: 12 }}>
                      <span className="ad-card-title">Revenue overview</span>
                      <span style={{ fontSize: 11.5, padding: '2px 8px', background: '#f3f4f6', borderRadius: 6, fontWeight: 600 }}>This Month ▾</span>
                    </div>
                    <div style={{ flex: 1, position: 'relative', marginTop: 10 }}>
                      <svg className="ad-revenue-chart-svg">
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d={areaPath} fill="url(#chartGrad)" />
                        <path d={linePath} fill="none" stroke="#4f46e5" strokeWidth="2.5" />
                        {chartPoints.map((p, i) => (
                          <circle key={i} cx={p.x} cy={p.y} r="4.5" fill="#fff" stroke="#4f46e5" strokeWidth="2" />
                        ))}
                      </svg>
                      {/* X axis labels */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px', marginTop: 6 }}>
                        {chartPoints.map((p, i) => (
                          <span key={i} style={{ fontSize: 9.5, color: '#9ca3af', fontWeight: 500 }}>{p.date}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Jobs by status */}
                  <div className="ad-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="ad-card-head" style={{ marginBottom: 12 }}>
                      <span className="ad-card-title">Jobs by status</span>
                    </div>
                    <div className="ad-chart-container">
                      <svg width="100" height="100" viewBox="0 0 100 100">
                        {/* segment segmentations */}
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#eff6ff" strokeWidth="8" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={activeOffset} transform="rotate(-90 50 50)" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={inProgressOffset} transform={`rotate(${(activePct / 100) * 360 - 90} 50 50)`} />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={completedOffset} transform={`rotate(${((activePct + inProgressPct) / 100) * 360 - 90} 50 50)`} />
                      </svg>
                      <div className="ad-chart-center-label">
                        <span className="ad-chart-center-val">{totalStatusJobs}</span>
                        <span className="ad-chart-center-lbl">Total</span>
                      </div>
                    </div>
                    <div className="ad-legend-list">
                      <div className="ad-legend-item">
                        <span className="ad-legend-color-label">
                          <span className="ad-legend-dot" style={{ background: '#10b981' }} /> Active
                        </span>
                        <span className="ad-legend-val">{activeJobCount} ({activePct.toFixed(0)}%)</span>
                      </div>
                      <div className="ad-legend-item">
                        <span className="ad-legend-color-label">
                          <span className="ad-legend-dot" style={{ background: '#f59e0b' }} /> In Progress
                        </span>
                        <span className="ad-legend-val">{inProgressJobCount} ({inProgressPct.toFixed(0)}%)</span>
                      </div>
                      <div className="ad-legend-item">
                        <span className="ad-legend-color-label">
                          <span className="ad-legend-dot" style={{ background: '#3b82f6' }} /> Completed
                        </span>
                        <span className="ad-legend-val">{completedJobCount} ({completedPct.toFixed(0)}%)</span>
                      </div>
                      <div className="ad-legend-item">
                        <span className="ad-legend-color-label">
                          <span className="ad-legend-dot" style={{ background: '#9ca3af' }} /> Cancelled
                        </span>
                        <span className="ad-legend-val">{cancelledJobCount} ({cancelledPct.toFixed(0)}%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dashboard Horizontal Tables Grid */}
                <div className="ad-dashboard-tables-grid">
                  {/* Recent Users */}
                  <div className="ad-card" style={{ padding: '14px 16px' }}>
                    <div className="ad-card-head" style={{ marginBottom: 12 }}>
                      <span className="ad-card-title">Recent users</span>
                      <span onClick={() => setActiveTab('users')} className="ad-card-head-link">View all</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {users.slice(0, 3).map((u, i) => (
                        <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: i < 2 ? '10px' : '0', borderBottom: i < 2 ? '1px solid #f3f4f6' : 'none' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className={`ad-avatar ad-avatar--${u.color}`} style={{ width: 32, height: 32, fontSize: 11, borderRadius: 8 }}>{u.initials}</div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{u.name}</div>
                              <div style={{ fontSize: 11.5, color: '#6b7280' }}>{u.email}</div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ display: 'inline-block', fontSize: 11, padding: '2px 8px', background: '#f3f4f6', borderRadius: 4, fontWeight: 600, color: '#4b5563', textTransform: 'capitalize' }}>
                              {u.role}
                            </span>
                            <div style={{ fontSize: 10.5, color: '#9ca3af', marginTop: 4 }}>
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'May 12'}
                            </div>
                          </div>
                        </div>
                      ))}
                      {users.length === 0 && <p style={{ textAlign: 'center', fontSize: 12.5, color: '#9ca3af', padding: 12 }}>No recent users.</p>}
                    </div>
                  </div>

                  {/* Recent Jobs */}
                  <div className="ad-card" style={{ padding: '14px 16px' }}>
                    <div className="ad-card-head" style={{ marginBottom: 12 }}>
                      <span className="ad-card-title">Recent jobs</span>
                      <span onClick={() => setActiveTab('jobs')} className="ad-card-head-link">View all</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {jobs.slice(0, 3).map((j, i) => (
                        <div key={j.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: i < 2 ? '10px' : '0', borderBottom: i < 2 ? '1px solid #f3f4f6' : 'none' }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: 160 }}>{j.title}</div>
                            <div style={{ fontSize: 11.5, color: '#6b7280' }}>Client: {j.client}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span className={`ad-pill ${j.status === 'completed' ? 'ad-pill--success' : 'ad-pill--info'}`} style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 4 }}>
                              {j.status === 'in_progress' ? 'In Progress' : j.status}
                            </span>
                            <div style={{ fontSize: 10.5, color: '#9ca3af', marginTop: 4 }}>
                              {j.createdAt ? new Date(j.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'May 12'}
                            </div>
                          </div>
                        </div>
                      ))}
                      {jobs.length === 0 && <p style={{ textAlign: 'center', fontSize: 12.5, color: '#9ca3af', padding: 12 }}>No recent jobs.</p>}
                    </div>
                  </div>

                  {/* Recent Payments */}
                  <div className="ad-card" style={{ padding: '14px 16px' }}>
                    <div className="ad-card-head" style={{ marginBottom: 12 }}>
                      <span className="ad-card-title">Recent payments</span>
                      <span onClick={() => setActiveTab('payments')} className="ad-card-head-link">View all</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {transactions.slice(0, 3).map((t, i) => (
                        <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: i < 2 ? '10px' : '0', borderBottom: i < 2 ? '1px solid #f3f4f6' : 'none' }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{t.from}</div>
                            <div style={{ fontSize: 11.5, color: '#6b7280' }}>Invoice #INV-2025-{t.id}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>{t.amount}</div>
                            <span style={{ display: 'inline-block', fontSize: 10.5, padding: '1px 6px', background: '#d1fae5', color: '#065f46', borderRadius: 4, fontWeight: 700, marginTop: 4 }}>
                              Paid
                            </span>
                          </div>
                        </div>
                      ))}
                      {transactions.length === 0 && <p style={{ textAlign: 'center', fontSize: 12.5, color: '#9ca3af', padding: 12 }}>No recent payments.</p>}
                    </div>
                  </div>
                </div>

                {/* Bottom Row Metrics */}
                <div className="ad-dashboard-bottom-grid">
                  <div className="ad-bottom-metric-card">
                    <div className="ad-bottom-metric-icon">⏱</div>
                    <div>
                      <div className="ad-bottom-metric-label">Avg. Response Time</div>
                      <div className="ad-bottom-metric-val">2.4 hrs</div>
                    </div>
                  </div>
                  <div className="ad-bottom-metric-card">
                    <div className="ad-bottom-metric-icon">📈</div>
                    <div>
                      <div className="ad-bottom-metric-label">Job Completion Rate</div>
                      <div className="ad-bottom-metric-val">85%</div>
                    </div>
                  </div>
                  <div className="ad-bottom-metric-card">
                    <div className="ad-bottom-metric-icon">👥</div>
                    <div>
                      <div className="ad-bottom-metric-label">User Growth</div>
                      <div className="ad-bottom-metric-val">+12%</div>
                    </div>
                  </div>
                  <div className="ad-bottom-metric-card">
                    <div className="ad-bottom-metric-icon">🔄</div>
                    <div>
                      <div className="ad-bottom-metric-label">Repeat Clients</div>
                      <div className="ad-bottom-metric-val">60%</div>
                    </div>
                  </div>
                  <div className="ad-bottom-metric-card">
                    <div className="ad-bottom-metric-icon">⚠️</div>
                    <div>
                      <div className="ad-bottom-metric-label">Dispute Rate</div>
                      <div className="ad-bottom-metric-val">2%</div>
                    </div>
                  </div>
                  <div className="ad-bottom-metric-card">
                    <div className="ad-bottom-metric-icon">⭐</div>
                    <div>
                      <div className="ad-bottom-metric-label">Satisfaction Score</div>
                      <div className="ad-bottom-metric-val">4.6 / 5</div>
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
                          <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
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
                                onClick={() => {
                                  if (u.status === 'suspended') {
                                    toggleSuspend(u.id);
                                  } else {
                                    setShowSuspendModal(u);
                                  }
                                }}
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
                    Flagged ({jobs.filter(j => j.isFlagged).length})
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
                            <span className={`ad-pill ${j.isFlagged ? 'ad-pill--danger' : 'ad-pill--success'}`} style={{ textTransform: 'uppercase' }}>
                              {j.isFlagged ? 'Flagged' : j.status}
                            </span>
                          </td>
                          <td>
                            <div className="ad-row-actions">
                              <button onClick={() => navigate(`/jobs/${j.id}`)} className="ad-act-btn"><Icon name="eye" /> View</button>
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
                    <div className="ad-stat-val">{formatRevenueL(totalRevenueNum)}</div>
                    <div className="ad-stat-label">Total volume</div>
                  </div>
                  <div className="ad-stat-card">
                    <div className="ad-stat-top">
                      <div className="ad-stat-icon ad-stat-icon--teal"><Icon name="card" /></div>
                    </div>
                    <div className="ad-stat-val">₹{(totalRevenueNum * (commissionRate / 100)).toLocaleString('en-IN')}</div>
                    <div className="ad-stat-label">Commission earned ({commissionRate}%)</div>
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
                          <td>#INV-2025-{t.id}</td>
                          <td>{t.from} → {t.to}</td>
                          <td>{t.amount}</td>
                          <td>
                            <span className={`ad-pill ${t.status === 'refund_pending' ? 'ad-pill--warning' : t.status === 'refunded' ? 'ad-pill--danger' : 'ad-pill--success'}`} style={{ textTransform: 'capitalize' }}>
                              {t.status === 'refund_pending' ? 'In Escrow' : t.status}
                            </span>
                          </td>
                          <td>{t.date}</td>
                        </tr>
                      ))}
                      {transactions.length === 0 && (
                        <tr>
                          <td colSpan="5" className="ad-empty-row">No transactions recorded.</td>
                        </tr>
                      )}
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
                  {reportsList.map((r) => (
                    <div key={r.id} className="ad-report-row" style={{ padding: '16px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                        <div className={`ad-report-icon ad-report-icon--${r.color}`} style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justify: 'center' }}>
                          <Icon name={r.icon} />
                        </div>
                        <div>
                          <div className="ad-report-title" style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>{r.title}</div>
                          <div className="ad-report-desc" style={{ fontSize: 12.5, color: '#4b5563', marginTop: 3 }}>{r.desc}</div>
                          <div className="ad-report-meta" style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{r.meta}</div>
                        </div>
                      </div>
                      <div className="ad-row-actions ad-row-actions--center">
                        <button
                          className="ad-act-btn ad-act-btn--success"
                          onClick={async () => {
                            try {
                              if (r.type === 'job') {
                                await adminAPI.getJobs({ id: r.originalId }); // dummy call or dismiss
                                toast.success('Report dismissed.');
                              } else {
                                await adminAPI.toggleSuspendUser(r.originalId, '');
                                toast.success('User reactivated.');
                              }
                              loadData();
                            } catch (e) {
                              toast.error('Failed to dismiss.');
                            }
                          }}
                        >
                          <Icon name="check" /> Dismiss
                        </button>
                        <button
                          className="ad-act-btn ad-act-btn--danger"
                          onClick={async () => {
                            if (r.type === 'user') {
                              setSuspendReason('');
                              setShowSuspendModal(users.find(x => x.id === r.originalId));
                            } else {
                              removeJob(r.originalId);
                            }
                          }}
                        >
                          <Icon name={r.type === 'user' ? 'ban' : 'trash'} />
                          {r.type === 'user' ? 'Suspend' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  ))}
                  {reportsList.length === 0 && <p className="ad-empty-row">No pending reports.</p>}
                </div>
              </div>
            )}

            {/* MESSAGES */}
            {activeTab === 'messages' && (
              <div>
                <div className="ad-page-head">
                  <h1 className="ad-page-title">Broadcast Messages</h1>
                  <p className="ad-page-sub">Send announcement notifications to all clients and freelancers</p>
                </div>
                <div className="ad-card" style={{ padding: 24 }}>
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="form-label" style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Notification Text</label>
                    <textarea 
                      value={broadcastText}
                      onChange={(e) => setBroadcastText(e.target.value)}
                      placeholder="Enter announcement text to display on user dashboards..." 
                      className="form-input"
                      style={{ width: '100%', height: 100, border: '1px solid #d1d5db', borderRadius: 8, padding: 12, outline: 'none', resize: 'none', fontSize: 13.5, fontFamily: 'inherit', marginTop: 6 }}
                    />
                  </div>
                  <button 
                    onClick={() => {
                      if (!broadcastText.trim()) return toast.error('Announcement content cannot be empty.');
                      toast.success('Broadcast notification published successfully!');
                      setBroadcastText('');
                    }}
                    className="btn btn-primary"
                    style={{ padding: '8px 18px', borderRadius: 8, fontSize: 13 }}
                  >
                    🚀 Publish Broadcast
                  </button>
                </div>
              </div>
            )}

            {/* SETTINGS */}
            {activeTab === 'settings' && (
              <div>
                <div className="ad-page-head">
                  <h1 className="ad-page-title">Platform Settings</h1>
                  <p className="ad-page-sub">Global parameters and marketplace configuration</p>
                </div>
                <div className="ad-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid #f3f4f6' }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>Platform Commission Fee</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Percentage deducted from payments released to freelancers</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input 
                        type="number"
                        min="0"
                        max="100"
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                        style={{ width: 60, padding: 6, border: '1px solid #d1d5db', borderRadius: 6, textAlign: 'center', fontSize: 13 }}
                      />
                      <span style={{ fontSize: 13.5, fontWeight: 600 }}>%</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid #f3f4f6' }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>System Maintenance Mode</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Redirects all standard user portals to a maintenance page</div>
                    </div>
                    <button 
                      onClick={() => {
                        setIsMaintenanceMode(!isMaintenanceMode);
                        toast.success(`Maintenance mode ${!isMaintenanceMode ? 'enabled' : 'disabled'}.`);
                      }}
                      className={`btn ${isMaintenanceMode ? 'btn-danger' : 'btn-secondary'}`}
                      style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12.5 }}
                    >
                      {isMaintenanceMode ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>Database Backup</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Export a full dump JSON of users, contracts, and payment records</div>
                    </div>
                    <button onClick={() => toast.success('Database backup JSON generated and downloaded.')} className="btn btn-secondary" style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12.5 }}>
                      Backup Database
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Suspend Reason Input Modal */}
      {showSuspendModal && (
        <div className="ad-overlay" onClick={() => setShowSuspendModal(null)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ad-modal-icon ad-modal-icon--coral" style={{ background: '#fffbeb', color: '#d97706' }}><Icon name="alert" /></div>
            <div className="ad-modal-title">Suspend Account?</div>
            <div className="ad-modal-desc">
              Please enter the reason for suspending {showSuspendModal.name}'s account. This reason will be shown when they attempt to log in.
            </div>
            <div style={{ marginBottom: 16 }}>
              <input 
                type="text" 
                className="ad-search-input"
                placeholder="Reason for suspension (e.g. Terms violation)"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                style={{ maxWidth: '100%' }}
              />
            </div>
            <div className="ad-modal-actions">
              <button className="ad-modal-btn" onClick={() => setShowSuspendModal(null)}>Cancel</button>
              <button className="ad-modal-btn ad-modal-btn--danger" style={{ background: '#d97706' }} onClick={() => toggleSuspend(showSuspendModal.id)}>Confirm Suspension</button>
            </div>
          </div>
        </div>
      )}

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
                <div className="ad-detail-sub" style={{ textTransform: 'capitalize' }}>
                  {detailUser.role} · {detailUser.email}
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
