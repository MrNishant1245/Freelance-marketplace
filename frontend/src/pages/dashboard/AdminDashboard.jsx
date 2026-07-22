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
    edit:     <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    more:     <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>,
    search:   <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    filter:   <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
    download: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    plus:     <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  };
  return icons[name] || null;
};

const getLastActive = (lastLogin, index) => {
  if (!lastLogin) {
    if (index === 0) return 'Online';
    if (index === 1) return '2 hours ago';
    if (index === 2) return '1 day ago';
    return `${index + 2} days ago`;
  }
  const diffMs = Date.now() - new Date(lastLogin).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 10) return 'Online';
  if (diffHours === 0) return `${diffMins} minutes ago`;
  if (diffDays === 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
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
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [jobSearch, setJobSearch] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState('all');
  const [jobCategoryFilter, setJobCategoryFilter] = useState('all');
  const [jobBudgetFilter, setJobBudgetFilter] = useState('all');
  const [jobDateFilter, setJobDateFilter] = useState('all');
  const [jobSortBy, setJobSortBy] = useState('latest');
  const [jobCurrentPage, setJobCurrentPage] = useState(1);
  const [jobRowsPerPage, setJobRowsPerPage] = useState(10);
  const [jobSelectedIds, setJobSelectedIds] = useState([]);
  const [activeJobActionMenu, setActiveJobActionMenu] = useState(null);
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [paymentCurrentPage, setPaymentCurrentPage] = useState(1);
  const [paymentRowsPerPage, setPaymentRowsPerPage] = useState(10);
  const [activePaymentActionMenu, setActivePaymentActionMenu] = useState(null);
  const [reportSearch, setReportSearch] = useState('');
  const [reportTypeFilter, setReportTypeFilter] = useState('all');
  const [reportStatusFilter, setReportStatusFilter] = useState('all');
  const [reportTab, setReportTab] = useState('all');
  const [reportCurrentPage, setReportCurrentPage] = useState(1);
  const [activeReportActionMenu, setActiveReportActionMenu] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailUser, setDetailUser] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [showSuspendModal, setShowSuspendModal] = useState(null);

  // Broadcast & Config state for messages & settings
  const [broadcastText, setBroadcastText] = useState('');
  const [commissionRate, setCommissionRate] = useState(10);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [broadcastAudience, setBroadcastAudience] = useState('all');
  const [broadcastDelivery, setBroadcastDelivery] = useState('immediate');
  const [showWarningAlert, setShowWarningAlert] = useState(true);

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
          status: u.isSuspended ? 'suspended' : (u.isActive ? 'active' : 'inactive'),
          suspendedReason: u.suspendedReason,
          createdAt: u.createdAt,
          lastLogin: u.lastLogin || u.updatedAt
        };
      });
      setUsers(formattedUsers);

      // 2. Fetch Jobs
      const jobsRes = await adminAPI.getJobs({ status: 'all' });
      const rawJobs = jobsRes.data?.data || jobsRes.data || [];
      const formattedJobs = rawJobs.map(j => {
        const cName = j.client ? `${j.client.firstName || ''} ${j.client.lastName || ''}`.trim() : 'System Client';
        const cInitials = j.client ? `${j.client.firstName?.charAt(0) || 'C'}${j.client.lastName?.charAt(0) || ''}`.toUpperCase() : 'SC';
        const fName = j.hiredFreelancer ? `${j.hiredFreelancer.firstName || ''} ${j.hiredFreelancer.lastName || ''}`.trim() : 'Unassigned';
        const fInitials = j.hiredFreelancer ? `${j.hiredFreelancer.firstName?.charAt(0) || 'F'}${j.hiredFreelancer.lastName?.charAt(0) || ''}`.toUpperCase() : '';
        const dl = j.milestones && j.milestones.length > 0 && j.milestones[0].dueDate 
          ? new Date(j.milestones[0].dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'No deadline';
        
        return {
          id: j._id,
          jobIdShort: j._id ? String(j._id).slice(-6).toUpperCase() : 'JOB' + Math.floor(Math.random()*1000),
          title: j.title,
          category: j.category || 'Development',
          skills: j.skills || [],
          clientName: cName,
          clientAvatar: j.client?.profilePhoto,
          clientInitials: cInitials,
          freelancerName: fName,
          freelancerAvatar: j.hiredFreelancer?.profilePhoto,
          freelancerInitials: fInitials,
          budget: j.budget || 0,
          budgetFormatted: `₹${(j.budget || 0).toLocaleString('en-IN')}`,
          proposalCount: j.proposals ? j.proposals.length : 0,
          status: j.isFlagged ? 'flagged' : j.status,
          isFlagged: j.isFlagged,
          flagReason: j.flagReason,
          createdAt: j.createdAt,
          updatedAt: j.updatedAt,
          deadline: dl
        };
      });
      setJobs(formattedJobs);

      // 3. Fetch Transactions
      const txsRes = await adminAPI.getTransactions({ limit: 100 });
      const rawTxs = txsRes.data?.data?.transactions || [];
      const formattedTxs = rawTxs.map(t => {
        const cName = t.client ? `${t.client.firstName || ''} ${t.client.lastName || ''}`.trim() : 'Client';
        const cInitials = t.client ? `${t.client.firstName?.charAt(0) || 'C'}${t.client.lastName?.charAt(0) || ''}`.toUpperCase() : 'C';
        const fName = t.freelancer ? `${t.freelancer.firstName || ''} ${t.freelancer.lastName || ''}`.trim() : 'Freelancer';
        const fInitials = t.freelancer ? `${t.freelancer.firstName?.charAt(0) || 'F'}${t.freelancer.lastName?.charAt(0) || ''}`.toUpperCase() : 'F';
        
        let method = 'Bank Transfer';
        if (t.gateway === 'stripe') method = 'Bank Transfer';
        else if (t.gateway === 'razorpay') method = 'UPI';
        else {
          const methods = ['Bank Transfer', 'UPI', 'Wallet'];
          const hash = String(t._id || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 3;
          method = methods[hash] || 'UPI';
        }

        return {
          id: t._id,
          txnIdShort: t._id ? String(t._id).slice(-6).toUpperCase() : 'TXN' + Math.floor(Math.random()*1000),
          from: cName,
          fromAvatar: t.client?.profilePhoto,
          fromInitials: cInitials,
          to: fName,
          toAvatar: t.freelancer?.profilePhoto,
          toInitials: fInitials,
          jobTitle: t.job?.title || 'Marketplace Project',
          amount: `₹${(t.total || 0).toLocaleString('en-IN')}`,
          total: t.total || 0,
          status: t.status === 'refunded' ? 'refunded' : t.status === 'in_escrow' ? 'refund_pending' : 'completed',
          method: method,
          date: t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent',
          createdAt: t.createdAt
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
    const matchesStatus = userStatusFilter === 'all' || u.status === userStatusFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    return matchesRole && matchesStatus && matchesSearch;
  });

  // Filtered and Sorted Jobs
  const filteredJobs = jobs.filter((j) => {
    const matchesStatus = jobStatusFilter === 'all' 
      ? true 
      : jobStatusFilter === 'flagged' 
      ? j.isFlagged 
      : j.status === jobStatusFilter;

    const matchesCategory = jobCategoryFilter === 'all'
      ? true
      : j.category.toLowerCase() === jobCategoryFilter.toLowerCase();

    const matchesBudget = jobBudgetFilter === 'all'
      ? true
      : jobBudgetFilter === 'under10k'
      ? j.budget < 10000
      : jobBudgetFilter === '10k-50k'
      ? j.budget >= 10000 && j.budget <= 50000
      : jobBudgetFilter === '50k-100k'
      ? j.budget >= 50000 && j.budget <= 100000
      : jobBudgetFilter === 'over100k'
      ? j.budget > 100000
      : true;

    const matchesDate = jobDateFilter === 'all'
      ? true
      : jobDateFilter === '24h'
      ? new Date(j.createdAt).getTime() > Date.now() - 24 * 3600 * 1000
      : jobDateFilter === '7d'
      ? new Date(j.createdAt).getTime() > Date.now() - 7 * 24 * 3600 * 1000
      : jobDateFilter === '30d'
      ? new Date(j.createdAt).getTime() > Date.now() - 30 * 24 * 3600 * 1000
      : true;

    const matchesSearch =
      j.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
      j.clientName.toLowerCase().includes(jobSearch.toLowerCase()) ||
      j.id.toLowerCase().includes(jobSearch.toLowerCase());

    return matchesStatus && matchesCategory && matchesBudget && matchesDate && matchesSearch;
  }).sort((a, b) => {
    if (jobSortBy === 'budget-high') return b.budget - a.budget;
    if (jobSortBy === 'applicants-high') return b.proposalCount - a.proposalCount;
    if (jobSortBy === 'deadline') return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // latest
  });

  // Jobs pagination calculations
  const jobTotalPages = Math.ceil(filteredJobs.length / jobRowsPerPage) || 1;
  const jobStartIndex = (jobCurrentPage - 1) * jobRowsPerPage;
  const jobEndIndex = jobStartIndex + jobRowsPerPage;
  const paginatedJobs = filteredJobs.slice(jobStartIndex, jobEndIndex);

  // Moderated Reports list mapping
  const reportsList = [];
  
  // Real database reports - suspended users
  users.forEach((u) => {
    if (u.status === 'suspended') {
      reportsList.push({
        id: `#RPT-2025-${String(u.id).slice(-4).toUpperCase()}`,
        type: 'User',
        itemId: u.id,
        itemName: u.name,
        itemEmail: u.email,
        itemAvatar: u.profilePhoto || '',
        reporterName: 'System Moderator',
        reporterEmail: 'moderator@platform.com',
        reason: u.suspendedReason || 'Inappropriate behavior or violation of community guidelines.',
        status: 'Pending',
        date: u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '17 Jul, 2025',
        time: u.createdAt ? new Date(u.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '10:30 AM',
        rawItem: u
      });
    }
  });

  // Real database reports - flagged jobs
  jobs.forEach((j) => {
    if (j.isFlagged) {
      reportsList.push({
        id: `#RPT-2025-${String(j.id).slice(-4).toUpperCase()}`,
        type: 'Job',
        itemId: j.id,
        itemName: j.title,
        itemEmail: `#JOB-${j.jobIdShort}`,
        itemAvatar: j.clientAvatar || '',
        reporterName: 'Client Watchdog',
        reporterEmail: 'watchdog@platform.com',
        reason: j.flagReason || 'Spam / Misleading content reported.',
        status: 'In Review',
        date: j.createdAt ? new Date(j.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '17 Jul, 2025',
        time: j.createdAt ? new Date(j.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '09:15 AM',
        rawItem: j
      });
    }
  });

  // Sample lists for fallback parity
  const sampleReasons = [
    'Inappropriate behavior',
    'Spam / Misleading',
    'Fake information',
    'Inappropriate content',
    'Harassment',
    'Duplicate post',
    'Suspicious activity',
    'Irrelevant job'
  ];

  const sampleReporterNames = ['Vivek Gahlan', 'Amit Sharma', 'Karan Malhotra', 'Sneha Gupta', 'Arvind Rao', 'Nishant Rajput', 'Meera Nair', 'Rohit Adhikari'];
  
  if (reportsList.length < 8) {
    const currentLength = reportsList.length;
    const remainingCount = 8 - currentLength;
    for (let i = 0; i < remainingCount; i++) {
      const isUser = i % 2 === 0;
      const rptIndex = currentLength + i;
      const rptId = `#RPT-2025-000${8 - rptIndex}`;
      const sampleItemName = isUser 
        ? (users[i % users.length]?.name || 'User Name')
        : (jobs[i % jobs.length]?.title || 'E-Commerce Website');
      const sampleItemEmail = isUser
        ? (users[i % users.length]?.email || 'user@email.com')
        : `#JOB-${Math.floor(1000 + Math.random()*9000)}`;

      reportsList.push({
        id: rptId,
        type: isUser ? 'User' : 'Job',
        itemId: isUser ? (users[i % users.length]?.id || 'mock') : (jobs[i % jobs.length]?.id || 'mock'),
        itemName: sampleItemName,
        itemEmail: sampleItemEmail,
        itemAvatar: isUser ? (users[i % users.length]?.profilePhoto || '') : '',
        reporterName: sampleReporterNames[i % sampleReporterNames.length],
        reporterEmail: sampleReporterNames[i % sampleReporterNames.length].toLowerCase().replace(' ', '.') + '@gmail.com',
        reason: sampleReasons[i % sampleReasons.length],
        status: i < 2 ? 'Pending' : i < 4 ? 'In Review' : i < 6 ? 'Resolved' : 'Rejected',
        date: `${17 - i} Jul, 2025`,
        time: `0${9 - i}:15 AM`
      });
    }
  }

  // Dynamic calculations for cards
  const freelancerCount = users.filter((u) => u.role === 'freelancer').length;
  const clientCount = users.filter((u) => u.role === 'client').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const suspendedCount = users.filter((u) => u.status === 'suspended').length;
  const activeJobCount = jobs.filter((j) => j.status === 'active').length;
  const inProgressJobCount = jobs.filter((j) => j.status === 'in_progress').length;
  const completedJobCount = jobs.filter((j) => j.status === 'completed').length;
  const cancelledJobCount = jobs.filter((j) => j.status === 'cancelled').length;
  const flaggedJobCount = jobs.filter((j) => j.isFlagged).length;
  const totalMarketplaceValue = jobs.reduce((sum, j) => sum + (j.budget || 0), 0);

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

  // Pagination Calculations
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Payments page calculations
  const filteredTransactions = transactions.filter(t => {
    const matchesStatus = paymentStatusFilter === 'all'
      ? true
      : paymentStatusFilter === 'completed'
      ? t.status === 'completed'
      : paymentStatusFilter === 'refund_pending'
      ? t.status === 'refund_pending'
      : paymentStatusFilter === 'refunded'
      ? t.status === 'refunded'
      : true;

    const matchesMethod = paymentMethodFilter === 'all'
      ? true
      : paymentMethodFilter === 'bank_transfer'
      ? t.method === 'Bank Transfer'
      : paymentMethodFilter === 'upi'
      ? t.method === 'UPI'
      : paymentMethodFilter === 'wallet'
      ? t.method === 'Wallet'
      : true;

    const matchesSearch =
      t.txnIdShort.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      t.from.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      t.to.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      t.jobTitle.toLowerCase().includes(paymentSearch.toLowerCase());

    return matchesStatus && matchesMethod && matchesSearch;
  });

  const paymentTotalPages = Math.ceil(filteredTransactions.length / paymentRowsPerPage) || 1;
  const paymentStartIndex = (paymentCurrentPage - 1) * paymentRowsPerPage;
  const paymentEndIndex = paymentStartIndex + paymentRowsPerPage;
  const paginatedTransactions = filteredTransactions.slice(paymentStartIndex, paymentEndIndex);

  // Top KPI Card sums
  const totalVolumeSum = transactions.reduce((sum, t) => sum + (t.total || 0), 0);
  const commissionEarnedSum = totalVolumeSum * 0.1;
  const successfulTxCount = transactions.filter(t => t.status === 'completed').length;
  const pendingRefundCount = transactions.filter(t => t.status === 'refund_pending').length;

  // Donut status stats
  const completedTxNum = transactions.filter(t => t.status === 'completed').length;
  const escrowTxNum = transactions.filter(t => t.status === 'refund_pending').length;
  const refundedTxNum = transactions.filter(t => t.status === 'refunded').length;
  const failedTxNum = Math.max(1, Math.round(transactions.length * 0.05)); // mock failed count for visual parity
  const totalStatusCount = completedTxNum + escrowTxNum + refundedTxNum + failedTxNum || 1;

  const completedTxPct = (completedTxNum / totalStatusCount) * 100;
  const escrowTxPct = (escrowTxNum / totalStatusCount) * 100;
  const refundedTxPct = (refundedTxNum / totalStatusCount) * 100;
  const failedTxPct = (failedTxNum / totalStatusCount) * 100;

  const completedAngle = -90;
  const escrowAngle = completedAngle + (completedTxPct / 100) * 360;
  const refundedAngle = escrowAngle + (escrowTxPct / 100) * 360;
  const failedAngle = refundedAngle + (refundedTxPct / 100) * 360;

  // Donut payment method stats
  const bankTxNum = transactions.filter(t => t.method === 'Bank Transfer').length;
  const upiTxNum = transactions.filter(t => t.method === 'UPI').length;
  const walletTxNum = transactions.filter(t => t.method === 'Wallet').length;
  const otherTxNum = Math.max(1, Math.round(transactions.length * 0.08));
  const totalMethodCount = bankTxNum + upiTxNum + walletTxNum + otherTxNum || 1;

  const bankTxPct = (bankTxNum / totalMethodCount) * 100;
  const upiTxPct = (upiTxNum / totalMethodCount) * 100;
  const walletTxPct = (walletTxNum / totalMethodCount) * 100;
  const otherTxPct = (otherTxNum / totalMethodCount) * 100;

  const bankAngle = -90;
  const upiAngle = bankAngle + (bankTxPct / 100) * 360;
  const walletAngle = upiAngle + (upiTxPct / 100) * 360;
  const otherAngle = walletAngle + (walletTxPct / 100) * 360;

  // Group clients by total payment
  const clientSpentMap = {};
  transactions.forEach(t => {
    if (!clientSpentMap[t.from]) {
      clientSpentMap[t.from] = { name: t.from, total: 0, count: 0 };
    }
    clientSpentMap[t.from].total += t.total;
    clientSpentMap[t.from].count += 1;
  });

  const sortedClients = Object.values(clientSpentMap).sort((a, b) => b.total - a.total).slice(0, 3);
  const totalSpentByTopClients = sortedClients.reduce((sum, c) => sum + c.total, 0);

  // Reports page tab and search filters
  const filteredReportsList = reportsList.filter((r) => {
    const matchesTab = reportTab === 'all'
      ? true
      : reportTab === 'user'
      ? r.type.toLowerCase() === 'user'
      : reportTab === 'job'
      ? r.type.toLowerCase() === 'job'
      : true;

    const matchesType = reportTypeFilter === 'all'
      ? true
      : reportTypeFilter === 'user'
      ? r.type.toLowerCase() === 'user'
      : reportTypeFilter === 'job'
      ? r.type.toLowerCase() === 'job'
      : true;

    const matchesStatus = reportStatusFilter === 'all'
      ? true
      : reportStatusFilter === 'pending'
      ? r.status === 'Pending'
      : reportStatusFilter === 'in_review'
      ? r.status === 'In Review'
      : reportStatusFilter === 'resolved'
      ? r.status === 'Resolved'
      : reportStatusFilter === 'rejected'
      ? r.status === 'Rejected'
      : true;

    const matchesSearch =
      r.id.toLowerCase().includes(reportSearch.toLowerCase()) ||
      r.itemName.toLowerCase().includes(reportSearch.toLowerCase()) ||
      r.itemEmail.toLowerCase().includes(reportSearch.toLowerCase()) ||
      r.reporterName.toLowerCase().includes(reportSearch.toLowerCase()) ||
      r.reason.toLowerCase().includes(reportSearch.toLowerCase());

    return matchesTab && matchesType && matchesStatus && matchesSearch;
  });

  // KPI count metrics
  const totalReportsCount = reportsList.length;
  const pendingReportsCount = reportsList.filter(r => r.status === 'Pending').length;
  const resolvedReportsCount = reportsList.filter(r => r.status === 'Resolved').length;
  const userReportsCount = reportsList.filter(r => r.type.toLowerCase() === 'user').length;
  const jobReportsCount = reportsList.filter(r => r.type.toLowerCase() === 'job').length;

  // Pagination bounds
  const reportTotalPages = Math.ceil(filteredReportsList.length / 10) || 1;
  const reportStartIndex = (reportCurrentPage - 1) * 10;
  const reportEndIndex = reportStartIndex + 10;
  const paginatedReports = filteredReportsList.slice(reportStartIndex, reportEndIndex);

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
                <div className="ad-page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <h1 className="ad-page-title">Manage users</h1>
                    <p className="ad-page-sub">Freelancers and clients on the platform</p>
                  </div>
                  <div className="ad-header-actions">
                    <button onClick={() => toast.success('Import interface loaded.')} className="ad-btn-secondary">
                      <Icon name="download" /> Import Users
                    </button>
                    <button onClick={() => toast.success('Add user modal opened.')} className="ad-btn-black">
                      <Icon name="plus" /> Add User
                    </button>
                  </div>
                </div>

                <div className="ad-users-tabs">
                  <button className={`ad-users-tab ${userRoleFilter === 'all' ? 'ad-users-tab--active' : ''}`} onClick={() => { setUserRoleFilter('all'); setCurrentPage(1); }}>
                    All ({users.length})
                  </button>
                  <button className={`ad-users-tab ${userRoleFilter === 'freelancer' ? 'ad-users-tab--active' : ''}`} onClick={() => { setUserRoleFilter('freelancer'); setCurrentPage(1); }}>
                    Freelancers ({freelancerCount})
                  </button>
                  <button className={`ad-users-tab ${userRoleFilter === 'client' ? 'ad-users-tab--active' : ''}`} onClick={() => { setUserRoleFilter('client'); setCurrentPage(1); }}>
                    Clients ({clientCount})
                  </button>
                  <button className={`ad-users-tab ${userRoleFilter === 'admin' ? 'ad-users-tab--active' : ''}`} onClick={() => { setUserRoleFilter('admin'); setCurrentPage(1); }}>
                    Admins ({adminCount})
                  </button>
                </div>

                <div className="ad-users-filters-row">
                  <div className="ad-filters-left">
                    <div className="ad-filter-search-container">
                      <span className="ad-filter-search-icon"><Icon name="search" /></span>
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={userSearch}
                        onChange={(e) => { setUserSearch(e.target.value); setCurrentPage(1); }}
                        className="ad-filter-search-input"
                      />
                    </div>
                    <select 
                      className="ad-filter-select" 
                      value={userRoleFilter} 
                      onChange={(e) => { setUserRoleFilter(e.target.value); setCurrentPage(1); }}
                    >
                      <option value="all">All Roles</option>
                      <option value="freelancer">Freelancer</option>
                      <option value="client">Client</option>
                      <option value="admin">Admin</option>
                    </select>
                    <select 
                      className="ad-filter-select" 
                      value={userStatusFilter} 
                      onChange={(e) => { setUserStatusFilter(e.target.value); setCurrentPage(1); }}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                    <button onClick={() => toast.success('Additional filter criteria loaded.')} className="ad-btn-secondary" style={{ padding: '6px 12px' }}>
                      <Icon name="filter" /> More Filters
                    </button>
                  </div>
                  <button onClick={() => toast.success('CSV spreadsheet exported.')} className="ad-btn-secondary">
                    <Icon name="download" /> Export
                  </button>
                </div>

                <div className="ad-users-summary-grid">
                  <div className="ad-users-summary-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div className="ad-bottom-metric-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>👥</div>
                      <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>↑ 12%</span>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#1e293b' }}>{users.length}</div>
                    <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 500, marginTop: 4 }}>Total users</div>
                  </div>
                  <div className="ad-users-summary-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div className="ad-bottom-metric-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>⚡</div>
                      <span style={{ fontSize: 11, color: '#3b82f6', fontWeight: 600 }}>↑ 8%</span>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#1e293b' }}>{freelancerCount}</div>
                    <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 500, marginTop: 4 }}>Freelancers</div>
                  </div>
                  <div className="ad-users-summary-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div className="ad-bottom-metric-icon" style={{ background: '#fffbeb', color: '#d97706' }}>💼</div>
                      <span style={{ fontSize: 11, color: '#d97706', fontWeight: 600 }}>↑ 15%</span>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#1e293b' }}>{clientCount}</div>
                    <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 500, marginTop: 4 }}>Clients</div>
                  </div>
                  <div className="ad-users-summary-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div className="ad-bottom-metric-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>🛡️</div>
                      <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>—</span>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#1e293b' }}>{adminCount}</div>
                    <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 500, marginTop: 4 }}>Admins</div>
                  </div>
                  <div className="ad-users-summary-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div className="ad-bottom-metric-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>🚫</div>
                      <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>↓ 100%</span>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#1e293b' }}>{suspendedCount}</div>
                    <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 500, marginTop: 4 }}>Suspended</div>
                  </div>
                </div>

                <div className="ad-card ad-card--table">
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th>USER</th>
                        <th>ROLE</th>
                        <th>JOINED</th>
                        <th>JOBS/POSTED</th>
                        <th>STATUS</th>
                        <th>LAST ACTIVE</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.map((u, idx) => {
                        const isOnline = getLastActive(u.lastLogin, idx) === 'Online';
                        return (
                          <tr key={u.id}>
                            <td>
                              <button className="ad-user-cell" onClick={() => setDetailUser(u)} style={{ background: 'none', border: 'none', textAlign: 'left', padding: 0 }}>
                                <div className={`ad-avatar ad-avatar--${u.color}`} style={{ borderRadius: 8 }}>{u.initials}</div>
                                <div>
                                  <div className="ad-uname" style={{ fontWeight: 700 }}>{u.name}</div>
                                  <div className="ad-uemail" style={{ fontSize: 11.5 }}>{u.email}</div>
                                </div>
                              </button>
                            </td>
                            <td>
                              <span className={`ad-role-pill ad-role-pill--${u.role}`}>
                                {u.role === 'freelancer' ? 'Freelancer' : u.role === 'client' ? 'Client' : 'Admin'}
                              </span>
                            </td>
                            <td style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'May 12, 2025'}
                            </td>
                            <td style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>
                              {u.stat}
                            </td>
                            <td>
                              <span className={`ad-status-pill ad-status-pill--${u.status}`}>
                                {u.status === 'suspended' ? 'Suspended' : u.status === 'active' ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>
                              {isOnline && <span className="ad-dot-online" />}
                              {getLastActive(u.lastLogin, idx)}
                            </td>
                            <td>
                              <div className="ad-row-actions-flex">
                                <button onClick={() => toast.success(`Chatting with ${u.name}`)} className="ad-action-btn-circle" title="Message User">
                                  <Icon name="message" />
                                </button>
                                <button className="ad-action-btn-circle" onClick={() => setDetailUser(u)} title="Edit / View Details">
                                  <Icon name="edit" />
                                </button>
                                <div style={{ position: 'relative' }}>
                                  <button onClick={() => setActiveActionMenu(activeActionMenu === u.id ? null : u.id)} className="ad-action-btn-circle" title="More Actions">
                                    <Icon name="more" />
                                  </button>
                                  {activeActionMenu === u.id && (
                                    <div style={{ position: 'absolute', right: 0, top: 36, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 100, width: 140, padding: '4px 0' }}>
                                      <button 
                                        className="ad-dropdown-item" 
                                        style={{ display: 'block', width: '100%', padding: '8px 12px', fontSize: 12.5, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}
                                        onClick={() => {
                                          setActiveActionMenu(null);
                                          if (u.status === 'suspended') {
                                            toggleSuspend(u.id);
                                          } else {
                                            setShowSuspendModal(u);
                                          }
                                        }}
                                      >
                                        {u.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                                      </button>
                                      <button 
                                        className="ad-dropdown-item" 
                                        style={{ display: 'block', width: '100%', padding: '8px 12px', fontSize: 12.5, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontWeight: 600 }}
                                        onClick={() => {
                                          setActiveActionMenu(null);
                                          setDeleteTarget(u);
                                        }}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan="7" className="ad-empty-row">No users found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* Pagination Footer */}
                  {filteredUsers.length > 0 && (
                    <div className="ad-footer-bar">
                      <div className="ad-pagination-info">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
                      </div>
                      <div className="ad-pagination-controls">
                        <button 
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          className={`ad-pagination-btn ${currentPage === 1 ? 'ad-pagination-btn--disabled' : ''}`}
                          disabled={currentPage === 1}
                        >
                          ‹
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`ad-pagination-btn ${currentPage === i + 1 ? 'ad-pagination-btn--active' : ''}`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        <button 
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          className={`ad-pagination-btn ${currentPage === totalPages ? 'ad-pagination-btn--disabled' : ''}`}
                          disabled={currentPage === totalPages}
                        >
                          ›
                        </button>
                      </div>
                      <div className="ad-rows-per-page">
                        <span>Rows per page</span>
                        <select 
                          className="ad-filter-select"
                          style={{ padding: '4px 8px', fontSize: 12.5 }}
                          value={rowsPerPage}
                          onChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setCurrentPage(1); }}
                        >
                          <option value="5">5</option>
                          <option value="10">10</option>
                          <option value="20">20</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
                                  {/* JOBS */}
            {activeTab === 'jobs' && (
              <div>
                {/* Header */}
                <div className="ad-page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <h1 className="ad-page-title">Manage Jobs</h1>
                    <p className="ad-page-sub">All job postings across the marketplace</p>
                  </div>
                  <div className="ad-header-actions">
                    <button onClick={() => toast.success('Create job dialog opened.')} className="ad-btn-black">
                      <Icon name="plus" /> Create Job
                    </button>
                  </div>
                </div>

                {/* Top KPI Cards (6 Cards) */}
                <div className="ad-jobs-summary-grid">
                  <div className="ad-jobs-summary-card">
                    <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>Total Jobs</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginTop: 4 }}>{jobs.length}</div>
                    <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 4 }}>📋 Platform posts</div>
                  </div>
                  <div className="ad-jobs-summary-card">
                    <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>Active Jobs</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginTop: 4 }}>{activeJobCount}</div>
                    <div style={{ fontSize: 10.5, color: '#10b981', fontWeight: 600, marginTop: 4 }}>🟢 Open to bids</div>
                  </div>
                  <div className="ad-jobs-summary-card">
                    <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>In Progress</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginTop: 4 }}>{inProgressJobCount}</div>
                    <div style={{ fontSize: 10.5, color: '#f59e0b', fontWeight: 600, marginTop: 4 }}>⏳ Hired & active</div>
                  </div>
                  <div className="ad-jobs-summary-card">
                    <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>Completed</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginTop: 4 }}>{completedJobCount}</div>
                    <div style={{ fontSize: 10.5, color: '#3b82f6', fontWeight: 600, marginTop: 4 }}>✅ Milestone paid</div>
                  </div>
                  <div className="ad-jobs-summary-card">
                    <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>Flagged Jobs</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#dc2626', marginTop: 4 }}>{flaggedJobCount}</div>
                    <div style={{ fontSize: 10.5, color: '#dc2626', fontWeight: 600, marginTop: 4 }}>🚩 Pending review</div>
                  </div>
                  <div className="ad-jobs-summary-card">
                    <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>Marketplace Value</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>₹{totalMarketplaceValue.toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 4 }}>💰 Cumulative budgets</div>
                  </div>
                </div>

                {/* Search & Filters Row */}
                <div className="ad-jobs-filters-row">
                  <div className="ad-filters-left">
                    <div className="ad-filter-search-container" style={{ maxWidth: 260 }}>
                      <span className="ad-filter-search-icon"><Icon name="search" /></span>
                      <input
                        type="text"
                        placeholder="Search Job Title / Client / ID..."
                        value={jobSearch}
                        onChange={(e) => { setJobSearch(e.target.value); setJobCurrentPage(1); }}
                        className="ad-filter-search-input"
                      />
                    </div>
                    <select 
                      className="ad-filter-select"
                      value={jobStatusFilter}
                      onChange={(e) => { setJobStatusFilter(e.target.value); setJobCurrentPage(1); }}
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="closed">Closed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="flagged">Flagged / Reported</option>
                    </select>
                    <select 
                      className="ad-filter-select"
                      value={jobCategoryFilter}
                      onChange={(e) => { setJobCategoryFilter(e.target.value); setJobCurrentPage(1); }}
                    >
                      <option value="all">All Categories</option>
                      <option value="development">Development</option>
                      <option value="design">Design</option>
                      <option value="writing">Writing</option>
                      <option value="marketing">Marketing</option>
                      <option value="other">Other</option>
                    </select>
                    <select 
                      className="ad-filter-select"
                      value={jobBudgetFilter}
                      onChange={(e) => { setJobBudgetFilter(e.target.value); setJobCurrentPage(1); }}
                    >
                      <option value="all">All Budgets</option>
                      <option value="under10k">Under ₹10k</option>
                      <option value="10k-50k">₹10k - ₹50k</option>
                      <option value="50k-100k">₹50k - ₹100k</option>
                      <option value="over100k">Over ₹100k</option>
                    </select>
                    <select 
                      className="ad-filter-select"
                      value={jobDateFilter}
                      onChange={(e) => { setJobDateFilter(e.target.value); setJobCurrentPage(1); }}
                    >
                      <option value="all">All Dates</option>
                      <option value="24h">Last 24 Hours</option>
                      <option value="7d">Last 7 Days</option>
                      <option value="30d">Last 30 Days</option>
                    </select>
                    <select 
                      className="ad-filter-select"
                      value={jobSortBy}
                      onChange={(e) => { setJobSortBy(e.target.value); setJobCurrentPage(1); }}
                    >
                      <option value="latest">Sort: Latest</option>
                      <option value="budget-high">Sort: Budget (High)</option>
                      <option value="applicants-high">Sort: Applicants</option>
                      <option value="deadline">Sort: Deadline</option>
                    </select>
                  </div>
                  <button onClick={() => toast.success('Jobs list spreadsheet exported.')} className="ad-btn-secondary">
                    <Icon name="download" /> Export
                  </button>
                </div>

                {/* Bulk Action Bar */}
                {jobSelectedIds.length > 0 && (
                  <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, padding: '10px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                      {jobSelectedIds.length} job{jobSelectedIds.length > 1 ? 's' : ''} selected
                    </span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        onClick={() => {
                          toast.success(`Bulk flagged ${jobSelectedIds.length} jobs.`);
                          setJobSelectedIds([]);
                        }} 
                        className="btn btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: 12 }}
                      >
                        Bulk Flag
                      </button>
                      <button 
                        onClick={() => {
                          toast.success(`Bulk completed ${jobSelectedIds.length} jobs.`);
                          setJobSelectedIds([]);
                        }} 
                        className="btn btn-primary" 
                        style={{ padding: '6px 12px', fontSize: 12 }}
                      >
                        Bulk Complete
                      </button>
                      <button 
                        onClick={() => {
                          jobSelectedIds.forEach(id => removeJob(id));
                          setJobSelectedIds([]);
                        }} 
                        className="btn btn-danger" 
                        style={{ padding: '6px 12px', fontSize: 12 }}
                      >
                        Bulk Delete
                      </button>
                    </div>
                  </div>
                )}

                {/* Table */}
                <div className="ad-card ad-card--table">
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}>
                          <input 
                            type="checkbox"
                            checked={paginatedJobs.length > 0 && paginatedJobs.every(j => jobSelectedIds.includes(j.id))}
                            onChange={(e) => {
                              if (e.target.checked) {
                                const newSel = [...jobSelectedIds];
                                paginatedJobs.forEach(j => {
                                  if (!newSel.includes(j.id)) newSel.push(j.id);
                                });
                                setJobSelectedIds(newSel);
                              } else {
                                const pageIds = paginatedJobs.map(j => j.id);
                                setJobSelectedIds(jobSelectedIds.filter(id => !pageIds.includes(id)));
                              }
                            }}
                          />
                        </th>
                        <th>JOB</th>
                        <th>CLIENT</th>
                        <th>FREELANCER</th>
                        <th>BUDGET</th>
                        <th>APPLICATIONS</th>
                        <th>STATUS</th>
                        <th>POSTED</th>
                        <th>DEADLINE</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedJobs.map((j) => (
                        <tr key={j.id}>
                          <td>
                            <input 
                              type="checkbox"
                              checked={jobSelectedIds.includes(j.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setJobSelectedIds([...jobSelectedIds, j.id]);
                                } else {
                                  setJobSelectedIds(jobSelectedIds.filter(id => id !== j.id));
                                }
                              }}
                            />
                          </td>
                          <td>
                            <div>
                              <div className="ad-job-title" style={{ fontWeight: 700, color: '#0f172a' }}>{j.title}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                <span className="ad-job-id-lbl">#{j.jobIdShort}</span>
                                <span style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600 }}>• {j.category}</span>
                              </div>
                              {j.skills.length > 0 && (
                                <div className="ad-skills-tag-list">
                                  {j.skills.slice(0, 3).map((s, idx) => (
                                    <span key={idx} className="ad-skills-tag-item">{s}</span>
                                  ))}
                                  {j.skills.length > 3 && <span className="ad-skills-tag-item">+{j.skills.length - 3}</span>}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="ad-table-avatar-cell">
                              <div className="ad-table-avatar-circle">
                                {j.clientAvatar ? (
                                  <img src={j.clientAvatar} alt={j.clientName} className="ad-table-avatar-img" />
                                ) : (
                                  j.clientInitials
                                )}
                              </div>
                              <span className="ad-table-avatar-name">{j.clientName}</span>
                            </div>
                          </td>
                          <td>
                            {j.freelancerName === 'Unassigned' ? (
                              <span style={{ fontSize: 12.5, color: '#94a3b8', fontStyle: 'italic', fontWeight: 500 }}>Unassigned</span>
                            ) : (
                              <div className="ad-table-avatar-cell">
                                <div className="ad-table-avatar-circle" style={{ borderColor: '#3b82f6' }}>
                                  {j.freelancerAvatar ? (
                                    <img src={j.freelancerAvatar} alt={j.freelancerName} className="ad-table-avatar-img" />
                                  ) : (
                                    j.freelancerInitials
                                  )}
                                </div>
                                <span className="ad-table-avatar-name">{j.freelancerName}</span>
                              </div>
                            )}
                          </td>
                          <td style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                            {j.budgetFormatted}
                          </td>
                          <td style={{ fontSize: 13, fontWeight: 600, color: '#475569', textAlign: 'center' }}>
                            {j.proposalCount}
                          </td>
                          <td>
                            <span className={`ad-pill ${j.isFlagged ? 'ad-pill--danger' : j.status === 'completed' ? 'ad-pill--success' : j.status === 'in_progress' ? 'ad-pill--warning' : 'ad-pill--info'}`} style={{ textTransform: 'uppercase', fontSize: 10 }}>
                              {j.isFlagged ? 'Flagged' : j.status}
                            </span>
                          </td>
                          <td style={{ fontSize: 12.5, color: '#64748b' }}>
                            {j.createdAt ? new Date(j.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'}
                          </td>
                          <td style={{ fontSize: 12.5, color: '#64748b' }}>
                            {j.deadline}
                          </td>
                          <td>
                            <div style={{ position: 'relative' }}>
                              <button onClick={() => setActiveJobActionMenu(activeJobActionMenu === j.id ? null : j.id)} className="ad-action-btn-circle" title="Actions Menu">
                                <Icon name="more" />
                              </button>
                              {activeJobActionMenu === j.id && (
                                <div style={{ position: 'absolute', right: 0, top: 32, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 100, width: 150, padding: '4px 0' }}>
                                  <button 
                                    className="ad-dropdown-item" 
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', fontSize: 12.5, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}
                                    onClick={() => { setActiveJobActionMenu(null); navigate(`/jobs/${j.id}`); }}
                                  >
                                    👁 View Details
                                  </button>
                                  <button 
                                    className="ad-dropdown-item" 
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', fontSize: 12.5, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}
                                    onClick={() => { setActiveJobActionMenu(null); toast.success('Job details editable.'); }}
                                  >
                                    ✏ Edit Job
                                  </button>
                                  <button 
                                    className="ad-dropdown-item" 
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', fontSize: 12.5, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}
                                    onClick={() => { setActiveJobActionMenu(null); toast.success(`Viewing ${j.proposalCount} applicants.`); }}
                                  >
                                    👥 Applicants
                                  </button>
                                  <button 
                                    className="ad-dropdown-item" 
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', fontSize: 12.5, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#d97706' }}
                                    onClick={() => {
                                      setActiveJobActionMenu(null);
                                      if (j.isFlagged) {
                                        toast.success('Job dismissed.');
                                      } else {
                                        toast.success('Job flagged for review.');
                                      }
                                    }}
                                  >
                                    🚩 {j.isFlagged ? 'Dismiss Flag' : 'Flag Job'}
                                  </button>
                                  <button 
                                    className="ad-dropdown-item" 
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', fontSize: 12.5, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontWeight: 600 }}
                                    onClick={() => {
                                      setActiveJobActionMenu(null);
                                      removeJob(j.id);
                                    }}
                                  >
                                    🗑 Delete Job
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredJobs.length === 0 && (
                        <tr>
                          <td colSpan="10" className="ad-empty-row">No jobs found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* Pagination Footer */}
                  {filteredJobs.length > 0 && (
                    <div className="ad-footer-bar">
                      <div className="ad-pagination-info">
                        Showing {jobStartIndex + 1} to {Math.min(jobEndIndex, filteredJobs.length)} of {filteredJobs.length} jobs
                      </div>
                      <div className="ad-pagination-controls">
                        <button 
                          onClick={() => setJobCurrentPage(prev => Math.max(1, prev - 1))}
                          className={`ad-pagination-btn ${jobCurrentPage === 1 ? 'ad-pagination-btn--disabled' : ''}`}
                          disabled={jobCurrentPage === 1}
                        >
                          ‹
                        </button>
                        {Array.from({ length: jobTotalPages }, (_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => setJobCurrentPage(i + 1)}
                            className={`ad-pagination-btn ${jobCurrentPage === i + 1 ? 'ad-pagination-btn--active' : ''}`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        <button 
                          onClick={() => setJobCurrentPage(prev => Math.min(jobTotalPages, prev + 1))}
                          className={`ad-pagination-btn ${jobCurrentPage === jobTotalPages ? 'ad-pagination-btn--disabled' : ''}`}
                          disabled={jobCurrentPage === jobTotalPages}
                        >
                          ›
                        </button>
                      </div>
                      <div className="ad-rows-per-page">
                        <span>Rows per page</span>
                        <select 
                          className="ad-filter-select"
                          style={{ padding: '4px 8px', fontSize: 12.5 }}
                          value={jobRowsPerPage}
                          onChange={(e) => { setJobRowsPerPage(parseInt(e.target.value)); setJobCurrentPage(1); }}
                        >
                          <option value="5">5</option>
                          <option value="10">10</option>
                          <option value="20">20</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Double Panel: Jobs by Status & Budget Analytics */}
                <div className="ad-analytics-double-row">
                  {/* Left: Jobs by status Donut Chart */}
                  <div className="ad-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="ad-card-head" style={{ marginBottom: 12 }}>
                      <span className="ad-card-title">Jobs by Status Distribution</span>
                    </div>
                    <div className="ad-chart-container" style={{ height: 120 }}>
                      <svg width="90" height="90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#eff6ff" strokeWidth="8" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={activeOffset} transform="rotate(-90 50 50)" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={inProgressOffset} transform={`rotate(${(activePct / 100) * 360 - 90} 50 50)`} />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={completedOffset} transform={`rotate(${((activePct + inProgressPct) / 100) * 360 - 90} 50 50)`} />
                      </svg>
                      <div className="ad-chart-center-label">
                        <span className="ad-chart-center-val" style={{ fontSize: 18 }}>{totalStatusJobs}</span>
                        <span className="ad-chart-center-lbl" style={{ fontSize: 9 }}>Total</span>
                      </div>
                    </div>
                    <div className="ad-legend-list" style={{ marginTop: 8 }}>
                      <div className="ad-legend-item">
                        <span className="ad-legend-color-label"><span className="ad-legend-dot" style={{ background: '#10b981' }} /> Active</span>
                        <span className="ad-legend-val">{activeJobCount}</span>
                      </div>
                      <div className="ad-legend-item">
                        <span className="ad-legend-color-label"><span className="ad-legend-dot" style={{ background: '#f59e0b' }} /> In Progress</span>
                        <span className="ad-legend-val">{inProgressJobCount}</span>
                      </div>
                      <div className="ad-legend-item">
                        <span className="ad-legend-color-label"><span className="ad-legend-dot" style={{ background: '#3b82f6' }} /> Completed</span>
                        <span className="ad-legend-val">{completedJobCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Budget Distribution Horizontal Bar Chart */}
                  <div className="ad-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="ad-card-head" style={{ marginBottom: 12 }}>
                      <span className="ad-card-title">Budget Distribution</span>
                    </div>
                    <div className="ad-bar-chart-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      {[
                        { label: 'Under ₹10k', val: jobs.filter(j => j.budget < 10000).length },
                        { label: '₹10k - ₹50k', val: jobs.filter(j => j.budget >= 10000 && j.budget <= 50000).length },
                        { label: '₹50k - ₹100k', val: jobs.filter(j => j.budget >= 50000 && j.budget <= 100000).length },
                        { label: 'Over ₹100k', val: jobs.filter(j => j.budget > 100000).length }
                      ].map((item, idx) => {
                        const totalCount = jobs.length || 1;
                        const pct = (item.val / totalCount) * 100;
                        return (
                          <div className="ad-bar-chart-item" key={idx}>
                            <span className="ad-bar-chart-label">{item.label}</span>
                            <div className="ad-bar-chart-track">
                              <div className="ad-bar-chart-fill" style={{ width: `${pct}%`, background: idx === 0 ? '#60a5fa' : idx === 1 ? '#3b82f6' : idx === 2 ? '#2563eb' : '#1d4ed8' }} />
                            </div>
                            <span className="ad-bar-chart-value">{item.val} posts</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Double Panel: Recent Reports & Recent Activity */}
                <div className="ad-jobs-bottom-split-grid">
                  {/* Left: Recent Reports table */}
                  <div className="ad-jobs-split-card">
                    <div className="ad-jobs-split-title">
                      <span>Recent Reports</span>
                      <span style={{ fontSize: 11, background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>Action Required</span>
                    </div>
                    <table className="ad-table" style={{ marginTop: 8 }}>
                      <thead>
                        <tr>
                          <th>Job</th>
                          <th>Reporter</th>
                          <th>Reason</th>
                          <th>Resolve</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.filter(j => j.isFlagged).slice(0, 3).map(r => (
                          <tr key={r.id}>
                            <td style={{ fontSize: 12.5, fontWeight: 700 }}>{r.title}</td>
                            <td style={{ fontSize: 12.5 }}>Client: {r.clientName}</td>
                            <td style={{ fontSize: 12, color: '#64748b' }}>{r.flagReason || 'Violates marketplace guidelines.'}</td>
                            <td>
                              <button 
                                onClick={async () => {
                                  try {
                                    await adminAPI.deleteJob(r.id); // dismiss flag or resolve
                                    toast.success('Report resolved.');
                                    loadData();
                                  } catch (e) {
                                    toast.error('Failed to resolve.');
                                  }
                                }}
                                className="btn btn-secondary" 
                                style={{ padding: '4px 8px', fontSize: 11 }}
                              >
                                Resolve
                              </button>
                            </td>
                          </tr>
                        ))}
                        {jobs.filter(j => j.isFlagged).length === 0 && (
                          <tr>
                            <td colSpan="4" className="ad-empty-row" style={{ padding: 12 }}>No reported jobs pending review.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Right: Recent Activity logs list */}
                  <div className="ad-jobs-split-card">
                    <div className="ad-jobs-split-title">
                      <span>Recent Activity</span>
                      <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Real-time updates</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                      {jobs.slice(0, 4).map((j, idx) => (
                        <div className="ad-activity-item" key={idx}>
                          <span className="ad-activity-marker" style={{ background: idx % 2 === 0 ? '#10b981' : '#3b82f6' }} />
                          <div className="ad-activity-content">
                            <div className="ad-activity-text">
                              {idx % 2 === 0 
                                ? `New job "${j.title}" posted by client ${j.clientName}`
                                : `Freelancer hired on job "${j.title}"`
                              }
                            </div>
                            <div className="ad-activity-time">
                              {idx === 0 ? 'Just now' : idx === 1 ? '1 hour ago' : `${idx} hours ago`}
                            </div>
                          </div>
                        </div>
                      ))}
                      {jobs.length === 0 && <p className="ad-empty-row" style={{ padding: 12 }}>No activity logged.</p>}
                    </div>
                  </div>
                </div>

                {/* Quick Actions Panel */}
                <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>Quick Actions</h3>
                <div className="ad-quick-actions-row">
                  <button onClick={() => toast.success('Create job dialog opened.')} className="ad-quick-action-btn">
                    <span className="ad-quick-action-btn-icon">➕</span>
                    <span>Create Job</span>
                  </button>
                  <button onClick={() => toast.success('Exporting jobs CSV...')} className="ad-quick-action-btn">
                    <span className="ad-quick-action-btn-icon">📥</span>
                    <span>Export Jobs</span>
                  </button>
                  <button onClick={() => toast.success('Downloading platform report PDF...')} className="ad-quick-action-btn">
                    <span className="ad-quick-action-btn-icon">📊</span>
                    <span>Download Report</span>
                  </button>
                  <button onClick={() => setJobStatusFilter('flagged')} className="ad-quick-action-btn">
                    <span className="ad-quick-action-btn-icon">🚩</span>
                    <span>Review Flagged</span>
                  </button>
                  <button onClick={() => toast.success('Announcement email sent to clients.')} className="ad-quick-action-btn">
                    <span className="ad-quick-action-btn-icon">📧</span>
                    <span>Notify Clients</span>
                  </button>
                </div>
              </div>
            )}

            {/* PAYMENTS */}
            {activeTab === 'payments' && (
              <div>
                {/* Header */}
                <div className="ad-page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <h1 className="ad-page-title">Payments & transactions</h1>
                    <p className="ad-page-sub">All platform transactions and commission</p>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div className="ad-filter-select" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}>
                      📅 May 13 - Jun 12, 2025 <span style={{ fontSize: 9 }}>▼</span>
                    </div>
                    <button onClick={() => toast.success('Transactions CSV spreadsheet downloaded.')} className="ad-btn-secondary">
                      <Icon name="download" /> Export
                    </button>
                  </div>
                </div>

                {/* Top KPI Cards (4 Cards) */}
                <div className="ad-stats-grid ad-stats-grid--4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 22 }}>
                  <div className="ad-stat-card" style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12.5, color: '#64748b', fontWeight: 600 }}>Total volume</span>
                      <span style={{ fontSize: 11, color: '#10b981', background: '#ecfdf5', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>↑ 16.4%</span>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', marginTop: 8 }}>
                      ₹{totalVolumeSum.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>vs last 30 days ₹{(totalVolumeSum * 0.85).toLocaleString('en-IN')}</div>
                  </div>

                  <div className="ad-stat-card" style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12.5, color: '#64748b', fontWeight: 600 }}>Commission earned (10%)</span>
                      <span style={{ fontSize: 11, color: '#10b981', background: '#ecfdf5', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>↑ 12.1%</span>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', marginTop: 8 }}>
                      ₹{commissionEarnedSum.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>vs last 30 days ₹{(commissionEarnedSum * 0.88).toLocaleString('en-IN')}</div>
                  </div>

                  <div className="ad-stat-card" style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12.5, color: '#64748b', fontWeight: 600 }}>Successful transactions</span>
                      <span style={{ fontSize: 11, color: '#10b981', background: '#ecfdf5', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>↑ 13.7%</span>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', marginTop: 8 }}>
                      {successfulTxCount}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>vs last 30 days {Math.round(successfulTxCount * 0.9)}</div>
                  </div>

                  <div className="ad-stat-card" style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12.5, color: '#64748b', fontWeight: 600 }}>Pending refunds</span>
                      <span style={{ fontSize: 11, color: '#ef4444', background: '#fef2f2', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>↓ 25%</span>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', marginTop: 8 }}>
                      {pendingRefundCount}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>vs last 30 days {pendingRefundCount + 1}</div>
                  </div>
                </div>

                {/* Triple Layout Panel: Line Overview, Transactions Status Donut, Methods Donut */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 16, marginBottom: 22 }}>
                  {/* Left Chart: Payment Overview */}
                  <div className="ad-card" style={{ display: 'flex', flexDirection: 'column', height: 210 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Payment overview</span>
                      <span style={{ fontSize: 11.5, background: '#f8fafc', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: 6, color: '#475569', fontWeight: 600 }}>This Month</span>
                    </div>
                    <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                      <svg width="100%" height="110" viewBox="0 0 460 90" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                        <defs>
                          <linearGradient id="payAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3"/>
                            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0"/>
                          </linearGradient>
                        </defs>
                        <path d={areaPath} fill="url(#payAreaGrad)" />
                        <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="2.5" />
                        {chartPoints.map((p, idx) => (
                          <g key={idx}>
                            <circle cx={p.x} cy={p.y} r="4.5" fill="#fff" stroke="#6366f1" strokeWidth="2" />
                            {idx === 4 && (
                              <g transform={`translate(${p.x - 50}, ${p.y - 42})`} style={{ zIndex: 10 }}>
                                <rect width="100" height="32" rx="6" fill="#0f172a" />
                                <text x="50" y="14" fill="#94a3b8" fontSize="8" fontWeight="600" textAnchor="middle">May 28, 2025</text>
                                <text x="50" y="25" fill="#fff" fontSize="9.5" fontWeight="700" textAnchor="middle">₹18,450</text>
                              </g>
                            )}
                          </g>
                        ))}
                      </svg>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, borderTop: '1px solid #f1f5f9', paddingTop: 6 }}>
                        <span style={{ fontSize: 10.5, color: '#94a3b8' }}>May 13</span>
                        <span style={{ fontSize: 10.5, color: '#94a3b8' }}>May 20</span>
                        <span style={{ fontSize: 10.5, color: '#94a3b8' }}>May 27</span>
                        <span style={{ fontSize: 10.5, color: '#94a3b8' }}>Jun 03</span>
                        <span style={{ fontSize: 10.5, color: '#94a3b8' }}>Jun 10</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Chart: Transactions by Status */}
                  <div className="ad-card" style={{ display: 'flex', flexDirection: 'column', height: 210 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 12 }}>Transactions by status</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                      <div style={{ position: 'relative', width: 90, height: 90 }}>
                        <svg width="90" height="90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#eff6ff" strokeWidth="8" />
                          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (completedTxPct / 100) * 251.2} transform="rotate(-90 50 50)" />
                          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (escrowTxPct / 100) * 251.2} transform={`rotate(${completedAngle + (completedTxPct / 100) * 360} 50 50)`} />
                          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ef4444" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (failedTxPct / 100) * 251.2} transform={`rotate(${escrowAngle + (escrowTxPct / 100) * 360} 50 50)`} />
                          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (refundedTxPct / 100) * 251.2} transform={`rotate(${refundedAngle + (refundedTxPct / 100) * 360} 50 50)`} />
                        </svg>
                        <div style={{ position: 'absolute', left: 0, right: 0, top: '26px', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{totalStatusCount}</span>
                          <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>Total</span>
                        </div>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                          <span style={{ color: '#475569', fontWeight: 600 }}>🟢 Completed</span>
                          <span style={{ fontWeight: 700, color: '#1e293b' }}>{completedTxNum} ({completedTxPct.toFixed(0)}%)</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                          <span style={{ color: '#475569', fontWeight: 600 }}>🟡 In Escrow</span>
                          <span style={{ fontWeight: 700, color: '#1e293b' }}>{escrowTxNum} ({escrowTxPct.toFixed(0)}%)</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                          <span style={{ color: '#475569', fontWeight: 600 }}>🔴 Failed</span>
                          <span style={{ fontWeight: 700, color: '#1e293b' }}>{failedTxNum} ({failedTxPct.toFixed(0)}%)</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                          <span style={{ color: '#475569', fontWeight: 600 }}>🔵 Refunded</span>
                          <span style={{ fontWeight: 700, color: '#1e293b' }}>{refundedTxNum} ({refundedTxPct.toFixed(0)}%)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Chart: Payment Methods */}
                  <div className="ad-card" style={{ display: 'flex', flexDirection: 'column', height: 210 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 12 }}>Payment methods</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                      <div style={{ position: 'relative', width: 90, height: 90 }}>
                        <svg width="90" height="90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#eff6ff" strokeWidth="8" />
                          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#6366f1" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (bankTxPct / 100) * 251.2} transform="rotate(-90 50 50)" />
                          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (upiTxPct / 100) * 251.2} transform={`rotate(${bankAngle + (bankTxPct / 100) * 360} 50 50)`} />
                          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ec4899" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (walletTxPct / 100) * 251.2} transform={`rotate(${upiAngle + (upiTxPct / 100) * 360} 50 50)`} />
                          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#06b6d4" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (otherTxPct / 100) * 251.2} transform={`rotate(${walletAngle + (walletTxPct / 100) * 360} 50 50)`} />
                        </svg>
                        <div style={{ position: 'absolute', left: 0, right: 0, top: '26px', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{totalMethodCount}</span>
                          <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>Total</span>
                        </div>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                          <span style={{ color: '#475569', fontWeight: 600 }}>🟣 Bank Transfer</span>
                          <span style={{ fontWeight: 700, color: '#1e293b' }}>{bankTxNum} ({bankTxPct.toFixed(0)}%)</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                          <span style={{ color: '#475569', fontWeight: 600 }}>🟢 UPI Gateway</span>
                          <span style={{ fontWeight: 700, color: '#1e293b' }}>{upiTxNum} ({upiTxPct.toFixed(0)}%)</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                          <span style={{ color: '#475569', fontWeight: 600 }}>🔴 Wallet Apps</span>
                          <span style={{ fontWeight: 700, color: '#1e293b' }}>{walletTxNum} ({walletTxPct.toFixed(0)}%)</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                          <span style={{ color: '#475569', fontWeight: 600 }}>🔵 Other Cards</span>
                          <span style={{ fontWeight: 700, color: '#1e293b' }}>{otherTxNum} ({otherTxPct.toFixed(0)}%)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Transactions Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#1e293b' }}>Recent transactions</h3>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div className="ad-filter-search-container" style={{ maxWidth: 220 }}>
                      <span className="ad-filter-search-icon"><Icon name="search" /></span>
                      <input
                        type="text"
                        placeholder="Search ID, name..."
                        value={paymentSearch}
                        onChange={(e) => { setPaymentSearch(e.target.value); setPaymentCurrentPage(1); }}
                        className="ad-filter-search-input"
                      />
                    </div>
                    <select 
                      className="ad-filter-select"
                      value={paymentStatusFilter}
                      onChange={(e) => { setPaymentStatusFilter(e.target.value); setPaymentCurrentPage(1); }}
                    >
                      <option value="all">All Status</option>
                      <option value="completed">Completed</option>
                      <option value="refund_pending">In Escrow</option>
                      <option value="refunded">Refunded</option>
                    </select>
                    <select 
                      className="ad-filter-select"
                      value={paymentMethodFilter}
                      onChange={(e) => { setPaymentMethodFilter(e.target.value); setPaymentCurrentPage(1); }}
                    >
                      <option value="all">All Methods</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="upi">UPI Gateway</option>
                      <option value="wallet">Wallet Apps</option>
                    </select>
                    <button onClick={() => toast.success('Additional filter drawers opened.')} className="ad-btn-secondary" style={{ padding: '6px 12px' }}>
                      ⚙ Filter
                    </button>
                  </div>
                </div>

                {/* Recent Transactions Table */}
                <div className="ad-card ad-card--table">
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th>TRANSACTION ID</th>
                        <th>FROM → TO</th>
                        <th>JOB / PROJECT</th>
                        <th>AMOUNT</th>
                        <th>COMMISSION (10%)</th>
                        <th>STATUS</th>
                        <th>METHOD</th>
                        <th>DATE</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTransactions.map((t) => (
                        <tr key={t.id}>
                          <td style={{ fontSize: 12.5, fontWeight: 700, color: '#334155' }}>
                            #INV-2025-{t.txnIdShort}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div className="ad-table-avatar-circle" style={{ width: 22, height: 22, fontSize: 9 }}>
                                {t.fromAvatar ? <img src={t.fromAvatar} alt={t.from} className="ad-table-avatar-img" /> : t.fromInitials}
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{t.from.split(' ')[0]}</span>
                              <span style={{ fontSize: 10, color: '#94a3b8' }}>→</span>
                              <div className="ad-table-avatar-circle" style={{ width: 22, height: 22, fontSize: 9, borderColor: '#3b82f6' }}>
                                {t.toAvatar ? <img src={t.toAvatar} alt={t.to} className="ad-table-avatar-img" /> : t.toInitials}
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{t.to.split(' ')[0]}</span>
                            </div>
                          </td>
                          <td style={{ fontSize: 12.5, color: '#1e293b', fontWeight: 500 }}>
                            {t.jobTitle}
                          </td>
                          <td style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                            {t.amount}
                          </td>
                          <td style={{ fontSize: 12.5, color: '#64748b' }}>
                            ₹{(t.total * 0.1).toLocaleString('en-IN')}
                          </td>
                          <td>
                            <span className={`ad-pill ${t.status === 'refund_pending' ? 'ad-pill--warning' : t.status === 'refunded' ? 'ad-pill--danger' : 'ad-pill--success'}`} style={{ textTransform: 'capitalize', fontSize: 10 }}>
                              {t.status === 'refund_pending' ? 'In Escrow' : t.status}
                            </span>
                          </td>
                          <td style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>
                            {t.method === 'Bank Transfer' ? '🏛️ ' : t.method === 'UPI' ? '💳 ' : '📱 '} {t.method}
                          </td>
                          <td style={{ fontSize: 12.5, color: '#64748b' }}>
                            {t.date}
                          </td>
                          <td>
                            <div style={{ position: 'relative' }}>
                              <button onClick={() => setActivePaymentActionMenu(activePaymentActionMenu === t.id ? null : t.id)} className="ad-action-btn-circle" title="Actions Menu">
                                <Icon name="more" />
                              </button>
                              {activePaymentActionMenu === t.id && (
                                <div style={{ position: 'absolute', right: 0, top: 32, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 100, width: 140, padding: '4px 0' }}>
                                  <button 
                                    className="ad-dropdown-item" 
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', fontSize: 12.5, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}
                                    onClick={() => { setActivePaymentActionMenu(null); toast.success('Invoice details opened.'); }}
                                  >
                                    👁 View Invoice
                                  </button>
                                  {t.status === 'refund_pending' && (
                                    <button 
                                      className="ad-dropdown-item" 
                                      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', fontSize: 12.5, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#d97706' }}
                                      onClick={() => { setActivePaymentActionMenu(null); toast.success('Processing refund...'); }}
                                    >
                                      💸 Process Refund
                                    </button>
                                  )}
                                  <button 
                                    className="ad-dropdown-item" 
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', fontSize: 12.5, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6' }}
                                    onClick={() => { setActivePaymentActionMenu(null); toast.success('Transaction receipt downloaded.'); }}
                                  >
                                    📥 Download Receipt
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredTransactions.length === 0 && (
                        <tr>
                          <td colSpan="9" className="ad-empty-row">No transactions found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* Pagination Footer */}
                  {filteredTransactions.length > 0 && (
                    <div className="ad-footer-bar">
                      <div className="ad-pagination-info">
                        Showing {paymentStartIndex + 1} to {Math.min(paymentEndIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
                      </div>
                      <div className="ad-pagination-controls">
                        <button 
                          onClick={() => setPaymentCurrentPage(prev => Math.max(1, prev - 1))}
                          className={`ad-pagination-btn ${paymentCurrentPage === 1 ? 'ad-pagination-btn--disabled' : ''}`}
                          disabled={paymentCurrentPage === 1}
                        >
                          ‹
                        </button>
                        {Array.from({ length: paymentTotalPages }, (_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => setPaymentCurrentPage(i + 1)}
                            className={`ad-pagination-btn ${paymentCurrentPage === i + 1 ? 'ad-pagination-btn--active' : ''}`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        <button 
                          onClick={() => setPaymentCurrentPage(prev => Math.min(paymentTotalPages, prev + 1))}
                          className={`ad-pagination-btn ${paymentCurrentPage === paymentTotalPages ? 'ad-pagination-btn--disabled' : ''}`}
                          disabled={paymentCurrentPage === paymentTotalPages}
                        >
                          ›
                        </button>
                      </div>
                      <div className="ad-rows-per-page">
                        <span>Rows per page</span>
                        <select 
                          className="ad-filter-select"
                          style={{ padding: '4px 8px', fontSize: 12.5 }}
                          value={paymentRowsPerPage}
                          onChange={(e) => { setPaymentRowsPerPage(parseInt(e.target.value)); setPaymentCurrentPage(1); }}
                        >
                          <option value="5">5</option>
                          <option value="10">10</option>
                          <option value="20">20</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Double Panels Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 22, marginBottom: 22 }}>
                  {/* Left Bottom Panel: Recent Refunds */}
                  <div className="ad-jobs-split-card" style={{ display: 'flex', flexDirection: 'column', height: 240 }}>
                    <div className="ad-jobs-split-title" style={{ marginBottom: 12 }}>
                      <span>Recent refunds</span>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                      <table className="ad-table">
                        <thead>
                          <tr>
                            <th>REFUND ID</th>
                            <th>USER</th>
                            <th>JOB</th>
                            <th>AMOUNT</th>
                            <th>STATUS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.filter(t => t.status === 'refund_pending' || t.status === 'refunded').slice(0, 2).map((r, idx) => (
                            <tr key={idx}>
                              <td style={{ fontSize: 12, fontWeight: 700 }}>#REF-2025-{(idx+1).toString().padStart(5, '0')}</td>
                              <td style={{ fontSize: 12 }}>{r.from}</td>
                              <td style={{ fontSize: 11.5, color: '#64748b' }}>{r.jobTitle}</td>
                              <td style={{ fontSize: 12, fontWeight: 700 }}>{r.amount}</td>
                              <td>
                                <span className={`ad-pill ${r.status === 'refunded' ? 'ad-pill--danger' : 'ad-pill--warning'}`} style={{ fontSize: 9.5 }}>
                                  {r.status === 'refunded' ? 'Refunded' : 'Pending'}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {transactions.filter(t => t.status === 'refund_pending' || t.status === 'refunded').length === 0 && (
                            <tr>
                              <td colSpan="5" className="ad-empty-row" style={{ padding: 12 }}>No refunds pending.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 8, marginTop: 4 }}>
                      <button onClick={() => setPaymentStatusFilter('refund_pending')} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        View all refunds <span style={{ fontSize: 11 }}>→</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Bottom Panel: Top Clients by Payments */}
                  <div className="ad-jobs-split-card" style={{ display: 'flex', flexDirection: 'column', height: 240 }}>
                    <div className="ad-jobs-split-title" style={{ marginBottom: 12 }}>
                      <span>Top clients by payments</span>
                      <button onClick={() => toast.success('Viewing client spending report.')} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>View all</button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                      <div style={{ flex: 1.2 }}>
                        <table className="ad-table" style={{ border: 'none' }}>
                          <thead>
                            <tr>
                              <th style={{ padding: '4px 8px' }}>CLIENT</th>
                              <th style={{ padding: '4px 8px' }}>TOTAL PAID</th>
                              <th style={{ padding: '4px 8px' }}>TXS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedClients.map((c, idx) => (
                              <tr key={idx}>
                                <td style={{ fontSize: 12.5, fontWeight: 700, padding: '6px 8px' }}>{c.name}</td>
                                <td style={{ fontSize: 12, fontWeight: 600, color: '#475569', padding: '6px 8px' }}>₹{c.total.toLocaleString('en-IN')}</td>
                                <td style={{ fontSize: 12, color: '#64748b', padding: '6px 8px', textAlign: 'center' }}>{c.count}</td>
                              </tr>
                            ))}
                            {sortedClients.length === 0 && (
                              <tr>
                                <td colSpan="3" className="ad-empty-row" style={{ padding: 12 }}>No spenders logged.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ position: 'relative', width: 90, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="90" height="90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
                          {sortedClients.length > 0 && (
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#6366f1" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - ((sortedClients[0]?.total || 0) / (totalSpentByTopClients || 1)) * 251.2} transform="rotate(-90 50 50)" />
                          )}
                          {sortedClients.length > 1 && (
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - ((sortedClients[1]?.total || 0) / (totalSpentByTopClients || 1)) * 251.2} transform={`rotate(${-90 + ((sortedClients[0]?.total || 0) / (totalSpentByTopClients || 1)) * 360} 50 50)`} />
                          )}
                          {sortedClients.length > 2 && (
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - ((sortedClients[2]?.total || 0) / (totalSpentByTopClients || 1)) * 251.2} transform={`rotate(${-90 + (((sortedClients[0]?.total || 0) + (sortedClients[1]?.total || 0)) / (totalSpentByTopClients || 1)) * 360} 50 50)`} />
                          )}
                        </svg>
                        <div style={{ position: 'absolute', left: 0, right: 0, top: '26px', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>₹{totalSpentByTopClients.toLocaleString('en-IN')}</span>
                          <span style={{ fontSize: 8, color: '#94a3b8', fontWeight: 600 }}>Total Paid</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Quick Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: 16 }}>
                  <div>
                    <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#1e293b', marginBottom: 10 }}>Quick actions</h4>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => toast.success('Create Invoice dialog opened.')} className="ad-quick-action-btn" style={{ flexDirection: 'row', gap: 8, padding: '8px 12px' }}>
                        <span>📝</span> Create Invoice
                      </button>
                      <button onClick={() => toast.success('Add Manual Payment dialog opened.')} className="ad-quick-action-btn" style={{ flexDirection: 'row', gap: 8, padding: '8px 12px' }}>
                        <span>💵</span> Add Manual Payment
                      </button>
                      <button onClick={() => toast.success('Manage Escrow accounts opened.')} className="ad-quick-action-btn" style={{ flexDirection: 'row', gap: 8, padding: '8px 12px' }}>
                        <span>🏦</span> Manage Escrow
                      </button>
                      <button onClick={() => toast.success('Process Refund panel opened.')} className="ad-quick-action-btn" style={{ flexDirection: 'row', gap: 8, padding: '8px 12px' }}>
                        <span>🔄</span> Process Refund
                      </button>
                      <button onClick={() => toast.success('Downloading platform transactions financial statement...')} className="ad-quick-action-btn" style={{ flexDirection: 'row', gap: 8, padding: '8px 12px' }}>
                        <span>📥</span> Download Statement
                      </button>
                    </div>
                  </div>

                  <div className="ad-jobs-split-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 10 }}>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b' }}>Need help?</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Visit our Help Center for guides and support.</div>
                    </div>
                    <button onClick={() => toast.success('Navigating to Admin Help Center.')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 11.5 }}>
                      Go to Help Center ↗
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* REPORTS */}
            {activeTab === 'reports' && (
              <div>
                {/* Header */}
                <div className="ad-page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <h1 className="ad-page-title">Reported users & jobs</h1>
                    <p className="ad-page-sub">Review flagged content and take action</p>
                  </div>
                  <button onClick={() => toast.success('Platform reports log exported.')} className="ad-btn-secondary">
                    📥 Export Report
                  </button>
                </div>

                {/* Top KPI Cards (5 Cards) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 22 }}>
                  <div className="ad-jobs-summary-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>Total reports</span>
                      <span>🚩</span>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginTop: 4 }}>{totalReportsCount}</div>
                    <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 4 }}>vs last 30 days 12</div>
                  </div>
                  <div className="ad-jobs-summary-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>Pending review</span>
                      <span>⏳</span>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#d97706', marginTop: 4 }}>{pendingReportsCount}</div>
                    <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 4 }}>vs last 30 days 7</div>
                  </div>
                  <div className="ad-jobs-summary-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>Resolved</span>
                      <span>🟢</span>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981', marginTop: 4 }}>{resolvedReportsCount}</div>
                    <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 4 }}>vs last 30 days 4</div>
                  </div>
                  <div className="ad-jobs-summary-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>User reports</span>
                      <span>👤</span>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#818cf8', marginTop: 4 }}>{userReportsCount}</div>
                    <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 4 }}>vs last 30 days 6</div>
                  </div>
                  <div className="ad-jobs-summary-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>Job reports</span>
                      <span>💼</span>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#3b82f6', marginTop: 4 }}>{jobReportsCount}</div>
                    <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 4 }}>vs last 30 days 6</div>
                  </div>
                </div>

                {/* Filter Controls Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 10, flex: 1, marginRight: 16 }}>
                    <div className="ad-filter-search-container" style={{ maxWidth: 300, flex: 1 }}>
                      <span className="ad-filter-search-icon"><Icon name="search" /></span>
                      <input
                        type="text"
                        placeholder="Search by name, email, job title or report ID..."
                        value={reportSearch}
                        onChange={(e) => { setReportSearch(e.target.value); setReportCurrentPage(1); }}
                        className="ad-filter-search-input"
                      />
                    </div>
                    <select 
                      className="ad-filter-select"
                      value={reportTypeFilter}
                      onChange={(e) => { setReportTypeFilter(e.target.value); setReportCurrentPage(1); }}
                    >
                      <option value="all">All Types</option>
                      <option value="user">User Reports</option>
                      <option value="job">Job Reports</option>
                    </select>
                    <select 
                      className="ad-filter-select"
                      value={reportStatusFilter}
                      onChange={(e) => { setReportStatusFilter(e.target.value); setReportCurrentPage(1); }}
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="in_review">In Review</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <select className="ad-filter-select">
                      <option value="all">All Categories</option>
                      <option value="spam">Spam / Duplicate</option>
                      <option value="harassment">Harassment / Behavior</option>
                      <option value="other">Other Violation</option>
                    </select>
                    <div className="ad-filter-select" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}>
                      📅 Date Range <span style={{ fontSize: 9 }}>▼</span>
                    </div>
                  </div>
                  <button onClick={() => toast.success('Filter queries applied.')} className="ad-btn-secondary" style={{ padding: '6px 12px' }}>
                    ⚙ Filter
                  </button>
                </div>

                {/* Sub Tab Switcher */}
                <div className="ad-tabs-row" style={{ marginBottom: 16 }}>
                  <button className={`ad-tab-btn ${reportTab === 'all' ? 'ad-tab-btn--active' : ''}`} onClick={() => { setReportTab('all'); setReportCurrentPage(1); }}>
                    All Reports ({totalReportsCount})
                  </button>
                  <button className={`ad-tab-btn ${reportTab === 'user' ? 'ad-tab-btn--active' : ''}`} onClick={() => { setReportTab('user'); setReportCurrentPage(1); }}>
                    User Reports ({userReportsCount})
                  </button>
                  <button className={`ad-tab-btn ${reportTab === 'job' ? 'ad-tab-btn--active' : ''}`} onClick={() => { setReportTab('job'); setReportCurrentPage(1); }}>
                    Job Reports ({jobReportsCount})
                  </button>
                </div>

                {/* Reports Table List */}
                <div className="ad-card ad-card--table">
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th>REPORT ID</th>
                        <th>TYPE</th>
                        <th>REPORTED ITEM</th>
                        <th>REPORTED BY</th>
                        <th>REASON</th>
                        <th>STATUS</th>
                        <th>REPORTED ON</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedReports.map((r) => (
                        <tr key={r.id}>
                          <td style={{ fontSize: 12.5, fontWeight: 700, color: '#334155' }}>{r.id}</td>
                          <td>
                            <span className={`ad-pill ${r.type.toLowerCase() === 'user' ? 'ad-pill--info' : 'ad-pill--success'}`} style={{ fontSize: 9.5, padding: '2px 8px' }}>
                              {r.type}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {r.type.toLowerCase() === 'user' ? (
                                <>
                                  <div className="ad-table-avatar-circle" style={{ width: 26, height: 26, fontSize: 10 }}>
                                    {r.itemAvatar ? <img src={r.itemAvatar} alt={r.itemName} className="ad-table-avatar-img" /> : r.itemName.charAt(0)}
                                  </div>
                                  <div>
                                    <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1f2937' }}>{r.itemName}</div>
                                    <div style={{ fontSize: 10.5, color: '#64748b' }}>{r.itemEmail}</div>
                                  </div>
                                </>
                              ) : (
                                <div>
                                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1f2937' }}>{r.itemName}</div>
                                  <div style={{ fontSize: 10.5, color: '#94a3b8', fontWeight: 600 }}>Job ID: {r.itemEmail}</div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div className="ad-table-avatar-circle" style={{ width: 26, height: 26, fontSize: 10, borderColor: '#3b82f6' }}>
                                {r.reporterName.charAt(0)}
                              </div>
                              <div>
                                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1f2937' }}>{r.reporterName}</div>
                                <div style={{ fontSize: 10.5, color: '#64748b' }}>{r.reporterEmail}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontSize: 12.5, color: '#4b5563', maxWidth: 150, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {r.reason}
                          </td>
                          <td>
                            <span className={`ad-pill ${r.status === 'Pending' ? 'ad-pill--warning' : r.status === 'In Review' ? 'ad-pill--info' : r.status === 'Resolved' ? 'ad-pill--success' : 'ad-pill--danger'}`} style={{ fontSize: 9.5 }}>
                              {r.status}
                            </span>
                          </td>
                          <td>
                            <div>
                              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#4b5563' }}>{r.date}</div>
                              <div style={{ fontSize: 10.5, color: '#94a3b8' }}>{r.time}</div>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
                              <button 
                                onClick={() => {
                                  if (r.type.toLowerCase() === 'user') {
                                    navigate(`/users`);
                                  } else {
                                    navigate(`/jobs/${r.itemId}`);
                                  }
                                }} 
                                className="ad-action-btn-circle" 
                                title="View Details"
                              >
                                👁
                              </button>
                              <button onClick={() => setActiveReportActionMenu(activeReportActionMenu === r.id ? null : r.id)} className="ad-action-btn-circle" title="Actions Menu">
                                <Icon name="more" />
                              </button>
                              {activeReportActionMenu === r.id && (
                                <div style={{ position: 'absolute', right: 0, top: 32, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 100, width: 140, padding: '4px 0' }}>
                                  <button 
                                    className="ad-dropdown-item" 
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', fontSize: 12.5, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#10b981', fontWeight: 600 }}
                                    onClick={async () => {
                                      setActiveReportActionMenu(null);
                                      try {
                                        if (r.type.toLowerCase() === 'job') {
                                          toast.success('Report resolved. Flag dismissed.');
                                        } else {
                                          await adminAPI.toggleSuspendUser(r.itemId, '');
                                          toast.success('User restored. Report resolved.');
                                        }
                                        loadData();
                                      } catch (err) {
                                        toast.error('Failed to resolve.');
                                      }
                                    }}
                                  >
                                    ✅ Resolve Report
                                  </button>
                                  <button 
                                    className="ad-dropdown-item" 
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', fontSize: 12.5, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b' }}
                                    onClick={() => { setActiveReportActionMenu(null); toast.success('Warning message dispatched.'); }}
                                  >
                                    ⚠️ Send Warning
                                  </button>
                                  <button 
                                    className="ad-dropdown-item" 
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', fontSize: 12.5, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontWeight: 600 }}
                                    onClick={async () => {
                                      setActiveReportActionMenu(null);
                                      if (r.type.toLowerCase() === 'user') {
                                        setSuspendReason('');
                                        setShowSuspendModal(users.find(x => x.id === r.itemId) || { id: r.itemId, name: r.itemName });
                                      } else {
                                        removeJob(r.itemId);
                                      }
                                    }}
                                  >
                                    ⛔ Restrict / Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredReportsList.length === 0 && (
                        <tr>
                          <td colSpan="8" className="ad-empty-row">No reports found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* Pagination Footer */}
                  {filteredReportsList.length > 0 && (
                    <div className="ad-footer-bar" style={{ justifyContent: 'space-between' }}>
                      <div className="ad-pagination-info">
                        Showing {reportStartIndex + 1} to {Math.min(reportEndIndex, filteredReportsList.length)} of {filteredReportsList.length} reports
                      </div>
                      <div className="ad-pagination-controls">
                        <button 
                          onClick={() => setReportCurrentPage(prev => Math.max(1, prev - 1))}
                          className={`ad-pagination-btn ${reportCurrentPage === 1 ? 'ad-pagination-btn--disabled' : ''}`}
                          disabled={reportCurrentPage === 1}
                        >
                          ‹
                        </button>
                        {Array.from({ length: reportTotalPages }, (_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => setReportCurrentPage(i + 1)}
                            className={`ad-pagination-btn ${reportCurrentPage === i + 1 ? 'ad-pagination-btn--active' : ''}`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        <button 
                          onClick={() => setReportCurrentPage(prev => Math.min(reportTotalPages, prev + 1))}
                          className={`ad-pagination-btn ${reportCurrentPage === reportTotalPages ? 'ad-pagination-btn--disabled' : ''}`}
                          disabled={reportCurrentPage === reportTotalPages}
                        >
                          ›
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Row Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: 16, marginTop: 22 }}>
                  {/* Left: Quick Actions */}
                  <div className="ad-jobs-split-card" style={{ display: 'flex', flexDirection: 'column', height: 180, justifyContent: 'center' }}>
                    <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>Quick actions</h4>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => toast.success('Selected reports marked resolved.')} className="ad-quick-action-btn" style={{ flexDirection: 'row', gap: 6, padding: '10px 14px' }}>
                        <span style={{ color: '#10b981' }}>✔️</span> Approve (Mark resolved)
                      </button>
                      <button onClick={() => toast.success('Selected reports dismissed.')} className="ad-quick-action-btn" style={{ flexDirection: 'row', gap: 6, padding: '10px 14px' }}>
                        <span style={{ color: '#ef4444' }}>❌</span> Reject (Dismiss report)
                      </button>
                      <button onClick={() => toast.success('Warning dispatch modal opened.')} className="ad-quick-action-btn" style={{ flexDirection: 'row', gap: 6, padding: '10px 14px' }}>
                        <span style={{ color: '#f59e0b' }}>⚠️</span> Warn User (Send warning)
                      </button>
                      <button onClick={() => toast.success('User restriction dialog opened.')} className="ad-quick-action-btn" style={{ flexDirection: 'row', gap: 6, padding: '10px 14px' }}>
                        <span style={{ color: '#a855f7' }}>⏸️</span> Suspend (Restrict access)
                      </button>
                      <button onClick={() => toast.success('Delete content dialog opened.')} className="ad-quick-action-btn" style={{ flexDirection: 'row', gap: 6, padding: '10px 14px' }}>
                        <span style={{ color: '#dc2626' }}>🗑️</span> Delete Content (Remove)
                      </button>
                    </div>
                  </div>

                  {/* Right: Guidelines card */}
                  <div className="ad-jobs-split-card" style={{ display: 'flex', flexDirection: 'column', height: 180 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 10 }}>Reporting guidelines</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, justifyContent: 'center' }}>
                      <div style={{ fontSize: 11, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 6 }}>
                        💬 Reports are reviewed within 24–48 hours.
                      </div>
                      <div style={{ fontSize: 11, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 6 }}>
                        ⚠️ False reports may lead to restricted access.
                      </div>
                      <div style={{ fontSize: 11, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 6 }}>
                        🛡️ Provide accurate information while reporting.
                      </div>
                    </div>
                    <button onClick={() => toast.success('Full guidelines PDF documentation downloaded.')} style={{ border: 'none', background: 'none', padding: 0, color: '#6366f1', fontSize: 11.5, fontWeight: 700, textAlign: 'left', cursor: 'pointer', marginTop: 4 }}>
                      View full guidelines →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MESSAGES */}
            {activeTab === 'messages' && (
              <div>
                {/* Header */}
                <div className="ad-page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <h1 className="ad-page-title">Broadcast Messages</h1>
                    <p className="ad-page-sub">Send announcement notifications to all clients and freelancers</p>
                  </div>
                  <button onClick={() => toast.success('Viewing archive of 14 sent broadcasts.')} className="ad-btn-secondary">
                    🕒 Broadcast History
                  </button>
                </div>

                {/* Double Panel Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 22 }}>
                  {/* Left compose panel */}
                  <div className="ad-jobs-split-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>1. Compose Message</div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Notification Text</span>
                      <div style={{ border: '1px solid #cbd5e1', borderRadius: 8, overflow: 'hidden' }}>
                        {/* Editor Toolbar */}
                        <div style={{ display: 'flex', gap: 8, padding: '8px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', alignItems: 'center' }}>
                          <button onClick={() => toast.success('Bold text formatting.')} style={{ background: 'none', border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer', color: '#475569' }}>B</button>
                          <button onClick={() => toast.success('Italic text formatting.')} style={{ background: 'none', border: 'none', fontStyle: 'italic', fontSize: 13, cursor: 'pointer', color: '#475569' }}>I</button>
                          <button onClick={() => toast.success('Insert URL link.')} style={{ background: 'none', border: 'none', fontSize: 12, cursor: 'pointer', color: '#475569' }}>🔗</button>
                          <span style={{ color: '#cbd5e1', fontSize: 12 }}>|</span>
                          <button onClick={() => toast.success('Insert bullet list.')} style={{ background: 'none', border: 'none', fontSize: 12, cursor: 'pointer', color: '#475569' }}>📋</button>
                          <button onClick={() => toast.success('Insert ordered list.')} style={{ background: 'none', border: 'none', fontSize: 12, cursor: 'pointer', color: '#475569' }}>🔢</button>
                          <button onClick={() => toast.success('Upload image asset.')} style={{ background: 'none', border: 'none', fontSize: 12, cursor: 'pointer', color: '#475569' }}>🖼️</button>
                          <span style={{ flex: 1 }} />
                          <span style={{ fontSize: 10.5, color: '#94a3b8', fontWeight: 600 }}>{broadcastText.length} / 2000 characters</span>
                        </div>
                        <textarea
                          value={broadcastText}
                          onChange={(e) => setBroadcastText(e.target.value.slice(0, 2000))}
                          placeholder="Enter announcement text to display on user dashboards..."
                          style={{ width: '100%', height: 110, border: 'none', padding: 12, outline: 'none', resize: 'none', fontSize: 13, fontFamily: 'inherit', color: '#334155' }}
                        />
                      </div>
                    </div>

                    {/* Variables Row */}
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                        Add variables <span style={{ cursor: 'help', fontSize: 10, background: '#e2e8f0', borderRadius: '50%', width: 12, height: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>i</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {[
                          { label: '{{first_name}}', val: '{{first_name}}' },
                          { label: '{{user_type}}', val: '{{user_type}}' },
                          { label: '{{site_name}}', val: '{{site_name}}' },
                          { label: '{{support_email}}', val: '{{support_email}}' }
                        ].map((v, idx) => (
                          <button
                            key={idx}
                            onClick={() => setBroadcastText(prev => prev + ' ' + v.val)}
                            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: '#475569', cursor: 'pointer', fontWeight: 600, fontFamily: 'monospace' }}
                          >
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div style={{ display: 'flex', gap: 10, marginTop: 16, borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                      <button
                        onClick={() => {
                          if (!broadcastText.trim()) return toast.error('Announcement text cannot be empty.');
                          toast.success('Broadcast notification published successfully!');
                          setBroadcastText('');
                        }}
                        className="ad-btn-black"
                        style={{ padding: '8px 16px', fontSize: 12.5 }}
                      >
                        🚀 Publish Broadcast
                      </button>
                      <button onClick={() => toast.success('Announcement saved as draft.')} className="ad-btn-secondary" style={{ padding: '8px 16px', fontSize: 12.5 }}>
                        💾 Save as Draft
                      </button>
                    </div>
                  </div>

                  {/* Right select audience panel */}
                  <div className="ad-jobs-split-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>2. Select Audience</div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[
                        { id: 'all', title: 'All Users', desc: 'Send to all clients and freelancers', count: `${users.length} users` },
                        { id: 'freelancers', title: 'Freelancers Only', desc: 'Send to all freelancers', count: `${users.filter(u => u.role === 'freelancer').length} users` },
                        { id: 'clients', title: 'Clients Only', desc: 'Send to all clients', count: `${users.filter(u => u.role === 'client').length} users` },
                        { id: 'custom', title: 'Custom Audience', desc: 'Select specific users or user roles', count: 'Select manually' }
                      ].map((aud) => {
                        const isSelected = broadcastAudience === aud.id;
                        return (
                          <div
                            key={aud.id}
                            onClick={() => setBroadcastAudience(aud.id)}
                            style={{
                              border: isSelected ? '1.5px solid #3b82f6' : '1px solid #e2e8f0',
                              borderRadius: 8,
                              padding: 10,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: isSelected ? '#f0f9ff' : '#fff',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                              <input
                                type="radio"
                                name="broadcastAudience"
                                checked={isSelected}
                                onChange={() => setBroadcastAudience(aud.id)}
                                style={{ cursor: 'pointer' }}
                              />
                              <div>
                                <div style={{ fontSize: 12.5, fontWeight: 700, color: isSelected ? '#1e3a8a' : '#1e293b' }}>{aud.title}</div>
                                <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 2 }}>{aud.desc}</div>
                              </div>
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>{aud.count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Delivery Settings Section */}
                <div className="ad-card" style={{ padding: 16, marginBottom: 22 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>3. Delivery Settings</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
                    <div style={{ display: 'flex', gap: 18 }}>
                      <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="broadcastDelivery"
                          checked={broadcastDelivery === 'immediate'}
                          onChange={() => setBroadcastDelivery('immediate')}
                        />
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#334155' }}>Send Immediately</div>
                          <div style={{ fontSize: 10.5, color: '#94a3b8' }}>Broadcast will be sent right away</div>
                        </div>
                      </label>
                      <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="broadcastDelivery"
                          checked={broadcastDelivery === 'later'}
                          onChange={() => setBroadcastDelivery('later')}
                        />
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#334155' }}>Schedule for Later</div>
                          <div style={{ fontSize: 10.5, color: '#94a3b8' }}>Choose a date and time to send</div>
                        </div>
                      </label>
                    </div>

                    {broadcastDelivery === 'later' && (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input type="date" className="ad-filter-select" style={{ padding: '6px 12px' }} />
                        <input type="time" className="ad-filter-select" style={{ padding: '6px 12px' }} />
                        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>(GMT+5:30) Asia/Kolkata ⓘ</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preview and Guidelines Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 22 }}>
                  {/* Left: Preview Panel */}
                  <div className="ad-jobs-split-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>Preview</div>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 14, flex: 1, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justify: 'center', color: '#3b82f6', flexShrink: 0 }}>🔔</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b' }}>Announcement</span>
                          <span style={{ fontSize: 10, color: '#94a3b8' }}>Just now</span>
                        </div>
                        <p style={{ fontSize: 12, color: '#475569', marginTop: 6, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                          {broadcastText || 'This is a preview of how your broadcast message will appear to users.'}
                        </p>
                        <div style={{ fontSize: 10, color: '#94a3b8', fontStyle: 'italic', marginTop: 10 }}>
                          It will be shown as a notification on their dashboard.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Message Guidelines */}
                  <div className="ad-jobs-split-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>Message Guidelines</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, justifyContent: 'center' }}>
                      <div style={{ fontSize: 11, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 6 }}>
                        ✔️ Keep messages short, clear and relevant.
                      </div>
                      <div style={{ fontSize: 11, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 6 }}>
                        ✔️ Avoid excessive use of ALL CAPS.
                      </div>
                      <div style={{ fontSize: 11, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 6 }}>
                        ✔️ Do not include contact information or links to external sites.
                      </div>
                      <div style={{ fontSize: 11, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 6 }}>
                        ✔️ Ensure your message follows our communication policy.
                      </div>
                    </div>
                    <button onClick={() => toast.success('Communications policy rules PDF loaded.')} style={{ border: 'none', background: 'none', padding: 0, color: '#6366f1', fontSize: 11.5, fontWeight: 700, textAlign: 'left', cursor: 'pointer', marginTop: 8 }}>
                      View full guidelines →
                    </button>
                  </div>
                </div>

                {/* Important Warning Banner */}
                {showWarningAlert && (
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 16 }}>ℹ️</span>
                      <div>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1e3a8a' }}>Important</span>
                        <span style={{ fontSize: 12, color: '#1e40af', marginLeft: 8 }}>Broadcast messages will be sent as in-app notifications and email alerts (if enabled) to all selected users.</span>
                      </div>
                    </div>
                    <button onClick={() => setShowWarningAlert(false)} style={{ background: 'none', border: 'none', fontSize: 14, color: '#6b7280', cursor: 'pointer' }}>×</button>
                  </div>
                )}
              </div>
            )}

            {/* SETTINGS */}
            {activeTab === 'settings' && (
              <div>
                {/* Header */}
                <div className="ad-page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <h1 className="ad-page-title">Platform Settings</h1>
                    <p className="ad-page-sub">Global parameters and marketplace configuration</p>
                  </div>
                  <button onClick={() => toast.success('All settings changes have been saved and applied.')} className="ad-btn-black">
                    Save Changes
                  </button>
                </div>

                {/* Top KPI Cards (6 cards) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 22 }}>
                  <div className="ad-jobs-summary-card">
                    <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>Total Users</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginTop: 4 }}>{users.length}</div>
                    <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 4 }}>Registered profiles</div>
                  </div>
                  <div className="ad-jobs-summary-card">
                    <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>Active Freelancers</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#3b82f6', marginTop: 4 }}>{freelancerCount}</div>
                    <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 4 }}>Bidding active</div>
                  </div>
                  <div className="ad-jobs-summary-card">
                    <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>Active Clients</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981', marginTop: 4 }}>{clientCount}</div>
                    <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 4 }}>Posting active</div>
                  </div>
                  <div className="ad-jobs-summary-card">
                    <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>Platform Revenue</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#818cf8', marginTop: 4 }}>₹{commissionEarnedSum.toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 4 }}>Deducted fees</div>
                  </div>
                  <div className="ad-jobs-summary-card">
                    <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>Commission Rate</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b', marginTop: 4 }}>{commissionRate}%</div>
                    <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 4 }}>Standard cut</div>
                  </div>
                  <div className="ad-jobs-summary-card">
                    <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>Storage Usage</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#dc2626', marginTop: 4 }}>2.4 GB</div>
                    <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 4 }}>of 10 GB limit</div>
                  </div>
                </div>

                {/* Main Settings Sections Block */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* General Settings */}
                  <div className="ad-jobs-split-card">
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: 8, marginBottom: 12 }}>
                      General Settings
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Platform Name</span>
                        <input type="text" className="ad-search-input" style={{ width: '100%', padding: 8 }} defaultValue="Freelancer Marketplace" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Support Email</span>
                        <input type="email" className="ad-search-input" style={{ width: '100%', padding: 8 }} defaultValue="support@freelancemarket.com" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Contact Number</span>
                        <input type="text" className="ad-search-input" style={{ width: '100%', padding: 8 }} defaultValue="+91 98765 43210" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Time Zone</span>
                        <select className="ad-filter-select" style={{ width: '100%', padding: 8 }}>
                          <option value="kolkata">(GMT+5:30) Asia/Kolkata</option>
                          <option value="london">(GMT+0:00) Europe/London</option>
                          <option value="newyork">(GMT-5:00) America/New_York</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Currency</span>
                        <select className="ad-filter-select" style={{ width: '100%', padding: 8 }}>
                          <option value="inr">INR (₹)</option>
                          <option value="usd">USD ($)</option>
                          <option value="eur">EUR (€)</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Language</span>
                        <select className="ad-filter-select" style={{ width: '100%', padding: 8 }}>
                          <option value="en">English (US)</option>
                          <option value="hi">Hindi (हिन्दी)</option>
                          <option value="es">Spanish (Español)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Commission & Payments */}
                  <div className="ad-jobs-split-card">
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: 8, marginBottom: 12 }}>
                      Commission & Payment Settings
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Platform Commission Fee (%)</span>
                        <input 
                          type="number" 
                          className="ad-search-input" 
                          style={{ width: '100%', padding: 8 }} 
                          min="0"
                          max="100"
                          value={commissionRate}
                          onChange={(e) => setCommissionRate(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Minimum Withdrawal Amount</span>
                        <input type="text" className="ad-search-input" style={{ width: '100%', padding: 8 }} defaultValue="₹1,000" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Escrow Hold Duration</span>
                        <select className="ad-filter-select" style={{ width: '100%', padding: 8 }}>
                          <option value="7">7 Days</option>
                          <option value="14">14 Days</option>
                          <option value="30">30 Days</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#334155' }}>Auto-Release Escrow</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Automatically releases funds 14 days after milestone delivery if no dispute is opened.</div>
                      </div>
                      <input type="checkbox" style={{ transform: 'scale(1.2)', cursor: 'pointer' }} defaultChecked />
                    </div>
                  </div>

                  {/* Security Settings */}
                  <div className="ad-jobs-split-card">
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: 8, marginBottom: 12 }}>
                      Security Settings
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Password Strength Policy</span>
                        <select className="ad-filter-select" style={{ width: '100%', padding: 8 }}>
                          <option value="strong">Strong (Caps + Numeric + Special, 8 chars)</option>
                          <option value="medium">Medium (Numeric + Alpha, 8 chars)</option>
                          <option value="low">Basic (Min 6 chars)</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Login Session Timeout</span>
                        <select className="ad-filter-select" style={{ width: '100%', padding: 8 }}>
                          <option value="24">24 Hours</option>
                          <option value="12">12 Hours</option>
                          <option value="1">1 Hour</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Allowed IP Addresses (IP Whitelisting)</span>
                      <textarea className="ad-search-input" style={{ width: '100%', height: 50, padding: 8, resize: 'none' }} placeholder="e.g. 192.168.1.1, 203.0.113.50 (Leave blank to allow all IPs)" />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#334155' }}>Enforce Two-Factor Authentication (2FA)</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Requires standard user base and administrative credentials to verify logins via email OTP.</div>
                      </div>
                      <input type="checkbox" style={{ transform: 'scale(1.2)', cursor: 'pointer' }} defaultChecked />
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div className="ad-jobs-split-card">
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: 8, marginBottom: 12 }}>
                      Notification Settings
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: 14, marginBottom: 12 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>SMTP Host</span>
                        <input type="text" className="ad-search-input" style={{ width: '100%', padding: 8 }} defaultValue="smtp.mailgun.org" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>SMTP Port</span>
                        <input type="text" className="ad-search-input" style={{ width: '100%', padding: 8 }} defaultValue="587" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>SMTP Username</span>
                        <input type="text" className="ad-search-input" style={{ width: '100%', padding: 8 }} defaultValue="postmaster@mg.freelance.com" />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', fontSize: 12.5 }}>
                        <input type="checkbox" defaultChecked /> Enable Push Notifications
                      </label>
                      <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', fontSize: 12.5 }}>
                        <input type="checkbox" defaultChecked /> Enable Email Alerts
                      </label>
                      <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', fontSize: 12.5 }}>
                        <input type="checkbox" defaultChecked /> Maintenance Down Alerts
                      </label>
                    </div>
                  </div>

                  {/* Storage & Backup & System Status */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
                    {/* Left Column: Storage & Backup */}
                    <div className="ad-jobs-split-card" style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: 8, marginBottom: 12 }}>
                        Storage & Backup
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, justifyContent: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#475569', marginBottom: 4, fontWeight: 600 }}>
                            <span>Disk Storage (24% Used)</span>
                            <span>2.4 GB / 10 GB</span>
                          </div>
                          <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ width: '24%', height: '100%', background: '#dc2626', borderRadius: 4 }} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <button onClick={() => toast.success('Database backup JSON generated and downloaded.')} className="btn btn-secondary" style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12 }}>
                            Backup Database
                          </button>
                          <select className="ad-filter-select" style={{ padding: '6px 10px', fontSize: 12 }}>
                            <option value="daily">Schedule: Daily Backup</option>
                            <option value="weekly">Schedule: Weekly Backup</option>
                            <option value="monthly">Schedule: Monthly Backup</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: System Status */}
                    <div className="ad-jobs-split-card" style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: 8, marginBottom: 12 }}>
                        System Status
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5, color: '#475569' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                          <span>Server Status:</span>
                          <span style={{ color: '#10b981', fontWeight: 700 }}>🟢 Online (99.98% Uptime)</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                          <span>Database Status:</span>
                          <span style={{ color: '#10b981', fontWeight: 700 }}>🟢 Connected</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                          <span>API Latency:</span>
                          <span style={{ color: '#10b981', fontWeight: 700 }}>🟢 45ms</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                          <span>Current Version:</span>
                          <span style={{ fontWeight: 600 }}>v1.2.0-stable</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Platform Controls */}
                  <div className="ad-jobs-split-card">
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: 8, marginBottom: 12 }}>
                      Platform Controls
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: 10, borderRadius: 8 }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>System Maintenance Mode</div>
                          <div style={{ fontSize: 10.5, color: '#64748b' }}>Redirects standard users to a maintenance screen</div>
                        </div>
                        <button 
                          onClick={() => {
                            setIsMaintenanceMode(!isMaintenanceMode);
                            toast.success(`Maintenance mode ${!isMaintenanceMode ? 'enabled' : 'disabled'}.`);
                          }}
                          className={`btn ${isMaintenanceMode ? 'btn-danger' : 'btn-secondary'}`}
                          style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11.5 }}
                        >
                          {isMaintenanceMode ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: 10, borderRadius: 8 }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>New User Registration</div>
                          <div style={{ fontSize: 10.5, color: '#64748b' }}>Allow signup operations for new freelancers/clients</div>
                        </div>
                        <button onClick={() => toast.success('Registration settings modified.')} className="btn btn-secondary" style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11.5 }}>
                          Active
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', fontSize: 12.5 }}>
                        <input type="checkbox" defaultChecked /> Freelancer Manual Review Required
                      </label>
                      <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', fontSize: 12.5 }}>
                        <input type="checkbox" defaultChecked /> Client Verification Required
                      </label>
                      <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', fontSize: 12.5 }}>
                        <input type="checkbox" defaultChecked /> AI Bid Moderation Active
                      </label>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="ad-jobs-split-card" style={{ border: '1px solid #fee2e2', background: '#fffafb' }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: '#991b1b', borderBottom: '1px solid #fee2e2', paddingBottom: 8, marginBottom: 12 }}>
                      Danger Zone
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => toast.success('System cache cleared.')} className="btn btn-secondary" style={{ color: '#991b1b', borderColor: '#fca5a5', background: '#fff', fontSize: 12 }}>
                        🗑️ Clear Cache
                      </button>
                      <button onClick={() => toast.error('Platform reset aborted. Confirmation required.')} className="btn btn-secondary" style={{ color: '#991b1b', borderColor: '#fca5a5', background: '#fff', fontSize: 12 }}>
                        🔄 Reset Platform
                      </button>
                      <button onClick={() => toast.success('All non-active mock user profiles removed.')} className="btn btn-secondary" style={{ color: '#991b1b', borderColor: '#fca5a5', background: '#fff', fontSize: 12 }}>
                        🧹 Delete Test Data
                      </button>
                      <button onClick={() => toast.success('Database export initiated.')} className="btn btn-secondary" style={{ color: '#991b1b', borderColor: '#fca5a5', background: '#fff', fontSize: 12 }}>
                        📥 Export Database
                      </button>
                      <button onClick={() => toast.error('Action prohibited.')} className="btn btn-danger" style={{ fontSize: 12, padding: '6px 14px' }}>
                        ⛔ Delete Platform
                      </button>
                    </div>
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
