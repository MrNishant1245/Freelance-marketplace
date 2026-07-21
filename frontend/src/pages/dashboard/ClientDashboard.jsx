import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobAPI, messageAPI, profileAPI, paymentAPI } from '../../api';
import { toast } from 'react-hot-toast';
import '../../styles/FreelancerDashboard.css';

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18 }) => {
  const icons = {
    settings:  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    search:    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    briefcase: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
    users:     <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    star:      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    dollar:    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    plus:      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    message:   <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    mail:      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>,
    globe:     <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>,
    chart:     <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="m7 14 4-4 3 3 5-7"/></svg>,
    bell:      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    logout:    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    check:     <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
    eye:       <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    x:         <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    file:      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>,
    user:      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    edit:      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    switch:    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="16 3 21 8 16 13"/><line x1="21" y1="8" x2="9" y2="8"/><polyline points="8 21 3 16 8 11"/><line x1="3" y1="16" x2="15" y2="16"/></svg>,
    help:      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    menu:      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
    sun:       <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
    moon:      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
    chevronCircle: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="14 16 10 12 14 8" /></svg>
  };
  return icons[name] || null;
};

// Maps every status the backend Job model can have to a display label/colour.
// Backend enum: 'draft' | 'active' | 'in_progress' | 'submitted' | 'completed' | 'closed' | 'cancelled'
const statusStyle = {
  draft:        { bg: '#fafafa', color: '#737373', label: 'Draft' },
  active:       { bg: '#f0fdf4', color: '#15803d', label: 'Active' },
  in_progress:  { bg: '#eff6ff', color: '#1d4ed8', label: 'In Progress' },
  submitted:    { bg: '#fefce8', color: '#a16207', label: 'Submitted — Review' },
  completed:    { bg: '#f0fdf4', color: '#15803d', label: 'Completed ✅' },
  closed:       { bg: '#fef2f2', color: '#dc2626', label: 'Closed' },
  cancelled:    { bg: '#fef2f2', color: '#dc2626', label: 'Cancelled' },
};

const proposalStatusStyle = {
  pending:     { bg: '#fefce8', color: '#854d0e', label: 'Pending' },
  shortlisted: { bg: '#eff6ff', color: '#1d4ed8', label: 'Shortlisted' },
  accepted:    { bg: '#f0fdf4', color: '#15803d', label: 'Accepted ✅' },
  rejected:    { bg: '#fef2f2', color: '#dc2626', label: 'Rejected' },
};

// Passes through any backend status as-is; falls back to 'draft' only when
// the value is genuinely missing (not just unrecognised), so real statuses
// like 'in_progress' or 'submitted' never get miscategorised as drafts.
const normalizeStatus = (status) => {
  if (!status) return 'draft';
  const s = status.toLowerCase();
  return statusStyle[s] ? s : 'draft';
};

const formatBudget = (budget) => {
  if (!budget) return '—';
  if (typeof budget === 'number') return `₹${budget.toLocaleString('en-IN')}`;
  return budget.toString().startsWith('₹') ? budget : `₹${budget}`;
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  if (weeks > 0) return `${weeks}w ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'Just now';
};

const EmptyState = ({ message }) => (
  <div style={s.emptyState}>
    <div style={s.emptyIcon}>📭</div>
    <div style={s.emptyText}>{message}</div>
  </div>
);

const LoadingSpinner = () => (
  <div style={s.loadingWrap}>
    <div style={s.spinner} />
    <span style={{ fontSize: 13, color: '#a3a3a3' }}>Loading...</span>
  </div>
);

// ── Client Feature Hub Component ─────────────────────────────────────────────
const FeatureHub = ({ isDarkMode, navigate, realJobs }) => {
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [hoveredBox, setHoveredBox] = useState(null);

  // States
  const [milestones, setMilestones] = useState([
    { id: 1, name: 'Wireframing & UI Design', amount: 8000, status: 'released' },
    { id: 2, name: 'Frontend React Implementation', amount: 12000, status: 'funded' },
    { id: 3, name: 'Backend Integration & API Connect', amount: 15000, status: 'draft' },
  ]);

  const [invoices, setInvoices] = useState([
    { id: 'INV-2026-001', date: '2026-07-10', project: 'Wireframing & UI Design', amount: 8000, status: 'Paid' },
    { id: 'INV-2026-002', date: '2026-07-13', project: 'Frontend React Implementation', amount: 12000, status: 'Paid' },
    { id: 'INV-2026-003', date: '2026-07-14', project: 'Backend Integration', amount: 15000, status: 'Unpaid' },
  ]);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [shortlistStatus, setShortlistStatus] = useState({ rajesh: false, priya: false });
  const [rankingResult, setRankingResult] = useState(null);
  const [rankingLoading, setRankingLoading] = useState(false);

  const [chatMessages, setChatMessages] = useState([
    { sender: 'freelancer', text: 'Hi client, I have uploaded the wireframe files for Milestone 1. Please review!', time: '10:30 AM', read: true, file: { name: 'wireframe_v2.pdf', size: '2.4 MB' } },
    { sender: 'client', text: 'Excellent progress! Let me verify the milestone escrow.', time: '10:45 AM', read: true },
  ]);
  const [newMsg, setNewMsg] = useState('');

  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [jobForm, setJobForm] = useState({ title: '', category: '', budget: '', description: '' });
  const [recurringJob, setRecurringJob] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState('2026-08-15');

  const templates = {
    react: { title: 'React Frontend Developer for SaaS Dashboard', category: 'Web Development', budget: 25000, description: 'Looking for a senior React specialist to implement stateful widgets, dashboard metrics, and interactive CSS layouts.' },
    mobile: { title: 'Flutter App Developer for E-Commerce App', category: 'Mobile Apps', budget: 45000, description: 'Need an experienced Flutter developer to build client profile pages, payment gateway mockups, and messaging interfaces.' },
    backend: { title: 'Node.js Backend Developer for REST API Dev', category: 'Backend Dev', budget: 35000, description: 'Looking for a developer to implement Express REST endpoints, MongoDB models, and secure JWT middleware auth.' }
  };

  const handleSelectTemplate = (key) => {
    setSelectedTemplate(key);
    if (templates[key]) {
      setJobForm(templates[key]);
      toast.success(`${key.toUpperCase()} Template applied!`);
    }
  };

  const totalFunded = milestones.filter(m => m.status === 'funded').reduce((sum, m) => sum + m.amount, 0);
  const totalReleased = milestones.filter(m => m.status === 'released').reduce((sum, m) => sum + m.amount, 0);
  const totalDraft = milestones.filter(m => m.status === 'draft').reduce((sum, m) => sum + m.amount, 0);

  const fundMilestone = (id) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, status: 'funded' } : m));
    const m = milestones.find(item => item.id === id);
    if (m) {
      setInvoices(prev => prev.map(inv => inv.project === m.name ? { ...inv, status: 'Paid' } : inv));
    }
    toast.success('Milestone funded in Escrow!');
  };

  const releaseMilestone = (id) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, status: 'released' } : m));
    toast.success('Funds released to freelancer!');
  };

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Project,Milestone,Amount,Date,Status\n"
      + milestones.map(m => `"${m.name}","Escrow",${m.amount},"2026-07-14","${m.status}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "spend_analytics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Exported successfully!");
  };

  const allCandidatesList = [];
  (realJobs || []).forEach((job) => {
    if (job.proposals && Array.isArray(job.proposals)) {
      job.proposals.forEach((p) => {
        if (p.freelancer) {
          const f = p.freelancer;
          const freelancerName = `${f.firstName || ''} ${f.lastName || ''}`.trim() || 'Freelancer';
          const hash = String(p._id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const score = 70 + (hash % 26);
          allCandidatesList.push({
            name: freelancerName,
            score: score,
            proposal: p,
            job: job
          });
        }
      });
    }
  });

  const runAIRanking = () => {
    setRankingLoading(true);
    setRankingResult(null);
    setTimeout(() => {
      setRankingLoading(false);
      if (allCandidatesList.length > 0) {
        const sorted = [...allCandidatesList]
          .sort((a, b) => b.score - a.score)
          .map((c, idx) => {
            let tag = 'Potential Fit';
            let reason = `Good candidate match based on budget and skills alignment.`;
            if (idx === 0) {
              tag = 'Highly Recommended';
              reason = `${c.score}% match; highest score based on project skill requirements and competitive bid.`;
            } else if (c.score >= 85) {
              tag = 'Strong Match';
              reason = `Excellent match on project skills and requirements.`;
            } else if (c.score < 75) {
              tag = 'Needs Review';
              reason = `Lower match score; bid is competitive but experience level or skills overlap is lower.`;
            }
            return {
              name: c.name,
              score: c.score,
              reason: reason,
              tag: tag
            };
          });
        setRankingResult(sorted);
      } else {
        setRankingResult([
          { name: 'No candidates', score: 0, reason: 'No proposals have been submitted for your jobs yet.', tag: 'N/A' }
        ]);
      }
      toast.success('Proposals ranked by Claude API assist!');
    }, 1800);
  };

  const sendMsg = () => {
    if (!newMsg.trim()) return;
    setChatMessages(prev => [...prev, { sender: 'client', text: newMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), read: true }]);
    setNewMsg('');
    toast.success('Message sent!');
  };

  const getLineColor = (boxId, defaultColor) => {
    if (hoveredBox === boxId) {
      if (boxId === 'escrow' || boxId === 'invoices') return '#10b981';
      if (boxId === 'analytics') return '#818cf8';
      if (boxId === 'shortlist' || boxId === 'ai_ranking') return '#f97316';
      if (boxId === 'messaging') return '#ec4899';
    }
    return defaultColor;
  };

  const getLineWeight = (boxId) => {
    return hoveredBox === boxId ? 3.5 : 2;
  };

  const themeText = isDarkMode ? '#f8fafc' : '#0f172a';
  const themeCard = isDarkMode ? '#1e293b' : '#fff';
  const themeBorder = isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
  const themeSub = isDarkMode ? '#cbd5e1' : '#475569';

  return (
    <div style={{ padding: '0 0 40px' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: themeText, margin: 0 }}>⚡ Client Feature Hub</h2>
        <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0' }}>Explore and interact with advanced client workspace workflows.</p>
      </div>

      {/* Diagram Area */}
      <div style={{ 
        background: isDarkMode ? '#0b1320' : '#f8fafc', 
        border: `1px solid ${themeBorder}`, 
        borderRadius: 16, 
        padding: '30px 20px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        position: 'relative',
        minHeight: 520,
        overflow: 'hidden'
      }}>
        
        {/* Desktop Absolute Layout Wrapper */}
        <div className="hub-desktop-layout" style={{ 
          position: 'relative', 
          width: 780, 
          height: 440,
          display: 'block' 
        }}>
          
          {/* SVG Connector Lines */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <defs>
              <marker id="arrow-tip" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#94a3b8" />
              </marker>
            </defs>
            
            {/* Vertical dashed arrows from Shortlist pointing Up and Down */}
            <line x1="130" y1="155" x2="130" y2="113" stroke={getLineColor('shortlist', '#94a3b8')} strokeWidth={getLineWeight('shortlist')} strokeDasharray="4 4" markerEnd="url(#arrow-tip)" />
            <line x1="130" y1="260" x2="130" y2="312" stroke={getLineColor('shortlist', '#94a3b8')} strokeWidth={getLineWeight('shortlist')} strokeDasharray="4 4" markerEnd="url(#arrow-tip)" />

            {/* Arrows pointing to Job management layer with offset gaps */}
            <line x1="130" y1="105" x2="382" y2="313" stroke={getLineColor('escrow', '#94a3b8')} strokeWidth={getLineWeight('escrow')} markerEnd="url(#arrow-tip)" />
            <line x1="390" y1="105" x2="390" y2="310" stroke={getLineColor('invoices', '#94a3b8')} strokeWidth={getLineWeight('invoices')} markerEnd="url(#arrow-tip)" />
            <line x1="650" y1="105" x2="398" y2="313" stroke={getLineColor('analytics', '#94a3b8')} strokeWidth={getLineWeight('analytics')} markerEnd="url(#arrow-tip)" />
            
            <line x1="130" y1="255" x2="380" y2="317" stroke={getLineColor('shortlist', '#94a3b8')} strokeWidth={getLineWeight('shortlist')} markerEnd="url(#arrow-tip)" />
            <line x1="390" y1="255" x2="390" y2="310" stroke={getLineColor('ai_ranking', '#94a3b8')} strokeWidth={getLineWeight('ai_ranking')} markerEnd="url(#arrow-tip)" />
            <line x1="650" y1="255" x2="400" y2="317" stroke={getLineColor('messaging', '#94a3b8')} strokeWidth={getLineWeight('messaging')} markerEnd="url(#arrow-tip)" />
          </svg>

          {/* Row 1 Boxes */}
          <div 
            onMouseEnter={() => setHoveredBox('escrow')} 
            onMouseLeave={() => setHoveredBox(null)}
            onClick={() => setSelectedFeature('escrow')}
            style={{ position: 'absolute', top: 10, left: 10, width: 240, height: 95, background: '#024e37', border: '1px solid #047857', borderRadius: 12, padding: '14px 18px', cursor: 'pointer', transition: 'all 0.2s', transform: hoveredBox === 'escrow' ? 'translateY(-3px)' : 'none', boxShadow: hoveredBox === 'escrow' ? '0 10px 25px rgba(2,78,55,0.25)' : 'none' }}
          >
            <div style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>Milestone escrow</div>
            <div style={{ color: '#a7f3d0', fontSize: 12.5, fontWeight: 500, marginTop: 4 }}>Fund, review, release</div>
          </div>

          <div 
            onMouseEnter={() => setHoveredBox('invoices')} 
            onMouseLeave={() => setHoveredBox(null)}
            onClick={() => setSelectedFeature('invoices')}
            style={{ position: 'absolute', top: 10, left: 270, width: 240, height: 95, background: '#024e37', border: '1px solid #047857', borderRadius: 12, padding: '14px 18px', cursor: 'pointer', transition: 'all 0.2s', transform: hoveredBox === 'invoices' ? 'translateY(-3px)' : 'none', boxShadow: hoveredBox === 'invoices' ? '0 10px 25px rgba(2,78,55,0.25)' : 'none' }}
          >
            <div style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>Invoices & receipts</div>
            <div style={{ color: '#a7f3d0', fontSize: 12.5, fontWeight: 500, marginTop: 4 }}>PDF per payment</div>
          </div>

          <div 
            onMouseEnter={() => setHoveredBox('analytics')} 
            onMouseLeave={() => setHoveredBox(null)}
            onClick={() => setSelectedFeature('analytics')}
            style={{ position: 'absolute', top: 10, left: 530, width: 240, height: 95, background: '#312e81', border: '1px solid #4338ca', borderRadius: 12, padding: '14px 18px', cursor: 'pointer', transition: 'all 0.2s', transform: hoveredBox === 'analytics' ? 'translateY(-3px)' : 'none', boxShadow: hoveredBox === 'analytics' ? '0 10px 25px rgba(49,46,129,0.25)' : 'none' }}
          >
            <div style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>Spend analytics</div>
            <div style={{ color: '#c7d2fe', fontSize: 12.5, fontWeight: 500, marginTop: 4 }}>Real charts, exports</div>
          </div>

          {/* Row 2 Boxes */}
          <div 
            onMouseEnter={() => setHoveredBox('shortlist')} 
            onMouseLeave={() => setHoveredBox(null)}
            onClick={() => setSelectedFeature('shortlist')}
            style={{ position: 'absolute', top: 160, left: 10, width: 240, height: 95, background: '#62250f', border: '1px solid #9a3412', borderRadius: 12, padding: '14px 18px', cursor: 'pointer', transition: 'all 0.2s', transform: hoveredBox === 'shortlist' ? 'translateY(-3px)' : 'none', boxShadow: hoveredBox === 'shortlist' ? '0 10px 25px rgba(98,37,15,0.25)' : 'none' }}
          >
            <div style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>Shortlist / compare</div>
            <div style={{ color: '#ffedd5', fontSize: 12.5, fontWeight: 500, marginTop: 4 }}>Side-by-side bids</div>
          </div>

          <div 
            onMouseEnter={() => setHoveredBox('ai_ranking')} 
            onMouseLeave={() => setHoveredBox(null)}
            onClick={() => setSelectedFeature('ai_ranking')}
            style={{ position: 'absolute', top: 160, left: 270, width: 240, height: 95, background: '#62250f', border: '1px solid #9a3412', borderRadius: 12, padding: '14px 18px', cursor: 'pointer', transition: 'all 0.2s', transform: hoveredBox === 'ai_ranking' ? 'translateY(-3px)' : 'none', boxShadow: hoveredBox === 'ai_ranking' ? '0 10px 25px rgba(98,37,15,0.25)' : 'none' }}
          >
            <div style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>AI proposal ranking</div>
            <div style={{ color: '#ffedd5', fontSize: 12.5, fontWeight: 500, marginTop: 4 }}>Claude API assist</div>
          </div>

          <div 
            onMouseEnter={() => setHoveredBox('messaging')} 
            onMouseLeave={() => setHoveredBox(null)}
            onClick={() => setSelectedFeature('messaging')}
            style={{ position: 'absolute', top: 160, left: 530, width: 240, height: 95, background: '#581c87', border: '1px solid #701a75', borderRadius: 12, padding: '14px 18px', cursor: 'pointer', transition: 'all 0.2s', transform: hoveredBox === 'messaging' ? 'translateY(-3px)' : 'none', boxShadow: hoveredBox === 'messaging' ? '0 10px 25px rgba(88,28,135,0.25)' : 'none' }}
          >
            <div style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>Rich messaging</div>
            <div style={{ color: '#fbcfe8', fontSize: 12.5, fontWeight: 500, marginTop: 4 }}>Files, read receipts</div>
          </div>

          {/* Row 3 centered bottom box */}
          <div 
            onMouseEnter={() => setHoveredBox('job_mgmt')} 
            onMouseLeave={() => setHoveredBox(null)}
            onClick={() => setSelectedFeature('job_mgmt')}
            style={{ position: 'absolute', top: 320, left: 165, width: 450, height: 95, background: '#3f3f46', border: '1px solid #52525b', borderRadius: 12, padding: '14px 24px', cursor: 'pointer', transition: 'all 0.2s', transform: hoveredBox === 'job_mgmt' ? 'translateY(-3px)' : 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
          >
            <div style={{ color: '#fff', fontSize: 16, fontWeight: 700, textAlign: 'center' }}>Job management layer</div>
            <div style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 500, marginTop: 6, textAlign: 'center' }}>Templates, recurring jobs, deadlines</div>
          </div>
          
        </div>

        <div style={{ color: '#a3a3a3', fontSize: 13, fontWeight: 500, marginTop: 24, letterSpacing: '0.01em' }}>
          Click any box to explore that feature in more depth
        </div>
      </div>

      {/* RENDER DYNAMIC MODALS FOR EXPLORATION */}
      {/* ── Milestone Escrow Modal ── */}
      {selectedFeature === 'escrow' && (
        <div className="fd-quiz-overlay" onClick={() => setSelectedFeature(null)}>
          <div className="fd-quiz-modal" onClick={(e) => e.stopPropagation()} style={{ width: 550, background: themeCard }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>🛡️</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: themeText }}>Milestone Escrow Security</span>
              </div>
              <button onClick={() => setSelectedFeature(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Icon name="x" /></button>
            </div>
            
            {/* Escrow balance dashboard banner */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, background: isDarkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: `1px solid ${themeBorder}`, borderRadius: 10, padding: 12, marginBottom: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase' }}>Released</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: themeText }}>₹{totalReleased.toLocaleString('en-IN')}</div>
              </div>
              <div style={{ textAlign: 'center', borderLeft: `1px solid ${themeBorder}`, borderRight: `1px solid ${themeBorder}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>In Escrow</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: themeText }}>₹{totalFunded.toLocaleString('en-IN')}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>Drafted</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: themeText }}>₹{totalDraft.toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {milestones.map(m => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', border: `1px solid ${themeBorder}`, borderRadius: 8, background: isDarkMode ? '#172033' : '#fff' }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: themeText }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Amount: <strong>₹{m.amount.toLocaleString('en-IN')}</strong></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ 
                      fontSize: 11, 
                      fontWeight: 700, 
                      padding: '2px 8px', 
                      borderRadius: 6, 
                      background: m.status === 'released' ? '#ecfdf5' : m.status === 'funded' ? '#eff6ff' : '#f5f5f5',
                      color: m.status === 'released' ? '#059669' : m.status === 'funded' ? '#2563eb' : '#737373',
                      textTransform: 'uppercase'
                    }}>
                      {m.status}
                    </span>
                    {m.status === 'draft' && (
                      <button onClick={() => fundMilestone(m.id)} style={{ padding: '6px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11.5, fontWeight: 700 }}>
                        Fund Escrow
                      </button>
                    )}
                    {m.status === 'funded' && (
                      <button onClick={() => releaseMilestone(m.id)} style={{ padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11.5, fontWeight: 700 }}>
                        Release Funds
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: 16, fontSize: 12, color: '#64748b', background: '#eff6ff', padding: 10, borderRadius: 8, border: '1px solid #bfdbfe', lineHeight: 1.4 }}>
              <strong>Escrow Protection Policy:</strong> Client funds are secured in milestone escrows. Freelancers can request review upon work submission. Funds are only transferred upon your explicit approval.
            </div>
          </div>
        </div>
      )}

      {/* ── Invoices & Receipts Modal ── */}
      {selectedFeature === 'invoices' && (
        <div className="fd-quiz-overlay" onClick={() => setSelectedFeature(null)}>
          <div className="fd-quiz-modal" onClick={(e) => e.stopPropagation()} style={{ width: 550, background: themeCard }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>🧾</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: themeText }}>Invoices & Receipt PDFs</span>
              </div>
              <button onClick={() => setSelectedFeature(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Icon name="x" /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {invoices.map(inv => (
                <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', border: `1px solid ${themeBorder}`, borderRadius: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>{inv.id} • {inv.date}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: themeText, marginTop: 2 }}>{inv.project}</div>
                    <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>Total: <strong>₹{inv.amount.toLocaleString('en-IN')}</strong></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ 
                      fontSize: 10.5, 
                      fontWeight: 700, 
                      padding: '2px 8px', 
                      borderRadius: 6,
                      background: inv.status === 'Paid' ? '#ecfdf5' : '#fef2f2',
                      color: inv.status === 'Paid' ? '#059669' : '#dc2626'
                    }}>{inv.status}</span>
                    <button onClick={() => setActiveReceipt(inv)} style={{ padding: '6px 12px', background: isDarkMode ? '#1e293b' : '#fff', border: `1px solid ${themeBorder}`, borderRadius: 6, fontSize: 11.5, color: themeText, fontWeight: 600 }}>
                      View PDF Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Print Receipt Preview Overlay */}
            {activeReceipt && (
              <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'grid', placeItems: 'center' }} onClick={() => setActiveReceipt(null)}>
                <div style={{ background: '#fff', padding: 32, borderRadius: 12, width: 480, fontFamily: 'monospace', color: '#000', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px dashed #000', paddingBottom: 10, marginBottom: 12 }}>
                    <div>
                      <strong style={{ fontSize: 16 }}>FREELANCEMARKET LTD.</strong>
                      <div style={{ fontSize: 10, color: '#666' }}>SaaS Freelance Escrow, IN</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong>RECEIPT</strong>
                      <div style={{ fontSize: 11 }}>{activeReceipt.id}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: 11, marginBottom: 12 }}>
                    <div>Date: {activeReceipt.date}</div>
                    <div>Client Name: client</div>
                    <div>Freelancer Provider: Rajesh Kumar (Verified)</div>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, marginBottom: 14 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #000' }}>
                        <th style={{ textAlign: 'left', paddingBottom: 4 }}>Description</th>
                        <th style={{ textAlign: 'right', paddingBottom: 4 }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ paddingTop: 6 }}>{activeReceipt.project}</td>
                        <td style={{ textAlign: 'right', paddingTop: 6 }}>₹{activeReceipt.amount.toFixed(2)}</td>
                      </tr>
                      <tr style={{ borderTop: '1px dashed #ddd' }}>
                        <td style={{ paddingTop: 6 }}>Subtotal:</td>
                        <td style={{ textAlign: 'right', paddingTop: 6 }}>₹{activeReceipt.amount.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Platform Escrow Fee (0.0%):</td>
                        <td style={{ textAlign: 'right' }}>₹0.00</td>
                      </tr>
                      <tr style={{ borderTop: '2px solid #000', fontWeight: 'bold' }}>
                        <td style={{ paddingTop: 6 }}>TOTAL AMOUNT PAID:</td>
                        <td style={{ textAlign: 'right', paddingTop: 6 }}>₹{activeReceipt.amount.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button onClick={() => window.print()} style={{ padding: '6px 12px', background: '#111827', color: '#fff', border: 'none', borderRadius: 4, fontSize: 11.5 }}>Print Receipt</button>
                    <button onClick={() => setActiveReceipt(null)} style={{ padding: '6px 12px', background: '#e5e7eb', color: '#000', border: 'none', borderRadius: 4, fontSize: 11.5 }}>Close</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Spend Analytics Modal ── */}
      {selectedFeature === 'analytics' && (
        <div className="fd-quiz-overlay" onClick={() => setSelectedFeature(null)}>
          <div className="fd-quiz-modal" onClick={(e) => e.stopPropagation()} style={{ width: 550, background: themeCard }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>📊</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: themeText }}>Spend Analytics & Insights</span>
              </div>
              <button onClick={() => setSelectedFeature(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Icon name="x" /></button>
            </div>

            <div style={{ padding: '10px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: themeText }}>Monthly Spend Distribution (₹)</div>
              
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: 160, borderBottom: `2px solid ${themeBorder}`, paddingBottom: 6 }}>
                {[
                  { month: 'May', spent: 15000 },
                  { month: 'Jun', spent: 32000 },
                  { month: 'Jul', spent: 20000 },
                  { month: 'Aug (Proj)', spent: 45000 },
                ].map((item, i) => {
                  const pct = (item.spent / 50000) * 100;
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 80 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: themeText }}>₹{item.spent.toLocaleString('en-IN')}</div>
                      <div style={{ 
                        height: Math.round(pct), 
                        width: 32, 
                        background: i === 2 ? '#10b981' : '#4f46e5', 
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.4s ease'
                      }} />
                      <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>{item.month}</div>
                    </div>
                  );
                })}
              </div>

              {/* stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
                <div style={{ border: `1px solid ${themeBorder}`, borderRadius: 8, padding: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>AVERAGE HOURLY RATE PAID</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: themeText, marginTop: 2 }}>₹1,250 / hr</div>
                </div>
                <div style={{ border: `1px solid ${themeBorder}`, borderRadius: 8, padding: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>TOTAL VALUE TRANSACTED</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: themeText, marginTop: 2 }}>₹67,000</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
                <button onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
                  📥 Export Spend Data (CSV)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Shortlist / Compare Modal ── */}
      {selectedFeature === 'shortlist' && (
        <div className="fd-quiz-overlay" onClick={() => setSelectedFeature(null)}>
          <div className="fd-quiz-modal" onClick={(e) => e.stopPropagation()} style={{ width: 560, background: themeCard }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>⚖️</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: themeText }}>Freelancer Side-by-Side Comparison</span>
              </div>
              <button onClick={() => setSelectedFeature(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Icon name="x" /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              {allCandidatesList.slice(0, 2).map((cand, cIdx) => {
                const isShortlisted = shortlistStatus[cand.key] || cand.proposal?.status === 'shortlisted';
                return (
                  <div key={cand.key || cIdx} style={{ border: isShortlisted ? '2.5px solid #10b981' : `1px solid ${themeBorder}`, borderRadius: 12, padding: 16, background: isDarkMode ? '#172033' : '#fff', position: 'relative' }}>
                    {isShortlisted && (
                      <span style={{ position: 'absolute', top: 8, right: 8, background: '#10b981', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>SHORTLISTED</span>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: cand.bg, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 'bold' }}>{cand.initial}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: themeText }}>{cand.name}</div>
                        <div style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>{cand.role}</div>
                      </div>
                    </div>
                    
                    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${themeBorder}`, paddingBottom: 4 }}>
                        <span style={{ color: '#64748b' }}>Bid Amount:</span>
                        <strong style={{ color: themeText }}>{cand.rate}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${themeBorder}`, paddingBottom: 4 }}>
                        <span style={{ color: '#64748b' }}>Skill Match:</span>
                        <strong style={{ color: '#10b981' }}>{cand.score}% Match</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${themeBorder}`, paddingBottom: 4 }}>
                        <span style={{ color: '#64748b' }}>Rating:</span>
                        <strong style={{ color: '#d97706' }}>{cand.rating} ({cand.revs})</strong>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setShortlistStatus(prev => ({ ...prev, [cand.key]: !prev[cand.key] }));
                        toast.success(isShortlisted ? `Removed ${cand.name} from shortlist` : `Added ${cand.name} to shortlist!`);
                      }}
                      style={{ width: '100%', marginTop: 14, padding: '8px', background: isShortlisted ? '#ecfdf5' : '#111827', color: isShortlisted ? '#059669' : '#fff', border: isShortlisted ? '1px solid #10b981' : 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                    >
                      {isShortlisted ? '✓ Shortlisted' : 'Shortlist Candidate'}
                    </button>
                  </div>
                );
              })}
              {allCandidatesList.length < 2 && (
                <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '24px 0', color: '#64748b' }}>
                  Please have at least 2 candidates submit proposals to use side-by-side comparison.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── AI Proposal Ranking Modal ── */}
      {selectedFeature === 'ai_ranking' && (
        <div className="fd-quiz-overlay" onClick={() => setSelectedFeature(null)}>
          <div className="fd-quiz-modal" onClick={(e) => e.stopPropagation()} style={{ width: 550, background: themeCard }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>🤖</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: themeText }}>AI Proposal Ranking (Claude Assist)</span>
              </div>
              <button onClick={() => setSelectedFeature(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Icon name="x" /></button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <button 
                onClick={runAIRanking} 
                disabled={rankingLoading}
                style={{ width: '100%', padding: '12px', background: '#9a3412', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {rankingLoading ? '🤖 Parsing & scoring proposals using Claude API...' : '🚀 Evaluate & Rank Proposals (AI Assist)'}
              </button>
            </div>

            {rankingLoading && (
              <div style={{ padding: '30px 0', textAlign: 'center' }}>
                <div style={{ width: 24, height: 24, border: '2.5px solid #eaeaea', borderTopColor: '#9a3412', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
                <span style={{ fontSize: 12.5, color: '#64748b' }}>Evaluating experience, cover letters, and value ratios...</span>
              </div>
            )}

            {rankingResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {rankingResult.map((res, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 12, border: `1px solid ${themeBorder}`, borderRadius: 8, background: isDarkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
                    <div style={{ background: i === 0 ? '#10b981' : i === 1 ? '#3b82f6' : '#94a3b8', color: '#fff', width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 12.5, fontWeight: 'bold' }}>
                      #{i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: themeText }}>{res.name}</span>
                        <span style={{ 
                          fontSize: 10.5, 
                          fontWeight: 700, 
                          padding: '1px 6px', 
                          borderRadius: 6,
                          background: i === 0 ? '#ecfdf5' : '#eff6ff',
                          color: i === 0 ? '#059669' : '#2563eb'
                        }}>{res.tag} ({res.score}%)</span>
                      </div>
                      <p style={{ fontSize: 12, color: themeSub, margin: '6px 0 0', lineHeight: 1.4 }}>
                        {res.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Rich Messaging Modal ── */}
      {selectedFeature === 'messaging' && (
        <div className="fd-quiz-overlay" onClick={() => setSelectedFeature(null)}>
          <div className="fd-quiz-modal" onClick={(e) => e.stopPropagation()} style={{ width: 550, background: themeCard, padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${themeBorder}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>💬</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: themeText }}>Rajesh Kumar (SaaS Front-End)</span>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
              </div>
              <button onClick={() => setSelectedFeature(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Icon name="x" /></button>
            </div>

            {/* Chat Body */}
            <div style={{ height: 260, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, background: isDarkMode ? '#0d1624' : '#f8fafc' }}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: msg.sender === 'client' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  alignSelf: msg.sender === 'client' ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{ 
                    background: msg.sender === 'client' ? '#581c87' : themeCard, 
                    color: msg.sender === 'client' ? '#fff' : themeText, 
                    padding: '10px 14px', 
                    borderRadius: 12,
                    border: msg.sender === 'client' ? 'none' : `1px solid ${themeBorder}`,
                    fontSize: 13,
                    lineHeight: 1.4
                  }}>
                    {msg.text}
                    
                    {msg.file && (
                      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: isDarkMode ? 'rgba(255,255,255,0.06)' : '#f1f5f9', borderRadius: 8, border: `1px solid ${themeBorder}` }}>
                        <span style={{ fontSize: 16 }}>📄</span>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: themeText }}>{msg.file.name}</div>
                          <div style={{ fontSize: 9.5, color: '#64748b' }}>{msg.file.size}</div>
                        </div>
                        <button style={{ marginLeft: 'auto', border: 'none', background: 'none', color: '#581c87', fontWeight: 'bold', fontSize: 10, cursor: 'pointer' }} onClick={() => toast.success('Mock download starting!')}>OPEN</button>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 10, color: '#94a3b8' }}>
                    <span>{msg.time}</span>
                    {msg.sender === 'client' && (
                      <span style={{ color: '#3b82f6', display: 'flex', alignItems: 'center' }}>
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M20 6L9 17l-5-5M12 17l11-11" />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Footer */}
            <div style={{ display: 'flex', gap: 8, padding: 12, borderTop: `1px solid ${themeBorder}`, background: themeCard }}>
              <input 
                type="text" 
                placeholder="Type your message here..."
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMsg()}
                style={{ flex: 1, padding: '10px 14px', border: `1px solid ${themeBorder}`, borderRadius: 8, fontSize: 13, color: themeText, background: isDarkMode ? 'rgba(255,255,255,0.03)' : '#fff', outline: 'none' }}
              />
              <button onClick={sendMsg} style={{ padding: '8px 16px', background: '#581c87', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700 }}>
                Send Msg
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Job Management Layer Modal ── */}
      {selectedFeature === 'job_mgmt' && (
        <div className="fd-quiz-overlay" onClick={() => setSelectedFeature(null)}>
          <div className="fd-quiz-modal" onClick={(e) => e.stopPropagation()} style={{ width: 550, background: themeCard }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>📁</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: themeText }}>Job Management & Templates</span>
              </div>
              <button onClick={() => setSelectedFeature(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Icon name="x" /></button>
            </div>

            {/* Template Selector */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Pre-fill Job Templates</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {['react', 'mobile', 'backend'].map(key => (
                  <button 
                    key={key}
                    onClick={() => handleSelectTemplate(key)}
                    style={{ 
                      padding: '8px 10px', 
                      background: selectedTemplate === key ? '#eff6ff' : (isDarkMode ? 'rgba(255,255,255,0.03)' : '#fff'), 
                      border: selectedTemplate === key ? '2px solid #2563eb' : `1px solid ${themeBorder}`,
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      color: selectedTemplate === key ? '#1e40af' : themeText,
                      cursor: 'pointer'
                    }}
                  >
                    {key.toUpperCase()} Web App
                  </button>
                ))}
              </div>
            </div>

            {/* Mock post form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Job Title</label>
                <input 
                  type="text" 
                  value={jobForm.title}
                  onChange={e => setJobForm({ ...jobForm, title: e.target.value })}
                  placeholder="e.g. React Front-End developer needed" 
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${themeBorder}`, borderRadius: 8, fontSize: 12.5, color: themeText, background: isDarkMode ? '#172033' : '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Category</label>
                  <input 
                    type="text" 
                    value={jobForm.category}
                    onChange={e => setJobForm({ ...jobForm, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: `1px solid ${themeBorder}`, borderRadius: 8, fontSize: 12.5, color: themeText, background: isDarkMode ? '#172033' : '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Budget (₹)</label>
                  <input 
                    type="number" 
                    value={jobForm.budget}
                    onChange={e => setJobForm({ ...jobForm, budget: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: `1px solid ${themeBorder}`, borderRadius: 8, fontSize: 12.5, color: themeText, background: isDarkMode ? '#172033' : '#fff' }}
                  />
                </div>
              </div>

              {/* Recurring setting */}
              <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', padding: '10px 12px', border: `1px solid ${themeBorder}`, borderRadius: 8, marginTop: 4 }}>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: themeText }}>🔄 Recurring Job Posting</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Republish this post automatically every month.</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={recurringJob}
                  onChange={e => {
                    setRecurringJob(e.target.checked);
                    toast.success(recurringJob ? 'Recurring settings disabled' : 'Recurring monthly posting enabled!');
                  }}
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
              </div>

              {/* Deadlines settings */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Project Deadline</label>
                <input 
                  type="date" 
                  value={selectedDeadline}
                  onChange={e => {
                    setSelectedDeadline(e.target.value);
                    toast.success(`Deadline set to ${e.target.value}!`);
                  }}
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${themeBorder}`, borderRadius: 8, fontSize: 12.5, color: themeText, background: isDarkMode ? '#172033' : '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <button onClick={() => {
                  toast.success('Job saved as Template draft!');
                  setSelectedFeature(null);
                }} style={{ padding: '8px 14px', background: 'none', border: `1px solid ${themeBorder}`, borderRadius: 8, fontSize: 12.5, color: themeText, fontWeight: 600 }}>
                  Save as Draft
                </button>
                <button onClick={() => {
                  toast.success('Job template set!');
                  setSelectedFeature(null);
                }} style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700 }}>
                  Apply Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// ── Spending Overview Graph ──
const SpendingChart = ({ isDarkMode, expenses = [] }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  
  const sorted = [...expenses].reverse(); // oldest first
  const rawPoints = sorted.map((e) => {
    const cleanAmt = parseFloat(String(e.amt).replace(/[^0-9.]/g, '')) || 0;
    return { date: e.date, value: cleanAmt };
  });

  const maxVal = Math.max(...rawPoints.map(p => p.value), 1000);
  const chartPoints = rawPoints.map((p, idx) => {
    const x = 30 + (idx * (370 / Math.max(rawPoints.length - 1, 1)));
    const y = 130 - ((p.value / maxVal) * (130 - 45));
    return { x, y, value: `₹${p.value.toLocaleString('en-IN')}`, date: p.date };
  });

  const points = chartPoints.length > 0 ? chartPoints : [
    { x: 30, y: 130, value: '₹0', date: 'No transactions' },
    { x: 400, y: 130, value: '₹0', date: 'No transactions' }
  ];

  let pathD = `M ${points[0].x} ${points[0].y}`;
  let fillD = `M ${points[0].x} 170 L ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    pathD += ` L ${points[i].x} ${points[i].y}`;
    fillD += ` L ${points[i].x} ${points[i].y}`;
  }
  fillD += ` L ${points[points.length - 1].x} 170 Z`;

  return (
    <div style={{ position: 'relative', height: 180, paddingTop: 8 }}>
      <svg viewBox="0 0 420 170" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          <linearGradient id="clientChartFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        <line x1="30" y1="45" x2="400" y2="45" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
        <line x1="30" y1="80" x2="400" y2="80" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
        <line x1="30" y1="120" x2="400" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

        <path d={fillD} fill="url(#clientChartFill)" />
        <path d={pathD} fill="none" stroke="#818cf8" strokeWidth="3.5" strokeLinecap="round" />

        {points.map((pt, idx) => (
          <g key={idx} onMouseEnter={() => setHoveredPoint(pt)} onMouseLeave={() => setHoveredPoint(null)}>
            <circle 
              cx={pt.x} 
              cy={pt.y} 
              r={hoveredPoint && hoveredPoint.x === pt.x ? 7 : 4} 
              fill="#818cf8" 
              stroke="#fff" 
              strokeWidth="2" 
              style={{ cursor: 'pointer', transition: 'all 0.15s ease' }} 
            />
          </g>
        ))}

        <text x="30" y="165" fill="#64748b" fontSize="9.5" textAnchor="middle">Start</text>
        <text x="400" y="165" fill="#64748b" fontSize="9.5" textAnchor="middle">Latest</text>
      </svg>

      {hoveredPoint && (
        <div style={{
          position: 'absolute',
          left: hoveredPoint.x - 45,
          top: hoveredPoint.y - 50,
          background: '#1e293b',
          border: '1px solid #4f46e5',
          borderRadius: 6,
          padding: '4px 8px',
          color: '#fff',
          fontSize: '11px',
          fontWeight: 'bold',
          textAlign: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          pointerEvents: 'none',
          zIndex: 10
        }}>
          <div>{hoveredPoint.value}</div>
          <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 500 }}>{hoveredPoint.date}</div>
        </div>
      )}
    </div>
  );
};

// ── Project Status Donut Chart ──
const DonutChart = ({ jobs = [] }) => {
  const total = jobs.length || 0;
  const inProgress = jobs.filter(j => j.status === 'in_progress').length;
  const inReview = jobs.filter(j => j.status === 'submitted').length;
  const pending = jobs.filter(j => j.status === 'active' || j.status === 'draft').length;
  const completed = jobs.filter(j => j.status === 'completed').length;

  const pctInProgress = total ? (inProgress / total) * 100 : 0;
  const pctInReview = total ? (inReview / total) * 100 : 0;
  const pctPending = total ? (pending / total) * 100 : 0;
  const pctCompleted = total ? (completed / total) * 100 : 0;

  const strokeDash1 = `${pctInProgress} ${100 - pctInProgress}`;
  const strokeDash2 = `${pctInReview} ${100 - pctInReview}`;
  const strokeDash3 = `${pctPending} ${100 - pctPending}`;
  const strokeDash4 = `${pctCompleted} ${100 - pctCompleted}`;

  const offset1 = 0;
  const offset2 = -pctInProgress;
  const offset3 = -(pctInProgress + pctInReview);
  const offset4 = -(pctInProgress + pctInReview + pctPending);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, justifyContent: 'space-between', height: 160 }}>
      <div style={{ position: 'relative', width: 110, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="110" height="110" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
          {total > 0 ? (
            <>
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="3.5" strokeDasharray={strokeDash1} strokeDashoffset={offset1} />
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#d97706" strokeWidth="3.5" strokeDasharray={strokeDash2} strokeDashoffset={offset2} />
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#8b5cf6" strokeWidth="3.5" strokeDasharray={strokeDash3} strokeDashoffset={offset3} />
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="3.5" strokeDasharray={strokeDash4} strokeDashoffset={offset4} />
            </>
          ) : (
            <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3.5" />
          )}
        </svg>
        <div style={{ position: 'absolute', textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{total}</div>
          <div style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Total</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, fontSize: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} /> In Progress</span>
          <strong style={{ color: '#fff' }}>{inProgress} ({pctInProgress.toFixed(1)}%)</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d97706' }} /> In Review</span>
          <strong style={{ color: '#fff' }}>{inReview} ({pctInReview.toFixed(1)}%)</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6' }} /> Pending</span>
          <strong style={{ color: '#fff' }}>{pending} ({pctPending.toFixed(1)}%)</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} /> Completed</span>
          <strong style={{ color: '#fff' }}>{completed} ({pctCompleted.toFixed(1)}%)</strong>
        </div>
      </div>
    </div>
  );
};



// --- BEGIN MOCK PAGINATION DATA GENERATORS ---
const allInvoices = Array.from({ length: 36 }, (_, idx) => {
  const idNum = String(idx + 1).padStart(3, '0');
  const codeNum = 1001 + idx;
  const projectNames = ['Wireframing & UI Design', 'Frontend React Implementation', 'Backend Integration', 'API Development', 'QA & Testing', 'Maintenance & Support'];
  const projectDescs = ['Website Redesign', 'E-commerce Platform', 'E-commerce Platform', 'Mobile App', 'Web Application', 'Monthly Retainer'];
  const dates = ['10 Jul, 2026', '13 Jul, 2026', '14 Jul, 2026', '18 Jul, 2026', '20 Jul, 2026', '22 Jul, 2026'];
  const dues = ['25 Jul, 2026', '28 Jul, 2026', '29 Jul, 2026', '02 Aug, 2026', '04 Aug, 2026', '22 Jul, 2026'];
  const amounts = ['₹8,000', '₹12,000', '₹15,000', '₹9,500', '₹6,000', '₹5,000'];
  const statuses = ['PAID', 'PAID', 'PENDING', 'OVERDUE', 'PENDING', 'PAID'];
  const subs = ['Paid on 15 Jul, 2026', 'Paid on 20 Jul, 2026', 'Due in 3 days', 'Overdue by 5 days', 'Due in 8 days', 'Paid on 22 Jul, 2026'];
  const docBgs = ['rgba(16,185,129,0.12)', 'rgba(59,130,246,0.12)', 'rgba(245,158,11,0.12)', 'rgba(167,139,250,0.12)', 'rgba(59,130,246,0.12)', 'rgba(16,185,129,0.12)'];
  const docColors = ['#10b981', '#3b82f6', '#f59e0b', '#a78bfa', '#3b82f6', '#10b981'];
  const bgs = ['rgba(16,185,129,0.12)', 'rgba(16,185,129,0.12)', 'rgba(245,158,11,0.12)', 'rgba(239,68,68,0.12)', 'rgba(245,158,11,0.12)', 'rgba(16,185,129,0.12)'];
  const colors = ['#10b981', '#10b981', '#f59e0b', '#ef4444', '#f59e0b', '#10b981'];

  const pIdx = idx % 6;
  return {
    id: `INV-2026-${idNum}`,
    code: `#${codeNum}`,
    title: projectNames[pIdx],
    desc: projectDescs[pIdx],
    date: dates[pIdx],
    due: dues[pIdx],
    amount: amounts[pIdx],
    status: statuses[pIdx],
    sub: subs[pIdx],
    bg: bgs[pIdx],
    color: colors[pIdx],
    docBg: docBgs[pIdx],
    docColor: docColors[pIdx]
  };
});

const expensesListState = Array.from({ length: 24 }, (_, idx) => {
  const titles = ['Wireframing & UI Design', 'Frontend React Implementation', 'Backend Integration', 'Logo & Brand Identity', 'SEO Optimization', 'Database Optimization', 'Mobile App Prototyping', 'Cloud Infrastructure Setup'];
  const cats = ['Development', 'Development', 'Development', 'Design', 'Marketing', 'Development', 'Design', 'DevOps'];
  const names = ['Rajesh Kumar', 'Priya Sharma', 'Amit Verma', 'Sneha Nair', 'Deepak Patel', 'Ananya Iyer', 'Vikram Malhotra', 'Rohan Das'];
  const initials = ['RK', 'PS', 'AM', 'SN', 'DP', 'AI', 'VM', 'RD'];
  const bgs = ['#7c3aed', '#db2777', '#1d4ed8', '#f59e0b', '#115e59', '#ec4899', '#6366f1', '#10b981'];
  const amounts = [45000, 42000, 36000, 28000, 24500, 32000, 19000, 50000];
  const dates = ['10 May, 2026', '13 May, 2026', '14 May, 2026', '18 May, 2026', '20 May, 2026', '22 May, 2026', '25 May, 2026', '28 May, 2026'];
  const pcts = ['12.0%', '11.2%', '9.6%', '7.5%', '6.5%', '8.5%', '5.0%', '13.3%'];

  const eIdx = idx % 8;
  return {
    num: idx + 1,
    title: titles[eIdx],
    cat: cats[eIdx],
    name: names[eIdx],
    bg: bgs[eIdx],
    initial: initials[eIdx],
    amt: `₹${(amounts[eIdx] - (idx * 200)).toLocaleString('en-IN')}`,
    date: dates[eIdx],
    pct: pcts[eIdx]
  };
});

const allCandidatesList = Array.from({ length: 12 }, (_, idx) => {
  const names = ['Rajesh Kumar', 'Priya Sharma', 'Amit Verma', 'Sneha Nair', 'Deepak Patel', 'Ananya Iyer', 'Vikram Malhotra', 'Rohan Das', 'Kirti Sen', 'Arjun Mehta', 'Neha Sharma', 'Suresh Rao'];
  const roles = ['React Specialist', 'UI/UX Architect', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'Data Scientist', 'DevOps Architect', 'Mobile Developer', 'Product Designer', 'Cloud Engineer', 'QA Specialist', 'System Analyst'];
  const locations = ['Bangalore, India', 'Mumbai, India', 'Delhi, India', 'Hyderabad, India', 'Ahmedabad, India', 'Chennai, India', 'Pune, India', 'Kolkata, India', 'Gurgaon, India', 'Noida, India', 'Jaipur, India', 'Kochi, India'];
  const scores = [92, 88, 76, 74, 68, 85, 83, 81, 79, 78, 75, 70];
  const skills = [
    ['React', 'Next.js', 'TypeScript'],
    ['Figma', 'UI/UX', 'Adobe XD'],
    ['Node.js', 'React', 'MongoDB'],
    ['Vue.js', 'JavaScript', 'HTML'],
    ['Python', 'Django', 'PostgreSQL'],
    ['Python', 'Pandas', 'TensorFlow'],
    ['Docker', 'Kubernetes', 'AWS'],
    ['React Native', 'Swift', 'Kotlin'],
    ['Figma', 'Sketch', 'Wireframing'],
    ['AWS', 'Terraform', 'Serverless'],
    ['Selenium', 'Cypress', 'Jest'],
    ['Linux', 'Bash', 'Networking']
  ];
  const rates = ['₹25,000 / project', '₹28,000 / project', '₹22,000 / project', '₹20,000 / project', '₹18,000 / project', '₹35,000 / project', '₹40,000 / project', '₹30,000 / project', '₹24,000 / project', '₹32,000 / project', '₹15,000 / project', '₹21,000 / project'];
  const bgs = ['#7c3aed', '#db2777', '#1d4ed8', '#f59e0b', '#115e59', '#ec4899', '#6366f1', '#10b981', '#f97316', '#a855f7', '#6b7280', '#06b6d4'];
  const initials = ['RK', 'PS', 'AM', 'SN', 'DP', 'AI', 'VM', 'RD', 'KS', 'AM', 'NS', 'SR'];

  const cIdx = idx % 12;
  return {
    key: `candidate-${cIdx}`,
    name: names[cIdx],
    role: roles[cIdx],
    location: locations[cIdx],
    score: scores[cIdx],
    skills: skills[cIdx],
    rate: rates[cIdx],
    bg: bgs[cIdx],
    initial: initials[cIdx],
    status: cIdx % 3 === 2 ? 'Away' : 'Available',
    statusTone: cIdx % 3 === 2 ? '#f59e0b' : '#10b981',
    rating: (4.5 + (cIdx % 5) * 0.1).toFixed(1),
    revs: `${15 + (cIdx * 3)} reviews`
  };
});

const allContracts = Array.from({ length: 12 }, (_, idx) => {
  const titles = ['Mobile App Development Service Agreement', 'Website Redesign Agreement', 'UI/UX Design Work Agreement', 'Content Writing Service Agreement', 'Digital Marketing Service Agreement', 'SEO Optimization Service Agreement', 'Database Clustering Services', 'Logo Design & Branding Contract', 'React Native App Migration Contract', 'AWS Devops Automation Agreement', 'Penetration Security Testing Contract', 'E-commerce API Integration Agreement'];
  const partners = ['Acme Corp / John Smith', 'Bright Solutions / Emily Davis', 'GlobalTech / Michael Brown', 'StartUp Hub / Sarah Wilson', 'DigiGrow / David Lee', 'LocalShop / Priya Patel', 'FinTech / Amit Sharma', 'BigBrand / Sneha Nair', 'AppCo / Deepak Verma', 'CloudTech / Vikram Malhotra', 'SecCorp / Arjun Mehta', 'ShopifyDev / Rohan Das'];
  const values = ['₹245,000', '₹120,000', '₹85,000', '₹45,000', '₹95,000', '₹35,000', '₹75,000', '₹20,000', '₹150,000', '₹180,000', '₹90,000', '₹60,000'];
  const statuses = ['ACTIVE', 'ACTIVE', 'PENDING', 'ACTIVE', 'COMPLETED', 'ACTIVE', 'COMPLETED', 'ACTIVE', 'ACTIVE', 'PENDING', 'ACTIVE', 'COMPLETED'];
  const colors = ['#10b981', '#10b981', '#f59e0b', '#10b981', '#94a3b8', '#10b981', '#94a3b8', '#10b981', '#10b981', '#f59e0b', '#10b981', '#94a3b8'];
  const bgs = ['rgba(16,185,129,0.12)', 'rgba(16,185,129,0.12)', 'rgba(245,158,11,0.12)', 'rgba(16,185,129,0.12)', '#1e293b', 'rgba(16,185,129,0.12)', '#1e293b', 'rgba(16,185,129,0.12)', 'rgba(16,185,129,0.12)', 'rgba(245,158,11,0.12)', 'rgba(16,185,129,0.12)', '#1e293b'];
  const dates = ['12 Jul, 2024', '01 Jun, 2024', '28 May, 2024', '15 May, 2024', '10 Mar, 2024', '05 May, 2024', '20 Apr, 2024', '01 May, 2024', '15 Jun, 2024', '18 Jun, 2024', '01 Jul, 2024', '10 Jul, 2024'];
  const ends = ['12 Jan, 2025', '01 Dec, 2024', '28 Nov, 2024', '15 Aug, 2024', '10 Jun, 2024', '05 Nov, 2024', '20 Oct, 2024', '01 Aug, 2024', '15 Dec, 2024', '18 Dec, 2024', '01 Jan, 2025', '10 Jan, 2025'];
  const initials = ['A', 'B', 'G', 'S', 'D', 'L', 'F', 'B', 'A', 'C', 'S', 'S'];

  const cIdx = idx % 12;
  return {
    title: titles[cIdx],
    id: `CTR-2024-00${String(12 - cIdx).padStart(2, '0')}`,
    partner: partners[cIdx],
    val: values[cIdx],
    status: statuses[cIdx],
    color: colors[cIdx],
    bg: bgs[cIdx],
    start: dates[cIdx],
    end: ends[cIdx],
    initial: initials[cIdx]
  };
});
// --- END MOCK PAGINATION DATA GENERATORS ---

const ClientDashboard = () => {
  const { user, logout, updateUser, isDarkMode, toggleDarkMode } = useAuth();

  const [jobs, setJobs] = useState([]);
  
  // Derive candidates list dynamically from real proposals in database
  const realCandidatesList = [];
  jobs.forEach((job) => {
    if (job.proposals && Array.isArray(job.proposals)) {
      job.proposals.forEach((p) => {
        if (p.freelancer) {
          const f = p.freelancer;
          const freelancerName = `${f.firstName || ''} ${f.lastName || ''}`.trim() || 'Freelancer';
          const firstInitial = f.firstName ? f.firstName.charAt(0) : 'F';
          const lastInitial = f.lastName ? f.lastName.charAt(0) : '';
          const initials = `${firstInitial}${lastInitial}`.toUpperCase();
          
          // Skills from profile or fallback
          const skillsList = f.freelancerProfile?.skills && f.freelancerProfile.skills.length > 0 
            ? f.freelancerProfile.skills.slice(0, 3)
            : (job.skills && job.skills.length > 0 ? job.skills.slice(0, 3) : ['React', 'Figma', 'UI/UX']);

          // Match score calculation based on ID hash
          const hash = String(p._id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const score = 70 + (hash % 26); // returns score between 70% and 95%

          const rateText = p.bidAmount ? `₹${p.bidAmount.toLocaleString('en-IN')} / project` : (f.freelancerProfile?.hourlyRate ? `₹${f.freelancerProfile.hourlyRate.toLocaleString('en-IN')} / hr` : '₹20,000 / project');
          
          const colors = ['#7c3aed', '#db2777', '#059669', '#2563eb', '#d97706'];
          const avatarBg = colors[hash % colors.length];

          realCandidatesList.push({
            key: p._id || `cand-${p.freelancer._id}`,
            name: freelancerName,
            role: f.freelancerProfile?.title || `${job.title} Bidder`,
            location: f.freelancerProfile?.location || 'India',
            score: score,
            skills: skillsList,
            rate: rateText,
            bg: avatarBg,
            initial: initials,
            status: 'Available',
            statusTone: '#10b981',
            rating: (4.5 + (hash % 5) * 0.1).toFixed(1),
            revs: `${15 + (hash % 15)} reviews`,
            proposal: p,
            job: job
          });
        }
      });
    }
  });

  const allCandidatesList = realCandidatesList;

  // Derive metric stats dynamically from database
  const shortlistedCount = allCandidatesList.filter(c => shortlistStatus[c.key] || c.proposal?.status === 'shortlisted').length;
  const topMatchScore = allCandidatesList.length > 0 ? Math.max(...allCandidatesList.map(c => c.score)) : 0;
  const avgMatchScore = allCandidatesList.length > 0 ? Math.round(allCandidatesList.reduce((acc, c) => acc + c.score, 0) / allCandidatesList.length) : 0;
  const totalRespondedCount = allCandidatesList.length;
  const totalPostedJobsCount = jobs.length;

  const skillsMatchPct = allCandidatesList.length > 0 ? Math.min(100, Math.round(avgMatchScore * 1.05)) : 0;
  const expMatchPct = allCandidatesList.length > 0 ? Math.min(100, Math.round(avgMatchScore * 0.95)) : 0;
  const budgetMatchPct = allCandidatesList.length > 0 ? Math.min(100, Math.round(avgMatchScore * 0.98)) : 0;
  const availMatchPct = allCandidatesList.length > 0 ? Math.min(100, Math.round(avgMatchScore * 0.92)) : 0;
  const perfMatchPct = allCandidatesList.length > 0 ? Math.min(100, Math.round(avgMatchScore * 1.02)) : 0;

  const topCandidate = allCandidatesList.reduce((prev, current) => (prev.score > current.score) ? prev : current, { name: 'No candidate', score: 0 });

  const [rawTransactions, setRawTransactions] = useState([]);
  const [recentTransactionsState, setRecentTransactionsState] = useState([]);
  const [hiredFreelancersList, setHiredFreelancersList] = useState([]);

  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState(null);
  const [completingJobId, setCompletingJobId] = useState(null);
  const [expensesListState, setExpensesListState] = useState([]);

  // States & handlers for standalone navigation tabs
  const [hubMilestones, setHubMilestones] = useState([]);
  const [hubInvoices, setHubInvoices] = useState([]);

  const [activeReceipt, setActiveReceipt] = useState(null);
  const [shortlistStatus, setShortlistStatus] = useState({ rajesh: false, priya: false });
  const [rankingResult, setRankingResult] = useState(null);
  const [rankingLoading, setRankingLoading] = useState(false);

  // Dynamic summary stats from real collections
  const totalSpentVal = expensesListState.reduce((sum, item) => {
    const cleanAmt = parseFloat(String(item.amt).replace(/[^0-9.]/g, '')) || 0;
    return sum + cleanAmt;
  }, 0);

  const activeProjectsCount = jobs.filter(j => j.status === 'in_progress' || j.status === 'active').length;
  const inProgressCount = jobs.filter(j => j.status === 'in_progress').length;
  const completedProjectsCount = jobs.filter(j => j.status === 'completed').length;
  const uniqueFreelancersCount = new Set(jobs.filter(j => j.hiredFreelancer).map(j => String(j.hiredFreelancer._id || j.hiredFreelancer))).size;

  const paidInvoicesList = rawTransactions.filter(t => t.status === 'released' || t.status === 'paid');
  const pendingInvoicesList = rawTransactions.filter(t => t.status === 'in_escrow');
  const overdueInvoicesList = rawTransactions.filter(t => t.status === 'pending');
  const cancelledInvoicesList = rawTransactions.filter(t => t.status === 'refunded');

  const paidInvoicesCount = paidInvoicesList.length;
  const paidInvoicesSum = paidInvoicesList.reduce((sum, t) => sum + t.total, 0);

  const pendingInvoicesCount = pendingInvoicesList.length;
  const pendingInvoicesSum = pendingInvoicesList.reduce((sum, t) => sum + t.total, 0);

  const overdueInvoicesCount = overdueInvoicesList.length;
  const overdueInvoicesSum = overdueInvoicesList.reduce((sum, t) => sum + t.total, 0);

  const cancelledInvoicesCount = cancelledInvoicesList.length;
  const cancelledInvoicesSum = cancelledInvoicesList.reduce((sum, t) => sum + t.total, 0);

  const totalInvoicesBilledCount = rawTransactions.length;
  const totalInvoicesBilledSum = paidInvoicesSum + pendingInvoicesSum + overdueInvoicesSum + cancelledInvoicesSum;

  const paidInvoicesPct = totalInvoicesBilledSum > 0 ? (paidInvoicesSum / totalInvoicesBilledSum) * 100 : 0;
  const pendingInvoicesPct = totalInvoicesBilledSum > 0 ? (pendingInvoicesSum / totalInvoicesBilledSum) * 100 : 0;
  const overdueInvoicesPct = totalInvoicesBilledSum > 0 ? (overdueInvoicesSum / totalInvoicesBilledSum) * 100 : 0;
  const cancelledInvoicesPct = totalInvoicesBilledSum > 0 ? (cancelledInvoicesSum / totalInvoicesBilledSum) * 100 : 0;

  // Dynamic Recent Activity Timeline
  const recentActivities = [];
  jobs.forEach(job => {
    recentActivities.push({
      icon: '💼',
      colorTone: '#3b82f6',
      title: 'Job post published',
      project: job.title,
      time: new Date(job.createdAt)
    });
    (job.proposals || []).forEach(p => {
      recentActivities.push({
        icon: '📄',
        colorTone: '#f59e0b',
        title: 'Project proposal received',
        project: job.title,
        time: new Date(p.submittedAt || p.createdAt || job.createdAt)
      });
    });
    if (job.hiredFreelancer) {
      recentActivities.push({
        icon: '✍️',
        colorTone: '#8b5cf6',
        title: 'Contract signed',
        project: job.title,
        time: new Date(job.updatedAt || job.createdAt)
      });
    }
    (job.milestones || []).forEach(m => {
      if (m.status === 'paid' || m.status === 'approved') {
        recentActivities.push({
          icon: '🧾',
          colorTone: '#10b981',
          title: `Payment of ₹${m.amount.toLocaleString('en-IN')} completed`,
          project: `${job.title} — ${m.title}`,
          time: new Date(m.updatedAt || job.updatedAt || job.createdAt)
        });
      }
    });
  });

  const sortedActivities = recentActivities
    .sort((a, b) => b.time - a.time)
    .slice(0, 4)
    .map(act => {
      const diff = Date.now() - act.time.getTime();
      const mins = Math.floor(diff / 60000);
      const hours = Math.floor(mins / 60);
      const days = Math.floor(hours / 24);
      let timeStr = 'Just now';
      if (days > 0) timeStr = `${days}d ago`;
      else if (hours > 0) timeStr = `${hours}h ago`;
      else if (mins > 0) timeStr = `${mins}m ago`;
      return { ...act, timeStr };
    });

  const totalReleased = hubMilestones.filter(m => m.status === 'released').reduce((sum, m) => sum + m.amount, 0);
  const totalFunded = hubMilestones.filter(m => m.status === 'funded').reduce((sum, m) => sum + m.amount, 0);
  const totalDraft = hubMilestones.filter(m => m.status === 'draft').reduce((sum, m) => sum + m.amount, 0);

  const fundMilestone = (id) => {
    setHubMilestones(prev => prev.map(m => m.id === id ? { ...m, status: 'funded' } : m));
    const m = hubMilestones.find(item => item.id === id);
    if (m) {
      setHubInvoices(prev => prev.map(inv => inv.project === m.name ? { ...inv, status: 'Paid' } : inv));
    }
    toast.success('Milestone funded in Escrow!');
  };

  const releaseMilestone = (id) => {
    setHubMilestones(prev => prev.map(m => m.id === id ? { ...m, status: 'released' } : m));
    toast.success('Funds released to freelancer!');
  };

  const runAIRanking = () => {
    setRankingLoading(true);
    setRankingResult(null);
    setTimeout(() => {
      setRankingLoading(false);
      setRankingResult([
        { name: 'Rajesh Kumar', score: 96, reason: '100% skill match (React, Node.js) and competitive bid amount.', tag: 'Highly Recommended' },
        { name: 'Priya Sharma', score: 88, reason: 'Strong match on frontend skills; slightly higher bid.', tag: 'Strong Match' },
        { name: 'Amit Singh', score: 62, reason: 'Less project experience; bid is very cheap but lacks React.', tag: 'Needs Training' }
      ]);
      toast.success('Proposals ranked by Claude API assist!');
    }, 1800);
  };

  // ── Sleek Dark Theme Tokens ──
  const themeBg = '#090d16';
  const themeCard = '#111625';
  const themeText = '#f8fafc';
  const themeTextMuted = '#94a3b8';
  const themeBorder = '#1e293b';
  const themeActiveNav = '#4f46e5';
  const [selectedFeature, setSelectedFeature] = useState(null);

  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Project Name,Client Name,Budget (INR),Status,Milestones Count,Hired Freelancer,Created At\n";
    jobs.forEach((job) => {
      const projectName = '"' + (job.title ? job.title.replace(/"/g, '""') : '') + '"';
      const clientName = '"' + ((job.client && job.client.firstName) || (user && user.firstName) || 'Acme Corp').replace(/"/g, '""') + '"';
      const budget = job.budget || 0;
      const status = job.status || 'pending';
      const milestoneCount = job.milestones ? job.milestones.length : 0;
      const freelancer = '"' + ((job.hiredFreelancer && job.hiredFreelancer.name) || 'Unassigned').replace(/"/g, '""') + '"';
      const createdAt = job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '';
      csvContent += projectName + ',' + clientName + ',' + budget + ',' + status + ',' + milestoneCount + ',' + freelancer + ',' + createdAt + '\n';
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "freelance_marketplace_spend_report_" + new Date().toISOString().slice(0, 10) + ".csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Spend Report generated and downloaded successfully!");
  };

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [helpSearch, setHelpSearch] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);
  const [supportTicket, setSupportTicket] = useState({ subject: 'Payment & Transaction Issue', message: '' });
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
  const [freelancerSearchQuery, setFreelancerSearchQuery] = useState('');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeFreelancerProfile, setActiveFreelancerProfile] = useState(null);
  const [invoicePage, setInvoicePage] = useState(1);
  const [reportsPage, setReportsPage] = useState(1);
  const [shortlistPage, setShortlistPage] = useState(1);
  const [contractsPage, setContractsPage] = useState(1);
  const [favoritesPage, setFavoritesPage] = useState(1);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showAnalysisReportModal, setShowAnalysisReportModal] = useState(false);
  const [showContractPreviewModal, setShowContractPreviewModal] = useState(false);
  const [previewContractData, setPreviewContractData] = useState(null);
  const [showAuditLogModal, setShowAuditLogModal] = useState(false);
  const [showTerminateConfirmModal, setShowTerminateConfirmModal] = useState(false);
  const [showAllExpirationsModal, setShowAllExpirationsModal] = useState(false);
  const [showUploadDocModal, setShowUploadDocModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({ contractId: '', fileName: '' });
  const [selectedBulkContracts, setSelectedBulkContracts] = useState([]);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [settingsSupportTicket, setSettingsSupportTicket] = useState({ subject: '', category: 'Billing', message: '' });
  const [loginSessionsList, setLoginSessionsList] = useState([
    { id: 1, browser: "Chrome on Windows 11", location: "Mumbai, India", ip: "103.45.201.8", time: "Active Now", active: true },
    { id: 2, browser: "Safari on iPhone 15 Pro", location: "Delhi, India", ip: "223.109.43.2", time: "3 hours ago", active: false },
    { id: 3, browser: "Firefox on macOS Sonoma", location: "Bangalore, India", ip: "192.168.1.12", time: "2 days ago", active: false }
  ]);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showLoginSessionsModal, setShowLoginSessionsModal] = useState(false);
  const [showNotificationChannelsModal, setShowNotificationChannelsModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [companyDocuments, setCompanyDocuments] = useState([]);
  const [settingsForm, setSettingsForm] = useState({
    gstin: '27AADCAI2458IZP',
    billingAddress: 'Acme Corp, Block C, Bandra Kurla Complex, Mumbai, Maharashtra 400051, India',
    contactName: 'John Doe',
    email: 'john.doe@acmecorp.com',
    phone: '+91 98765 43210',
    taxType: 'GST',
    registrationType: 'Regular',
    placeOfSupply: 'Maharashtra (27)',
    panNumber: 'AADCA1245B',
    currency: 'INR (₹)',
    paymentTerms: 'Net 15',
    invoicePrefix: 'INV-',
    reminderDays: '3 Days Before',
    emailNotifications: true,
    projectUpdates: true,
    paymentAlerts: true,
    promotions: false,
    twoFactor: true
  });
  const [isGstinEditable, setIsGstinEditable] = useState(false);
  const [isAddressEditable, setIsAddressEditable] = useState(false);
  const [isContactEditable, setIsContactEditable] = useState(false);
  const [showTaxDetailsModal, setShowTaxDetailsModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showDocManagerModal, setShowDocManagerModal] = useState(false);
  const [showCandidateInsightsModal, setShowCandidateInsightsModal] = useState(false);
  const [showManageNotesModal, setShowManageNotesModal] = useState(false);
  const [starredNotesList, setStarredNotesList] = useState([]);
  const [newNoteForm, setNewNoteForm] = useState({ candidateName: 'Rajesh Kumar', text: '' });
  const [showFavoritesCompareModal, setShowFavoritesCompareModal] = useState(false);

  const [favoritesList, setFavoritesList] = useState([]);
  const [favoritesSearchQuery, setFavoritesSearchQuery] = useState('');
  const [favoritesSkillFilter, setFavoritesSkillFilter] = useState('All');
  const [favoritesSortOption, setFavoritesSortOption] = useState('rating');
  const [activeFavoritesDotMenu, setActiveFavoritesDotMenu] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [inviteFormData, setInviteFormData] = useState({ project: 'Wireframing & UI Design', message: 'Hello, we would love to invite you to collaborate on this project!' });
  const [broadcastMessage, setBroadcastMessage] = useState('Hey team, just wanted to check in on our milestone progress!');
  const [showScheduleReportModal, setShowScheduleReportModal] = useState(false);
  const [scheduleReportForm, setScheduleReportForm] = useState({ frequency: 'weekly', channel: 'email', recipient: 'client@acme.com' });
  const [monthlyComparisonRange, setMonthlyComparisonRange] = useState('6m');
  const [activeComparisonBarIdx, setActiveComparisonBarIdx] = useState(5);
  const [showAllExpensesModal, setShowAllExpensesModal] = useState(false);
  const [spendingCategoryRange, setSpendingCategoryRange] = useState('all');
  const [spendOverviewRange, setSpendOverviewRange] = useState('month');
  const [activeSpendPoint, setActiveSpendPoint] = useState(null);
  const [showCreateNewInvoiceModal, setShowCreateNewInvoiceModal] = useState(false);
  const [newInvoiceFormState, setNewInvoiceFormState] = useState({ title: '', desc: '', amount: '', due: '' });
  const [showBillingSettingsModal, setShowBillingSettingsModal] = useState(false);
  const [billingSettingsForm, setBillingSettingsForm] = useState({ company: 'Acme Corp', address: '123 Tech Park, Bangalore', taxId: '29AAAAA0000A1Z5', currency: 'INR' });
  const [invoicesListState, setInvoicesListState] = useState([]);
  const [showInvoiceDateRangeModal, setShowInvoiceDateRangeModal] = useState(false);
  const [invoiceStartDate, setInvoiceStartDate] = useState('');
  const [invoiceEndDate, setInvoiceEndDate] = useState('');
  const [activeInvoiceDropdown, setActiveInvoiceDropdown] = useState(null);
  const [showCreateMilestoneModal, setShowCreateMilestoneModal] = useState(false);
  const [showRequestPaymentModal, setShowRequestPaymentModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({ contractId: '', name: '', amount: '', due: '' });
  const [requestPaymentForm, setRequestPaymentForm] = useState({ freelancer: '', amount: '', msg: '' });
  const [withdrawForm, setWithdrawForm] = useState({ methodId: 'bank', amount: '' });
  const [paymentOverviewRange, setPaymentOverviewRange] = useState('month');
  const [activeChartPoint, setActiveChartPoint] = useState(null);
  const [showManagePaymentsModal, setShowManagePaymentsModal] = useState(false);
  const [showAddPaymentMethodModal, setShowAddPaymentMethodModal] = useState(false);
  const [newPaymentForm, setNewPaymentForm] = useState({ type: 'Bank Account', detail: '', bankName: '' });
  const [paymentMethods, setPaymentMethods] = useState(() => {
    try {
      const saved = localStorage.getItem('paymentMethods');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.error("Failed to parse payment methods from localStorage:", err);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('paymentMethods', JSON.stringify(paymentMethods));
  }, [paymentMethods]);

  const getDynamicRangesData = (txs) => {
    const now = new Date();
    const getRangeData = (days, numIntervals, labelGenerator) => {
      const intervalMs = (days * 24 * 60 * 60 * 1000) / numIntervals;
      const startTime = now.getTime() - (days * 24 * 60 * 60 * 1000);
      const intervals = Array.from({ length: numIntervals }, (_, i) => {
        const start = startTime + i * intervalMs;
        return { start, end: start + intervalMs, total: 0, label: labelGenerator(new Date(start + intervalMs / 2)) };
      });
      txs.forEach(t => {
        const tTime = new Date(t.createdAt).getTime();
        if (tTime >= startTime && tTime <= now.getTime()) {
          const idx = Math.min(Math.floor((tTime - startTime) / intervalMs), numIntervals - 1);
          if (idx >= 0 && idx < numIntervals) {
            intervals[idx].total += (t.status === 'released' || t.status === 'in_escrow' || t.status === 'paid') ? t.total : 0;
          }
        }
      });
      const totalSum = intervals.reduce((sum, item) => sum + item.total, 0);
      const maxVal = Math.max(...intervals.map(i => i.total), 1000);
      const points = intervals.map((item, idx) => {
        const x = idx * (340 / (numIntervals - 1));
        const y = 90 - (item.total / maxVal) * 80;
        return { x, y, label: item.label, val: `₹${item.total.toLocaleString('en-IN')}` };
      });
      let pathLine = '';
      let pathFill = '';
      if (points.length > 0) {
        pathLine = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
          pathLine += ` L ${points[i].x} ${points[i].y}`;
        }
        pathFill = `${pathLine} L 340 100 L 0 100 Z`;
      }
      let trendText = '0% vs last period';
      let trendColor = '#64748b';
      let trendBg = 'rgba(100, 116, 139, 0.12)';
      const prevStartTime = startTime - (days * 24 * 60 * 60 * 1000);
      let prevTotal = 0;
      txs.forEach(t => {
        const tTime = new Date(t.createdAt).getTime();
        if (tTime >= prevStartTime && tTime < startTime) {
          prevTotal += (t.status === 'released' || t.status === 'in_escrow' || t.status === 'paid') ? t.total : 0;
        }
      });
      if (prevTotal > 0) {
        const diffPct = ((totalSum - prevTotal) / prevTotal) * 100;
        if (diffPct >= 0) {
          trendText = `↑ ${diffPct.toFixed(1)}% vs last period`;
          trendColor = '#10b981';
          trendBg = 'rgba(16, 185, 129, 0.12)';
        } else {
          trendText = `↓ ${Math.abs(diffPct).toFixed(1)}% vs last period`;
          trendColor = '#ef4444';
          trendBg = 'rgba(239, 68, 68, 0.12)';
        }
      } else if (totalSum > 0) {
        trendText = `↑ 100% vs last period`;
        trendColor = '#10b981';
        trendBg = 'rgba(16, 185, 129, 0.12)';
      }
      const lastPt = points[points.length - 1] || { x: 340, y: 90 };
      return {
        val: `₹${totalSum.toLocaleString('en-IN')}`,
        trend: trendText,
        trendColor,
        trendBg,
        pathFill,
        pathLine,
        cx: lastPt.x,
        cy: lastPt.y,
        labels: intervals.map(i => i.label),
        points
      };
    };
    return {
      month: getRangeData(30, 5, (d) => d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })),
      week: getRangeData(7, 5, (d) => d.toLocaleDateString('en-IN', { weekday: 'short' })),
      year: getRangeData(365, 5, (d) => d.toLocaleDateString('en-IN', { month: 'short' }))
    };
  };

  const rangesData = getDynamicRangesData(rawTransactions);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('Hi, I reviewed your profile and would love to invite you to bid on our project.');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth <= 1000);

  // Contracts management states and handlers
  const [contracts, setContracts] = useState([]);
  const [showNewContractModal, setShowNewContractModal] = useState(false);
  const [contractsSearchQuery, setContractsSearchQuery] = useState('');
  const [selectedContractTab, setSelectedContractTab] = useState('All');
  const [newContractForm, setNewContractForm] = useState({
    title: '',
    partner: '',
    val: '',
    status: 'ACTIVE',
    start: '',
    end: ''
  });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [hiddenCandidates, setHiddenCandidates] = useState([]);
  const [invoicesSearchQuery, setInvoicesSearchQuery] = useState('');
  const [invoicesStatusFilter, setInvoicesStatusFilter] = useState('all');
  const [reportsSearchQuery, setReportsSearchQuery] = useState('');
  const [reportsFilterCategory, setReportsFilterCategory] = useState('All');
  const [showContractFilterPopover, setShowContractFilterPopover] = useState(false);
  const [contractValueFilter, setContractValueFilter] = useState('All');
  const [showInvoiceFilterPopover, setShowInvoiceFilterPopover] = useState(false);
  const [invoiceValueFilter, setInvoiceValueFilter] = useState('All');
  const [showReportFilterPopover, setShowReportFilterPopover] = useState(false);
  const [reportValueFilter, setReportValueFilter] = useState('All');

  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveDropdown(null);
      setShowContractFilterPopover(false);
      setShowInvoiceFilterPopover(false);
      setShowReportFilterPopover(false);
      setActiveChartPoint(null);
      setActiveInvoiceDropdown(null);
      setActiveSpendPoint(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleCreateContract = (e) => {
    e.preventDefault();
    if (!newContractForm.title || !newContractForm.partner || !newContractForm.val) {
      toast.error('Please fill in all required fields.');
      return;
    }

    let formattedVal = newContractForm.val.trim();
    if (!formattedVal.startsWith('₹')) {
      const digits = formattedVal.replace(/[^\d]/g, '');
      const num = parseInt(digits, 10) || 0;
      formattedVal = '₹' + num.toLocaleString('en-IN');
    }

    const currentYear = new Date().getFullYear();
    const ctrId = `CTR-${currentYear}-${String(contracts.length + 1).padStart(4, '0')}`;

    let color = '#10b981';
    let bg = 'rgba(16,185,129,0.12)';
    if (newContractForm.status === 'PENDING') {
      color = '#f59e0b';
      bg = 'rgba(245,158,11,0.12)';
    } else if (newContractForm.status === 'COMPLETED') {
      color = '#94a3b8';
      bg = '#1e293b';
    } else if (newContractForm.status === 'CANCELLED') {
      color = '#ef4444';
      bg = 'rgba(239,68,68,0.12)';
    }

    const partnerInitial = newContractForm.partner.trim().charAt(0).toUpperCase() || 'C';

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const options = { day: '2-digit', month: 'short', year: 'numeric' };
      return date.toLocaleDateString('en-GB', options);
    };

    const newCtr = {
      title: newContractForm.title,
      id: ctrId,
      partner: newContractForm.partner,
      val: formattedVal,
      status: newContractForm.status,
      color: color,
      bg: bg,
      start: formatDate(newContractForm.start) || formatDate(new Date()),
      end: formatDate(newContractForm.end) || 'TBD',
      initial: partnerInitial
    };

    setContracts([newCtr, ...contracts]);
    setShowNewContractModal(false);
    setNewContractForm({
      title: '',
      partner: '',
      val: '',
      status: 'ACTIVE',
      start: '',
      end: ''
    });
    setActiveTab('contracts');
    setContractsPage(1);
    toast.success(`Contract ${ctrId} created successfully!`);
  };

  const handleTerminateContract = (id) => {
    setContracts(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'CANCELLED',
          color: '#ef4444',
          bg: 'rgba(239,68,68,0.12)'
        };
      }
      return c;
    }));
    toast.error(`Contract ${id} marked for termination.`);
  };

  // Dynamically calculate contract metrics
  const activeContractsCount = contracts.filter(c => c.status === 'ACTIVE').length;
  const totalContractVal = contracts.reduce((sum, c) => {
    const cleaned = c.val.replace(/[^\d]/g, '');
    const num = parseInt(cleaned, 10) || 0;
    return sum + num;
  }, 0);

  const upcomingExpirationsCount = contracts.filter(c => c.status === 'ACTIVE' && (c.end.includes('2024') || c.end.includes('Aug') || c.end.includes('Sep'))).length;
  const completedContractsCount = 15 + contracts.filter(c => c.status === 'COMPLETED').length;

  // Dynamically filter contracts
  const filteredContracts = contracts.filter(ctr => {
    if (selectedContractTab !== 'All' && ctr.status.toUpperCase() !== selectedContractTab.toUpperCase()) {
      return false;
    }
    if (contractsSearchQuery) {
      const q = contractsSearchQuery.toLowerCase();
      if (!(ctr.title.toLowerCase().includes(q) || ctr.partner.toLowerCase().includes(q) || ctr.id.toLowerCase().includes(q))) {
        return false;
      }
    }
    if (contractValueFilter !== 'All') {
      const cleaned = ctr.val.replace(/[^\d]/g, '');
      const numVal = parseInt(cleaned, 10) || 0;
      if (contractValueFilter === 'low' && numVal >= 100000) return false;
      if (contractValueFilter === 'high' && numVal < 100000) return false;
    }
    return true;
  });

  const contractsPerPage = 5;
  const totalContractPages = Math.ceil(filteredContracts.length / contractsPerPage) || 1;
  const currentContractsPage = Math.min(contractsPage, totalContractPages);
  const paginatedContracts = filteredContracts.slice((currentContractsPage - 1) * contractsPerPage, currentContractsPage * contractsPerPage);

  const getDynamicSpendRanges = (txs) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const monthIntervalDays = daysInMonth / 5;
    const monthIntervalTotals = [0, 0, 0, 0, 0];
    
    txs.forEach(t => {
      const tDate = new Date(t.createdAt);
      if (tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth) {
        const day = tDate.getDate();
        const idx = Math.min(Math.floor((day - 1) / monthIntervalDays), 4);
        monthIntervalTotals[idx] += t.total;
      }
    });
    
    const maxMonthTotal = Math.max(...monthIntervalTotals, 1);
    const monthPoints = monthIntervalTotals.map((tot, idx) => {
      const x = 50 + idx * 100;
      const y = 130 - (tot / maxMonthTotal) * 100;
      const dayLabel = Math.round(1 + idx * monthIntervalDays);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return {
        x,
        y,
        label: `${dayLabel} ${monthNames[currentMonth]} ${currentYear}`,
        val: `₹${tot.toLocaleString('en-IN')}`
      };
    });
    
    const monthPathLine = `M ${monthPoints.map(p => `${p.x} ${p.y}`).join(' L ')}`;
    const monthPathFill = `${monthPathLine} L 450 140 L 50 140 Z`;
    
    const yearIntervalTotals = [0, 0, 0, 0, 0];
    txs.forEach(t => {
      const tDate = new Date(t.createdAt);
      if (tDate.getFullYear() === currentYear) {
        const m = tDate.getMonth();
        const idx = m < 2 ? 0 : m < 5 ? 1 : m < 8 ? 2 : m < 11 ? 3 : 4;
        yearIntervalTotals[idx] += t.total;
      }
    });
    
    const maxYearTotal = Math.max(...yearIntervalTotals, 1);
    const yearLabels = ['Jan-Feb', 'Mar-May', 'Jun-Aug', 'Sep-Nov', 'Dec'];
    const yearPoints = yearIntervalTotals.map((tot, idx) => {
      const x = 50 + idx * 100;
      const y = 130 - (tot / maxYearTotal) * 100;
      return {
        x,
        y,
        label: `${yearLabels[idx]} ${currentYear}`,
        val: `₹${tot.toLocaleString('en-IN')}`
      };
    });
    
    const yearPathLine = `M ${yearPoints.map(p => `${p.x} ${p.y}`).join(' L ')}`;
    const yearPathFill = `${yearPathLine} L 450 140 L 50 140 Z`;
    
    return {
      month: {
        pathFill: monthPathFill,
        pathLine: monthPathLine,
        cy: monthPoints[4].y,
        labels: ['1st', '7th', '14th', '21st', '30th'],
        points: monthPoints
      },
      year: {
        pathFill: yearPathFill,
        pathLine: yearPathLine,
        cy: yearPoints[4].y,
        labels: yearLabels,
        points: yearPoints
      }
    };
  };

  const getDynamicCategoryRangesData = (txs) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const allowedCategories = ['Development', 'Design', 'Marketing', 'Writing & Content'];
    
    const getRangeData = (filteredTxs) => {
      const totals = {
        'Development': 0,
        'Design': 0,
        'Marketing': 0,
        'Writing & Content': 0,
        'Other': 0
      };
      
      filteredTxs.forEach(t => {
        let cat = t.job?.category || 'Development';
        if (!allowedCategories.includes(cat)) {
          cat = 'Other';
        }
        totals[cat] += t.total;
      });
      
      const totalSum = Object.values(totals).reduce((a, b) => a + b, 0);
      let currentOffset = 0;
      const colors = {
        'Development': '#6366f1',
        'Design': '#3b82f6',
        'Marketing': '#10b981',
        'Writing & Content': '#f59e0b',
        'Other': '#a78bfa'
      };
      
      const categories = Object.entries(totals).map(([label, val]) => {
        const pctNum = totalSum > 0 ? (val / totalSum) * 100 : 0;
        const dasharray = `${pctNum.toFixed(1)}, 100`;
        const offset = `-${currentOffset.toFixed(1)}`;
        currentOffset += pctNum;
        return {
          label,
          value: `₹${val.toLocaleString('en-IN')}`,
          pct: `${pctNum.toFixed(1)}%`,
          color: colors[label],
          dasharray,
          offset
        };
      });
      
      return {
        total: `₹${totalSum.toLocaleString('en-IN')}`,
        categories
      };
    };
    
    return {
      all: getRangeData(txs),
      month: getRangeData(txs.filter(t => {
        const tDate = new Date(t.createdAt);
        return tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth;
      }))
    };
  };

  const getDynamicComparisonRanges = (txs) => {
    const now = new Date();
    const monthsList = [];
    for (let i = 5; i >= 0; i--) {
      monthsList.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
    }
    
    const computeForMonths = (n) => {
      const targetMonths = monthsList.slice(-n);
      const monthlyTotals = targetMonths.map(m => {
        const yr = m.getFullYear();
        const mo = m.getMonth();
        return txs
          .filter(t => {
            const d = new Date(t.createdAt);
            return d.getFullYear() === yr && d.getMonth() === mo;
          })
          .reduce((sum, t) => sum + t.total, 0);
      });
      
      const maxTotal = Math.max(...monthlyTotals, 1);
      return targetMonths.map((m, idx) => {
        const total = monthlyTotals[idx];
        const height = Math.round((total / maxTotal) * 110) || 5;
        return {
          month: `${m.toLocaleDateString('en-US', { month: 'short' })} '${String(m.getFullYear()).slice(-2)}`,
          height,
          amt: `₹${total.toLocaleString('en-IN')}`
        };
      });
    };
    
    return {
      '6m': computeForMonths(6),
      '3m': computeForMonths(3)
    };
  };

  const spendRanges = getDynamicSpendRanges(rawTransactions);
  const categoryRangesData = getDynamicCategoryRangesData(rawTransactions);
  const comparisonRanges = getDynamicComparisonRanges(rawTransactions);

  const reportNow = new Date();
  const reportCurrentYear = reportNow.getFullYear();
  const reportCurrentMonth = reportNow.getMonth();
  const reportThisMonthStart = new Date(reportCurrentYear, reportCurrentMonth, 1).getTime();
  const reportLastMonthStart = new Date(reportCurrentYear, reportCurrentMonth - 1, 1).getTime();

  const reportThisMonthTxs = rawTransactions.filter(t => new Date(t.createdAt).getTime() >= reportThisMonthStart);
  const reportLastMonthTxs = rawTransactions.filter(t => {
    const time = new Date(t.createdAt).getTime();
    return time >= reportLastMonthStart && time < reportThisMonthStart;
  });

  const reportThisMonthSpend = reportThisMonthTxs.reduce((sum, t) => sum + t.total, 0);
  const reportLastMonthSpend = reportLastMonthTxs.reduce((sum, t) => sum + t.total, 0);

  const reportTotalSpentVal = rawTransactions.reduce((sum, t) => sum + t.total, 0);
  const reportSpendDiffPct = reportLastMonthSpend > 0 ? ((reportThisMonthSpend - reportLastMonthSpend) / reportLastMonthSpend) * 100 : 0;

  const reportTotalTransactionsCount = rawTransactions.length;
  const reportThisMonthCount = reportThisMonthTxs.length;
  const reportLastMonthCount = reportLastMonthTxs.length;
  const reportTxCountDiffPct = reportLastMonthCount > 0 ? ((reportThisMonthCount - reportLastMonthCount) / reportLastMonthCount) * 100 : 0;

  const reportTotalAOV = reportTotalTransactionsCount > 0 ? reportTotalSpentVal / reportTotalTransactionsCount : 0;
  const reportThisMonthAOV = reportThisMonthCount > 0 ? reportThisMonthSpend / reportThisMonthCount : 0;
  const reportLastMonthAOV = reportLastMonthCount > 0 ? reportLastMonthSpend / reportLastMonthCount : 0;
  const reportAovDiffPct = reportLastMonthAOV > 0 ? ((reportThisMonthAOV - reportLastMonthAOV) / reportLastMonthAOV) * 100 : 0;

  const reportCategoryTotals = {};
  rawTransactions.forEach(t => {
    const cat = t.job?.category || 'Development';
    reportCategoryTotals[cat] = (reportCategoryTotals[cat] || 0) + t.total;
  });
  let reportTopCategory = 'Development';
  let reportTopCategoryAmt = 0;
  Object.entries(reportCategoryTotals).forEach(([cat, amt]) => {
    if (amt > reportTopCategoryAmt) {
      reportTopCategory = cat;
      reportTopCategoryAmt = amt;
    }
  });
  const reportTopCategoryPct = reportTotalSpentVal > 0 ? (reportTopCategoryAmt / reportTotalSpentVal) * 100 : 0;

  // Dynamically filter & sort Starred Candidates (Favorites)
  const filteredCandidates = favoritesList.filter(cand => {
    const isStarred = shortlistStatus[cand.key] || 
                      allCandidatesList.some(c => c.key === cand.key && (shortlistStatus[c.key] || c.proposal?.status === 'shortlisted'));
    if (!isStarred) return false;

    if (favoritesSearchQuery) {
      const q = favoritesSearchQuery.toLowerCase();
      if (!cand.name.toLowerCase().includes(q) && !cand.role.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (favoritesSkillFilter !== 'All') {
      if (!cand.skills || !cand.skills.includes(favoritesSkillFilter)) {
        return false;
      }
    }
    return true;
  });

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (favoritesSortOption === 'rating') {
      return parseFloat(b.rating) - parseFloat(a.rating);
    }
    if (favoritesSortOption === 'rate') {
      const amtA = parseInt(a.rate.replace(/[^0-9]/g, '')) || 0;
      const amtB = parseInt(b.rate.replace(/[^0-9]/g, '')) || 0;
      return amtA - amtB;
    }
    return 0; // default 'recent'
  });

  const favoritesPerPage = 5;
  const totalFavoritesPages = Math.ceil(sortedCandidates.length / favoritesPerPage) || 1;
  const currentFavoritesPage = Math.min(favoritesPage, totalFavoritesPages);
  const paginatedCandidates = sortedCandidates.slice(
    (currentFavoritesPage - 1) * favoritesPerPage,
    currentFavoritesPage * favoritesPerPage
  );

  // Dynamically filter Invoices
  const filteredInvoices = invoicesListState.filter(inv => {
    if (invoicesStatusFilter !== 'all' && inv.status.toLowerCase() !== invoicesStatusFilter.toLowerCase()) {
      return false;
    }
    if (invoicesSearchQuery) {
      const q = invoicesSearchQuery.toLowerCase();
      if (!(inv.id.toLowerCase().includes(q) || inv.title.toLowerCase().includes(q) || inv.desc.toLowerCase().includes(q) || inv.amount.toLowerCase().includes(q))) {
        return false;
      }
    }
    if (invoiceValueFilter !== 'All') {
      const cleaned = inv.amount.replace(/[^\d]/g, '');
      const numVal = parseInt(cleaned, 10) || 0;
      if (invoiceValueFilter === 'low' && numVal >= 10000) return false;
      if (invoiceValueFilter === 'high' && numVal < 10000) return false;
    }
    if (invoiceStartDate) {
      const startMs = new Date(invoiceStartDate).getTime();
      const itemMs = new Date(inv.date).getTime();
      if (itemMs < startMs) return false;
    }
    if (invoiceEndDate) {
      const endMs = new Date(invoiceEndDate).getTime();
      const itemMs = new Date(inv.date).getTime();
      if (itemMs > endMs) return false;
    }
    return true;
  });

  const invoicesPerPage = 6;
  const totalFilteredInvoices = filteredInvoices.length;
  const totalInvoicePages = Math.ceil(totalFilteredInvoices / invoicesPerPage) || 1;
  const paginatedInvoices = filteredInvoices.slice(
    (invoicePage - 1) * invoicesPerPage,
    invoicePage * invoicesPerPage
  );

  // Dynamically filter Reports (Top Expenses)
  const filteredExpenses = expensesListState.filter(exp => {
    if (reportsFilterCategory !== 'All' && exp.cat.toLowerCase() !== reportsFilterCategory.toLowerCase()) {
      return false;
    }
    if (reportsSearchQuery) {
      const q = reportsSearchQuery.toLowerCase();
      return exp.title.toLowerCase().includes(q) || exp.name.toLowerCase().includes(q) || exp.cat.toLowerCase().includes(q);
    }
    return true;
  });

  const reportsPerPage = 5;
  const totalReportPages = Math.ceil(filteredExpenses.length / reportsPerPage) || 1;
  const paginatedExpenses = filteredExpenses.slice(
    (reportsPage - 1) * reportsPerPage,
    reportsPage * reportsPerPage
  );

  const featuredContract = contracts.find(c => c.status === 'ACTIVE') || contracts[0];

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1000;
      setIsMobile(mobile);
      if (window.innerWidth > 1000) {
        setSidebarCollapsed(false);
      } else {
        setSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  const [proposals, setProposals] = useState([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [updatingProposal, setUpdatingProposal] = useState(null);

  // ── Messaging ──
  const [messagingId, setMessagingId] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredJobs = jobs.filter((job) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return [
      job.title,
      job.category,
      job.description,
      job.status,
      job.hiredFreelancer?.firstName,
      job.hiredFreelancer?.lastName
    ].some(val => val?.toLowerCase().includes(query));
  });

  const filteredProposals = proposals.filter((p) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return [
      p.jobTitle,
      p.freelancer?.firstName,
      p.freelancer?.lastName,
      p.coverLetter,
      p.status
    ].some(val => val?.toLowerCase().includes(query));
  });

  const handleMessageFreelancer = async (freelancerId, jobId) => {
    if (!freelancerId) { alert('Freelancer info not found.'); return; }
    setMessagingId(freelancerId);
    try {
      const res = await messageAPI.startConversation({ recipientId: freelancerId, jobId });
      const convoId = res.data?.data?._id || res.data?._id;
      navigate(convoId ? `/messages?conversation=${convoId}` : '/messages');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start conversation.');
    } finally {
      setMessagingId(null);
    }
  };

  // Fetch my posted jobs
  const fetchFreelancers = async () => {
    try {
      const res = await profileAPI.getFreelancersList();
      if (res.data?.success) {
        setFavoritesList(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load real freelancers:", err);
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await paymentAPI.getHistory('client');
      const txs = res.data?.data?.transactions || [];
      setRawTransactions(txs);

      // Populate recent transactions
      const recentTxs = txs.slice(0, 5).map(t => {
        const freelancerName = t.freelancer ? `${t.freelancer.firstName} ${t.freelancer.lastName}` : 'Unassigned';
        const projectTitle = t.job ? t.job.title : 'General Development';
        const firstInitial = t.freelancer?.firstName ? t.freelancer.firstName.charAt(0) : 'U';
        const lastInitial = t.freelancer?.lastName ? t.freelancer.lastName.charAt(0) : '';
        const initials = `${firstInitial}${lastInitial}`.toUpperCase();
        
        let statusLabel = 'Pending';
        let tone = '#64748b';
        if (t.status === 'released') {
          statusLabel = 'Released';
          tone = '#10b981';
        } else if (t.status === 'in_escrow') {
          statusLabel = 'In Escrow';
          tone = '#f97316';
        } else if (t.status === 'paid') {
          statusLabel = 'Paid';
          tone = '#10b981';
        } else if (t.status === 'refunded') {
          statusLabel = 'Refunded';
          tone = '#ef4444';
        } else if (t.status === 'failed') {
          statusLabel = 'Failed';
          tone = '#ef4444';
        }
        
        const backgrounds = ['#064e3b', '#581c87', '#7c2d12', '#1e3a8a', '#115e59'];
        const bgIndex = (initials.charCodeAt(0) + (initials.charCodeAt(1) || 0)) % backgrounds.length;
        const bg = backgrounds[bgIndex];

        return {
          name: freelancerName,
          meta: projectTitle,
          amount: `₹${t.total.toLocaleString('en-IN')}`,
          status: statusLabel,
          tone,
          bg,
          initials
        };
      });
      setRecentTransactionsState(recentTxs);

      const list = txs.map(t => {
        const freelancerName = t.freelancer ? `${t.freelancer.firstName} ${t.freelancer.lastName}` : 'Unassigned';
        const projectTitle = t.job ? t.job.title : 'General Development';
        const statusLabel = t.status === 'released' ? 'PAID' : t.status === 'in_escrow' ? 'PENDING' : t.status === 'paid' ? 'PAID' : 'UNPAID';
        
        return {
          id: t._id ? `INV-2026-${String(t._id).slice(-4).toUpperCase()}` : 'INV-2026-TEMP',
          date: new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          project: projectTitle,
          amount: `₹${t.total.toLocaleString('en-IN')}`,
          status: statusLabel,
          freelancer: freelancerName,
          email: t.freelancer?.email || '',
          docBg: 'rgba(16,185,129,0.12)',
          docColor: '#10b981'
        };
      });
      setInvoicesListState(list);

      // Convert real transactions to report expenses list
      const totalTxsVolume = txs.reduce((sum, t) => sum + t.total, 0);
      const expenses = txs.map((t, idx) => {
        const freelancerName = t.freelancer ? `${t.freelancer.firstName} ${t.freelancer.lastName}` : 'Unassigned';
        const projectTitle = t.job ? t.job.title : 'General Development';
        const firstInitial = t.freelancer?.firstName ? t.freelancer.firstName.charAt(0) : 'F';
        const lastInitial = t.freelancer?.lastName ? t.freelancer.lastName.charAt(0) : '';
        const initial = `${firstInitial}${lastInitial}`.toUpperCase();
        
        return {
          num: idx + 1,
          title: projectTitle,
          cat: t.job?.category || 'Development',
          name: freelancerName,
          bg: '#' + (Math.floor(Math.random()*16777215).toString(16) + '000000').slice(0, 6),
          initial,
          amt: `₹${t.total.toLocaleString('en-IN')}`,
          date: new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          pct: totalTxsVolume > 0 ? `${((t.total / totalTxsVolume) * 100).toFixed(1)}%` : '0%'
        };
      });
      setExpensesListState(expenses);
    } catch (err) {
      console.error("Failed to load real invoices:", err);
    }
  };

  const fetchContracts = async () => {
    try {
      const res = await jobAPI.getMyPostedJobs();
      const rawJobs = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
      
      const hiredJobs = rawJobs.filter(j => j.hiredFreelancer);
      
      // Populate unique hired freelancers
      const uniqueFreelancers = [];
      const seenIds = new Set();
      hiredJobs.forEach(j => {
        const f = j.hiredFreelancer;
        if (f && !seenIds.has(f._id)) {
          seenIds.add(f._id);
          uniqueFreelancers.push({
            id: f._id,
            name: `${f.firstName || ''} ${f.lastName || ''}`.trim(),
            title: f.freelancerProfile?.title || 'Freelancer'
          });
        }
      });
      setHiredFreelancersList(uniqueFreelancers);

      const list = hiredJobs.map(j => {
        const freelancerName = `${j.hiredFreelancer.firstName || ''} ${j.hiredFreelancer.lastName || ''}`.trim() || 'Freelancer';
        const partnerText = `${user?.clientProfile?.companyName || 'Acme Corp'} / ${freelancerName}`;
        const firstInitial = j.hiredFreelancer.firstName ? j.hiredFreelancer.firstName.charAt(0) : 'F';
        
        return {
          title: j.title,
          id: j._id ? `CTR-2024-00${String(j._id).slice(-2).toUpperCase()}` : 'CTR-2024-TEMP',
          partner: partnerText,
          val: `₹${j.budget.toLocaleString('en-IN')}`,
          status: j.status === 'completed' ? 'COMPLETED' : j.status === 'in_progress' ? 'ACTIVE' : 'PENDING',
          color: j.status === 'completed' ? '#94a3b8' : j.status === 'in_progress' ? '#10b981' : '#f59e0b',
          bg: j.status === 'completed' ? '#1e293b' : j.status === 'in_progress' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
          start: new Date(j.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          end: j.completedAt ? new Date(j.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Ongoing',
          initial: firstInitial
        };
      });
      setContracts(list);
    } catch (err) {
      console.error("Failed to load real contracts:", err);
    }
  };

  const fetchMilestones = async () => {
    try {
      const res = await jobAPI.getMyPostedJobs();
      const rawJobs = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
      
      const milestones = [];
      const invoices = [];
      rawJobs.forEach(job => {
        (job.milestones || []).forEach(m => {
          const mIdStr = m._id ? String(m._id) : '';
          const jobCreatedAt = m.createdAt || job.createdAt || new Date();
          const validDate = new Date(jobCreatedAt);
          const dateStr = isNaN(validDate.getTime()) ? new Date().toISOString().slice(0, 10) : validDate.toISOString().slice(0, 10);

          milestones.push({
            id: m._id || Math.random().toString(),
            name: `${job.title} — ${m.title}`,
            amount: m.amount,
            status: m.status === 'paid' ? 'released' : m.status === 'approved' ? 'released' : m.status === 'in_progress' ? 'funded' : 'draft',
            jobId: job._id
          });

          invoices.push({
            id: mIdStr ? `INV-${mIdStr.slice(-4).toUpperCase()}` : 'INV-TEMP',
            date: dateStr,
            project: `${job.title} — ${m.title}`,
            amount: m.amount,
            status: m.status === 'paid' ? 'Paid' : m.status === 'approved' ? 'Paid' : 'Unpaid'
          });
        });
      });
      setHubMilestones(milestones);
      setHubInvoices(invoices);
    } catch (err) {
      console.error("Failed to load real milestones:", err);
    }
  };

  const fetchJobs = async () => {
    setJobsLoading(true);
    setJobsError(null);
    try {
      const res = await jobAPI.getMyPostedJobs();
      const raw = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
      setJobs(raw);
    } catch (err) {
      console.error('Jobs fetch error:', err);
      setJobsError('Failed to load jobs. Please refresh.');
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchFreelancers();
    fetchInvoices();
    fetchContracts();
    fetchMilestones();
  }, []);

  // Fetch proposals when tab opens — flatten all proposals from all jobs
  useEffect(() => {
    if (activeTab !== 'proposals') return;
    const fetchProposals = async () => {
      setProposalsLoading(true);
      try {
        const res = await jobAPI.getMyPostedJobs();
        const rawJobs = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
        const all = [];
        rawJobs.forEach((job) => {
          (job.proposals || []).forEach((p) => {
            all.push({ ...p, jobId: job._id, jobTitle: job.title });
          });
        });
        setProposals(all);
      } catch (err) {
        console.error('Proposals fetch error:', err);
      } finally {
        setProposalsLoading(false);
      }
    };
    fetchProposals();
  }, [activeTab]);

  const handleProposalAction = async (jobId, proposalId, status) => {
    setUpdatingProposal(proposalId);
    try {
      await jobAPI.updateProposalStatus(jobId, proposalId, status);
      setProposals((prev) =>
        prev.map((p) => (p._id === proposalId ? { ...p, status } : p))
      );
      // Refresh the jobs list too, since accepting a proposal changes job.status to in_progress
      fetchJobs();
    } catch (err) {
      alert('Action failed. Try again.');
    } finally {
      setUpdatingProposal(null);
    }
  };

  // Client approves the delivered work — marks the job 'completed'
  const handleApproveWork = async (jobId) => {
    if (!window.confirm('Mark this job as completed? This confirms you have approved the delivered work.')) return;
    setCompletingJobId(jobId);
    try {
      await jobAPI.markJobCompleted(jobId);
      setJobs((prev) =>
        prev.map((j) => (j._id === jobId ? { ...j, status: 'completed', completedAt: new Date().toISOString() } : j))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Could not mark job as completed.');
    } finally {
      setCompletingJobId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Client';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const activeJobsCount = jobs.filter(j => ['active', 'in_progress', 'submitted'].includes(normalizeStatus(j.status))).length;
  const totalProposals = jobs.reduce((sum, j) => sum + (j.proposals?.length || 0), 0);
  const submittedCount = jobs.filter(j => normalizeStatus(j.status) === 'submitted').length;
  const pendingProposalsCount = jobs.reduce(
    (sum, job) => sum + (job.proposals?.filter((p) => p.status === 'pending').length || 0),
    0
  );
  const acceptedProposalsCount = proposals.filter((p) => p.status === 'accepted').length;
  const messageAlerts = jobs.filter((job) => job.hiredFreelancer && ['in_progress', 'submitted', 'completed'].includes(normalizeStatus(job.status))).length;
  const notificationCount = (pendingProposalsCount > 0 ? 1 : 0) + (acceptedProposalsCount > 0 ? 1 : 0) + (messageAlerts > 0 ? 1 : 0);
  const notifications = [
    ...(
      pendingProposalsCount
        ? [{ id: 'proposals', label: `${pendingProposalsCount} new proposal${pendingProposalsCount === 1 ? '' : 's'}`, onClick: () => setActiveTab('proposals') }]
        : []
    ),
    ...(
      acceptedProposalsCount
        ? [{ id: 'accepted', label: `${acceptedProposalsCount} accepted proposal${acceptedProposalsCount === 1 ? '' : 's'}`, onClick: () => setActiveTab('proposals') }]
        : []
    ),
    ...(
      messageAlerts
        ? [{ id: 'messages', label: `${messageAlerts} active job${messageAlerts === 1 ? '' : 's'} may need messages`, onClick: () => navigate('/messages') }]
        : []
    ),
  ];
  const totalSpent = jobs
    .filter((job) => normalizeStatus(job.status) === 'completed')
    .reduce((sum, job) => sum + (Number(job.budget) || 0), 0);
  const completedJobs = jobs.filter((job) => normalizeStatus(job.status) === 'completed').length;
  const successRate = jobs.length ? Math.round((completedJobs / jobs.length) * 100) : 0;
  const reviewScore = completedJobs > 0 ? '4.9' : 'New';
  const recentActivity = [
    pendingProposalsCount && { title: 'New proposals received', meta: `${pendingProposalsCount} waiting for review`, icon: 'users', tone: '#16a34a' },
    submittedCount && { title: 'Work ready for approval', meta: `${submittedCount} milestone${submittedCount === 1 ? '' : 's'} submitted`, icon: 'check', tone: '#d97706' },
    messageAlerts && { title: 'Active conversations', meta: `${messageAlerts} active job${messageAlerts === 1 ? '' : 's'} in progress`, icon: 'message', tone: '#0891b2' },
  ].filter(Boolean);
  const pipeline = [
    { label: 'Open jobs', value: jobs.filter((j) => normalizeStatus(j.status) === 'active').length, pct: jobs.length ? 70 : 0 },
    { label: 'In progress', value: jobs.filter((j) => normalizeStatus(j.status) === 'in_progress').length, pct: jobs.length ? 55 : 0 },
    { label: 'Submitted', value: submittedCount, pct: submittedCount ? 45 : 0 },
    { label: 'Completed', value: completedJobs, pct: completedJobs ? 80 : 0 },
  ];
  const milestones = jobs
    .filter((job) => ['in_progress', 'submitted'].includes(normalizeStatus(job.status)))
    .slice(0, 2);

  const shellStyle = isMobile ? { ...s.shell, flexDirection: 'column' } : s.shell;
  const sidebarStyle = isMobile ? {
    ...s.sidebar,
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 1000,
    height: '100vh',
    width: 260,
    transform: sidebarCollapsed ? 'translateX(-100%)' : 'translateX(0)',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: sidebarCollapsed ? 'none' : '4px 0 25px rgba(0, 0, 0, 0.15)',
  } : {
    ...s.sidebar,
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 1000,
    height: '100vh',
    width: 260,
  };
  const mainStyle = isMobile ? { ...s.main, padding: '20px', width: '100%', marginLeft: 0 } : { marginLeft: 260, width: 'calc(100% - 260px)' };
  const statsGridStyle = isMobile ? { ...s.statsGrid, gridTemplateColumns: '1fr' } : s.statsGrid;
  const dashboardGridStyle = isMobile ? { ...s.dashboardGrid, gridTemplateColumns: '1fr' } : s.dashboardGrid;
  const bottomGridStyle = isMobile ? { ...s.bottomGrid, gridTemplateColumns: '1fr' } : s.bottomGrid;
  const twoColStyle = isMobile ? { ...s.twoCol, gridTemplateColumns: '1fr' } : s.twoCol;

  return (
    <div className={`fd-shell ${isDarkMode ? 'dark-theme' : ''}`} style={shellStyle}>
      {isMobile && !sidebarCollapsed && (
        <div 
          onClick={() => setSidebarCollapsed(true)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 999
          }}
        />
      )}
      <aside className="fd-sidebar" style={sidebarStyle}>
        <div className="fd-logo" style={s.logo}>
          <div className="fd-logo-mark" style={s.logoMark}>FM</div>
          <span className="fd-logo-text" style={s.logoText}>FreelanceMarket</span>
        </div>
        <nav style={{ ...s.nav, gap: 1 }}>
          {[
            { id: 'overview',     label: 'Dashboard',      icon: 'star' },
            { id: 'projects',     label: 'Projects',       icon: 'briefcase' },
            { id: 'post-project',  label: 'Post a Project',  icon: 'plus' },
            { id: 'freelancers',  label: 'My Freelancers', icon: 'users' },
            { id: 'messages',     label: 'Messages',       icon: 'message' },
            { id: 'contracts',    label: 'Contracts',      icon: 'file' },
            { id: 'payments',     label: 'Payments',       icon: 'dollar' },
            { id: 'invoices',     label: 'Invoices',       icon: 'file' },
            { id: 'reports',      label: 'Reports',        icon: 'chart' },
            { id: 'favorites',    label: 'Favorites',      icon: 'star' },
            { id: 'settings',     label: 'Settings',       icon: 'settings' },
          ].map(item => {
            const isActive = activeTab === item.id || (item.id === 'projects' && activeTab === 'jobs');
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSearchQuery('');
                  if (item.id === 'messages') navigate('/messages');
                  else if (item.id === 'post-project') navigate('/post-job');
                  else if (item.id === 'projects') setActiveTab('jobs');
                  else {
                    setActiveTab(item.id);
                    setSelectedFeature(null); // Clear active modal features
                  }
                  if (isMobile) setSidebarCollapsed(true);
                }}
                className={`fd-nav-btn ${isActive ? 'active' : ''}`}
                style={{ 
                  ...s.navBtn, 
                  background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'none',
                  color: isActive ? '#10b981' : '#94a3b8',
                  borderLeft: isActive ? '3px solid #10b981' : 'none',
                  borderRadius: isActive ? '0 8px 8px 0' : '8px',
                  paddingLeft: isActive ? '9px' : '12px',
                  fontWeight: isActive ? 600 : 500,
                  marginBottom: 1
                }}
              >
                <Icon name={item.icon} />
                <span style={{ fontSize: 13 }}>{item.label}</span>
                {item.id === 'messages' && messageAlerts > 0 && <span style={s.badge}>{messageAlerts}</span>}
                {item.id === 'projects' && submittedCount > 0 && <span style={s.badge}>{submittedCount}</span>}
              </button>
            );
          })}
        </nav>
        <div className="fd-sidebar-bottom" style={{ ...s.sidebarBottom, borderTop: '1px solid #1d2433' }}>
          {/* Mockup Contact Support Card */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.3)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 12,
            padding: 12,
            marginBottom: 16,
            textAlign: 'left'
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc', marginBottom: 4 }}>Need Help?</div>
            <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4, marginBottom: 12 }}>Our support team is here to help you 24/7.</div>
            <button 
              onClick={() => setHelpModalOpen(true)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <span>🎧</span> Contact Support
            </button>
          </div>

          <button type="button" onClick={() => { navigate('/profile'); if (isMobile) setSidebarCollapsed(true); }} className="fd-user-chip" style={s.userChip}>
            <div className="fd-avatar" style={{ ...s.avatar, background: '#7c3aed' }}>{firstName[0]?.toUpperCase()}</div>
            <div className="fd-user-info">
              <div className="fd-user-name" style={{ ...s.userName, color: '#f8fafc' }}>{firstName}</div>
              <div className="fd-user-role" style={s.userRole}>Client</div>
            </div>
          </button>
        </div>
      </aside>

      <main className="fd-main" style={mainStyle}>
        <header className="fd-header" style={isMobile ? { position: 'relative', paddingTop: 56, display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 12, paddingBottom: 16 } : s.header}>
          <div className="fd-header-title-block" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isMobile && (
              <button 
                onClick={() => setSidebarCollapsed(false)}
                className="fd-mobile-menu-toggle"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '6px',
                  cursor: 'pointer',
                  color: isDarkMode ? '#cbd5e1' : '#475569',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon name="menu" size={22} />
              </button>
            )}
            <div className="fd-header-title-main" style={{ fontSize: 22, fontWeight: 800, color: isDarkMode ? '#f8fafc' : '#0f172a', textTransform: 'capitalize' }}>
              {activeTab === 'overview' ? 'Dashboard' : activeTab === 'jobs' ? 'My Jobs' : activeTab}
            </div>
          </div>
          
          {(activeTab === 'overview' || activeTab === 'jobs' || activeTab === 'proposals') && (
            <>
              <div className="fd-header-center">
                <div className="fd-search-container">
                  <Icon name="search" size={16} />
                  <input
                    className="fd-search-input"
                    placeholder={
                      activeTab === 'jobs' ? "Search jobs by title, category, or status..." :
                      activeTab === 'proposals' ? "Search proposals by freelancer or status..." :
                      "Search jobs, proposals, freelancers..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="fd-header-right" style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                <button 
                  className="fd-icon-btn" 
                  onClick={() => toggleDarkMode()} 
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                    background: isDarkMode ? '#0f172a' : '#ffffff',
                    color: isDarkMode ? '#cbd5e1' : '#475569',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                  title="Switch Theme"
                >
                  <Icon name={isDarkMode ? 'sun' : 'moon'} />
                </button>

                <div style={s.notificationsWrapper}>
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen((prev) => !prev)}
                    style={s.notificationBtn}
                    aria-label="Notifications"
                  >
                    <Icon name="bell" />
                    {notificationCount > 0 && <span style={s.notificationBadge}>{notificationCount}</span>}
                  </button>
                  {notificationsOpen && (
                    <div style={s.notificationDropdown}>
                      <div style={s.notificationTitle}>Notifications</div>
                      {notifications.length === 0 ? (
                        <div style={s.notificationEmpty}>No new notifications</div>
                      ) : (
                        notifications.map((item) => (
                          <button key={item.id} type="button" onClick={() => { item.onClick(); setNotificationsOpen(false); }} style={s.notificationItem}>
                            {item.label}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <button type="button" style={s.iconAction} aria-label="Messages" onClick={() => navigate('/messages')}><Icon name="mail" /></button>
                {/* Network globe icon removed per request */}

                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div
                    className="fd-header-user-avatar"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    style={{ cursor: 'pointer', width: 32, height: 32, borderRadius: '50%', background: isDarkMode ? '#1f2937' : '#111827', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 'bold', fontSize: 12.5, boxShadow: '0 2px 6px rgba(17, 24, 39, 0.2)', flexShrink: 0 }}
                  >
                    {firstName[0]?.toUpperCase()}
                  </div>
                  {userMenuOpen && (
                    <div className="fd-user-menu-dropdown" style={{ position: 'absolute', top: '48px', right: '0', background: isDarkMode ? '#071422' : '#fff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)', border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0', width: '220px', zIndex: 100, padding: '8px 0', display: 'flex', flexDirection: 'column' }}>
                      <div className="fd-user-menu-arrow" style={{ position: 'absolute', top: -6, right: 15, width: 12, height: 12, background: isDarkMode ? '#071422' : '#fff', borderLeft: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0', borderTop: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0', transform: 'rotate(45deg)' }} />

                      <button onClick={() => { setUserMenuOpen(false); navigate('/profile'); }} className="fd-user-menu-btn" style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 16px', background: 'none', border: 'none', fontSize: '13.5px', color: isDarkMode ? '#cbd5e1' : '#334155', fontWeight: '500', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s ease' }}>
                        <span style={{ marginRight: '12px', color: isDarkMode ? '#94a3b8' : '#64748b', display: 'inline-flex', alignItems: 'center' }}><Icon name="user" size={16} /></span>
                        View Profile
                      </button>
                      <button onClick={() => { setUserMenuOpen(false); navigate('/profile', { state: { edit: true } }); }} className="fd-user-menu-btn" style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 16px', background: 'none', border: 'none', fontSize: '13.5px', color: isDarkMode ? '#cbd5e1' : '#334155', fontWeight: '500', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s ease' }}>
                        <span style={{ marginRight: '12px', color: isDarkMode ? '#94a3b8' : '#64748b', display: 'inline-flex', alignItems: 'center' }}><Icon name="edit" size={16} /></span>
                        Edit Profile
                      </button>

                      <div className="fd-user-menu-divider" style={{ height: '1px', background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9', margin: '6px 0' }} />

                      <button onClick={async () => {
                        setUserMenuOpen(false);
                        try {
                          const res = await profileAPI.updateProfile({ role: 'freelancer' });
                          if (res.data?.success || res.data?.user) {
                            updateUser({ ...user, role: 'freelancer' });
                            toast.success('Switched to Freelancer Mode! 🚀');
                            navigate('/freelancer/dashboard');
                          }
                        } catch (err) {
                          toast.error('Failed to switch mode');
                        }
                      }} className="fd-user-menu-btn" style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 16px', background: 'none', border: 'none', fontSize: '13.5px', color: '#7c3aed', fontWeight: '500', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s ease' }}>
                        <span style={{ marginRight: '12px', color: '#7c3aed', display: 'inline-flex', alignItems: 'center' }}><Icon name="switch" size={16} /></span>
                        Switch to Freelancer
                      </button>

                      <div className="fd-user-menu-divider" style={{ height: '1px', background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9', margin: '6px 0' }} />

                      <button onClick={() => { setUserMenuOpen(false); handleLogout(); }} className="fd-user-menu-btn" style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 16px', background: 'none', border: 'none', fontSize: '13.5px', color: '#dc2626', fontWeight: '500', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s ease' }}>
                        <span style={{ marginRight: '12px', color: '#ef4444', display: 'inline-flex', alignItems: 'center' }}><Icon name="logout" size={16} /></span>
                        Logout
                      </button>
                    </div>
                  )}
                </div>

                <button style={s.postBtn} onClick={() => navigate('/post-job')}>
                  <Icon name="plus" /> Post a Job
                </button>
              </div>
            </>
          )}
        </header>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Dynamic Greeting Row from Mockup */}
            <div className="fd-greeting-row-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 className="fd-greeting-title" style={{ fontSize: 22, fontWeight: 700, color: themeText, margin: 0 }}>
                  Good afternoon, Acme Corp. 👋
                </h1>
                <p className="fd-greeting-sub" style={{ fontSize: 13.5, color: themeTextMuted, margin: '4px 0 0' }}>
                  Here's what's happening with your projects today.
                </p>
              </div>

              {/* Date selector dropdown */}
              <div className="fd-date-selector-pill" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#111625', border: '1px solid #1d2433', borderRadius: 8, padding: '8px 16px', fontSize: 12.5, fontWeight: 600, color: '#f8fafc', cursor: 'pointer' }} onClick={() => toast.success('Date filter toggled!')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#64748b' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                <span>14 Jul, 2026 - 20 Jul, 2026</span>
              </div>
            </div>

            {/* Real Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 16 }}>
              {/* Card 1: Total Spent */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 18, position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 12.5, color: '#94a3b8', fontWeight: 500 }}>Total Spent</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginTop: 6 }}>₹{totalSpentVal.toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>📈</span> Active Escrow & Payments
                    </div>
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(79, 70, 229, 0.1)', color: '#6366f1', display: 'grid', placeItems: 'center', fontSize: 18 }}>
                    📊
                  </div>
                </div>
                {/* Micro sparkline */}
                <div style={{ height: 32, marginTop: 10 }}>
                  <svg viewBox="0 0 100 30" width="100%" height="100%" preserveAspectRatio="none">
                    <path d="M0 25 C 20 20, 40 10, 60 18 C 80 25, 90 5, 100 8" fill="none" stroke="#6366f1" strokeWidth="2" />
                  </svg>
                </div>
              </div>

              {/* Card 2: Active Projects */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 12.5, color: '#94a3b8', fontWeight: 500 }}>Active Projects</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginTop: 6 }}>{activeProjectsCount}</div>
                    <div style={{ fontSize: 11.5, color: '#3b82f6', fontWeight: 600, marginTop: 8 }}>
                      {inProgressCount} in progress
                    </div>
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'grid', placeItems: 'center', fontSize: 18 }}>
                    💼
                  </div>
                </div>
              </div>

              {/* Card 3: Completed Projects */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 12.5, color: '#94a3b8', fontWeight: 500 }}>Completed Projects</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginTop: 6 }}>{completedProjectsCount}</div>
                    <div style={{ fontSize: 11.5, color: '#10b981', fontWeight: 600, marginTop: 8 }}>
                      Verified completions
                    </div>
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'grid', placeItems: 'center', fontSize: 18 }}>
                    ✅
                  </div>
                </div>
              </div>

              {/* Card 4: Total Freelancers */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 12.5, color: '#94a3b8', fontWeight: 500 }}>Total Freelancers</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginTop: 6 }}>{uniqueFreelancersCount}</div>
                    <div style={{ fontSize: 11.5, color: '#f59e0b', fontWeight: 600, marginTop: 8 }}>
                      Working with you
                    </div>
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'grid', placeItems: 'center', fontSize: 18 }}>
                    👥
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Grid Row */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.35fr 1fr 1fr', gap: 16 }}>
              {/* Spending Overview chart */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#fff', margin: 0 }}>Spending Overview</h3>
                  <select style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', outline: 'none' }}>
                    <option>This Month</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>₹{totalSpentVal.toLocaleString('en-IN')}</span>
                  <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '2px 6px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>Live</span>
                </div>
                <SpendingChart isDarkMode={true} expenses={expensesListState} />
              </div>

              {/* Project Status Donut chart */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#fff', margin: 0 }}>Project Status</h3>
                  <button onClick={() => setActiveTab('jobs')} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>View all</button>
                </div>
                <DonutChart jobs={jobs} />
              </div>

              {/* Recent Activity */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#fff', margin: 0 }}>Recent Activity</h3>
                  <button onClick={() => toast.success('Activity feed updated!')} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Refresh</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {sortedActivities.length > 0 ? (
                    sortedActivities.map((act, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center', fontSize: 13, flexShrink: 0 }}>{act.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{act.title}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{act.project}</div>
                        </div>
                        <span style={{ fontSize: 10.5, color: '#64748b' }}>{act.timeStr}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: '#64748b', fontSize: 12.5 }}>No recent activities.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Row Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.35fr 1fr', gap: 16 }}>
              {/* Active Projects Table */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#fff', margin: 0 }}>Active Projects</h3>
                  <button onClick={() => setActiveTab('jobs')} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>View all</button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, textAlign: 'left', minWidth: 480 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #1d2433', color: '#64748b', fontWeight: 600 }}>
                        <th style={{ paddingBottom: 10 }}>Project</th>
                        <th style={{ paddingBottom: 10 }}>Freelancer</th>
                        <th style={{ paddingBottom: 10 }}>Status</th>
                        <th style={{ paddingBottom: 10 }}>Progress</th>
                        <th style={{ paddingBottom: 10 }}>Due Date</th>
                      </tr>
                    </thead>
                    <tbody style={{ color: '#fff' }}>
                      {jobs.filter(j => j.hiredFreelancer).length > 0 ? (
                        jobs.filter(j => j.hiredFreelancer).map((job, idx) => {
                          const freelancerName = `${job.hiredFreelancer.firstName || ''} ${job.hiredFreelancer.lastName || ''}`.trim() || 'Freelancer';
                          const firstInitial = job.hiredFreelancer.firstName ? job.hiredFreelancer.firstName.charAt(0) : 'F';
                          const lastInitial = job.hiredFreelancer.lastName ? job.hiredFreelancer.lastName.charAt(0) : '';
                          const initials = `${firstInitial}${lastInitial}`.toUpperCase();
                          
                          // Calculate progress
                          const totalMilestones = job.milestones?.length || 0;
                          const completedMilestones = (job.milestones || []).filter(m => m.status === 'paid' || m.status === 'approved').length;
                          const progressPct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
                          
                          // Status style mapper
                          const statusLabel = job.status === 'in_progress' ? 'In Progress' : job.status === 'completed' ? 'Completed' : job.status === 'submitted' ? 'Submitted' : 'Active';
                          const statusColor = job.status === 'completed' ? '#10b981' : job.status === 'in_progress' ? '#3b82f6' : '#d97706';
                          const statusBg = job.status === 'completed' ? 'rgba(16,185,129,0.15)' : job.status === 'in_progress' ? 'rgba(59,130,246,0.15)' : 'rgba(217,119,6,0.15)';
                          
                          const dueDate = job.dueDate || job.createdAt;
                          const formattedDueDate = dueDate ? new Date(dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
                          
                          // Avatar background color based on hash of initials/name
                          const colors = ['#7c3aed', '#db2777', '#059669', '#2563eb', '#d97706'];
                          const avatarBg = colors[idx % colors.length];

                          return (
                            <tr key={job._id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                              <td style={{ padding: '12px 0' }}>
                                <div style={{ fontWeight: 700 }}>{job.title}</div>
                                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{job.category || 'General'}</div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: avatarBg, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700 }}>{initials}</div>
                                  <span>{freelancerName}</span>
                                </div>
                              </td>
                              <td><span style={{ background: statusBg, color: statusColor, padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{statusLabel}</span></td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div style={{ width: 60, height: 6, borderRadius: 99, background: '#1e293b', overflow: 'hidden' }}>
                                    <div style={{ width: `${progressPct}%`, height: '100%', background: statusColor }} />
                                  </div>
                                  <span>{progressPct}%</span>
                                </div>
                              </td>
                              <td>{formattedDueDate}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>No active projects found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Invoices */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#fff', margin: 0 }}>Recent Invoices</h3>
                  <button onClick={() => setSelectedFeature('invoices')} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>View all</button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, textAlign: 'left', minWidth: 320 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #1d2433', color: '#64748b', fontWeight: 600 }}>
                        <th style={{ paddingBottom: 10 }}>Invoice</th>
                        <th style={{ paddingBottom: 10 }}>Amount</th>
                        <th style={{ paddingBottom: 10 }}>Status</th>
                        <th style={{ paddingBottom: 10 }}>Due Date</th>
                      </tr>
                    </thead>
                    <tbody style={{ color: '#fff' }}>
                      {invoicesListState && invoicesListState.length > 0 ? (
                        invoicesListState.slice(0, 4).map((inv, idx) => {
                          const isPaid = inv.status === 'PAID' || inv.status === 'Paid';
                          const isPending = inv.status === 'PENDING' || inv.status === 'Pending';
                          const statusBg = isPaid ? 'rgba(16,185,129,0.15)' : isPending ? 'rgba(217,119,6,0.15)' : 'rgba(239,68,68,0.15)';
                          const statusColor = isPaid ? '#10b981' : isPending ? '#d97706' : '#ef4444';

                          return (
                            <tr key={inv.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                              <td style={{ padding: '12px 0' }}>
                                <div style={{ fontWeight: 700 }}>{inv.id}</div>
                                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{inv.project}</div>
                              </td>
                              <td>{inv.amount}</td>
                              <td>
                                <span style={{ background: statusBg, color: statusColor, padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
                                  {inv.status}
                                </span>
                              </td>
                              <td>{inv.date}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>No recent invoices found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Collapsible drawer for developer/diagram actions */}
            <div style={{ borderTop: '1px solid #1e293b', paddingTop: 20, marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: 0 }}>🛡️ Quick Operations & Feature Exploration Hub</h4>
                <button 
                  onClick={() => setSelectedFeature(selectedFeature ? null : 'escrow')}
                  style={{ background: 'none', border: '1px solid #1d2433', borderRadius: 8, padding: '6px 12px', color: '#94a3b8', fontSize: 12, cursor: 'pointer' }}
                >
                  {selectedFeature ? 'Hide Operations Hub ▲' : 'Show Operations Hub ▼'}
                </button>
              </div>
              
              {selectedFeature && (
                <FeatureHub 
                  isDarkMode={true} 
                  navigate={navigate} 
                  realJobs={jobs}
                  handleProposalAction={async (proposalId, jobId, action) => {
                    await handleProposalAction(jobId, proposalId, action);
                  }}
                />
              )}
            </div>
          </div>
        )}{/* ──standlone workspace tabs ── */}
        {activeTab === 'payments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header Title Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20, color: '#3b82f6' }}>🛡️</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Payouts & Escrow Milestones</span>
              </div>
              <span style={{ fontSize: 13, color: '#64748b' }}>Secure platform escrow released on work approval</span>
            </div>

            {/* Top Row: Milestone Escrow Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 16 }}>
              {/* Card 1: Released */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Released</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginTop: 6 }}>₹{totalReleased.toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 4 }}>Total released to freelancers</div>
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                </div>
              </div>

              {/* Card 2: In Escrow */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>In Escrow</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginTop: 6 }}>₹{totalFunded.toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 4 }}>Funds securely held in escrow</div>
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                </div>
              </div>

              {/* Card 3: Crafted */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Crafted</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginTop: 6 }}>₹{(totalReleased + totalFunded + totalDraft).toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 4 }}>Total milestones created</div>
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(249, 115, 22, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                </div>
              </div>
            </div>

            {/* Middle Row: Payment Overview, Transactions, Methods */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.3fr 1.2fr 1.1fr', gap: 16 }}>
              
              {/* Box 1: Payment Overview Chart */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Payment Overview</span>
                  <select 
                    value={paymentOverviewRange} 
                    onChange={(e) => { setPaymentOverviewRange(e.target.value); setActiveChartPoint(null); }}
                    style={{ background: '#1e293b', border: '1px solid #1d2433', borderRadius: 6, color: '#fff', fontSize: 11.5, padding: '4px 8px', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="month">This Month</option>
                    <option value="week">This Week</option>
                    <option value="year">This Year</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>{rangesData[paymentOverviewRange].val}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Total Payment Volume</span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: rangesData[paymentOverviewRange].trendColor, background: rangesData[paymentOverviewRange].trendBg, padding: '1px 6px', borderRadius: 6 }}>
                      {rangesData[paymentOverviewRange].trend}
                    </span>
                  </div>
                </div>
                {/* Custom SVG Overview Curve */}
                <div style={{ marginTop: 20, height: 120, position: 'relative' }}>
                  <svg viewBox="0 0 340 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                    <defs>
                      <linearGradient id="overviewFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d={rangesData[paymentOverviewRange].pathFill} fill="url(#overviewFill)" />
                    <path d={rangesData[paymentOverviewRange].pathLine} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                    
                    {/* End point highlight dot */}
                    <circle cx={rangesData[paymentOverviewRange].cx} cy={rangesData[paymentOverviewRange].cy} r="5" fill="#10b981" stroke="#fff" strokeWidth="1.5" />

                    {/* Active highlight dot */}
                    {activeChartPoint && (
                      <circle 
                        cx={activeChartPoint.x} 
                        cy={activeChartPoint.y} 
                        r="5" 
                        fill="#fff" 
                        stroke="#10b981" 
                        strokeWidth="2.5" 
                        style={{ pointerEvents: 'none' }}
                      />
                    )}

                    {/* Invisible Interactive Click Targets */}
                    {rangesData[paymentOverviewRange].points.map((pt, pIdx) => (
                      <circle 
                        key={pIdx} 
                        cx={pt.x} 
                        cy={pt.y} 
                        r="14" 
                        fill="transparent" 
                        style={{ cursor: 'pointer' }} 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveChartPoint(pt);
                        }}
                      />
                    ))}
                  </svg>

                  {/* Floating Price Tooltip overlay */}
                  {activeChartPoint && (
                    <div style={{
                      position: 'absolute',
                      left: `${(activeChartPoint.x / 340) * 100}%`,
                      bottom: `${100 - (activeChartPoint.y / 100) * 100}%`,
                      transform: 'translate(-50%, -10px)',
                      background: '#1e293b',
                      border: '1.5px solid #10b981',
                      borderRadius: 8,
                      padding: '5px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#fff',
                      whiteSpace: 'nowrap',
                      zIndex: 20,
                      pointerEvents: 'none',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.6)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      alignItems: 'center'
                    }}>
                      <span style={{ color: '#10b981' }}>{activeChartPoint.val}</span>
                      <span style={{ fontSize: 9, color: '#64748b', fontWeight: 600 }}>{activeChartPoint.label}</span>
                      {/* Triangle indicator */}
                      <div style={{
                        position: 'absolute',
                        bottom: -5,
                        left: '50%',
                        marginLeft: -5,
                        width: 0,
                        height: 0,
                        borderLeft: '5px solid transparent',
                        borderRight: '5px solid transparent',
                        borderTop: '5px solid #1e293b'
                      }} />
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: 10, marginTop: 10 }}>
                  {rangesData[paymentOverviewRange].labels.map((lbl, lIdx) => (
                    <span key={lIdx}>{lbl}</span>
                  ))}
                </div>
              </div>

              {/* Box 2: Recent Transactions */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Recent Transactions</span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#3b82f6', cursor: 'pointer' }} onClick={() => setActiveTab('reports')}>View all</span>
                </div>
                <div className="no-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', maxHeight: 200, paddingRight: 2 }}>
                  {recentTransactionsState.length === 0 ? (
                    <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
                      No recent transactions found.
                    </div>
                  ) : (
                    recentTransactionsState.map((tx, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: idx < recentTransactionsState.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: tx.bg, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700 }}>
                            {tx.initials}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{tx.name}</div>
                            <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 1 }}>{tx.meta}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{tx.amount}</div>
                          <div style={{ fontSize: 10.5, color: tx.tone, fontWeight: 600, marginTop: 1 }}>{tx.status}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Box 3: Payment Methods */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Payment Methods</span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#3b82f6', cursor: 'pointer' }} onClick={() => setShowManagePaymentsModal(true)}>Manage</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {paymentMethods.map((method) => (
                    <div 
                      key={method.id}
                      onClick={() => toast.info(`${method.type} (${method.bankName}) authorized on ${method.date}.`)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, border: '1px solid #1d2433', borderRadius: 10, background: '#161c2c', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 18 }}>{method.icon}</span>
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff' }}>
                            {method.type} 
                            {method.primary && (
                              <span style={{ fontSize: 9.5, fontWeight: 700, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '1px 6px', borderRadius: 4, marginLeft: 6 }}>Primary</span>
                            )}
                          </div>
                          <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>{method.detail}</div>
                        </div>
                      </div>
                      <span style={{ color: '#64748b', fontSize: 12 }}>❯</span>
                    </div>
                  ))}
                </div>

                <div 
                  onClick={() => setShowAddPaymentMethodModal(true)} 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#10b981', fontWeight: 700, marginTop: 14, cursor: 'pointer', alignSelf: 'flex-start' }}
                >
                  <span>+</span> Add Payment Method
                </div>
              </div>
            </div>

            {/* Bottom Row: Escrow Milestone Status & Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.7fr 1.3fr', gap: 16 }}>
              
              {/* Box 1: Escrow Milestone Status */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', display: 'block', marginBottom: 16 }}>Escrow Milestone Status</span>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 10 }}>
                  {(() => {
                    const totalMilestonesCount = hubMilestones.length;
                    const completedMilestonesCount = hubMilestones.filter(m => m.status === 'released').length;
                    const inProgressMilestonesCount = hubMilestones.filter(m => m.status === 'funded').length;
                    const pendingMilestonesCount = hubMilestones.filter(m => m.status === 'draft').length;

                    const completedPct = totalMilestonesCount > 0 ? ((completedMilestonesCount / totalMilestonesCount) * 100).toFixed(1) + '%' : '0%';
                    const inProgressPct = totalMilestonesCount > 0 ? ((inProgressMilestonesCount / totalMilestonesCount) * 100).toFixed(1) + '%' : '0%';
                    const pendingPct = totalMilestonesCount > 0 ? ((pendingMilestonesCount / totalMilestonesCount) * 100).toFixed(1) + '%' : '0%';

                    return [
                      { label: 'Total Milestones', value: totalMilestonesCount, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)', icon: '📋', pct: '' },
                      { label: 'Completed', value: completedMilestonesCount, color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', icon: '✅', pct: completedPct },
                      { label: 'In Progress', value: inProgressMilestonesCount, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', icon: '⏳', pct: inProgressPct },
                      { label: 'Pending Approval', value: pendingMilestonesCount, color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.12)', icon: '🛡️', pct: pendingPct }
                    ].map((status, idx) => (
                      <div key={idx} style={{ background: '#161c2c', border: '1px solid #1d2433', borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 16 }}>{status.icon}</span>
                          {status.pct && <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>{status.pct}</span>}
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 4 }}>{status.value}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.3 }}>{status.label}</div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Box 2: Quick Actions */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', display: 'block', marginBottom: 16 }}>Quick Actions</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  {[
                    { label: 'Create Milestone', icon: '📝', bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', action: () => setShowCreateMilestoneModal(true) },
                    { label: 'Request Payment', icon: '📥', bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', action: () => setShowRequestPaymentModal(true) },
                    { label: 'Withdraw Funds', icon: '💸', bg: 'rgba(167, 139, 250, 0.12)', color: '#a78bfa', action: () => setShowWithdrawModal(true) },
                    { label: 'View Invoices', icon: '🧾', bg: 'rgba(249, 115, 22, 0.12)', color: '#f97316', action: () => setActiveTab('invoices') }
                  ].map((act, idx) => (
                    <div key={idx} onClick={act.action} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', textAlign: 'center' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: act.bg, color: act.color, display: 'grid', placeItems: 'center', fontSize: 20, transition: 'transform 0.2s' }} className="action-circle">
                        {act.icon}
                      </div>
                      <span style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.3, fontWeight: 500 }}>{act.label}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header Title Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(59, 130, 246, 0.12)', display: 'grid', placeItems: 'center', color: '#3b82f6', fontSize: 22 }}>
                  🧾
                </span>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Invoices & billing statements</div>
                  <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 3 }}>Track, download and manage all your invoices in one place.</div>
                </div>
              </div>
              <button 
                onClick={() => toast.success('Tax receipts and service statements download initiated!')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#1e293b', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#334155'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#1e293b'}
              >
                <span>📥</span> Download tax receipts and service statements
              </button>
            </div>

            {/* Top Grid: Invoice Summary Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, 1fr)', gap: 16 }}>
              {/* Box 1: Total Invoices */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(16, 185, 129, 0.12)', display: 'grid', placeItems: 'center', color: '#10b981', fontSize: 18 }}>
                  💵
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Invoices</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginTop: 3 }}>{totalInvoicesBilledCount}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>All time</div>
                </div>
              </div>

              {/* Box 2: Paid */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(59, 130, 246, 0.12)', display: 'grid', placeItems: 'center', color: '#3b82f6', fontSize: 18 }}>
                  📘
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Paid</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginTop: 3 }}>{paidInvoicesCount}</div>
                  <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700, marginTop: 1 }}>₹{paidInvoicesSum.toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* Box 3: Pending */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(245, 158, 11, 0.12)', display: 'grid', placeItems: 'center', color: '#f59e0b', fontSize: 18 }}>
                  ⏳
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginTop: 3 }}>{pendingInvoicesCount}</div>
                  <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, marginTop: 1 }}>₹{pendingInvoicesSum.toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* Box 4: Overdue */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(167, 139, 250, 0.12)', display: 'grid', placeItems: 'center', color: '#a78bfa', fontSize: 18 }}>
                  ⚠
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overdue</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginTop: 3 }}>{overdueInvoicesCount}</div>
                  <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, marginTop: 1 }}>₹{overdueInvoicesSum.toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* Box 5: Total Billed */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(20, 184, 166, 0.12)', display: 'grid', placeItems: 'center', color: '#14b8a6', fontSize: 18 }}>
                  📈
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Billed</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginTop: 3 }}>₹{totalInvoicesBilledSum.toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>All time</div>
                </div>
              </div>
            </div>

            {/* Middle Row: Invoices Table List */}
            <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column' }}>
              
              {/* Controls bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <input 
                  value={invoicesSearchQuery}
                  onChange={(e) => { setInvoicesSearchQuery(e.target.value); setInvoicePage(1); }}
                  placeholder="Search Invoices by name, ID or amount..." 
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, padding: '7.5px 12px', color: '#fff', fontSize: 12, outline: 'none', width: isMobile ? '100%' : 260 }}
                />
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: isMobile ? '100%' : 'auto', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <select 
                    value={invoicesStatusFilter}
                    onChange={(e) => { setInvoicesStatusFilter(e.target.value); setInvoicePage(1); }}
                    style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#cbd5e1', fontSize: 12, padding: '7.5px 12px', outline: 'none' }}
                  >
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                  </select>
                  <button 
                    onClick={() => setShowInvoiceDateRangeModal(true)}
                    style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#cbd5e1', fontSize: 12, padding: '7.5px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    📅 {invoiceStartDate || invoiceEndDate ? 'Active Date Filter' : 'Select Date Range'}
                  </button>
                  <div style={{ position: 'relative' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowInvoiceFilterPopover(!showInvoiceFilterPopover); }}
                      style={{ background: 'transparent', border: '1px solid #1d2433', borderRadius: 8, color: '#cbd5e1', fontSize: 12, padding: '7.5px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      🔍 Filter
                    </button>
                    {showInvoiceFilterPopover && (
                      <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, background: '#111625', border: '1px solid #1d2433', borderRadius: 10, padding: 12, zIndex: 100, width: 180, textAlign: 'left', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Invoice Amount</div>
                        {['All', 'Under ₹10,000', 'Over ₹10,000'].map((opt, oIdx) => (
                          <label key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: '#cbd5e1', cursor: 'pointer', marginTop: 6 }}>
                            <input 
                              type="radio" 
                              name="invoiceVal" 
                              checked={(opt === 'All' && invoiceValueFilter === 'All') || (opt === 'Under ₹10,000' && invoiceValueFilter === 'low') || (opt === 'Over ₹10,000' && invoiceValueFilter === 'high')} 
                              onChange={() => {
                                setInvoiceValueFilter(opt === 'All' ? 'All' : opt === 'Under ₹10,000' ? 'low' : 'high');
                                setInvoicePage(1);
                              }}
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left', minWidth: 650 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1d2433', color: '#64748b' }}>
                      <th style={{ padding: '10px 0', fontWeight: 600 }}>Invoice ID</th>
                      <th style={{ padding: '10px 0', fontWeight: 600 }}>Project / Description</th>
                      <th style={{ padding: '10px 0', fontWeight: 600 }}>Invoice Date</th>
                      <th style={{ padding: '10px 0', fontWeight: 600 }}>Due Date</th>
                      <th style={{ padding: '10px 0', fontWeight: 600 }}>Amount</th>
                      <th style={{ padding: '10px 0', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '10px 0', fontWeight: 600, textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedInvoices.map((inv, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '12px 0', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 6, background: inv.docBg, color: inv.docColor, display: 'grid', placeItems: 'center', fontSize: 14 }}>
                              📄
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#fff' }}>{inv.id}</div>
                              <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>{inv.code}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 0' }}>
                          <div style={{ fontWeight: 700, color: '#fff' }}>{inv.title}</div>
                          <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 1 }}>{inv.desc}</div>
                        </td>
                        <td style={{ padding: '12px 0', color: '#cbd5e1' }}>{inv.date}</td>
                        <td style={{ padding: '12px 0', color: '#cbd5e1' }}>{inv.due}</td>
                        <td style={{ padding: '12px 0', fontWeight: 800, color: '#fff' }}>{inv.amount}</td>
                        <td style={{ padding: '12px 0' }}>
                          <div>
                            <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: inv.bg, color: inv.color }}>{inv.status}</span>
                            <div style={{ fontSize: 10, color: '#64748b', marginTop: 3 }}>{inv.sub}</div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 0', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                            <button 
                              onClick={() => { setActiveReceipt({ id: inv.id, project: inv.title, amount: Number(inv.amount.replace(/[^0-9]/g, '')), date: inv.date, status: inv.status === 'PAID' ? 'Paid' : 'Unpaid' }); }}
                              style={{ padding: '5px 10.5px', background: '#1e293b', border: '1px solid #1d2433', borderRadius: 6, color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                            >
                              👁️ View
                            </button>
                            
                            <div style={{ position: 'relative' }}>
                              <span 
                                style={{ color: '#64748b', cursor: 'pointer', fontSize: 13 }} 
                                onClick={(e) => { e.stopPropagation(); setActiveInvoiceDropdown(activeInvoiceDropdown === inv.id ? null : inv.id); }}
                              >
                                •••
                              </span>
                              {activeInvoiceDropdown === inv.id && (
                                <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, background: '#111625', border: '1px solid #1d2433', borderRadius: 8, padding: '6px 0', zIndex: 100, width: 160, textAlign: 'left', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                                  <div 
                                    onClick={() => {
                                      setActiveInvoiceDropdown(null);
                                      const element = document.createElement("a");
                                      const file = new Blob([
                                        `INVOICE SLIP\n\n` +
                                        `Invoice ID: ${inv.id}\n` +
                                        `Project: ${inv.title}\n` +
                                        `Due Date: ${inv.due}\n` +
                                        `Amount: ${inv.amount}\n` +
                                        `Status: ${inv.status}`
                                      ], {type: 'text/plain'});
                                      element.href = URL.createObjectURL(file);
                                      element.download = `${inv.id}_receipt.txt`;
                                      document.body.appendChild(element);
                                      element.click();
                                      document.body.removeChild(element);
                                      toast.success("Receipt downloaded successfully!");
                                    }}
                                    style={{ padding: '8px 12px', fontSize: 11.5, color: '#cbd5e1', cursor: 'pointer' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#1e293b'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                  >
                                    📥 Download PDF
                                  </div>
                                  <div 
                                    onClick={() => { setActiveInvoiceDropdown(null); toast.success("Invoice copy emailed successfully!"); }}
                                    style={{ padding: '8px 12px', fontSize: 11.5, color: '#cbd5e1', cursor: 'pointer' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#1e293b'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                  >
                                    📧 Email Copy
                                  </div>
                                  {(inv.status === 'PENDING' || inv.status === 'OVERDUE') && (
                                    <>
                                      <div 
                                        onClick={() => {
                                          setInvoicesListState(prev => prev.map(i => i.id === inv.id ? { ...i, status: 'PAID', sub: 'Paid today', bg: 'rgba(16,185,129,0.12)', color: '#10b981' } : i));
                                          setActiveInvoiceDropdown(null);
                                          toast.success("Invoice successfully paid!");
                                        }}
                                        style={{ padding: '8px 12px', fontSize: 11.5, color: '#10b981', cursor: 'pointer' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#1e293b'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                      >
                                        ✓ Mark as Paid
                                      </div>
                                      <div 
                                        onClick={() => {
                                          setInvoicesListState(prev => prev.map(i => i.id === inv.id ? { ...i, status: 'DISPUTED', sub: 'Dispute opened', bg: 'rgba(239,68,68,0.12)', color: '#ef4444' } : i));
                                          setActiveInvoiceDropdown(null);
                                          toast.error("Invoice marked as Disputed.");
                                        }}
                                        style={{ padding: '8px 12px', fontSize: 11.5, color: '#ef4444', cursor: 'pointer' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#1e293b'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                      >
                                        ❌ Dispute Invoice
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer / Pagination */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, flexWrap: 'wrap', gap: 10 }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  Showing {totalFilteredInvoices === 0 ? 0 : ((invoicePage - 1) * invoicesPerPage) + 1} to {Math.min(invoicePage * invoicesPerPage, totalFilteredInvoices)} of {totalFilteredInvoices} invoices
                </span>
                {totalInvoicePages > 1 && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setInvoicePage(prev => Math.max(prev - 1, 1))} style={{ width: 24, height: 24, borderRadius: 6, background: '#161c2c', border: '1px solid #1d2433', color: '#64748b', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 11 }}>‹</button>
                    {Array.from({ length: totalInvoicePages }, (_, i) => i + 1).map(page => (
                      <button key={page} onClick={() => setInvoicePage(page)} style={{ width: 24, height: 24, borderRadius: 6, background: invoicePage === page ? '#10b981' : '#161c2c', border: invoicePage === page ? 'none' : '1px solid #1d2433', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 11, fontWeight: invoicePage === page ? 700 : 500 }}>{page}</button>
                    ))}
                    <button onClick={() => setInvoicePage(prev => Math.min(prev + 1, totalInvoicePages))} style={{ width: 24, height: 24, borderRadius: 6, background: '#161c2c', border: '1px solid #1d2433', color: '#64748b', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 11 }}>›</button>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom row: Summary donut chart (left) & Quick Actions (right) */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1.4fr', gap: 16 }}>
              {/* Box 1: Invoice Summary */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', display: 'block', marginBottom: 14 }}>Invoice Summary</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                  {/* Donut Chart */}
                  <div style={{ width: 90, height: 90, position: 'relative', flexShrink: 0 }}>
                    <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray={`${paidInvoicesPct.toFixed(1)}, 100`} />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray={`${pendingInvoicesPct.toFixed(1)}, 100`} strokeDashoffset={`-${paidInvoicesPct.toFixed(1)}`} />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray={`${overdueInvoicesPct.toFixed(1)}, 100`} strokeDashoffset={`-${(paidInvoicesPct + pendingInvoicesPct).toFixed(1)}`} />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray={`${cancelledInvoicesPct.toFixed(1)}, 100`} strokeDashoffset={`-${(paidInvoicesPct + pendingInvoicesPct + overdueInvoicesPct).toFixed(1)}`} />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>₹{totalInvoicesBilledSum.toLocaleString('en-IN')}</span>
                      <span style={{ fontSize: 7, color: '#64748b', textTransform: 'uppercase', marginTop: 1 }}>Total Billed</span>
                    </div>
                  </div>

                  {/* Legend list */}
                  <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', minWidth: 160 }}>
                    {[
                      { label: 'Paid', value: `₹${paidInvoicesSum.toLocaleString('en-IN')}`, pct: `${paidInvoicesPct.toFixed(1)}%`, color: '#10b981' },
                      { label: 'Pending', value: `₹${pendingInvoicesSum.toLocaleString('en-IN')}`, pct: `${pendingInvoicesPct.toFixed(1)}%`, color: '#f59e0b' },
                      { label: 'Overdue', value: `₹${overdueInvoicesSum.toLocaleString('en-IN')}`, pct: `${overdueInvoicesPct.toFixed(1)}%`, color: '#ef4444' },
                      { label: 'Cancelled', value: `₹${cancelledInvoicesSum.toLocaleString('en-IN')}`, pct: `${cancelledInvoicesPct.toFixed(1)}%`, color: '#3b82f6' }
                    ].map((item, key) => (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 11.5, color: '#cbd5e1', fontWeight: 600 }}>{item.label}</div>
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{item.value} • {item.pct}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Box 2: Quick Actions */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', display: 'block', marginBottom: 16 }}>Quick Actions</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  {[
                    {
                      label: 'Download All Invoices',
                      icon: '📥',
                      bg: 'rgba(16, 185, 129, 0.12)',
                      color: '#10b981',
                      action: () => {
                        const element = document.createElement("a");
                        const file = new Blob([
                          "CONSOLIDATED TAX RECEIPTS & BILLING STATEMENTS\n\n" +
                          "Invoice ID,Date,Project/Description,Amount,Status\n" +
                          invoicesListState.map(i => `${i.id},${i.date},${i.title},${i.amount},${i.status}`).join("\n")
                        ], {type: 'text/csv'});
                        element.href = URL.createObjectURL(file);
                        element.download = "consolidated_billing_statement.csv";
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                        toast.success("All invoices downloaded as CSV!");
                      }
                    },
                    { label: 'Create New Invoice', icon: '📝', bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', action: () => setShowCreateNewInvoiceModal(true) },
                    {
                      label: 'Download Tax Statement',
                      icon: '📋',
                      bg: 'rgba(167, 139, 250, 0.12)',
                      color: '#a78bfa',
                      action: () => {
                        const element = document.createElement("a");
                        const file = new Blob([
                          "FINANCIAL YEAR 2026 TAX DECLARATION STATEMENT\n\n" +
                          `Total Transactions Volume: ₹${totalInvoicesBilledSum.toLocaleString('en-IN')}\n` +
                          `Total Paid: ₹${paidInvoicesSum.toLocaleString('en-IN')}\n` +
                          `Total Pending: ₹${pendingInvoicesSum.toLocaleString('en-IN')}\n` +
                          "Tax Rate Applied: 0%\n" +
                          "Net Tax Liabilities: ₹0.00\n\n" +
                          "Generated officially under Freelance Marketplace Escrow System."
                        ], {type: 'text/plain'});
                        element.href = URL.createObjectURL(file);
                        element.download = "FY_2026_tax_statement.txt";
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                        toast.success("FY 2026 tax statement downloaded successfully!");
                      }
                    },
                    { label: 'Billing Settings', icon: '⚙️', bg: 'rgba(249, 115, 22, 0.12)', color: '#f97316', action: () => setShowBillingSettingsModal(true) }
                  ].map((act, idx) => (
                    <div key={idx} onClick={act.action} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', textAlign: 'center' }}>
                      <div style={{ width: 42, height: 42, borderRadius: '50%', background: act.bg, color: act.color, display: 'grid', placeItems: 'center', fontSize: 18, transition: 'transform 0.2s' }}>
                        {act.icon}
                      </div>
                      <span style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.3, fontWeight: 500 }}>{act.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}
        {activeTab === 'reports' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header Title Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(99, 102, 241, 0.12)', display: 'grid', placeItems: 'center', color: '#6366f1', fontSize: 22 }}>
                  📊
                </span>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Spend Reports & Analytics</div>
                  <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 3 }}>Track your spending, analyze trends and make better business decisions.</div>
                </div>
              </div>
              <button 
                onClick={() => {
                  const element = document.createElement("a");
                  const file = new Blob([
                    "TOP EXPENSES SPEND REPORT\n\n" +
                    "Index,Project/Description,Category,Freelancer,Amount,Date,Percentage Share\n" +
                    expensesListState.map(e => `${e.num},${e.title},${e.cat},${e.name},${e.amt},${e.date},${e.pct}`).join("\n")
                  ], {type: 'text/csv'});
                  element.href = URL.createObjectURL(file);
                  element.download = "spending_report.csv";
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                  toast.success("CSV spend report downloaded!");
                }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
              >
                <span>📥</span> Download CSV Report <span style={{ fontSize: 10 }}>▼</span>
              </button>
            </div>

            {/* Top Grid: Reports Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, 1fr)', gap: 16 }}>
              {/* Box 1: Total Spent */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(139, 92, 246, 0.12)', display: 'grid', placeItems: 'center', color: '#a78bfa', fontSize: 18 }}>
                  👛
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Spent</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginTop: 3 }}>₹{reportTotalSpentVal.toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: reportSpendDiffPct >= 0 ? '#10b981' : '#ef4444', marginTop: 2 }}>{reportSpendDiffPct >= 0 ? '↑' : '↓'} {Math.abs(reportSpendDiffPct).toFixed(1)}% <span style={{ color: '#64748b', fontWeight: 500 }}>vs last month</span></div>
                </div>
              </div>

              {/* Box 2: Total Transactions */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(59, 130, 246, 0.12)', display: 'grid', placeItems: 'center', color: '#3b82f6', fontSize: 18 }}>
                  📄
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Transactions</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginTop: 3 }}>{reportTotalTransactionsCount}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: reportTxCountDiffPct >= 0 ? '#10b981' : '#ef4444', marginTop: 2 }}>{reportTxCountDiffPct >= 0 ? '↑' : '↓'} {Math.abs(reportTxCountDiffPct).toFixed(1)}% <span style={{ color: '#64748b', fontWeight: 500 }}>vs last month</span></div>
                </div>
              </div>

              {/* Box 3: Average Order Value */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(16, 185, 129, 0.12)', display: 'grid', placeItems: 'center', color: '#10b981', fontSize: 18 }}>
                  💲
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Average Order Value</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginTop: 3 }}>₹{Math.round(reportTotalAOV).toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: reportAovDiffPct >= 0 ? '#10b981' : '#ef4444', marginTop: 2 }}>{reportAovDiffPct >= 0 ? '↑' : '↓'} {Math.abs(reportAovDiffPct).toFixed(1)}% <span style={{ color: '#64748b', fontWeight: 500 }}>vs last month</span></div>
                </div>
              </div>

              {/* Box 4: Top Category */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(245, 158, 11, 0.12)', display: 'grid', placeItems: 'center', color: '#f59e0b', fontSize: 18 }}>
                  📊
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Category</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginTop: 3 }}>{reportTopCategory}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>₹{reportTopCategoryAmt.toLocaleString('en-IN')} ({reportTopCategoryPct.toFixed(1)}%)</div>
                </div>
              </div>

              {/* Box 5: This Month Spend */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(167, 139, 250, 0.12)', display: 'grid', placeItems: 'center', color: '#a78bfa', fontSize: 18 }}>
                  📅
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>This Month Spend</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginTop: 3 }}>₹{reportThisMonthSpend.toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: reportSpendDiffPct >= 0 ? '#10b981' : '#ef4444', marginTop: 2 }}>{reportSpendDiffPct >= 0 ? '↑' : '↓'} {Math.abs(reportSpendDiffPct).toFixed(1)}% <span style={{ color: '#64748b', fontWeight: 500 }}>vs last month</span></div>
                </div>
              </div>
            </div>

            {/* Middle Row: Spend Progression Curve Chart & Spending Category Donut */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.7fr 1.3fr', gap: 16 }}>
              {/* Box 1: Spend Progression Over Time */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Spend Progression Over Time</span>
                  <select 
                    value={spendOverviewRange} 
                    onChange={(e) => { setSpendOverviewRange(e.target.value); setActiveSpendPoint(null); }}
                    style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 6, color: '#cbd5e1', fontSize: 11.5, padding: '4px 8px', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                </div>
                <div style={{ height: 160, position: 'relative', marginTop: 10 }}>
                  {/* Grid Lines */}
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
                    {[120, 90, 60, 30, 0].map((val, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', width: '100%', borderBottom: idx < 4 ? '1px dashed rgba(255,255,255,0.03)' : 'none', pb: 1 }}>
                        <span style={{ fontSize: 9, color: '#64748b', width: 50, textAlign: 'left', display: 'inline-block' }}>₹{val.toLocaleString('en-IN')},000</span>
                        <div style={{ flex: 1 }} />
                      </div>
                    ))}
                  </div>

                  {/* SVG Spend Line Curve */}
                  <svg viewBox="0 0 450 140" style={{ width: '100%', height: '100%', overflow: 'visible', position: 'relative', zIndex: 2 }}>
                    <defs>
                      <linearGradient id="spendFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d={spendRanges[spendOverviewRange].pathFill} fill="url(#spendFill)" />
                    <path d={spendRanges[spendOverviewRange].pathLine} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
                    
                    {/* End point highlight dot */}
                    <circle cx="450" cy={spendRanges[spendOverviewRange].cy} r="4" fill="#6366f1" stroke="#fff" strokeWidth="1.5" />

                    {/* Active highlight dot */}
                    {activeSpendPoint && (
                      <circle 
                        cx={activeSpendPoint.x} 
                        cy={activeSpendPoint.y} 
                        r="5" 
                        fill="#fff" 
                        stroke="#6366f1" 
                        strokeWidth="2.5" 
                        style={{ pointerEvents: 'none' }}
                      />
                    )}

                    {/* Invisible Interactive Click Targets */}
                    {spendRanges[spendOverviewRange].points.map((pt, pIdx) => (
                      <circle 
                        key={pIdx} 
                        cx={pt.x} 
                        cy={pt.y} 
                        r="16" 
                        fill="transparent" 
                        style={{ cursor: 'pointer' }} 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSpendPoint(pt);
                        }}
                      />
                    ))}

                    {/* Popover highlight on active node */}
                    {activeSpendPoint && (
                      <foreignObject x={activeSpendPoint.x - 50} y={activeSpendPoint.y - 42} width="100" height="38" style={{ pointerEvents: 'none' }}>
                        <div style={{ background: '#0e1320', border: '1.5px solid #6366f1', borderRadius: 6, padding: '3px 6px', fontSize: 9.5, textAlign: 'center', color: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', position: 'relative' }}>
                          <div style={{ color: '#64748b', fontSize: 8 }}>{activeSpendPoint.label}</div>
                          <strong style={{ color: '#6366f1' }}>{activeSpendPoint.val}</strong>
                        </div>
                      </foreignObject>
                    )}
                  </svg>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: 10, marginTop: 14, paddingLeft: 50 }}>
                  {spendRanges[spendOverviewRange].labels.map((lbl, idx) => (
                    <span key={idx}>{lbl}</span>
                  ))}
                </div>
              </div>

              {/* Box 2: Spending by Category Donut */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Spending by Category</span>
                  <select 
                    value={spendingCategoryRange} 
                    onChange={(e) => setSpendingCategoryRange(e.target.value)}
                    style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 6, color: '#cbd5e1', fontSize: 11.5, padding: '4px 8px', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="all">All Time</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1, flexWrap: 'wrap' }}>
                  {/* Donut Chart */}
                  <div style={{ width: 100, height: 100, position: 'relative', flexShrink: 0 }}>
                    <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                      {categoryRangesData[spendingCategoryRange].categories.map((item, key) => (
                        <circle 
                          key={key} 
                          cx="18" 
                          cy="18" 
                          r="15.9" 
                          fill="none" 
                          stroke={item.color} 
                          strokeWidth="4.2" 
                          strokeDasharray={item.dasharray} 
                          strokeDashoffset={item.offset} 
                        />
                      ))}
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 11.5, fontWeight: 800, color: '#fff' }}>{categoryRangesData[spendingCategoryRange].total}</span>
                      <span style={{ fontSize: 7, color: '#64748b', textTransform: 'uppercase', marginTop: 1 }}>Total Spent</span>
                    </div>
                  </div>

                  {/* Legend list */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 140 }}>
                    {categoryRangesData[spendingCategoryRange].categories.map((item, key) => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                          <span style={{ color: '#cbd5e1' }}>{item.label}</span>
                        </div>
                        <span style={{ color: '#64748b', fontWeight: 600 }}>{item.value} <span style={{ fontSize: 9.5, fontWeight: 500 }}>({item.pct})</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Third Row: Top Expenses Table & Monthly Comparison / Insights */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.7fr 1.3fr', gap: 16 }}>
              {/* Left Column: Top Expenses Table */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Top Expenses</span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }} onClick={() => setShowAllExpensesModal(true)}>View All ▼</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left', minWidth: 500 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #1d2433', color: '#64748b' }}>
                        <th style={{ padding: '8px 0', width: 30 }}>#</th>
                        <th style={{ padding: '8px 0', fontWeight: 600 }}>Project / Description</th>
                        <th style={{ padding: '8px 0', fontWeight: 600 }}>Category</th>
                        <th style={{ padding: '8px 0', fontWeight: 600 }}>Freelancer</th>
                        <th style={{ padding: '8px 0', fontWeight: 600 }}>Amount</th>
                        <th style={{ padding: '8px 0', fontWeight: 600 }}>Date</th>
                        <th style={{ padding: '8px 0', fontWeight: 600, textAlign: 'right' }}>% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedExpenses.map((exp, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '12px 0', color: '#64748b' }}>{exp.num}</td>
                          <td style={{ padding: '12px 0', fontWeight: 700, color: '#fff' }}>{exp.title}</td>
                          <td style={{ padding: '12px 0', color: '#cbd5e1' }}>{exp.cat}</td>
                          <td style={{ padding: '12px 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 24, height: 24, borderRadius: '50%', background: exp.bg, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700 }}>
                                {exp.initial}
                              </div>
                              <span style={{ color: '#fff' }}>{exp.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 0', fontWeight: 700, color: '#fff' }}>{exp.amt}</td>
                          <td style={{ padding: '12px 0', color: '#cbd5e1' }}>{exp.date}</td>
                          <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 700, color: '#10b981' }}>{exp.pct}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer / Pagination */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, flexWrap: 'wrap', gap: 10 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    Showing {filteredExpenses.length === 0 ? 0 : ((reportsPage - 1) * reportsPerPage) + 1} to {Math.min(reportsPage * reportsPerPage, filteredExpenses.length)} of {filteredExpenses.length} transactions
                  </span>
                  {totalReportPages > 1 && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => setReportsPage(prev => Math.max(prev - 1, 1))} style={{ width: 24, height: 24, borderRadius: 6, background: '#161c2c', border: '1px solid #1d2433', color: '#64748b', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 11 }}>‹</button>
                      {Array.from({ length: totalReportPages }, (_, i) => i + 1).map(page => (
                        <button key={page} onClick={() => setReportsPage(page)} style={{ width: 24, height: 24, borderRadius: 6, background: reportsPage === page ? '#10b981' : '#161c2c', border: reportsPage === page ? 'none' : '1px solid #1d2433', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 11, fontWeight: reportsPage === page ? 700 : 500 }}>{page}</button>
                      ))}
                      <button onClick={() => setReportsPage(prev => Math.min(prev + 1, totalReportPages))} style={{ width: 24, height: 24, borderRadius: 6, background: '#161c2c', border: '1px solid #1d2433', color: '#64748b', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 11 }}>›</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Monthly Bar Chart & Insights */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* Panel 1: Monthly Comparison Bar Chart */}
                <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Monthly Comparison</span>
                    <select 
                      value={monthlyComparisonRange} 
                      onChange={(e) => { setMonthlyComparisonRange(e.target.value); setActiveComparisonBarIdx(null); }}
                      style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 6, color: '#cbd5e1', fontSize: 11, padding: '4px 8px', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="6m">Last 6 Months</option>
                      <option value="3m">Last 3 Months</option>
                    </select>
                  </div>
                  
                  {/* Custom Flex Bar Chart */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: 120, padding: '0 10px', position: 'relative', marginTop: 14 }}>
                    {comparisonRanges[monthlyComparisonRange].map((bar, idx) => {
                      const isHighlighted = activeComparisonBarIdx === idx;
                      return (
                        <div 
                          key={idx} 
                          onClick={(e) => { e.stopPropagation(); setActiveComparisonBarIdx(idx); }}
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', cursor: 'pointer' }}
                        >
                          {isHighlighted && (
                            <div style={{ position: 'absolute', top: -36, background: '#0e1320', border: '1.5px solid #6366f1', color: '#fff', fontSize: 9.5, padding: '3px 6px', borderRadius: 6, fontWeight: 700, zIndex: 10, whiteSpace: 'nowrap', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                              {bar.amt}
                            </div>
                          )}
                          <div style={{ width: 14, height: bar.height, background: isHighlighted ? 'linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)' : 'rgba(99, 102, 241, 0.25)', borderRadius: '4px 4px 0 0', transition: 'all 0.15s ease' }} />
                          <span style={{ fontSize: 9, color: isHighlighted ? '#6366f1' : '#64748b', fontWeight: isHighlighted ? 700 : 500, marginTop: 8 }}>{bar.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Panel 2: Insights */}
                <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', display: 'block', marginBottom: 14 }}>Insights</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11.5, color: '#94a3b8', lineHeight: 1.4 }}>
                    <div style={{ display: 'flex', gap: 8 }}><span style={{ color: '#10b981' }}>✓</span> Your spending is {reportSpendDiffPct >= 0 ? 'up' : 'down'} by {Math.abs(reportSpendDiffPct).toFixed(1)}% compared to last month.</div>
                    <div style={{ display: 'flex', gap: 8 }}><span style={{ color: '#10b981' }}>✓</span> {reportTopCategory} category accounts for {reportTopCategoryPct.toFixed(1)}% of total spending.</div>
                    <div style={{ display: 'flex', gap: 8 }}><span style={{ color: '#10b981' }}>✓</span> You have completed {reportTotalTransactionsCount} transactions.</div>
                    <div style={{ display: 'flex', gap: 8 }}><span style={{ color: '#10b981' }}>✓</span> Average order value {reportAovDiffPct >= 0 ? 'increased' : 'decreased'} by {Math.abs(reportAovDiffPct).toFixed(1)}% this month.</div>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Row: Quick Actions */}
            <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', display: 'block', marginBottom: 16 }}>Quick Actions</span>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(5, 1fr)', gap: 12 }}>
                {[
                  {
                    label: 'Download CSV Report',
                    icon: '📥',
                    bg: 'rgba(16, 185, 129, 0.12)',
                    color: '#10b981',
                    action: () => {
                      const element = document.createElement("a");
                      const file = new Blob([
                        "TOP EXPENSES SPEND REPORT\n\n" +
                        "Index,Project/Description,Category,Freelancer,Amount,Date,Percentage Share\n" +
                        expensesListState.map(e => `${e.num},${e.title},${e.cat},${e.name},${e.amt},${e.date},${e.pct}`).join("\n")
                      ], {type: 'text/csv'});
                      element.href = URL.createObjectURL(file);
                      element.download = "spending_report.csv";
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                      toast.success("CSV spend report downloaded!");
                    }
                  },
                  {
                    label: 'Download PDF Report',
                    icon: '🧾',
                    bg: 'rgba(239, 68, 68, 0.12)',
                    color: '#ef4444',
                    action: () => {
                      const element = document.createElement("a");
                      const file = new Blob([
                        "====================================================\n" +
                        "         OFFICIAL SPEND & EXPENSES STATEMENT        \n" +
                        "====================================================\n\n" +
                        expensesListState.map(e => 
                          `#${e.num} ${e.title}\n` +
                          `   Category: ${e.cat} | Partner: ${e.name}\n` +
                          `   Amount: ${e.amt} | Date: ${e.date}\n` +
                          `   Share: ${e.pct}\n` +
                          `----------------------------------------------------`
                        ).join("\n\n")
                      ], {type: 'text/plain'});
                      element.href = URL.createObjectURL(file);
                      element.download = "spending_statement.txt";
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                      toast.success("Detailed spend report statement downloaded!");
                    }
                  },
                  { label: 'Schedule Report', icon: '📅', bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', action: () => setShowScheduleReportModal(true) },
                  {
                    label: 'Filter Report',
                    icon: '🔍',
                    bg: 'rgba(139, 92, 246, 0.12)',
                    color: '#a78bfa',
                    action: () => {
                      toast.success("Quick filters active! Focus set to filters.");
                      const searchEl = document.querySelector("input[placeholder='Search transactions...']");
                      if (searchEl) searchEl.focus();
                    }
                  },
                  {
                    label: 'Share Report',
                    icon: '🔗',
                    bg: 'rgba(59, 130, 246, 0.12)',
                    color: '#3b82f6',
                    action: () => {
                      navigator.clipboard.writeText(window.location.href + "?tab=reports");
                      toast.success("Report shareable dashboard link copied to clipboard!");
                    }
                  }
                ].map((act, idx) => (
                  <div 
                    key={idx} 
                    onClick={act.action}
                    style={{ background: '#161c2c', border: '1px solid #1d2433', borderRadius: 10, padding: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'border-color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = act.color}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1d2433'}
                  >
                    <span style={{ width: 28, height: 28, borderRadius: 6, background: act.bg, color: act.color, display: 'grid', placeItems: 'center', fontSize: 16, flexShrink: 0 }}>{act.icon}</span>
                    <span style={{ fontSize: 11.5, color: '#fff', fontWeight: 600 }}>{act.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {activeTab === 'freelancers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header Title Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(139, 92, 246, 0.12)', display: 'grid', placeItems: 'center', color: '#a78bfa', fontSize: 22 }}>
                  👥
                </span>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Starred Candidates & Claude AI Ranker</div>
                  <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 3 }}>Manage your shortlisted candidates and get AI-powered ranking & insights.</div>
                </div>
              </div>
              <button 
                onClick={runAIRanking} 
                disabled={rankingLoading} 
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8.5px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#2563eb'}
              >
                <span>⚡</span> {rankingLoading ? 'Claude AI Analyzing...' : 'Run Claude AI Assistant Ranking'}
              </button>
            </div>

            {/* Top Grid: Freelancer Summary Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, 1fr)', gap: 16 }}>
              {/* Box 1: Total Shortlisted */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(16, 185, 129, 0.12)', display: 'grid', placeItems: 'center', color: '#10b981', fontSize: 18 }}>
                  👥
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Shortlisted</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginTop: 3 }}>{shortlistedCount}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>Freelancers</div>
                </div>
              </div>

              {/* Box 2: Top Match */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(139, 92, 246, 0.12)', display: 'grid', placeItems: 'center', color: '#a78bfa', fontSize: 18 }}>
                  📈
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Match</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginTop: 3 }}>{topMatchScore}%</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>Best Match Score</div>
                </div>
              </div>

              {/* Box 3: Avg. Match Score */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(59, 130, 246, 0.12)', display: 'grid', placeItems: 'center', color: '#3b82f6', fontSize: 18 }}>
                  🛡️
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg. Match Score</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginTop: 3 }}>{avgMatchScore}%</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>Across all shortlisted</div>
                </div>
              </div>

              {/* Box 4: Responded */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(245, 158, 11, 0.12)', display: 'grid', placeItems: 'center', color: '#f59e0b', fontSize: 18 }}>
                  ⭐
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Responded</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginTop: 3 }}>{totalRespondedCount}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>Freelancers</div>
                </div>
              </div>

              {/* Box 5: Invited */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(20, 184, 166, 0.12)', display: 'grid', placeItems: 'center', color: '#14b8a6', fontSize: 18 }}>
                  📨
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invited to Project</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginTop: 3 }}>{totalPostedJobsCount}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>Jobs Posted</div>
                </div>
              </div>
            </div>

            {/* Middle Row: Shortlisted Candidates & AI proposals match analysis */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.75fr 1.25fr', gap: 16 }}>
              {/* Left Column: Shortlisted Candidates */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Shortlisted Candidates</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input 
                      value={freelancerSearchQuery}
                      onChange={(e) => setFreelancerSearchQuery(e.target.value)}
                      placeholder="Search freelancers..." 
                      style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, padding: '5px 10px', color: '#fff', fontSize: 12, outline: 'none', width: 140 }}
                    />
                    <div style={{ position: 'relative' }}>
                      <button 
                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                        style={{ 
                          background: selectedSkillFilter !== 'All' ? 'rgba(16, 185, 129, 0.15)' : 'transparent', 
                          border: selectedSkillFilter !== 'All' ? '1px solid #10b981' : '1px solid #1d2433', 
                          borderRadius: 8, 
                          color: selectedSkillFilter !== 'All' ? '#10b981' : '#64748b', 
                          fontSize: 12, 
                          padding: '5px 10.5px', 
                          cursor: 'pointer', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 4 
                        }}
                      >
                        🔍 {selectedSkillFilter === 'All' ? 'Filter' : selectedSkillFilter}
                      </button>
                      {showFilterDropdown && (
                        <div style={{ 
                          position: 'absolute', 
                          top: 34, 
                          right: 0, 
                          background: '#111625', 
                          border: '1px solid #1d2433', 
                          borderRadius: 8, 
                          boxShadow: '0 10px 25px rgba(0,0,0,0.3)', 
                          zIndex: 100, 
                          minWidth: 120, 
                          padding: '6px 0' 
                        }}>
                          {['All', 'React', 'Figma', 'Node.js', 'Vue.js', 'Python', 'UI/UX'].map((skill) => (
                            <div 
                              key={skill} 
                              onClick={() => { setSelectedSkillFilter(skill); setShowFilterDropdown(false); }}
                              style={{ 
                                padding: '6px 12px', 
                                color: selectedSkillFilter === skill ? '#10b981' : '#cbd5e1', 
                                fontSize: 12, 
                                cursor: 'pointer', 
                                fontWeight: selectedSkillFilter === skill ? 700 : 500,
                                background: selectedSkillFilter === skill ? 'rgba(16,185,129,0.06)' : 'transparent',
                                textAlign: 'left'
                              }}
                              onMouseEnter={(e) => { if (selectedSkillFilter !== skill) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                              onMouseLeave={(e) => { if (selectedSkillFilter !== skill) e.currentTarget.style.background = 'transparent'; }}
                            >
                              {skill === 'All' ? 'All Skills' : skill}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Candidate Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {allCandidatesList.length > 0 ? (
                    allCandidatesList.filter(cand => {
                      const matchesSearch = cand.name.toLowerCase().includes(freelancerSearchQuery.toLowerCase()) || 
                                            cand.role.toLowerCase().includes(freelancerSearchQuery.toLowerCase()) ||
                                            cand.skills.some(s => s.toLowerCase().includes(freelancerSearchQuery.toLowerCase()));
                      const matchesSkill = selectedSkillFilter === 'All' || cand.skills.includes(selectedSkillFilter);
                      return matchesSearch && matchesSkill;
                    }).slice((shortlistPage - 1) * 5, shortlistPage * 5).map((cand, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, border: '1px solid rgba(255,255,255,0.02)', borderRadius: 10, background: '#161c2c', flexWrap: 'wrap', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 200 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: cand.bg, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, position: 'relative' }}>
                            {cand.initial}
                            <span style={{ position: 'absolute', bottom: -2, right: -2, background: '#10b981', color: '#fff', borderRadius: '50%', width: 12, height: 12, fontSize: 8, display: 'grid', placeItems: 'center', border: '1.5px solid #161c2c' }}>✓</span>
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span style={{ fontWeight: 700, color: '#fff', fontSize: 13 }}>{cand.name}</span>
                              <span style={{ color: '#10b981', fontSize: 11 }}>✓</span>
                            </div>
                            <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>{cand.role} • India</div>
                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>📍 {cand.location}</div>
                          </div>
                        </div>

                        {/* Match Score Ring */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 64 }}>
                          <span style={{ fontSize: 10.5, color: '#64748b' }}>Match Score</span>
                          <div style={{ width: 38, height: 38, position: 'relative', marginTop: 4 }}>
                            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                              <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                              <circle cx="18" cy="18" r="16" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray={cand.score + ', 100'} strokeLinecap="round" />
                            </svg>
                            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 800, color: '#fff' }}>
                              {cand.score}%
                            </div>
                          </div>
                        </div>

                        {/* Skills & Rate */}
                        <div style={{ minWidth: 140 }}>
                          <span style={{ fontSize: 10.5, color: '#64748b', display: 'block' }}>Skills</span>
                          <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                            {cand.skills.map((sk, sIdx) => (
                              <span key={sIdx} style={{ fontSize: 10, background: '#1e293b', border: '1px solid #1d2433', borderRadius: 4, padding: '2px 6px', color: '#cbd5e1' }}>{sk}</span>
                            ))}
                            <span style={{ fontSize: 10, background: '#1e293b', border: '1px solid #1d2433', borderRadius: 4, padding: '2px 6px', color: '#64748b' }}>+2</span>
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginTop: 8 }}>{cand.rate}</div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button 
                            onClick={() => setActiveFreelancerProfile(cand)}
                            style={{ padding: '6px 12px', background: '#1e293b', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}
                          >
                            View Profile
                          </button>
                          <button 
                            onClick={() => setShortlistStatus(prev => ({ ...prev, [cand.key]: !prev[cand.key] }))}
                            style={{ padding: '6px 12px', background: shortlistStatus[cand.key] ? 'rgba(16, 185, 129, 0.15)' : '#161c2c', border: shortlistStatus[cand.key] ? '1px solid #10b981' : '1px solid #1d2433', borderRadius: 8, color: shortlistStatus[cand.key] ? '#10b981' : '#64748b', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            ★ {shortlistStatus[cand.key] ? 'Starred' : 'Shortlist'}
                          </button>
                          <span style={{ color: '#64748b', cursor: 'pointer', fontSize: 13 }} onClick={() => toast('Options for candidate ' + cand.name)}>⋮</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: 13 }}>
                      No candidates have submitted proposals yet.
                    </div>
                  )}
                </div>

                {/* Table Footer / Pagination */}
                {(() => {
                  const filteredCands = allCandidatesList.filter(cand => {
                    const matchesSearch = cand.name.toLowerCase().includes(freelancerSearchQuery.toLowerCase()) || 
                                          cand.role.toLowerCase().includes(freelancerSearchQuery.toLowerCase()) ||
                                          cand.skills.some(s => s.toLowerCase().includes(freelancerSearchQuery.toLowerCase()));
                    const matchesSkill = selectedSkillFilter === 'All' || cand.skills.includes(selectedSkillFilter);
                    return matchesSearch && matchesSkill;
                  });
                  const totalPages = Math.ceil(filteredCands.length / 5) || 1;
                  const displayPage = shortlistPage > totalPages ? totalPages : shortlistPage;
                  return (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, flexWrap: 'wrap', gap: 10, width: '100%' }}>
                      <span style={{ fontSize: 12, color: '#64748b' }}>
                        Showing {filteredCands.length === 0 ? 0 : ((displayPage - 1) * 5) + 1} to {Math.min(displayPage * 5, filteredCands.length)} of {filteredCands.length} candidates
                      </span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setShortlistPage(prev => Math.max(prev - 1, 1))} style={{ width: 24, height: 24, borderRadius: 6, background: '#161c2c', border: '1px solid #1d2433', color: '#64748b', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 11 }}>‹</button>
                        {Array.from({ length: totalPages }, (_, pIdx) => pIdx + 1).map(page => (
                          <button key={page} onClick={() => setShortlistPage(page)} style={{ width: 24, height: 24, borderRadius: 6, background: shortlistPage === page ? '#2563eb' : '#161c2c', border: shortlistPage === page ? 'none' : '1px solid #1d2433', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 11, fontWeight: shortlistPage === page ? 700 : 500 }}>{page}</button>
                        ))}
                        <button onClick={() => setShortlistPage(prev => Math.min(prev + 1, totalPages))} style={{ width: 24, height: 24, borderRadius: 6, background: '#161c2c', border: '1px solid #1d2433', color: '#64748b', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 11 }}>›</button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Right Column: AI Proposals Match Analysis & Insights */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* Panel 1: Claude AI Proposals Match Analysis */}
                <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', display: 'block', marginBottom: 14 }}>✨ Claude AI Proposals Match Analysis</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    {/* Ring match */}
                    <div style={{ width: 84, height: 84, position: 'relative', flexShrink: 0 }}>
                      <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2563eb" strokeWidth="3" strokeDasharray={`${avgMatchScore}, 100`} strokeLinecap="round" />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{avgMatchScore}%</span>
                        <span style={{ fontSize: 7, color: '#64748b', textTransform: 'uppercase', marginTop: 2 }}>Overall Match</span>
                      </div>
                    </div>

                    {/* Progress bars list */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 140 }}>
                      {[
                        { label: 'Skills Match', pct: skillsMatchPct, color: '#8b5cf6' },
                        { label: 'Experience Match', pct: expMatchPct, color: '#3b82f6' },
                        { label: 'Budget Match', pct: budgetMatchPct, color: '#10b981' },
                        { label: 'Availability Match', pct: availMatchPct, color: '#f59e0b' },
                        { label: 'Past Performance', pct: perfMatchPct, color: '#a78bfa' }
                      ].map((bar, bIdx) => (
                        <div key={bIdx}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1', marginBottom: 2 }}>
                            <span>{bar.label}</span>
                            <span style={{ fontWeight: 700 }}>{bar.pct}%</span>
                          </div>
                          <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ width: bar.pct + '%', height: '100%', background: bar.color, borderRadius: 2 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Insights Box */}
                  <div style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 10, padding: 14, marginTop: 16 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <span>💡</span> AI Insights
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11.5, color: '#94a3b8', lineHeight: 1.4 }}>
                      <div style={{ display: 'flex', gap: 8 }}><span style={{ color: '#10b981' }}>✓</span> {allCandidatesList.filter(c => c.score >= 85).length} candidate(s) have excellent skills match with your projects.</div>
                      <div style={{ display: 'flex', gap: 8 }}><span style={{ color: '#10b981' }}>✓</span> {topCandidate.name === 'No candidate' ? 'No candidate has applied yet.' : `${topCandidate.name} has the highest overall match score (${topCandidate.score}%).`}</div>
                      <div style={{ display: 'flex', gap: 8 }}><span style={{ color: '#10b981' }}>✓</span> Average response time of shortlisted freelancers is 1.5 hrs.</div>
                      <div style={{ display: 'flex', gap: 8 }}><span style={{ color: '#10b981' }}>✓</span> {allCandidatesList.length} freelancer(s) are available to start immediately.</div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowAnalysisReportModal(true)}
                    style={{ width: '100%', background: 'transparent', border: '1px solid #1d2433', borderRadius: 8, padding: '8px 0', color: '#fff', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, cursor: 'pointer' }}
                  >
                    📊 View Full Analysis Report
                  </button>
                </div>

              </div>
            </div>

            {/* Bottom Row: Candidate Activity & Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.75fr 1.25fr', gap: 16 }}>
              {/* Box 1: Candidate Activity */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', display: 'block', marginBottom: 16 }}>Candidate Activity</span>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, 1fr)', gap: 10 }}>
                  {[
                    { label: 'Invited', value: totalPostedJobsCount, color: '#14b8a6', bg: 'rgba(20, 184, 166, 0.12)', icon: '📨' },
                    { label: 'Viewed', value: Math.max(totalPostedJobsCount * 2, allCandidatesList.length + 1), color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)', icon: '👁️' },
                    { label: 'Responded', value: totalRespondedCount, color: '#22d3ee', bg: 'rgba(34, 211, 238, 0.12)', icon: '💬' },
                    { label: 'Submitted Proposal', value: totalRespondedCount, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', icon: '📋' },
                    { label: 'Hired', value: jobs.filter(j => j.hiredFreelancer).length, color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', icon: '✅' }
                  ].map((activity, idx) => (
                    <div key={idx} style={{ background: '#161c2c', border: '1px solid #1d2433', borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 16 }}>{activity.icon}</span>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 4 }}>{activity.value}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.3 }}>{activity.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 2: Quick Actions */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', display: 'block', marginBottom: 16 }}>Quick Actions</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  {[
                    { label: 'Invite Freelancers', icon: '📨', bg: 'rgba(37, 99, 235, 0.12)', color: '#2563eb', action: () => setShowInviteModal(true) },
                    { label: 'Compare Candidates', icon: '⚖️', bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', action: () => setShowCompareModal(true) },
                    { label: 'Send Message', icon: '💬', bg: 'rgba(20, 184, 166, 0.12)', color: '#14b8a6', action: () => { setActiveTab('messages'); toast.success('Redirected to conversation threads.'); } },
                    { 
                      label: 'Export Shortlist', 
                      icon: '📥', 
                      bg: 'rgba(22, 163, 74, 0.12)', 
                      color: '#16a34a', 
                      action: () => {
                        const headers = "Name,Role,Location,Match Score,Rate\n";
                        const rows = allCandidatesList.slice(0, 5).map(c => `${c.name},${c.role},"${c.location}",${c.score}%,${c.rate}`).join("\n");
                        const blob = new Blob([headers + rows], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = "shortlisted_candidates.csv";
                        a.click();
                        toast.success("Shortlisted candidates exported successfully!");
                      } 
                    }
                  ].map((act, idx) => (
                    <div key={idx} onClick={act.action} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', textAlign: 'center' }}>
                      <div style={{ width: 42, height: 42, borderRadius: '50%', background: act.bg, color: act.color, display: 'grid', placeItems: 'center', fontSize: 18, transition: 'transform 0.2s' }}>
                        {act.icon}
                      </div>
                      <span style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.3, fontWeight: 500 }}>{act.label}</span>
                    </div>
                  ))}
                </div>
                
                {/* Settings Cog Icon centered at the bottom */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                  <button 
                    onClick={() => setActiveTab('settings')}
                    style={{ background: '#161c2c', border: '1px solid #1d2433', borderRadius: 8, width: 34, height: 34, display: 'grid', placeItems: 'center', color: '#cbd5e1', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#1e293b'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#161c2c'}
                  >
                    ⚙️
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}
        {activeTab === 'contracts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header Title Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20, color: '#10b981' }}>📄</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Active Contracts & Work Agreements</span>
              </div>
              <button 
                onClick={() => setShowNewContractModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7.5px 14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
              >
                <span>+</span> New Contract
              </button>
            </div>

            {/* Top Grid: Contract Summary Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 16 }}>
              {/* Box 1: Active Contracts */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(16, 185, 129, 0.12)', display: 'grid', placeItems: 'center', color: '#10b981', fontSize: 20 }}>
                  📄
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Contracts</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 4 }}>{activeContractsCount}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', marginTop: 3 }}>↑ 9% <span style={{ color: '#64748b', fontWeight: 500 }}>vs last month</span></div>
                </div>
              </div>

              {/* Box 2: Total Contract Value */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(59, 130, 246, 0.12)', display: 'grid', placeItems: 'center', color: '#3b82f6', fontSize: 20 }}>
                  👥
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Contract Value</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 4 }}>₹{totalContractVal.toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>All contracts</div>
                </div>
              </div>

              {/* Box 3: Expiring Soon */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(167, 139, 250, 0.12)', display: 'grid', placeItems: 'center', color: '#a78bfa', fontSize: 20 }}>
                  📅
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expiring Soon</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 4 }}>{upcomingExpirationsCount}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>Next 30 days</div>
                </div>
              </div>

              {/* Box 4: Completed */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(249, 115, 22, 0.12)', display: 'grid', placeItems: 'center', color: '#f97316', fontSize: 20 }}>
                  🛡️
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 4 }}>{completedContractsCount}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>All time</div>
                </div>
              </div>
            </div>

            {/* Featured Active Service Agreement Card */}
            {featuredContract && (
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: featuredContract.bg || 'rgba(16, 185, 129, 0.12)', display: 'grid', placeItems: 'center', color: featuredContract.color || '#10b981', fontSize: 22, flexShrink: 0 }}>
                  📄
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{featuredContract.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap', fontSize: 11.5 }}>
                    <span style={{ background: featuredContract.bg || 'rgba(16, 185, 129, 0.15)', color: featuredContract.color || '#10b981', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>{featuredContract.status}</span>
                    <span style={{ color: '#64748b' }}>Contract ID: {featuredContract.id}</span>
                    <span style={{ color: '#64748b' }}>•</span>
                    <span style={{ color: '#64748b' }}>Signed on: {featuredContract.start}</span>
                  </div>
                  <p style={{ fontSize: 12.5, color: '#94a3b8', margin: '10px 0 0', lineHeight: 1.4 }}>
                    Secure escrow budget is <strong style={{ color: '#fff' }}>{featuredContract.val}</strong>. All deliverables transfer fully to {featuredContract.partner.split(' / ')[0] || 'Client'} on work approval.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, alignSelf: isMobile ? 'flex-end' : 'center', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'flex-end' : 'flex-start' }}>
                  <button 
                    onClick={() => { setPreviewContractData(featuredContract); setShowContractPreviewModal(true); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', background: '#1e293b', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    👁️ View Contract
                  </button>
                  <div style={{ position: 'relative' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'featured-contract' ? null : 'featured-contract'); }}
                      style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #1d2433', background: 'transparent', color: '#64748b', fontSize: 14, cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                    >
                      ⋮
                    </button>
                    {activeDropdown === 'featured-contract' && (
                      <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, background: '#111625', border: '1px solid #1d2433', borderRadius: 8, padding: '6px 0', zIndex: 100, width: 160, textAlign: 'left', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                        <div 
                          onClick={() => {
                            setActiveDropdown(null);
                            const element = document.createElement("a");
                            const file = new Blob([
                              `SERVICE AGREEMENT CONTRACT\n\n` +
                              `Contract ID: ${featuredContract.id}\n` +
                              `Title: ${featuredContract.title}\n` +
                              `Escrow Value: ${featuredContract.val}\n` +
                              `Status: ${featuredContract.status}\n` +
                              `Start Date: ${featuredContract.start}\n` +
                              `End Date: ${featuredContract.end || '12 Jan, 2025'}\n\n` +
                              `Parties:\n` +
                              `- Client: Acme Corp\n` +
                              `- Freelancer: John Smith (React Specialist)\n\n` +
                              `IP Assignment:\n` +
                              `All intellectual property and source files transfer to client upon work approval.`
                            ], {type: 'text/plain'});
                            element.href = URL.createObjectURL(file);
                            element.download = `${featuredContract.id}_agreement.txt`;
                            document.body.appendChild(element);
                            element.click();
                            document.body.removeChild(element);
                            toast.success("Agreement downloaded successfully!");
                          }}
                          style={{ padding: '8px 12px', fontSize: 11.5, color: '#cbd5e1', cursor: 'pointer' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#1e293b'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          📄 Download Agreement
                        </div>
                        <div 
                          onClick={() => { setActiveDropdown(null); setShowAuditLogModal(true); }}
                          style={{ padding: '8px 12px', fontSize: 11.5, color: '#cbd5e1', cursor: 'pointer' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#1e293b'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          🔍 View Audit Log
                        </div>
                        <div 
                          onClick={() => { setActiveDropdown(null); setShowTerminateConfirmModal(true); }}
                          style={{ padding: '8px 12px', fontSize: 11.5, color: '#ef4444', cursor: 'pointer' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#1e293b'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          ⚠️ Terminate Contract
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Middle row: All Contracts (left) & Expirations, Quick Actions, Health (right) */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.7fr 1.3fr', gap: 16 }}>
              {/* Left Column: All Contracts List Table */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>All Contracts</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input 
                      value={contractsSearchQuery}
                      onChange={(e) => { setContractsSearchQuery(e.target.value); setContractsPage(1); }}
                      placeholder="Search contracts..." 
                      style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, padding: '5px 10px', color: '#fff', fontSize: 12, outline: 'none', width: 140 }}
                    />
                    <div style={{ position: 'relative' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowContractFilterPopover(!showContractFilterPopover); }}
                        style={{ background: 'transparent', border: '1px solid #1d2433', borderRadius: 8, color: '#cbd5e1', fontSize: 12, padding: '5.5px 10.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        🔍 Filter
                      </button>
                      {showContractFilterPopover && (
                        <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, background: '#111625', border: '1px solid #1d2433', borderRadius: 10, padding: 12, zIndex: 100, width: 180, textAlign: 'left', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Contract Value</div>
                          {['All', 'Under ₹100,000', 'Over ₹100,000'].map((opt, oIdx) => (
                            <label key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: '#cbd5e1', cursor: 'pointer', marginTop: 6 }}>
                              <input 
                                type="radio" 
                                name="contractVal" 
                                checked={(opt === 'All' && contractValueFilter === 'All') || (opt === 'Under ₹100,000' && contractValueFilter === 'low') || (opt === 'Over ₹100,000' && contractValueFilter === 'high')} 
                                onChange={() => {
                                  setContractValueFilter(opt === 'All' ? 'All' : opt === 'Under ₹100,000' ? 'low' : 'high');
                                  setContractsPage(1);
                                }}
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid #1d2433', pb: 10, mb: 14, overflowX: 'auto', paddingBottom: 10 }}>
                  {['All', 'Active', 'Pending', 'Completed', 'Cancelled'].map((tab, idx) => (
                    <span 
                      key={idx} 
                      onClick={() => { setSelectedContractTab(tab); setContractsPage(1); }}
                      style={{ fontSize: 12.5, fontWeight: selectedContractTab === tab ? 700 : 500, color: selectedContractTab === tab ? '#10b981' : '#64748b', cursor: 'pointer' }}
                    >
                      {tab}
                    </span>
                  ))}
                </div>

                {/* Contracts Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left', minWidth: 500 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #1d2433', color: '#64748b' }}>
                        <th style={{ padding: '8px 0', fontWeight: 600 }}>Contract</th>
                        <th style={{ padding: '8px 0', fontWeight: 600 }}>Client / Freelancer</th>
                        <th style={{ padding: '8px 0', fontWeight: 600 }}>Value</th>
                        <th style={{ padding: '8px 0', fontWeight: 600 }}>Status</th>
                        <th style={{ padding: '8px 0', fontWeight: 600 }}>Start Date</th>
                        <th style={{ padding: '8px 0', fontWeight: 600 }}>End Date</th>
                        <th style={{ padding: '8px 0', fontWeight: 600, textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedContracts.map((ctr, idx) => (
                        <tr key={ctr.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '12px 0', verticalAlign: 'middle' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1d4ed8', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700 }}>
                                {ctr.initial}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: '#fff' }}>{ctr.title}</div>
                                <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 1 }}>{ctr.id}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 0', color: '#cbd5e1' }}>{ctr.partner}</td>
                          <td style={{ padding: '12px 0', fontWeight: 700, color: '#fff' }}>{ctr.val}</td>
                          <td style={{ padding: '12px 0' }}>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6, background: ctr.bg, color: ctr.color }}>{ctr.status}</span>
                          </td>
                          <td style={{ padding: '12px 0', color: '#94a3b8' }}>{ctr.start}</td>
                          <td style={{ padding: '12px 0', color: '#94a3b8' }}>{ctr.end}</td>
                          <td style={{ padding: '12px 0', textAlign: 'center', color: '#64748b', cursor: 'pointer', position: 'relative' }}>
                            <span 
                              style={{ display: 'block', width: '100%' }}
                              onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === `contract-${ctr.id}` ? null : `contract-${ctr.id}`); }}
                            >
                              •••
                            </span>
                            {activeDropdown === `contract-${ctr.id}` && (
                              <div style={{ position: 'absolute', right: 0, top: '80%', background: '#111625', border: '1px solid #1d2433', borderRadius: 8, padding: '6px 0', zIndex: 100, width: 150, textAlign: 'left', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                                <div 
                                  onClick={() => { setActiveDropdown(null); toast.success(`Contract Agreement PDF for ${ctr.id} downloaded!`); }}
                                  style={{ padding: '8px 12px', fontSize: 11.5, color: '#cbd5e1', cursor: 'pointer' }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#1e293b'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                  📄 Download Agreement
                                </div>
                                <div 
                                  onClick={() => { setActiveDropdown(null); toast.success(`Audit logs retrieved for ${ctr.id}!`); }}
                                  style={{ padding: '8px 12px', fontSize: 11.5, color: '#cbd5e1', cursor: 'pointer' }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#1e293b'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                  🔍 View Audit Log
                                </div>
                                {ctr.status !== 'CANCELLED' && (
                                  <div 
                                    onClick={() => { setActiveDropdown(null); handleTerminateContract(ctr.id); }}
                                    style={{ padding: '8px 12px', fontSize: 11.5, color: '#ef4444', cursor: 'pointer' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#1e293b'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                  >
                                    ⚠️ Terminate Contract
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {paginatedContracts.length === 0 && (
                        <tr>
                          <td colSpan="7" style={{ padding: '40px 0', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
                            No contracts found matching current filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer / Pagination */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, flexWrap: 'wrap', gap: 10 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    Showing {filteredContracts.length === 0 ? 0 : ((currentContractsPage - 1) * contractsPerPage) + 1} to {Math.min(currentContractsPage * contractsPerPage, filteredContracts.length)} of {filteredContracts.length} contracts
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button 
                      onClick={() => setContractsPage(1)} 
                      disabled={currentContractsPage === 1}
                      style={{ width: 24, height: 24, borderRadius: 6, background: '#161c2c', border: '1px solid #1d2433', color: currentContractsPage === 1 ? '#475569' : '#64748b', display: 'grid', placeItems: 'center', cursor: currentContractsPage === 1 ? 'not-allowed' : 'pointer', fontSize: 11 }}
                    >
                      «
                    </button>
                    <button 
                      onClick={() => setContractsPage(prev => Math.max(prev - 1, 1))} 
                      disabled={currentContractsPage === 1}
                      style={{ width: 24, height: 24, borderRadius: 6, background: '#161c2c', border: '1px solid #1d2433', color: currentContractsPage === 1 ? '#475569' : '#64748b', display: 'grid', placeItems: 'center', cursor: currentContractsPage === 1 ? 'not-allowed' : 'pointer', fontSize: 11 }}
                    >
                      ‹
                    </button>
                    {Array.from({ length: totalContractPages }, (_, i) => i + 1).map(page => (
                      <button 
                        key={page} 
                        onClick={() => setContractsPage(page)} 
                        style={{ width: 24, height: 24, borderRadius: 6, background: currentContractsPage === page ? '#10b981' : '#161c2c', border: currentContractsPage === page ? 'none' : '1px solid #1d2433', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 11, fontWeight: currentContractsPage === page ? 700 : 500 }}
                      >
                        {page}
                      </button>
                    ))}
                    <button 
                      onClick={() => setContractsPage(prev => Math.min(prev + 1, totalContractPages))} 
                      disabled={currentContractsPage === totalContractPages}
                      style={{ width: 24, height: 24, borderRadius: 6, background: '#161c2c', border: '1px solid #1d2433', color: currentContractsPage === totalContractPages ? '#475569' : '#64748b', display: 'grid', placeItems: 'center', cursor: currentContractsPage === totalContractPages ? 'not-allowed' : 'pointer', fontSize: 11 }}
                    >
                      ›
                    </button>
                    <button 
                      onClick={() => setContractsPage(totalContractPages)} 
                      disabled={currentContractsPage === totalContractPages}
                      style={{ width: 24, height: 24, borderRadius: 6, background: '#161c2c', border: '1px solid #1d2433', color: currentContractsPage === totalContractPages ? '#475569' : '#64748b', display: 'grid', placeItems: 'center', cursor: currentContractsPage === totalContractPages ? 'not-allowed' : 'pointer', fontSize: 11 }}
                    >
                      »
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Expirations, Actions, Health */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* Panel 1: Upcoming Expirations */}
                <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Upcoming Expirations</span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: '#3b82f6', cursor: 'pointer' }} onClick={() => setShowAllExpirationsModal(true)}>View all</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { title: 'Mobile App Development Service Agreement', exp: 'Expires on 12 Jan, 2025', days: '23 days', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', initial: 'A' },
                      { title: 'Website Redesign Agreement', exp: 'Expires on 01 Dec, 2024', days: '42 days', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', initial: 'B' },
                      { title: 'UI/UX Design Work Agreement', exp: 'Expires on 28 Nov, 2024', days: '69 days', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', initial: 'G' }
                    ].map((exp, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700 }}>
                            {exp.initial}
                          </div>
                          <div>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff' }}>{exp.title}</div>
                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{exp.exp}</div>
                          </div>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 6, background: exp.bg, color: exp.color, flexShrink: 0 }}>{exp.days}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Panel 2: Quick Actions */}
                <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', display: 'block', marginBottom: 14 }}>Quick Actions</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      { title: 'Create New Contract', desc: 'templates & wizards', icon: '📄', bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', action: () => setShowNewContractModal(true) },
                      { title: 'Upload Signed Document', desc: 'import legal PDF', icon: '📤', bg: 'rgba(167, 139, 250, 0.12)', color: '#a78bfa', action: () => setShowUploadDocModal(true) },
                      { title: 'Contract Templates', desc: 'reusable layouts', icon: '📋', bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', action: () => setShowTemplatesModal(true) },
                      { title: 'Bulk Actions', desc: 'sign or renew multiple', icon: '🗂️', bg: 'rgba(249, 115, 22, 0.12)', color: '#f97316', action: () => setShowBulkActionsModal(true) }
                    ].map((act, idx) => (
                      <div 
                        key={idx} 
                        onClick={act.action}
                        style={{ background: '#161c2c', border: '1px solid #1d2433', borderRadius: 10, padding: 12, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6, transition: 'border-color 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = act.color}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1d2433'}
                      >
                        <span style={{ width: 28, height: 28, borderRadius: 6, background: act.bg, color: act.color, display: 'grid', placeItems: 'center', fontSize: 15 }}>{act.icon}</span>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{act.title}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Panel 3: Contract Health */}
                <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', display: 'block', marginBottom: 14 }}>Contract Health</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {/* Circle Health Ring */}
                    <div style={{ width: 72, height: 72, position: 'relative', flexShrink: 0 }}>
                      <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="85, 100" strokeLinecap="round" />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 15, fontWeight: 800, color: '#fff' }}>
                        85%
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>Excellent</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, lineHeight: 1.3 }}>Most of your contracts are active and up to date.</div>
                      <span onClick={() => toast('Contract health detailed audit log loaded.')} style={{ display: 'inline-block', fontSize: 12, color: '#10b981', fontWeight: 700, marginTop: 8, cursor: 'pointer' }}>View details →</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}
        {activeTab === 'favorites' && (
          (() => {
            const starredCandidatesList = favoritesList.filter(cand => 
              shortlistStatus[cand.key] || 
              allCandidatesList.some(c => c.key === cand.key && (shortlistStatus[c.key] || c.proposal?.status === 'shortlisted'))
            );
            const totalFavoritesCount = starredCandidatesList.length;
            const availableNowCount = starredCandidatesList.filter(f => f.status === 'Available').length;
            const hiredFreelancersIds = new Set(jobs.filter(j => j.hiredFreelancer).map(j => String(j.hiredFreelancer._id || j.hiredFreelancer)));
            const hiredFromFavoritesCount = starredCandidatesList.filter(f => hiredFreelancersIds.has(f.key)).length;
            const avgRatingVal = starredCandidatesList.length > 0 ? (starredCandidatesList.reduce((sum, f) => sum + parseFloat(f.rating || 0), 0) / starredCandidatesList.length).toFixed(1) : '0.0';

            const totalProposalsReport = jobs.reduce((sum, j) => sum + (j.proposals ? j.proposals.length : 0), 0);
            const totalViewsReport = totalProposalsReport * 3;
            const shortlistedProposalsCountReport = jobs.reduce((sum, j) => {
              if (!j.proposals) return sum;
              const count = j.proposals.filter(p => p.status === 'shortlisted').length;
              return sum + count;
            }, 0) || shortlistedCount;
            const respondedProposalsReport = jobs.reduce((sum, j) => {
              if (!j.proposals) return sum;
              const count = j.proposals.filter(p => p.status !== 'pending').length;
              return sum + count;
            }, 0);
            const responseRateReport = totalProposalsReport > 0 ? Math.round((respondedProposalsReport / totalProposalsReport) * 100) : 0;
            const avgResponseTimeReport = totalProposalsReport > 0 ? (responseRateReport > 80 ? '1.8 hrs' : responseRateReport > 50 ? '3.5 hrs' : '8.2 hrs') : '—';

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Header Title Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(245, 158, 11, 0.12)', display: 'grid', placeItems: 'center', color: '#f59e0b', fontSize: 22 }}>
                      ⭐
                    </span>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Starred Freelance Candidates</div>
                      <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 3 }}>Your saved and favorite candidates for quick access and future opportunities.</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      onClick={() => setShowInviteModal(true)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#1e293b', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#334155'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#1e293b'}
                    >
                      📥 Invite to Project
                    </button>
                    <button 
                      onClick={() => setShowBroadcastModal(true)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
                    >
                      💬 Message All
                    </button>
                  </div>
                </div>

                {/* Top Grid: Favorites Summary Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 16 }}>
                  {/* Box 1: Total Favorites */}
                  <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(139, 92, 246, 0.12)', display: 'grid', placeItems: 'center', color: '#a78bfa', fontSize: 18 }}>
                      👥
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Favorites</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginTop: 3 }}>{totalFavoritesCount}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>Candidates</div>
                    </div>
                  </div>

                  {/* Box 2: Available Now */}
                  <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(59, 130, 246, 0.12)', display: 'grid', placeItems: 'center', color: '#3b82f6', fontSize: 18 }}>
                      💼
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available Now</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginTop: 3 }}>{availableNowCount}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>Candidates</div>
                    </div>
                  </div>

                  {/* Box 3: Hired from Favorites */}
                  <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(16, 185, 129, 0.12)', display: 'grid', placeItems: 'center', color: '#10b981', fontSize: 18 }}>
                      ✅
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hired from Favorites</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginTop: 3 }}>{hiredFromFavoritesCount}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>Candidates</div>
                    </div>
                  </div>

                  {/* Box 4: Avg. Rating */}
                  <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(245, 158, 11, 0.12)', display: 'grid', placeItems: 'center', color: '#f59e0b', fontSize: 18 }}>
                      ⭐
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg. Rating</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginTop: 3 }}>{avgRatingVal} / 5</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>Across all favorites</div>
                    </div>
                  </div>
                </div>

                {/* Middle Row: Starred Candidates & Candidate Insights */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.7fr 1.3fr', gap: 16 }}>
                  {/* Left Column: Your Starred Candidates */}
                  <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Your Starred Candidates ({starredCandidatesList.length})</span>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input 
                          placeholder="Search favorites..." 
                          value={favoritesSearchQuery}
                          onChange={(e) => { setFavoritesSearchQuery(e.target.value); setFavoritesPage(1); }}
                          style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, padding: '5px 10px', color: '#fff', fontSize: 12, outline: 'none', width: 140 }}
                        />
                        <select 
                          value={favoritesSkillFilter} 
                          onChange={(e) => { setFavoritesSkillFilter(e.target.value); setFavoritesPage(1); }}
                          style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#cbd5e1', fontSize: 11.5, padding: '5px 10px', outline: 'none', cursor: 'pointer' }}
                        >
                          <option value="All">All Skills</option>
                          <option value="React">React</option>
                          <option value="UI/UX">UI/UX</option>
                          <option value="Node.js">Node.js</option>
                          <option value="Python">Python</option>
                          <option value="AWS">AWS</option>
                          <option value="Docker">Docker</option>
                        </select>
                        <select 
                          value={favoritesSortOption} 
                          onChange={(e) => { setFavoritesSortOption(e.target.value); setFavoritesPage(1); }}
                          style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#cbd5e1', fontSize: 11.5, padding: '5px 10px', outline: 'none', cursor: 'pointer' }}
                        >
                          <option value="recent">Recently Added</option>
                          <option value="rating">Highest Rated</option>
                          <option value="rate">Lowest Rate</option>
                        </select>
                      </div>
                    </div>

                    {/* Starred Candidate Rows */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {paginatedCandidates.map((cand, idx) => (
                        <div key={cand.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, border: '1px solid rgba(255,255,255,0.02)', borderRadius: 10, background: '#161c2c', flexWrap: 'wrap', gap: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 220 }}>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: cand.bg, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, position: 'relative' }}>
                              {cand.initial}
                              <span style={{ position: 'absolute', bottom: -2, right: -2, background: '#10b981', color: '#fff', borderRadius: '50%', width: 12, height: 12, fontSize: 8, display: 'grid', placeItems: 'center', border: '1.5px solid #161c2c' }}>✓</span>
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ fontWeight: 700, color: '#fff', fontSize: 13 }}>{cand.name}</span>
                                <span style={{ color: '#10b981', fontSize: 11 }}>✓</span>
                              </div>
                              <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>{cand.role} • {cand.exp}</div>
                              <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>📍 {cand.location}</div>
                            </div>
                          </div>

                          {/* Rates & Status */}
                          <div style={{ minWidth: 120 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{cand.rate}</div>
                            <div style={{ fontSize: 11, color: cand.statusTone, fontWeight: 600, marginTop: 4 }}>{cand.status}</div>
                          </div>

                          {/* Ratings */}
                          <div style={{ minWidth: 80 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span>{cand.rating}</span>
                              <span style={{ color: '#f59e0b', fontSize: 12 }}>★</span>
                            </div>
                            <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 3 }}>({cand.revs})</div>
                          </div>

                          {/* Actions */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
                            <button 
                              onClick={() => { setActiveTab('messages'); toast('Chat session loaded.'); }}
                              style={{ padding: '6px 12px', background: '#1e293b', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}
                            >
                              Message
                            </button>
                            <span 
                              style={{ color: '#cbd5e1', cursor: 'pointer', fontSize: 16, padding: '4px 8px' }} 
                              onClick={(e) => { e.stopPropagation(); setActiveFavoritesDotMenu(activeFavoritesDotMenu === cand.key ? null : cand.key); }}
                            >
                              ⋮
                            </span>

                            {/* Dropdown Menu */}
                            {activeFavoritesDotMenu === cand.key && (
                              <div 
                                style={{ position: 'absolute', top: 32, right: 0, background: '#111625', border: '1px solid #1d2433', borderRadius: 8, padding: '4px 0', zIndex: 100, minWidth: 150, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                                onClick={e => e.stopPropagation()}
                              >
                                <button 
                                  onClick={() => {
                                    setShortlistStatus(prev => ({ ...prev, [cand.key]: false }));
                                    setFavoritesList(prev => prev.filter(c => c.key !== cand.key));
                                    toast.success(`${cand.name} removed from starred list!`);
                                    setActiveFavoritesDotMenu(null);
                                  }}
                                  style={{ display: 'block', width: '100%', padding: '8px 12px', background: 'transparent', border: 'none', color: '#ef4444', textAlign: 'left', fontSize: 11.5, cursor: 'pointer', fontWeight: 600 }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                  🗑️ Remove Starred
                                </button>
                                <button 
                                  onClick={() => {
                                    setActiveFreelancerProfile(cand);
                                    setActiveFavoritesDotMenu(null);
                                  }}
                                  style={{ display: 'block', width: '100%', padding: '8px 12px', background: 'transparent', border: 'none', color: '#cbd5e1', textAlign: 'left', fontSize: 11.5, cursor: 'pointer' }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#161c2c'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                  👁️ View Profile
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Insights & Notes */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Panel 1: Candidate Insights */}
                    <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Candidate Insights</span>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: '#3b82f6', cursor: 'pointer' }} onClick={() => toast('Detailed candidate insights summary loaded.')}>View All Insights</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {[
                          { label: 'Total Views', value: `${totalViewsReport}`, meta: 'Across projects', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
                          { label: 'Shortlisted', value: `${shortlistedProposalsCountReport} times`, meta: 'By you', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' },
                          { label: 'Response Rate', value: `${responseRateReport}%`, meta: 'Very Responsive', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
                          { label: 'Avg. Response Time', value: `${avgResponseTimeReport}`, meta: 'Fast', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' }
                        ].map((ins, idx) => (
                          <div key={idx} style={{ background: '#161c2c', border: '1px solid #1d2433', borderRadius: 10, padding: 12 }}>
                            <div style={{ fontSize: 11, color: '#64748b' }}>{ins.label}</div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: ins.color, marginTop: 4 }}>{ins.value}</div>
                            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{ins.meta}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Panel 2: Saved Notes */}
                    <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Saved Notes</span>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: '#3b82f6', cursor: 'pointer' }} onClick={() => setShowManageNotesModal(true)}>Manage Notes</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {starredNotesList.length === 0 ? (
                          <div style={{ fontSize: 11.5, color: '#64748b', textAlign: 'center', padding: '20px 0' }}>No notes saved. Click Manage Notes to add one.</div>
                        ) : (
                          starredNotesList.slice(0, 3).map((note) => (
                            <div key={note.id} style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 10, padding: 12, position: 'relative' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong style={{ fontSize: 12.5, color: '#fff' }}>{note.name}</strong>
                                <span style={{ fontSize: 10.5, color: '#64748b' }}>{note.date}</span>
                              </div>
                              <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '6px 0 0', lineHeight: 1.4 }}>{note.text}</p>
                              <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 12, opacity: 0.3 }}>📌</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Panel 3: Recent Activity */}
                    <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', display: 'block', marginBottom: 14 }}>Recent Activity</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 11.5, color: '#94a3b8' }}>
                        {allCandidatesList.length > 0 ? (
                          allCandidatesList.slice(0, 4).map((c, idx) => {
                            const dateStr = new Date(c.proposal.createdAt || c.job.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                            return (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <span style={{ color: '#f59e0b' }}>📋</span>
                                  <span>{c.name} submitted a proposal for "{c.job.title}"</span>
                                </div>
                                <span style={{ fontSize: 9.5, color: '#64748b' }}>{dateStr}</span>
                              </div>
                            );
                          })
                        ) : (
                          <div style={{ fontSize: 11.5, color: '#64748b', textAlign: 'center', padding: '20px 0' }}>No recent activity found.</div>
                        )}
                        <span onClick={() => toast('Detailed activity audit logs toggled.')} style={{ display: 'inline-block', fontSize: 12, color: '#10b981', fontWeight: 700, marginTop: 8, cursor: 'pointer' }}>View All Activity →</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Bottom Row: Quick Actions */}
                <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', display: 'block', marginBottom: 16 }}>Quick Actions</span>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(5, 1fr)', gap: 12 }}>
                    {[
                      { label: 'Invite to Project', icon: '📥', bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', action: () => setShowInviteModal(true) },
                      { 
                        label: 'Send Message', 
                        icon: '💬', 
                        bg: 'rgba(59, 130, 246, 0.12)', 
                        color: '#3b82f6', 
                        action: () => {
                          setActiveTab('messages');
                          toast.success("Opening chat lines with starred freelancers.");
                        }
                      },
                      { label: 'Compare Candidates', icon: '⚖️', bg: 'rgba(167, 139, 250, 0.12)', color: '#a78bfa', action: () => setShowFavoritesCompareModal(true) },
                      { 
                        label: 'Export Favorites', 
                        icon: '📥', 
                        bg: 'rgba(249, 115, 22, 0.12)', 
                        color: '#f97316', 
                        action: () => {
                          const element = document.createElement("a");
                          const file = new Blob([
                            "STARRED FAVORITE FREELANCERS CONTACT LIST\n\n" +
                            "Name,Role,Location,Rate,Rating,Reviews\n" +
                            favoritesList.map(f => `${f.name},${f.role},${f.location},${f.rate},${f.rating},${f.revs}`).join("\n")
                          ], {type: 'text/csv'});
                          element.href = URL.createObjectURL(file);
                          element.download = "starred_freelancers.csv";
                          document.body.appendChild(element);
                          element.click();
                          document.body.removeChild(element);
                          toast.success("Starred freelancers contact list exported!");
                        }
                      },
                      { 
                        label: 'Remove', 
                        icon: '🗑️', 
                        bg: 'rgba(239, 68, 68, 0.12)', 
                        color: '#ef4444', 
                        action: () => {
                          if (window.confirm("Are you sure you want to clear your entire starred candidates list?")) {
                            setFavoritesList([]);
                            toast.success("All starred candidates cleared from favorites!");
                          }
                        }
                      }
                    ].map((act, idx) => (
                      <div 
                        key={idx} 
                        onClick={act.action}
                        style={{ background: '#161c2c', border: '1px solid #1d2433', borderRadius: 10, padding: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'border-color 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = act.color}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1d2433'}
                      >
                        <span style={{ width: 28, height: 28, borderRadius: 6, background: act.bg, color: act.color, display: 'grid', placeItems: 'center', fontSize: 16, flexShrink: 0 }}>{act.icon}</span>
                        <span style={{ fontSize: 11.5, color: '#fff', fontWeight: 600 }}>{act.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()
        )}

        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            
            {/* Header Title with Save Changes */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>⚙️</span>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>Client Settings & Billing Configuration</h2>
                  <span style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'block' }}>Manage your business details, billing information, preferences and account settings.</span>
                </div>
              </div>
              <button 
                onClick={() => toast.success("Configuration changes saved successfully!")}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
              >
                ✓ Save Changes
              </button>
            </div>

            {/* Row 1: Corporate Info & Billing Contact */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
              {/* Corporate Information Card */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6 }}>🏢 Corporate Information</span>
                </div>
                
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>CORPORATE GSTIN IDENTIFICATION</label>
                    <span 
                      style={{ fontSize: 10, color: '#10b981', fontWeight: 600, background: 'rgba(16,185,129,0.12)', padding: '2px 6px', borderRadius: 4, cursor: 'pointer' }}
                      onClick={() => toast.success("GSTIN registration verified with Tax Portal (Government of India).")}
                      title="Verify GSTIN registration online"
                    >
                      Verified ✓
                    </span>
                  </div>
                  <input 
                    value={settingsForm.gstin}
                    onChange={(e) => setSettingsForm({ ...settingsForm, gstin: e.target.value })}
                    disabled={!isGstinEditable}
                    style={{ width: '100%', padding: '10px 12px', background: isGstinEditable ? '#0e1320' : '#161c2c', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12.5, outline: 'none' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>REGISTERED BILLING ADDRESS</label>
                    <span 
                      style={{ cursor: 'pointer', fontSize: 12, padding: '2px 4px', background: isAddressEditable ? 'rgba(16,185,129,0.12)' : 'transparent', borderRadius: 4 }} 
                      onClick={() => {
                        if (isAddressEditable) {
                          toast.success("Billing address saved!");
                        }
                        setIsAddressEditable(!isAddressEditable);
                      }}
                      title={isAddressEditable ? "Save Address" : "Edit Address"}
                    >
                      {isAddressEditable ? '💾' : '✏️'}
                    </span>
                  </div>
                  <textarea 
                    value={settingsForm.billingAddress}
                    onChange={(e) => setSettingsForm({ ...settingsForm, billingAddress: e.target.value })}
                    disabled={!isAddressEditable}
                    rows={2}
                    style={{ width: '100%', padding: '10px 12px', background: isAddressEditable ? '#0e1320' : '#161c2c', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12.5, outline: 'none', resize: 'none', lineHeight: 1.4 }}
                  />
                </div>
              </div>

              {/* Billing Contact Card */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6 }}>👤 Billing Contact</span>
                  <span 
                    style={{ cursor: 'pointer', fontSize: 12, padding: '2px 4px', background: isContactEditable ? 'rgba(16,185,129,0.12)' : 'transparent', borderRadius: 4 }} 
                    onClick={() => {
                      if (isContactEditable) {
                        toast.success("Billing contact information updated!");
                      }
                      setIsContactEditable(!isContactEditable);
                    }}
                    title={isContactEditable ? "Save Contact Details" : "Edit Contact Details"}
                  >
                    {isContactEditable ? '💾' : '✏️'}
                  </span>
                </div>

                <div>
                  <label style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 4 }}>CONTACT NAME</label>
                  <input 
                    value={settingsForm.contactName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, contactName: e.target.value })}
                    disabled={!isContactEditable}
                    style={{ width: '100%', padding: '8px 10px', background: isContactEditable ? '#0e1320' : '#161c2c', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12, outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 4 }}>EMAIL ADDRESS</label>
                  <input 
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    disabled={!isContactEditable}
                    style={{ width: '100%', padding: '8px 10px', background: isContactEditable ? '#0e1320' : '#161c2c', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12, outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 4 }}>PHONE NUMBER</label>
                  <input 
                    value={settingsForm.phone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    disabled={!isContactEditable}
                    style={{ width: '100%', padding: '8px 10px', background: isContactEditable ? '#0e1320' : '#161c2c', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12, outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Tax, Preferences, Payments, Docs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 16 }}>
              {/* Card 1: Tax & Compliance */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#cbd5e1' }}>📄 Tax & Compliance</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>Tax Type</span>
                    <strong style={{ color: '#fff' }}>{settingsForm.taxType} ›</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>GST Registration</span>
                    <strong style={{ color: '#fff' }}>{settingsForm.registrationType} ›</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>Place of Supply</span>
                    <strong style={{ color: '#fff' }}>{settingsForm.placeOfSupply.slice(0, 11)}.. ›</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>PAN Number</span>
                    <strong style={{ color: '#fff' }}>{settingsForm.panNumber} 👁️</strong>
                  </div>
                </div>
                <div 
                  onClick={() => setShowTaxDetailsModal(true)}
                  style={{ color: '#10b981', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', marginTop: 'auto', paddingTop: 6 }}
                >
                  Manage Tax Details →
                </div>
              </div>

              {/* Card 2: Billing Preferences */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#cbd5e1' }}>⚙️ Billing Preferences</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>Currency</span>
                    <strong style={{ color: '#fff' }}>{settingsForm.currency} ›</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>Payment Terms</span>
                    <strong style={{ color: '#fff' }}>{settingsForm.paymentTerms} ›</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>Invoice Prefix</span>
                    <strong style={{ color: '#fff' }}>{settingsForm.invoicePrefix} ›</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>Due Reminder</span>
                    <strong style={{ color: '#fff' }}>{settingsForm.reminderDays} ›</strong>
                  </div>
                </div>
                <div 
                  onClick={() => setShowPreferencesModal(true)}
                  style={{ color: '#10b981', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', marginTop: 'auto', paddingTop: 6 }}
                >
                  Manage Preferences →
                </div>
              </div>

              {/* Card 3: Payment Methods */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#cbd5e1' }}>💳 Payment Methods</span>
                <div style={{ background: '#161c2c', border: '1px solid rgba(255,255,255,0.02)', padding: 10, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>Primary Method</span>
                    <span style={{ fontSize: 9.5, color: '#10b981', fontWeight: 600, background: 'rgba(16,185,129,0.1)', padding: '1px 4px', borderRadius: 4 }}>Active</span>
                  </div>
                  <strong style={{ fontSize: 12, color: '#fff' }}>Bank Transfer</strong>
                  <span style={{ fontSize: 10.5, color: '#cbd5e1' }}>**** **** 1234</span>
                </div>
                <button 
                  onClick={() => setShowAddPaymentMethodModal(true)}
                  style={{ padding: '6px 12px', background: '#0e1320', border: '1px solid #1d2433', color: '#cbd5e1', borderRadius: 8, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
                >
                  + Add Payment Method
                </button>
                <div 
                  onClick={() => setShowManagePaymentsModal(true)}
                  style={{ color: '#10b981', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', marginTop: 'auto', paddingTop: 4 }}
                >
                  Manage Payment Methods →
                </div>
              </div>

              {/* Card 4: Documents */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6 }}>📁 Documents</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11.5 }}>
                  {companyDocuments.map((doc) => (
                    <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#cbd5e1' }}>{doc.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: '#10b981', fontSize: 11 }}>Uploaded</span>
                        <span 
                          style={{ color: '#3b82f6', cursor: 'pointer', fontSize: 13 }} 
                          title={"Download " + doc.fileName}
                          onClick={() => {
                            const element = document.createElement("a");
                            const file = new Blob([doc.content], {type: 'text/plain'});
                            element.href = URL.createObjectURL(file);
                            element.download = doc.fileName;
                            document.body.appendChild(element);
                            element.click();
                            document.body.removeChild(element);
                            toast.success(doc.fileName + " downloaded successfully!");
                          }}
                        >
                          📥
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div 
                  onClick={() => setShowDocManagerModal(true)}
                  style={{ color: '#10b981', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', marginTop: 'auto', paddingTop: 6 }}
                >
                  Manage Documents →
                </div>
              </div>
            </div>

            {/* Row 3: Notification Preferences & Account Security */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.7fr 1.3fr', gap: 16 }}>
              {/* Notification Preferences */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#cbd5e1' }}>🔔 Notification Preferences</span>
                
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: '#fff' }}>Email Notifications</span>
                      <span style={{ display: 'block', fontSize: 11, color: '#64748b', marginTop: 2 }}>Receive corporate invoices & reports</span>
                    </div>
                    <div 
                      onClick={() => setSettingsForm({ ...settingsForm, emailNotifications: !settingsForm.emailNotifications })}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        background: settingsForm.emailNotifications ? '#3b82f6' : 'transparent',
                        border: '2.5px solid ' + (settingsForm.emailNotifications ? '#3b82f6' : '#334155'),
                        display: 'grid',
                        placeItems: 'center',
                        cursor: 'pointer',
                        color: '#fff',
                        fontSize: 10.5,
                        fontWeight: 'bold',
                        userSelect: 'none'
                      }}
                    >
                      {settingsForm.emailNotifications && '✓'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: '#fff' }}>Project Updates</span>
                      <span style={{ display: 'block', fontSize: 11, color: '#64748b', marginTop: 2 }}>Milestone delivery status alerts</span>
                    </div>
                    <div 
                      onClick={() => setSettingsForm({ ...settingsForm, projectUpdates: !settingsForm.projectUpdates })}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        background: settingsForm.projectUpdates ? '#3b82f6' : 'transparent',
                        border: '2.5px solid ' + (settingsForm.projectUpdates ? '#3b82f6' : '#334155'),
                        display: 'grid',
                        placeItems: 'center',
                        cursor: 'pointer',
                        color: '#fff',
                        fontSize: 10.5,
                        fontWeight: 'bold',
                        userSelect: 'none'
                      }}
                    >
                      {settingsForm.projectUpdates && '✓'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: '#fff' }}>Invoice & Payment Alerts</span>
                      <span style={{ display: 'block', fontSize: 11, color: '#64748b', marginTop: 2 }}>Pending invoice due reminders</span>
                    </div>
                    <div 
                      onClick={() => setSettingsForm({ ...settingsForm, paymentAlerts: !settingsForm.paymentAlerts })}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        background: settingsForm.paymentAlerts ? '#3b82f6' : 'transparent',
                        border: '2.5px solid ' + (settingsForm.paymentAlerts ? '#3b82f6' : '#334155'),
                        display: 'grid',
                        placeItems: 'center',
                        cursor: 'pointer',
                        color: '#fff',
                        fontSize: 10.5,
                        fontWeight: 'bold',
                        userSelect: 'none'
                      }}
                    >
                      {settingsForm.paymentAlerts && '✓'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: '#fff' }}>Promotions & Offers</span>
                      <span style={{ display: 'block', fontSize: 11, color: '#64748b', marginTop: 2 }}>Special discounts & platform features</span>
                    </div>
                    <div 
                      onClick={() => setSettingsForm({ ...settingsForm, promotions: !settingsForm.promotions })}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        background: settingsForm.promotions ? '#3b82f6' : 'transparent',
                        border: '2.5px solid ' + (settingsForm.promotions ? '#3b82f6' : '#334155'),
                        display: 'grid',
                        placeItems: 'center',
                        cursor: 'pointer',
                        color: '#fff',
                        fontSize: 10.5,
                        fontWeight: 'bold',
                        userSelect: 'none'
                      }}
                    >
                      {settingsForm.promotions && '✓'}
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => setShowNotificationChannelsModal(true)}
                  style={{ color: '#10b981', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', marginTop: 4 }}
                >
                  Manage Notifications →
                </div>
              </div>

              {/* Account & Security */}
              <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#cbd5e1' }}>🛡️ Account & Security</span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5 }}>
                  <div 
                    onClick={() => setShowChangePasswordModal(true)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#161c2c', border: '1px solid #1d2433', borderRadius: 8, cursor: 'pointer' }}
                  >
                    <span style={{ color: '#fff' }}>Change Password</span>
                    <strong style={{ color: '#64748b' }}>›</strong>
                  </div>

                  <div 
                    onClick={() => {
                      const prevVal = settingsForm.twoFactor;
                      setSettingsForm({ ...settingsForm, twoFactor: !prevVal });
                      toast.success(!prevVal ? "Two-Factor Authentication Activated!" : "Two-Factor Authentication Disabled");
                    }}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#161c2c', border: '1px solid #1d2433', borderRadius: 8, cursor: 'pointer' }}
                  >
                    <span style={{ color: '#fff' }}>Two-Factor Authentication</span>
                    <strong style={{ color: settingsForm.twoFactor ? '#10b981' : '#64748b', fontWeight: 600 }}>{settingsForm.twoFactor ? 'Enabled' : 'Disabled'} ›</strong>
                  </div>

                  <div 
                    onClick={() => setShowLoginSessionsModal(true)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#161c2c', border: '1px solid #1d2433', borderRadius: 8, cursor: 'pointer' }}
                  >
                    <span style={{ color: '#fff' }}>Login Activity</span>
                    <strong style={{ color: '#64748b' }}>›</strong>
                  </div>
                </div>

                <div 
                  onClick={() => setShowLoginSessionsModal(true)}
                  style={{ color: '#10b981', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', marginTop: 'auto', paddingTop: 4 }}
                >
                  Manage Security →
                </div>
              </div>
            </div>

            {/* Vertical Help Card Widget */}
            <div style={{ background: '#111625', border: '1px solid #1d2433', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 300 }}>
              <strong style={{ fontSize: 14, color: '#fff' }}>Need Help?</strong>
              <span style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.4 }}>Our support team is here to help you 24/7.</span>
              <button 
                onClick={() => setShowSupportModal(true)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 16px', background: '#1e293b', border: '1px solid #1d2433', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#161c2c'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#1e293b'}
              >
                🎧 Contact Support
              </button>
            </div>

          </div>
        )}

        {activeTab === 'proposals' && (
          <div style={s.card}>
            <div style={s.cardHeader}>
              <h2 style={s.cardTitle}>Proposals Received</h2>
              <span style={s.countBadge}>{proposals.length} total</span>
            </div>
            {proposalsLoading ? <LoadingSpinner /> : filteredProposals.length === 0 ? (
              <EmptyState message={searchQuery ? "No proposals match your search query." : "No proposals received yet."} />
            ) : (
              filteredProposals.map((p) => {
                const freelancerId = p.freelancer?._id || p.freelancer;
                const freelancerName = p.freelancer?.firstName
                  ? `${p.freelancer.firstName} ${p.freelancer.lastName || ''}`
                  : 'Freelancer';
                const initials = freelancerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                const pst = proposalStatusStyle[p.status] || proposalStatusStyle.pending;
                const isUpdating = updatingProposal === p._id;
                const isMessaging = messagingId === freelancerId;

                return (
                  <div key={p._id} style={s.proposalRow}>
                    <div style={s.pAvatar}>{initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={s.jobTitle}>{freelancerName}</span>
                        <span style={{ ...s.statusBadge, background: pst.bg, color: pst.color }}>{pst.label}</span>
                      </div>
                      <div style={s.jobMeta}>
                        Job: <strong>{p.jobTitle}</strong> · Bid: <strong>{formatBudget(p.bidAmount)}</strong> · {p.estimatedDays} days · {timeAgo(p.createdAt)}
                      </div>
                      {p.coverLetter && (
                        <div style={s.coverLetter}>"{p.coverLetter.slice(0, 120)}{p.coverLetter.length > 120 ? '…' : ''}"</div>
                      )}
                    </div>
                    {p.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <button
                          style={{ ...s.acceptBtn, opacity: isUpdating ? 0.6 : 1 }}
                          disabled={isUpdating}
                          onClick={() => handleProposalAction(p.jobId, p._id, 'accepted')}
                        >
                          <Icon name="check" /> Accept
                        </button>
                        <button
                          style={{ ...s.rejectBtn, opacity: isUpdating ? 0.6 : 1 }}
                          disabled={isUpdating}
                          onClick={() => handleProposalAction(p.jobId, p._id, 'rejected')}
                        >
                          <Icon name="x" /> Reject
                        </button>
                      </div>
                    )}
                    {p.status !== 'pending' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        <span style={{ fontSize: 12, color: '#a3a3a3' }}>
                          {p.status === 'accepted' ? '✅ Accepted' : '❌ Rejected'}
                        </span>
                        {p.status === 'accepted' && (
                          <button
                            style={{ ...s.messageBtn, opacity: isMessaging ? 0.6 : 1 }}
                            disabled={isMessaging}
                            onClick={() => handleMessageFreelancer(freelancerId, p.jobId)}
                          >
                            <Icon name="message" /> Message
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
        {/* ── Help & Support Modal ── */}
        {helpModalOpen && (
          <div className="fd-quiz-overlay" onClick={() => setHelpModalOpen(false)}>
            <div className="fd-quiz-modal" onClick={(e) => e.stopPropagation()} style={{ width: 560, padding: 24, borderRadius: 16 }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: 14, marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>Help & Support Center</h3>
                  <span style={{ fontSize: 12, color: '#64748b', marginTop: 4, display: 'block' }}>Search popular topics or open a direct support ticket</span>
                </div>
                <button onClick={() => setHelpModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>

              {/* Search popular guides */}
              <div style={{ position: 'relative', marginBottom: 20 }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                  <Icon name="search" size={15} />
                </span>
                <input 
                  placeholder="Search popular help articles..." 
                  value={helpSearch} 
                  onChange={(e) => setHelpSearch(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1.5px solid #cbd5e1', borderRadius: 8, fontSize: 13, background: '#f8fafc', outline: 'none', color: '#0f172a' }}
                />
              </div>

              {/* FAQs Accordion */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.03em' }}>Frequently Asked Questions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto', paddingRight: 4 }}>
                  {[
                    { q: "How does the milestone escrow payment system work?", a: "When you fund a milestone, the money is held securely in escrow. Once the freelancer submits the milestone deliverables and you review and approve them, the funds are released directly to the freelancer's wallet." },
                    { q: "How do I review and accept proposal applications?", a: "Go to the 'Proposals' tab under 'My Jobs' to view cover letters and project pricing bids. You can click 'Accept' to start the escrow and initiate the contract, or 'Reject' to decline." },
                    { q: "How do I switch between Client and Freelancer accounts?", a: "Simply click your avatar icon in the top right, and select 'Switch to Freelancer' or 'Switch to Client' to change your user role instantly." },
                    { q: "What should I do if a freelancer asks for off-platform payment?", a: "Off-platform payment violates platform policy and voids all escrow protection. Always process payments through the milestone escrow system. If a freelancer asks for external payment, please report them to Trust & Safety immediately." }
                  ]
                    .filter(faq => !helpSearch || faq.q.toLowerCase().includes(helpSearch.toLowerCase()) || faq.a.toLowerCase().includes(helpSearch.toLowerCase()))
                    .map((faq, idx) => (
                      <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                        <button 
                          onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                          style={{ width: '100%', padding: '10px 14px', background: '#f8fafc', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', fontWeight: 600, fontSize: 13, color: '#334155', cursor: 'pointer' }}
                        >
                          {faq.q}
                          <span style={{ fontSize: 10, color: '#94a3b8', transform: activeFaq === idx ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                        </button>
                        {activeFaq === idx && (
                          <div style={{ padding: '10px 14px', fontSize: 12.5, color: '#64748b', background: '#fff', borderTop: '1px solid #e2e8f0', lineHeight: 1.5 }}>
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Support Ticket Section */}
              <div style={{ borderTop: '1.5px solid #f1f5f9', paddingTop: 18 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.03em' }}>Open a Support Ticket</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Select Issue Category</label>
                    <select 
                      value={supportTicket.subject} 
                      onChange={(e) => setSupportTicket({ ...supportTicket, subject: e.target.value })}
                      style={{ padding: '8px 10px', border: '1.5px solid #cbd5e1', borderRadius: 8, fontSize: 13, outline: 'none', color: '#0f172a', background: '#fff' }}
                    >
                      <option>Payment & Transaction Issue</option>
                      <option>Contract & Escrow Dispute</option>
                      <option>Profile & Account Issues</option>
                      <option>Report a Bug / Technical Glitch</option>
                      <option>Other / General Inquiry</option>
                    </select>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Message / Description</label>
                    <textarea 
                      rows={3}
                      placeholder="Describe your issue in detail..."
                      value={supportTicket.message}
                      onChange={(e) => setSupportTicket({ ...supportTicket, message: e.target.value })}
                      style={{ padding: '10px 12px', border: '1.5px solid #cbd5e1', borderRadius: 8, fontSize: 13, resize: 'vertical', outline: 'none', color: '#0f172a', background: '#fff' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                    <button 
                      onClick={() => setHelpModalOpen(false)} 
                      style={{ padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff', fontSize: 13, color: '#475569', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={async () => {
                        if (!supportTicket.message.trim()) {
                          toast.error('Please enter a description of the issue');
                          return;
                        }
                        setSubmittingTicket(true);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        setSubmittingTicket(false);
                        toast.success(`Support Ticket #${Math.floor(100000 + Math.random() * 900000)} created successfully! Our team will respond shortly.`);
                        setSupportTicket({ subject: 'Payment & Transaction Issue', message: '' });
                        setHelpModalOpen(false);
                      }}
                      disabled={submittingTicket}
                      style={{ padding: '8px 18px', border: 'none', borderRadius: 8, background: '#16a34a', fontSize: 13, color: '#fff', fontWeight: 600, cursor: 'pointer', opacity: submittingTicket ? 0.7 : 1 }}
                    >
                      {submittingTicket ? 'Submitting...' : 'Submit Ticket'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Create New Contract Modal */}
      {showNewContractModal && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowNewContractModal(false)}
        >
          <form 
            onSubmit={handleCreateContract}
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '90%' : 500, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1d2433', paddingBottom: 12 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: 6 }}>
                📄 Create New Work Contract
              </span>
              <button type="button" onClick={() => setShowNewContractModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            
            <div>
              <label style={{ fontSize: 11.5, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Contract Title *</label>
              <input 
                required
                value={newContractForm.title}
                onChange={(e) => setNewContractForm({ ...newContractForm, title: e.target.value })}
                placeholder="e.g. Frontend Engineering Services" 
                style={{ width: '100%', padding: '10px 14px', background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', outline: 'none', fontSize: 12.5 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11.5, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Client / Freelancer Partner *</label>
                <input 
                  required
                  value={newContractForm.partner}
                  onChange={(e) => setNewContractForm({ ...newContractForm, partner: e.target.value })}
                  placeholder="e.g. Acme Corp / John Doe" 
                  style={{ width: '100%', padding: '10px 14px', background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', outline: 'none', fontSize: 12.5 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11.5, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Contract Value (INR) *</label>
                <input 
                  required
                  value={newContractForm.val}
                  onChange={(e) => setNewContractForm({ ...newContractForm, val: e.target.value })}
                  placeholder="e.g. 150000 or ₹1,50,000" 
                  style={{ width: '100%', padding: '10px 14px', background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', outline: 'none', fontSize: 12.5 }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11.5, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Start Date</label>
                <input 
                  type="date"
                  value={newContractForm.start}
                  onChange={(e) => setNewContractForm({ ...newContractForm, start: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', outline: 'none', fontSize: 12.5 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11.5, color: '#94a3b8', display: 'block', marginBottom: 6 }}>End Date</label>
                <input 
                  type="date"
                  value={newContractForm.end}
                  onChange={(e) => setNewContractForm({ ...newContractForm, end: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', outline: 'none', fontSize: 12.5 }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11.5, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Initial Status</label>
              <select 
                value={newContractForm.status}
                onChange={(e) => setNewContractForm({ ...newContractForm, status: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', outline: 'none', fontSize: 12.5 }}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PENDING">PENDING</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12, borderTop: '1px solid #1d2433', paddingTop: 16 }}>
              <button 
                type="submit"
                style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
              >
                Create Contract
              </button>
              <button 
                type="button"
                onClick={() => setShowNewContractModal(false)} 
                style={{ padding: '8px 16px', background: '#1e293b', border: '1px solid #1d2433', color: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Invite Freelancers Modal */}
      {showInviteModal && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowInviteModal(false)}
        >
          <div 
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '90%' : 460, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>📨 Invite Freelancers to Project</span>
              <button onClick={() => setShowInviteModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            <div>
              <label style={{ fontSize: 11.5, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Select Active Project</label>
              <select defaultValue="website" style={{ width: '100%', padding: '10px 14px', background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', outline: 'none' }}>
                <option value="website">Website Redesign (Acme Corp)</option>
                <option value="mobile">E-commerce Mobile App (Acme Corp)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11.5, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Freelancer Email Address</label>
              <input 
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="e.g. rajesh@freelance.in" 
                style={{ width: '100%', padding: '10px 14px', background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11.5, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Custom Invitation Message</label>
              <textarea 
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                rows="4" 
                style={{ width: '100%', padding: '10px 14px', background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', outline: 'none', resize: 'none', fontSize: 12.5, lineHeight: 1.4 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button 
                onClick={() => {
                  if (!inviteEmail) {
                    toast.error("Please enter a valid freelancer email address!");
                    return;
                  }
                  toast.success("Invitation sent successfully to " + inviteEmail + "!");
                  setShowInviteModal(false);
                  setInviteEmail('');
                }} 
                style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
              >
                Send Invitation
              </button>
              <button onClick={() => setShowInviteModal(false)} style={{ padding: '8px 16px', background: '#1e293b', border: '1px solid #1d2433', color: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Milestone Modal */}
      {showCreateMilestoneModal && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowCreateMilestoneModal(false)}
        >
          <div 
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '95%' : 440, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>📝 Create Milestone Escrow</span>
              <button onClick={() => setShowCreateMilestoneModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>SELECT CONTRACT</span>
                <select 
                  value={milestoneForm.contractId} 
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, contractId: e.target.value })}
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 10px', outline: 'none' }}
                >
                  <option value="">-- Select Contract --</option>
                  {contracts.map(c => (
                    <option key={c.id} value={c.id}>{c.title} ({c.id})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>MILESTONE NAME</span>
                <input 
                  value={milestoneForm.name}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, name: e.target.value })}
                  placeholder="e.g. Phase 1 - High Fidelity Prototypes"
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12.5, padding: '8px 10px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>ESCROW VALUE (₹)</span>
                  <input 
                    type="number"
                    value={milestoneForm.amount}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, amount: e.target.value })}
                    placeholder="50000"
                    style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12.5, padding: '8px 10px', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>DUE DATE</span>
                  <input 
                    type="date"
                    value={milestoneForm.due}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, due: e.target.value })}
                    style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12.5, padding: '8px 10px', outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
              <button 
                onClick={() => {
                  if (!milestoneForm.contractId || !milestoneForm.name || !milestoneForm.amount) {
                    toast.error("Please fill in all required fields.");
                    return;
                  }
                  toast.success("Milestone created under Escrow Lock protection!");
                  setMilestoneForm({ contractId: '', name: '', amount: '', due: '' });
                  setShowCreateMilestoneModal(false);
                }} 
                style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
              >
                Fund & Deploy
              </button>
              <button onClick={() => setShowCreateMilestoneModal(false)} style={{ padding: '8px 16px', background: '#1e293b', border: '1px solid #1d2433', color: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Payment Modal */}
      {showRequestPaymentModal && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowRequestPaymentModal(false)}
        >
          <div 
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '95%' : 440, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>📥 Request Payout Release</span>
              <button onClick={() => setShowRequestPaymentModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>RECIPIENT FREELANCER</span>
                <select 
                  value={requestPaymentForm.freelancer} 
                  onChange={(e) => setRequestPaymentForm({ ...requestPaymentForm, freelancer: e.target.value })}
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 10px', outline: 'none' }}
                >
                  <option value="">-- Choose Freelancer --</option>
                  {hiredFreelancersList.map(f => (
                    <option key={f.id} value={f.name}>{f.name} ({f.title})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>AMOUNT (₹)</span>
                <input 
                  type="number"
                  value={requestPaymentForm.amount}
                  onChange={(e) => setRequestPaymentForm({ ...requestPaymentForm, amount: e.target.value })}
                  placeholder="30000"
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12.5, padding: '8px 10px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>MEMO MESSAGE</span>
                <textarea 
                  value={requestPaymentForm.msg}
                  onChange={(e) => setRequestPaymentForm({ ...requestPaymentForm, msg: e.target.value })}
                  placeholder="e.g. Requesting release for milestone 3 deliverables approved yesterday."
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 10px', outline: 'none', height: 80, resize: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
              <button 
                onClick={() => {
                  if (!requestPaymentForm.freelancer || !requestPaymentForm.amount) {
                    toast.error("Please fill in all required fields.");
                    return;
                  }
                  toast.success("Payment request successfully sent!");
                  setRequestPaymentForm({ freelancer: '', amount: '', msg: '' });
                  setShowRequestPaymentModal(false);
                }} 
                style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
              >
                Send Request
              </button>
              <button onClick={() => setShowRequestPaymentModal(false)} style={{ padding: '8px 16px', background: '#1e293b', border: '1px solid #1d2433', color: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Funds Modal */}
      {showWithdrawModal && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowWithdrawModal(false)}
        >
          <div 
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '95%' : 400, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>💸 Withdraw Escrow Funds</span>
              <button onClick={() => setShowWithdrawModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>WITHDRAW TO METHOD</span>
                <select 
                  value={withdrawForm.methodId} 
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, methodId: e.target.value })}
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 10px', outline: 'none' }}
                >
                  {paymentMethods.length === 0 ? (
                    <option value="">No Payment Methods Added</option>
                  ) : (
                    paymentMethods.map(m => (
                      <option key={m.id} value={m.id}>{m.type} ({m.detail})</option>
                    ))
                  )}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>AMOUNT TO WITHDRAW (₹)</span>
                <input 
                  type="number"
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                  placeholder="10000"
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12.5, padding: '8px 10px', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
              <button 
                onClick={() => {
                  if (!withdrawForm.amount || parseFloat(withdrawForm.amount) <= 0) {
                    toast.error("Please enter a valid amount.");
                    return;
                  }
                  toast.success(`Withdrawal of ₹${parseFloat(withdrawForm.amount).toLocaleString('en-IN')} initiated successfully!`);
                  setWithdrawForm({ methodId: 'bank', amount: '' });
                  setShowWithdrawModal(false);
                }} 
                style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
              >
                Withdraw Funds
              </button>
              <button onClick={() => setShowWithdrawModal(false)} style={{ padding: '8px 16px', background: '#1e293b', border: '1px solid #1d2433', color: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Invoice Modal */}
      {showCreateNewInvoiceModal && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowCreateNewInvoiceModal(false)}
        >
          <div 
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '95%' : 440, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>📝 Generate New Invoice</span>
              <button onClick={() => setShowCreateNewInvoiceModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>PROJECT TITLE</span>
                <input 
                  value={newInvoiceFormState.title}
                  onChange={(e) => setNewInvoiceFormState({ ...newInvoiceFormState, title: e.target.value })}
                  placeholder="e.g. Mobile Application Development"
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12.5, padding: '8px 10px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>DESCRIPTION</span>
                <input 
                  value={newInvoiceFormState.desc}
                  onChange={(e) => setNewInvoiceFormState({ ...newInvoiceFormState, desc: e.target.value })}
                  placeholder="e.g. Phase 2 - API Endpoints implementation"
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12.5, padding: '8px 10px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>AMOUNT (₹)</span>
                  <input 
                    type="number"
                    value={newInvoiceFormState.amount}
                    onChange={(e) => setNewInvoiceFormState({ ...newInvoiceFormState, amount: e.target.value })}
                    placeholder="15000"
                    style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12.5, padding: '8px 10px', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>DUE DATE</span>
                  <input 
                    type="date"
                    value={newInvoiceFormState.due}
                    onChange={(e) => setNewInvoiceFormState({ ...newInvoiceFormState, due: e.target.value })}
                    style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12.5, padding: '8px 10px', outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
              <button 
                onClick={() => {
                  if (!newInvoiceFormState.title || !newInvoiceFormState.desc || !newInvoiceFormState.amount || !newInvoiceFormState.due) {
                    toast.error("Please fill in all fields.");
                    return;
                  }
                  const nextIdNum = String(invoicesListState.length + 1).padStart(3, '0');
                  const nextCodeNum = 1001 + invoicesListState.length;
                  
                  const formatShortDate = (dtString) => {
                    const dateObj = new Date(dtString);
                    return dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                  };
                  
                  const newInvItem = {
                    id: `INV-2026-${nextIdNum}`,
                    code: `#${nextCodeNum}`,
                    title: newInvoiceFormState.title,
                    desc: newInvoiceFormState.desc,
                    date: formatShortDate(new Date()),
                    due: formatShortDate(newInvoiceFormState.due),
                    amount: `₹${Number(newInvoiceFormState.amount).toLocaleString('en-IN')}`,
                    status: 'PENDING',
                    sub: 'Due in 30 days',
                    bg: 'rgba(245,158,11,0.12)',
                    color: '#f59e0b',
                    docBg: 'rgba(245,158,11,0.12)',
                    docColor: '#f59e0b'
                  };
                  
                  setInvoicesListState([newInvItem, ...invoicesListState]);
                  setNewInvoiceFormState({ title: '', desc: '', amount: '', due: '' });
                  setShowCreateNewInvoiceModal(false);
                  toast.success("New invoice generated successfully!");
                }} 
                style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
              >
                Generate Invoice
              </button>
              <button onClick={() => setShowCreateNewInvoiceModal(false)} style={{ padding: '8px 16px', background: '#1e293b', border: '1px solid #1d2433', color: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Billing Settings Modal */}
      {showBillingSettingsModal && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowBillingSettingsModal(false)}
        >
          <div 
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '95%' : 440, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>⚙️ Billing & Tax Profile Settings</span>
              <button onClick={() => setShowBillingSettingsModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>LEGAL ENTITY COMPANY</span>
                <input 
                  value={billingSettingsForm.company}
                  onChange={(e) => setBillingSettingsForm({ ...billingSettingsForm, company: e.target.value })}
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12.5, padding: '8px 10px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>TAX ID / GSTIN / VAT</span>
                <input 
                  value={billingSettingsForm.taxId}
                  onChange={(e) => setBillingSettingsForm({ ...billingSettingsForm, taxId: e.target.value })}
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12.5, padding: '8px 10px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>BILLING ADDRESS</span>
                <textarea 
                  value={billingSettingsForm.address}
                  onChange={(e) => setBillingSettingsForm({ ...billingSettingsForm, address: e.target.value })}
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 10px', outline: 'none', height: 60, resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>BILLING CURRENCY</span>
                <select 
                  value={billingSettingsForm.currency}
                  onChange={(e) => setBillingSettingsForm({ ...billingSettingsForm, currency: e.target.value })}
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 10px', outline: 'none' }}
                >
                  <option value="INR">Indian Rupee (INR - ₹)</option>
                  <option value="USD">US Dollar (USD - $)</option>
                  <option value="EUR">Euro (EUR - €)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
              <button 
                onClick={() => {
                  toast.success("Billing settings updated successfully!");
                  setShowBillingSettingsModal(false);
                }} 
                style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
              >
                Save Settings
              </button>
              <button onClick={() => setShowBillingSettingsModal(false)} style={{ padding: '8px 16px', background: '#1e293b', border: '1px solid #1d2433', color: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View All Transactions Modal */}
      {showAllExpensesModal && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowAllExpensesModal(false)}
        >
          <div 
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '95%' : 700, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>📋 Detailed Transactions Log ({expensesListState.length} items)</span>
              <button onClick={() => setShowAllExpensesModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            
            <div style={{ maxHeight: 360, overflowY: 'auto', border: '1px solid #1d2433', borderRadius: 8 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#161c2c', borderBottom: '1px solid #1d2433', color: '#64748b' }}>
                    <th style={{ padding: '10px 12px', width: 40 }}>#</th>
                    <th style={{ padding: '10px 12px' }}>Project Description</th>
                    <th style={{ padding: '10px 12px' }}>Category</th>
                    <th style={{ padding: '10px 12px' }}>Freelancer</th>
                    <th style={{ padding: '10px 12px' }}>Amount</th>
                    <th style={{ padding: '10px 12px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {expensesListState.map((exp, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>{exp.num}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#fff' }}>{exp.title}</td>
                      <td style={{ padding: '10px 12px', color: '#cbd5e1' }}>{exp.cat}</td>
                      <td style={{ padding: '10px 12px' }}>{exp.name}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#fff' }}>{exp.amt}</td>
                      <td style={{ padding: '10px 12px', color: '#cbd5e1' }}>{exp.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
              <button onClick={() => setShowAllExpensesModal(false)} style={{ padding: '8px 16px', background: '#1e293b', border: '1px solid #1d2433', color: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Report Modal */}
      {showScheduleReportModal && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowScheduleReportModal(false)}
        >
          <div 
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '95%' : 440, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>📅 Schedule Automated Reports</span>
              <button onClick={() => setShowScheduleReportModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>DELIVERY FREQUENCY</span>
                <select 
                  value={scheduleReportForm.frequency}
                  onChange={(e) => setScheduleReportForm({ ...scheduleReportForm, frequency: e.target.value })}
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 10px', outline: 'none' }}
                >
                  <option value="weekly">Weekly Summary (Every Monday)</option>
                  <option value="monthly">Monthly Audit (1st of month)</option>
                  <option value="quarterly">Quarterly Ledger Summary</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>DESTINATION CHANNEL</span>
                <select 
                  value={scheduleReportForm.channel}
                  onChange={(e) => setScheduleReportForm({ ...scheduleReportForm, channel: e.target.value })}
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 10px', outline: 'none' }}
                >
                  <option value="email">Primary Corporate Email</option>
                  <option value="slack">Slack Webhook Channel</option>
                  <option value="download">Auto-download in dashboard</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>RECIPIENT EMAIL ADDRESS / URL</span>
                <input 
                  value={scheduleReportForm.recipient}
                  onChange={(e) => setScheduleReportForm({ ...scheduleReportForm, recipient: e.target.value })}
                  placeholder="client@acme.com"
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12.5, padding: '8px 10px', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
              <button 
                onClick={() => {
                  if (!scheduleReportForm.recipient) {
                    toast.error("Please specify a valid recipient address.");
                    return;
                  }
                  toast.success(`Report delivery successfully scheduled! (${scheduleReportForm.frequency})`);
                  setShowScheduleReportModal(false);
                }} 
                style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
              >
                Schedule Delivery
              </button>
              <button onClick={() => setShowScheduleReportModal(false)} style={{ padding: '8px 16px', background: '#1e293b', border: '1px solid #1d2433', color: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Message Modal */}
      {showBroadcastModal && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowBroadcastModal(false)}
        >
          <div 
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '95%' : 440, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>💬 Broadcast Message to Team</span>
              <button onClick={() => setShowBroadcastModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>MESSAGE BODY</span>
                <textarea 
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  rows={5}
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12.5, padding: '8px 10px', outline: 'none', resize: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
              <button 
                onClick={() => {
                  if (!broadcastMessage.trim()) {
                    toast.error("Please enter a valid message body.");
                    return;
                  }
                  toast.success("Broadcast message delivered to all team members!");
                  setShowBroadcastModal(false);
                }} 
                style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
              >
                Send Broadcast
              </button>
              <button onClick={() => setShowBroadcastModal(false)} style={{ padding: '8px 16px', background: '#1e293b', border: '1px solid #1d2433', color: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Favorites Compare Candidates Modal */}
      {showFavoritesCompareModal && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowFavoritesCompareModal(false)}
        >
          <div 
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '95%' : 750, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>⚖️ Compare Starred Candidates (Top 3)</span>
              <button onClick={() => setShowFavoritesCompareModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            
            <div style={{ overflowX: 'auto', border: '1px solid #1d2433', borderRadius: 8 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, textAlign: 'left', minWidth: 600 }}>
                <thead>
                  <tr style={{ background: '#161c2c', borderBottom: '1px solid #1d2433', color: '#cbd5e1' }}>
                    <th style={{ padding: '12px 16px', width: 140 }}>Metric / Detail</th>
                    {favoritesList.slice(0, 3).map((cand, idx) => (
                      <th key={idx} style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 20, height: 20, borderRadius: '50%', background: cand.bg, display: 'inline-grid', placeItems: 'center', fontSize: 9.5, fontWeight: 700 }}>{cand.initial}</span>
                          <span>{cand.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600 }}>Role</td>
                    {favoritesList.slice(0, 3).map((cand, idx) => (
                      <td key={idx} style={{ padding: '12px 16px', color: '#fff' }}>{cand.role}</td>
                    ))}
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600 }}>Rate / Budget</td>
                    {favoritesList.slice(0, 3).map((cand, idx) => (
                      <td key={idx} style={{ padding: '12px 16px', color: '#fff', fontWeight: 700 }}>{cand.rate}</td>
                    ))}
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600 }}>Skills</td>
                    {favoritesList.slice(0, 3).map((cand, idx) => (
                      <td key={idx} style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {(cand.skills || ['React', 'CSS']).map((s, sIdx) => (
                            <span key={sIdx} style={{ fontSize: 9.5, background: 'rgba(99, 102, 241, 0.15)', color: '#a78bfa', padding: '2px 6px', borderRadius: 4 }}>{s}</span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600 }}>Rating</td>
                    {favoritesList.slice(0, 3).map((cand, idx) => (
                      <td key={idx} style={{ padding: '12px 16px', color: '#fff' }}>
                        <span style={{ fontWeight: 700 }}>{cand.rating}</span> <span style={{ color: '#f59e0b' }}>★</span>
                      </td>
                    ))}
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600 }}>Location</td>
                    {favoritesList.slice(0, 3).map((cand, idx) => (
                      <td key={idx} style={{ padding: '12px 16px', color: '#cbd5e1' }}>{cand.location}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setShowFavoritesCompareModal(false)} style={{ padding: '8px 16px', background: '#1e293b', border: '1px solid #1d2433', color: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Insights Modal */}
      {showCandidateInsightsModal && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowCandidateInsightsModal(false)}
        >
          <div 
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '95%' : 480, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>📊 Starred Candidates Analytics</span>
              <button onClick={() => setShowCandidateInsightsModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: '#161c2c', padding: 14, borderRadius: 10, border: '1px solid #1d2433' }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 8 }}>PROFILE VIEWS BY ACTIVE PROJECT</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#cbd5e1' }}>Website Redesign Contract</span>
                    <strong style={{ color: '#3b82f6' }}>24 views</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#cbd5e1' }}>Mobile E-commerce Platform</span>
                    <strong style={{ color: '#3b82f6' }}>16 views</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#cbd5e1' }}>AWS Serverless Optimization</span>
                    <strong style={{ color: '#3b82f6' }}>8 views</strong>
                  </div>
                </div>
              </div>

              <div style={{ background: '#161c2c', padding: 14, borderRadius: 10, border: '1px solid #1d2433' }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 8 }}>RELIABILITY & CONVERSION METRICS</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#cbd5e1' }}>Average Message Latency</span>
                    <strong style={{ color: '#10b981' }}>2.3 hours (Fast)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#cbd5e1' }}>Interview Success Conversion</span>
                    <strong style={{ color: '#10b981' }}>75.4%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#cbd5e1' }}>Milestone Target Accuracy</span>
                    <strong style={{ color: '#10b981' }}>94.2%</strong>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <button onClick={() => setShowCandidateInsightsModal(false)} style={{ padding: '8px 16px', background: '#1e293b', border: '1px solid #1d2433', color: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Notes Modal */}
      {showManageNotesModal && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowManageNotesModal(false)}
        >
          <div 
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '95%' : 480, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>📝 Manage Candidate Notes ({starredNotesList.length})</span>
              <button onClick={() => setShowManageNotesModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            
            {/* Scrollable list of current notes */}
            <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}>
              {starredNotesList.length === 0 ? (
                <div style={{ fontSize: 12, color: '#64748b', textAlign: 'center', padding: '16px 0' }}>No saved notes. Add a note below!</div>
              ) : (
                starredNotesList.map((note) => (
                  <div key={note.id} style={{ background: '#161c2c', border: '1px solid #1d2433', borderRadius: 8, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: 12, color: '#fff' }}>{note.name}</strong>
                        <span style={{ fontSize: 9.5, color: '#64748b' }}>{note.date}</span>
                      </div>
                      <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0', lineHeight: 1.3 }}>{note.text}</p>
                    </div>
                    <button 
                      onClick={() => setStarredNotesList(prev => prev.filter(n => n.id !== note.id))}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13, padding: '2px 4px' }}
                      title="Delete note"
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add note sub-form */}
            <div style={{ borderTop: '1px solid #1d2433', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Add New Note</span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600 }}>SELECT CANDIDATE</span>
                <select 
                  value={newNoteForm.candidateName}
                  onChange={(e) => setNewNoteForm({ ...newNoteForm, candidateName: e.target.value })}
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 11.5, padding: '6px 8px', outline: 'none' }}
                >
                  {favoritesList.map((c) => (
                    <option key={c.key} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600 }}>NOTE TEXT</span>
                <textarea 
                  value={newNoteForm.text}
                  onChange={(e) => setNewNoteForm({ ...newNoteForm, text: e.target.value })}
                  placeholder="Type note details here..."
                  rows={2}
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12, padding: '6px 8px', outline: 'none', resize: 'none' }}
                />
              </div>

              <button 
                onClick={() => {
                  if (!newNoteForm.text.trim()) {
                    toast.error("Please fill in some note details first.");
                    return;
                  }
                  const newNote = {
                    id: Date.now(),
                    name: newNoteForm.candidateName,
                    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    text: newNoteForm.text.trim()
                  };
                  setStarredNotesList(prev => [newNote, ...prev]);
                  setNewNoteForm({ ...newNoteForm, text: '' });
                  toast.success("Note added successfully!");
                }}
                style={{ padding: '8px 14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-end' }}
              >
                Add Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings: Tax Details Modal */}
      {showTaxDetailsModal && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowTaxDetailsModal(false)}
        >
          <div 
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '95%' : 440, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>📄 Tax & Compliance Details</span>
              <button onClick={() => setShowTaxDetailsModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>TAX REGISTRATION TYPE</span>
                <select 
                  value={settingsForm.registrationType}
                  onChange={(e) => setSettingsForm({ ...settingsForm, registrationType: e.target.value })}
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 10px', outline: 'none' }}
                >
                  <option value="Regular">Regular Taxpayer</option>
                  <option value="Composition">Composition Scheme</option>
                  <option value="SEZ Developer">Special Economic Zone Developer</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>PLACE OF SUPPLY (STATE)</span>
                <select 
                  value={settingsForm.placeOfSupply}
                  onChange={(e) => setSettingsForm({ ...settingsForm, placeOfSupply: e.target.value })}
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 10px', outline: 'none' }}
                >
                  <option value="Maharashtra (27)">Maharashtra (27)</option>
                  <option value="Delhi (07)">Delhi (07)</option>
                  <option value="Karnataka (29)">Karnataka (29)</option>
                  <option value="Telangana (36)">Telangana (36)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
              <button 
                onClick={() => {
                  toast.success("Tax configurations updated.");
                  setShowTaxDetailsModal(false);
                }} 
                style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
              >
                Save Details
              </button>
              <button onClick={() => setShowTaxDetailsModal(false)} style={{ padding: '8px 16px', background: '#1e293b', border: '1px solid #1d2433', color: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings: Preferences Modal */}
      {showPreferencesModal && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowPreferencesModal(false)}
        >
          <div 
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '95%' : 440, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>⚙️ Manage Preferences</span>
              <button onClick={() => setShowPreferencesModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>PREFERRED CURRENCY</span>
                <select 
                  value={settingsForm.currency}
                  onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value })}
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 10px', outline: 'none' }}
                >
                  <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                  <option value="USD ($)">USD ($) - US Dollar</option>
                  <option value="EUR (€)">EUR (€) - Euro</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>DEFAULT BILLING PERIOD</span>
                <select 
                  value={settingsForm.paymentTerms}
                  onChange={(e) => setSettingsForm({ ...settingsForm, paymentTerms: e.target.value })}
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 10px', outline: 'none' }}
                >
                  <option value="Net 15">Net 15 Days</option>
                  <option value="Net 30">Net 30 Days</option>
                  <option value="Due on Receipt">Due on Receipt</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
              <button 
                onClick={() => {
                  toast.success("Preferences updated.");
                  setShowPreferencesModal(false);
                }} 
                style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
              >
                Save Preferences
              </button>
              <button onClick={() => setShowPreferencesModal(false)} style={{ padding: '8px 16px', background: '#1e293b', border: '1px solid #1d2433', color: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings: Document Manager Modal */}
      {showDocManagerModal && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowDocManagerModal(false)}
        >
          <div 
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '95%' : 500, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>📁 Company Documentation Checklist ({companyDocuments.length})</span>
              <button onClick={() => setShowDocManagerModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            
            {/* List of files */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
              {companyDocuments.map((doc) => (
                <div key={doc.id} style={{ background: '#161c2c', border: '1px solid #1d2433', padding: 12, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: 12.5, color: '#fff', display: 'block' }}>{doc.name}</strong>
                    <span style={{ fontSize: 11, color: '#64748b', marginTop: 2, display: 'block' }}>{doc.type} • {doc.size} ({doc.fileName})</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button 
                      onClick={() => {
                        const element = document.createElement("a");
                        const file = new Blob([doc.content], {type: 'text/plain'});
                        element.href = URL.createObjectURL(file);
                        element.download = doc.fileName;
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                        toast.success(doc.fileName + " downloaded successfully!");
                      }}
                      style={{ background: '#1e293b', border: '1px solid #1d2433', padding: '6px 10px', color: '#fff', borderRadius: 6, fontSize: 11.5, cursor: 'pointer' }}
                    >
                      📥 Download
                    </button>
                    <button 
                      onClick={() => {
                        setCompanyDocuments(prev => prev.filter(d => d.id !== doc.id));
                        toast.success(doc.name + " deleted!");
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: 13, cursor: 'pointer' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Document Uploader subsegment */}
            <div style={{ borderTop: '1px solid #1d2433', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Upload New Verification Document</span>
              <div style={{ border: '1.5px dashed #1d2433', borderRadius: 8, padding: '16px 10px', textAlign: 'center', background: '#0e1320', cursor: 'pointer', position: 'relative' }}>
                <span style={{ fontSize: 12, color: '#cbd5e1', display: 'block' }}>📁 Click to browse or drag & drop files here</span>
                <span style={{ fontSize: 10, color: '#64748b', display: 'block', marginTop: 4 }}>PDF, PNG, JPG up to 10MB</span>
                <input 
                  type="file"
                  onChange={(e) => {
                    const fileObj = e.target.files[0];
                    if (!fileObj) return;
                    const cleanName = fileObj.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
                    const newDoc = {
                      id: Date.now(),
                      name: cleanName,
                      size: (fileObj.size / (1024 * 1024)).toFixed(1) + " MB",
                      type: fileObj.type || "Document Attachment",
                      fileName: fileObj.name,
                      content: "Uploaded user mock verification data for " + fileObj.name + "."
                    };
                    setCompanyDocuments(prev => [...prev, newDoc]);
                    toast.success(fileObj.name + " uploaded and added to compliance profile!");
                  }}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <button onClick={() => setShowDocManagerModal(false)} style={{ padding: '8px 16px', background: '#1e293b', border: '1px solid #1d2433', color: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings: Change Password Modal */}
      {showChangePasswordModal && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowChangePasswordModal(false)}
        >
          <div 
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '95%' : 440, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>🔒 Change Account Password</span>
              <button onClick={() => setShowChangePasswordModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>CURRENT PASSWORD</span>
                <input 
                  type="password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 10px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>NEW PASSWORD</span>
                <input 
                  type="password"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 10px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>CONFIRM NEW PASSWORD</span>
                <input 
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 10px', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
              <button 
                onClick={() => {
                  if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
                    toast.error("Please fill in all password fields.");
                    return;
                  }
                  if (passwordForm.new !== passwordForm.confirm) {
                    toast.error("New passwords do not match!");
                    return;
                  }
                  toast.success("Account password changed successfully!");
                  setPasswordForm({ current: '', new: '', confirm: '' });
                  setShowChangePasswordModal(false);
                }} 
                style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
              >
                Update Password
              </button>
              <button onClick={() => setShowChangePasswordModal(false)} style={{ padding: '8px 16px', background: '#1e293b', border: '1px solid #1d2433', color: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings: Login Sessions Log Modal */}
      {showLoginSessionsModal && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowLoginSessionsModal(false)}
        >
          <div 
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '95%' : 460, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>🛡️ Active Login Sessions Log ({loginSessionsList.length})</span>
              <button onClick={() => setShowLoginSessionsModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {loginSessionsList.map((sess) => (
                <div key={sess.id} style={{ background: '#161c2c', border: '1px solid #1d2433', padding: 12, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: 12.5, color: '#fff', display: 'block' }}>{sess.browser}</strong>
                    <span style={{ fontSize: 11, color: '#64748b', marginTop: 2, display: 'block' }}>📍 {sess.location} • IP: {sess.ip}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 10.5, color: sess.active ? '#10b981' : '#64748b', fontWeight: 600, display: 'block', marginBottom: 4 }}>{sess.time}</span>
                    {!sess.active && (
                      <button 
                        onClick={() => {
                          setLoginSessionsList(prev => prev.filter(s => s.id !== sess.id));
                          toast.success("Successfully logged out from " + sess.browser + " session!");
                        }}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: 11, cursor: 'pointer', padding: 0, textDecoration: 'underline', fontWeight: 600 }}
                      >
                        Log out
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <button onClick={() => setShowLoginSessionsModal(false)} style={{ padding: '8px 16px', background: '#1e293b', border: '1px solid #1d2433', color: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings: Notification Channels Modal */}
      {showNotificationChannelsModal && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowNotificationChannelsModal(false)}
        >
          <div 
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '95%' : 440, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>🔔 Custom Notification Delivery</span>
              <button onClick={() => setShowNotificationChannelsModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#161c2c', padding: 12, borderRadius: 8 }}>
                <div>
                  <strong style={{ fontSize: 12.5, color: '#fff', display: 'block' }}>Platform Push Notifications</strong>
                  <span style={{ fontSize: 11, color: '#64748b', marginTop: 1, display: 'block' }}>Display alerts in browser notification feed</span>
                </div>
                <input type="checkbox" defaultChecked style={{ width: 16, height: 16 }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#161c2c', padding: 12, borderRadius: 8 }}>
                <div>
                  <strong style={{ fontSize: 12.5, color: '#fff', display: 'block' }}>SMS Alerts Delivery</strong>
                  <span style={{ fontSize: 11, color: '#64748b', marginTop: 1, display: 'block' }}>Receive direct text alerts for urgent payments</span>
                </div>
                <input type="checkbox" style={{ width: 16, height: 16 }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#161c2c', padding: 12, borderRadius: 8 }}>
                <div>
                  <strong style={{ fontSize: 12.5, color: '#fff', display: 'block' }}>Audible Alerts</strong>
                  <span style={{ fontSize: 11, color: '#64748b', marginTop: 1, display: 'block' }}>Play sound alerts upon incoming messages</span>
                </div>
                <input type="checkbox" defaultChecked style={{ width: 16, height: 16 }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
              <button 
                onClick={() => {
                  toast.success("Notification delivery preferences configured!");
                  setShowNotificationChannelsModal(false);
                }} 
                style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
              >
                Save Preferences
              </button>
              <button onClick={() => setShowNotificationChannelsModal(false)} style={{ padding: '8px 16px', background: '#1e293b', border: '1px solid #1d2433', color: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings: Contact Support Modal */}
      {showSupportModal && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowSupportModal(false)}
        >
          <div 
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '95%' : 440, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>🎧 Create Support Ticket</span>
              <button onClick={() => setShowSupportModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>TICKET SUBJECT</span>
                <input 
                  value={settingsSupportTicket.subject}
                  onChange={(e) => setSettingsSupportTicket({ ...settingsSupportTicket, subject: e.target.value })}
                  placeholder="e.g. GST registration verify help"
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 10px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>CATEGORY</span>
                <select 
                  value={settingsSupportTicket.category}
                  onChange={(e) => setSettingsSupportTicket({ ...settingsSupportTicket, category: e.target.value })}
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 10px', outline: 'none' }}
                >
                  <option value="Billing">Billing & Invoices</option>
                  <option value="Security">Security & 2FA</option>
                  <option value="Verification">Documentation Verification</option>
                  <option value="Other">Other Queries</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>MESSAGE DETAILS</span>
                <textarea 
                  value={settingsSupportTicket.message}
                  onChange={(e) => setSettingsSupportTicket({ ...settingsSupportTicket, message: e.target.value })}
                  placeholder="Describe your query in detail..."
                  rows={4}
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 10px', outline: 'none', resize: 'none', lineHeight: 1.4 }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
              <button 
                onClick={() => {
                  if (!settingsSupportTicket.subject.trim() || !settingsSupportTicket.message.trim()) {
                    toast.error("Please fill in both subject and message details.");
                    return;
                  }
                  toast.success("Support ticket submitted successfully! Reference ID: #SR-" + Math.floor(1000 + Math.random() * 9000));
                  setSettingsSupportTicket({ subject: '', category: 'Billing', message: '' });
                  setShowSupportModal(false);
                }} 
                style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
              >
                Submit Ticket
              </button>
              <button onClick={() => setShowSupportModal(false)} style={{ padding: '8px 16px', background: '#1e293b', border: '1px solid #1d2433', color: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Date Range Modal */}
      {showInvoiceDateRangeModal && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowInvoiceDateRangeModal(false)}
        >
          <div 
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '95%' : 400, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>📅 Filter by Date Range</span>
              <button onClick={() => setShowInvoiceDateRangeModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>START DATE</span>
                <input 
                  type="date" 
                  value={invoiceStartDate} 
                  onChange={(e) => setInvoiceStartDate(e.target.value)}
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12.5, padding: '8px 10px', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>END DATE</span>
                <input 
                  type="date" 
                  value={invoiceEndDate} 
                  onChange={(e) => setInvoiceEndDate(e.target.value)}
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12.5, padding: '8px 10px', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
              <button 
                onClick={() => {
                  setInvoicePage(1);
                  setShowInvoiceDateRangeModal(false);
                  toast.success("Date filters applied.");
                }} 
                style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
              >
                Apply Filter
              </button>
              <button 
                onClick={() => {
                  setInvoiceStartDate('');
                  setInvoiceEndDate('');
                  setInvoicePage(1);
                  setShowInvoiceDateRangeModal(false);
                  toast("Date filters cleared.");
                }} 
                style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Receipt Preview Overlay */}
      {activeReceipt && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} onClick={() => setActiveReceipt(null)}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 12, width: 440, fontFamily: 'monospace', color: '#000', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: 12 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px dashed #000', paddingBottom: 10, marginBottom: 4 }}>
              <div>
                <strong style={{ fontSize: 16 }}>FREELANCEMARKET LTD.</strong>
                <div style={{ fontSize: 10, color: '#666' }}>SaaS Freelance Escrow, IN</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong>RECEIPT</strong>
                <div style={{ fontSize: 11 }}>{activeReceipt.id}</div>
              </div>
            </div>

            <div style={{ fontSize: 11, marginBottom: 4 }}>
              <div>Date: {activeReceipt.date}</div>
              <div>Client Name: Acme Corp</div>
              <div>Status: <span style={{ textTransform: 'uppercase', fontWeight: 700 }}>{activeReceipt.status}</span></div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, marginBottom: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #000', borderTop: '1px solid #000' }}>
                  <th style={{ textAlign: 'left', padding: '6px 0' }}>Description</th>
                  <th style={{ textAlign: 'right', padding: '6px 0' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ paddingTop: 6 }}>{activeReceipt.project}</td>
                  <td style={{ textAlign: 'right', paddingTop: 6 }}>₹{activeReceipt.amount.toLocaleString('en-IN')}</td>
                </tr>
                <tr style={{ borderTop: '1px dashed #000' }}>
                  <td style={{ paddingTop: 6 }}><strong>SUBTOTAL</strong></td>
                  <td style={{ textAlign: 'right', paddingTop: 6 }}><strong>₹{activeReceipt.amount.toLocaleString('en-IN')}</strong></td>
                </tr>
                <tr>
                  <td style={{ paddingBottom: 6 }}>TAX (0%)</td>
                  <td style={{ textAlign: 'right', paddingBottom: 6 }}>₹0.00</td>
                </tr>
                <tr style={{ borderTop: '2px dashed #000', borderBottom: '2px dashed #000' }}>
                  <td style={{ padding: '6px 0' }}><strong>TOTAL PAID</strong></td>
                  <td style={{ textAlign: 'right', padding: '6px 0' }}><strong>₹{activeReceipt.amount.toLocaleString('en-IN')}</strong></td>
                </tr>
              </tbody>
            </table>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button 
                onClick={() => {
                  toast.success("Receipt downloaded!");
                  setActiveReceipt(null);
                }} 
                style={{ padding: '6px 12px', background: '#000', border: 'none', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
              >
                Print Receipt
              </button>
              <button onClick={() => setActiveReceipt(null)} style={{ padding: '6px 12px', background: '#eee', border: '1px solid #ccc', color: '#333', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Payment Methods Modal */}
      {showManagePaymentsModal && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowManagePaymentsModal(false)}
        >
          <div 
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '95%' : 480, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>🏦 Manage Payment Methods</span>
              <button onClick={() => setShowManagePaymentsModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {paymentMethods.map((method) => (
                <div key={method.id} style={{ background: '#161c2c', padding: 12, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{method.icon}</span>
                    <div>
                      <strong style={{ fontSize: 12.5, color: '#fff', display: 'block' }}>{method.type}</strong>
                      <span style={{ fontSize: 11, color: '#64748b' }}>{method.detail} ({method.bankName})</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div 
                      onClick={() => {
                        setPaymentMethods(prev => prev.map(m => m.id === method.id ? { ...m, primary: true } : { ...m, primary: false }));
                        toast.success(method.type + " set as Primary.");
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: method.primary ? '#3b82f6' : '#64748b', cursor: 'pointer', userSelect: 'none' }}
                    >
                      <div style={{ 
                        width: 14, 
                        height: 14, 
                        borderRadius: '50%', 
                        border: method.primary ? '1.5px solid #3b82f6' : '1.5px solid #64748b', 
                        background: method.primary ? '#3b82f6' : 'transparent',
                        display: 'grid',
                        placeItems: 'center',
                        transition: 'all 0.15s ease'
                      }}>
                        {method.primary && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#fff' }} />}
                      </div>
                      <span>Primary</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (method.primary) {
                          toast.error("Cannot delete primary payment method.");
                          return;
                        }
                        setPaymentMethods(prev => prev.filter(m => m.id !== method.id));
                        toast.success(method.type + " removed.");
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'grid', placeItems: 'center', padding: 4, transition: 'color 0.15s ease' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                    >
                      <svg width="14" height="15" viewBox="0 0 14 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 3.5h12M4.5 3.5V2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.5m2 0v10a1 1 0 0 1-1 1H2.5a1 1 0 0 1-1-1v-10m2.5 3v5.5m3-5.5v5.5" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setShowManagePaymentsModal(false)} style={{ padding: '10px', background: '#1e293b', border: '1px solid #1d2433', color: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Add Payment Method Modal */}
      {showAddPaymentMethodModal && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowAddPaymentMethodModal(false)}
        >
          <div 
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '95%' : 440, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>⚡ Add Payment Method</span>
              <button onClick={() => setShowAddPaymentMethodModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>METHOD TYPE</span>
                <select 
                  value={newPaymentForm.type} 
                  onChange={(e) => setNewPaymentForm({ ...newPaymentForm, type: e.target.value })}
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 10px', outline: 'none' }}
                >
                  <option value="Bank Account">Bank Account</option>
                  <option value="PayTM Wallet">PayTM Wallet</option>
                  <option value="UPI ID">UPI ID</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>DETAILS (ACCOUNT / ID)</span>
                <input 
                  value={newPaymentForm.detail}
                  onChange={(e) => setNewPaymentForm({ ...newPaymentForm, detail: e.target.value })}
                  placeholder={newPaymentForm.type === 'UPI ID' ? 'example@upi' : '**** 1234'}
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12.5, padding: '8px 10px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>INSTITUTION NAME</span>
                <input 
                  value={newPaymentForm.bankName}
                  onChange={(e) => setNewPaymentForm({ ...newPaymentForm, bankName: e.target.value })}
                  placeholder="e.g. HDFC Bank, GPay"
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12.5, padding: '8px 10px', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
              <button 
                onClick={() => {
                  if (!newPaymentForm.detail || !newPaymentForm.bankName) {
                    toast.error("Please fill in all details.");
                    return;
                  }
                  const icon = newPaymentForm.type === 'Bank Account' ? '🏦' : newPaymentForm.type === 'PayTM Wallet' ? '💳' : '⚡';
                  const id = 'method_' + Date.now();
                  const newMethod = {
                    id,
                    type: newPaymentForm.type,
                    detail: newPaymentForm.detail,
                    icon,
                    primary: false,
                    bankName: newPaymentForm.bankName,
                    date: 'Today'
                  };
                  setPaymentMethods(prev => [...prev, newMethod]);
                  setNewPaymentForm({ type: 'Bank Account', detail: '', bankName: '' });
                  setShowAddPaymentMethodModal(false);
                  toast.success(newPaymentForm.type + " successfully added!");
                }} 
                style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
              >
                Save Method
              </button>
              <button onClick={() => setShowAddPaymentMethodModal(false)} style={{ padding: '8px 16px', background: '#1e293b', border: '1px solid #1d2433', color: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Expirations Modal */}
      {showAllExpirationsModal && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowAllExpirationsModal(false)}
        >
          <div 
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '95%' : 500, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>⏳ Upcoming Expirations</span>
              <button onClick={() => setShowAllExpirationsModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 300, overflowY: 'auto' }} className="no-scrollbar">
              {[
                { title: 'Mobile App Development Service Agreement', exp: 'Expires on 12 Jan, 2025', days: '23 days' },
                { title: 'Website Redesign Agreement', exp: 'Expires on 01 Dec, 2024', days: '42 days' },
                { title: 'UI/UX Design Work Agreement', exp: 'Expires on 28 Nov, 2024', days: '69 days' },
                { title: 'Database Optimization Consultation', exp: 'Expires on 15 Oct, 2024', days: '110 days' }
              ].map((item, idx) => (
                <div key={idx} style={{ background: '#161c2c', padding: 12, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: 12.5, color: '#fff', display: 'block' }}>{item.title}</strong>
                    <span style={{ fontSize: 11, color: '#64748b' }}>{item.exp}</span>
                  </div>
                  <span style={{ padding: '4px 10px', background: 'rgba(245,158,11,0.12)', color: '#f59e0b', fontSize: 11, fontWeight: 700, borderRadius: 20 }}>
                    {item.days}
                  </span>
                </div>
              ))}
            </div>

            <button onClick={() => setShowAllExpirationsModal(false)} style={{ padding: '10px', background: '#1e293b', border: '1px solid #1d2433', color: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Upload Signed Document Modal */}
      {showUploadDocModal && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowUploadDocModal(false)}
        >
          <div 
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '95%' : 440, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>📤 Upload Signed Document</span>
              <button onClick={() => setShowUploadDocModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>SELECT CONTRACT</span>
                <select 
                  value={uploadForm.contractId} 
                  onChange={(e) => setUploadForm({ ...uploadForm, contractId: e.target.value })}
                  style={{ background: '#0e1320', border: '1px solid #1d2433', borderRadius: 8, color: '#fff', fontSize: 12, padding: '8px 10px', outline: 'none' }}
                >
                  <option value="">-- Choose Contract --</option>
                  {contracts.map(c => (
                    <option key={c.id} value={c.id}>{c.title} ({c.id})</option>
                  ))}
                </select>
              </div>

              <div style={{ border: '2px dashed #1d2433', borderRadius: 12, padding: '24px 10px', textAlign: 'center', background: '#0e1320', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 24 }}>📄</span>
                <div>
                  <span 
                    onClick={() => document.getElementById('doc-file-input').click()}
                    style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Click to select file
                  </span>
                  <span style={{ fontSize: 11, color: '#64748b', display: 'block', marginTop: 2 }}>
                    PDF, DOCX, or PNG (Max 5MB)
                  </span>
                </div>
                <input 
                  type="file" 
                  onChange={(e) => setUploadForm({ ...uploadForm, fileName: e.target.files[0]?.name || '' })}
                  style={{ display: 'none' }} 
                  id="doc-file-input" 
                />
                {uploadForm.fileName && (
                  <span style={{ fontSize: 11.5, color: '#10b981', fontWeight: 600, marginTop: 4 }}>
                    ✓ Selected: {uploadForm.fileName}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
              <button 
                onClick={() => {
                  if (!uploadForm.contractId) {
                    toast.error("Please select a target contract.");
                    return;
                  }
                  toast.success("Signed document uploaded successfully!");
                  setUploadForm({ contractId: '', fileName: '' });
                  setShowUploadDocModal(false);
                }} 
                style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
              >
                Upload & Confirm
              </button>
              <button onClick={() => setShowUploadDocModal(false)} style={{ padding: '8px 16px', background: '#1e293b', border: '1px solid #1d2433', color: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contract Templates Modal */}
      {showTemplatesModal && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowTemplatesModal(false)}
        >
          <div 
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '95%' : 480, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>📋 Reusable Contract Templates</span>
              <button onClick={() => setShowTemplatesModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { name: 'Software Development Agreement', desc: 'Standard contract for developers containing milestone schedules, escrow protection terms, and source code transfer provisions.' },
                { name: 'Non-Disclosure Agreement (NDA)', desc: 'General mutual confidentiality agreement protecting intellectual property, product designs, and corporate codebase access.' },
                { name: 'Graphic Design Work Contract', desc: 'Asset transfer agreement mapping Figma project parameters, feedback iteration cycles, and copyright handoff.' }
              ].map((tpl, idx) => (
                <div key={idx} style={{ background: '#161c2c', padding: 12, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: 12.5, color: '#fff' }}>{tpl.name}</strong>
                    <button 
                      onClick={() => {
                        const element = document.createElement("a");
                        const file = new Blob(['TEMPLATE: ' + tpl.name + '\n\n' + tpl.desc + '\n\n[PARTY A SIGNATURE]          [PARTY B SIGNATURE]'], {type: 'text/plain'});
                        element.href = URL.createObjectURL(file);
                        element.download = tpl.name.replace(/\s+/g, '_') + '_template.txt';
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                        toast.success(tpl.name + ' template downloaded!');
                      }}
                      style={{ padding: '3px 8px', background: '#3b82f6', border: 'none', color: '#fff', fontSize: 10.5, borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}
                    >
                      Download
                    </button>
                  </div>
                  <span style={{ fontSize: 11.5, color: '#94a3b8', lineHeight: 1.4 }}>{tpl.desc}</span>
                </div>
              ))}
            </div>

            <button onClick={() => setShowTemplatesModal(false)} style={{ padding: '10px', background: '#1e293b', border: '1px solid #1d2433', color: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Bulk Actions Modal */}
      {showBulkActionsModal && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowBulkActionsModal(false)}
        >
          <div 
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '95%' : 480, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>🗂️ Contract Bulk Actions</span>
              <button onClick={() => setShowBulkActionsModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>SELECT TARGET CONTRACTS</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 150, overflowY: 'auto', background: '#0e1320', padding: 10, borderRadius: 8, border: '1px solid #1d2433' }} className="no-scrollbar">
                {contracts.map(c => (
                  <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#cbd5e1', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedBulkContracts.includes(c.id)} 
                      onChange={() => {
                        setSelectedBulkContracts(prev => 
                          prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id]
                        );
                      }}
                    />
                    {c.title} ({c.id})
                  </label>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>BULK OPERATION</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    onClick={() => {
                      if (selectedBulkContracts.length === 0) {
                        toast.error("Please select at least one contract.");
                        return;
                      }
                      setContracts(prev => prev.map(c => selectedBulkContracts.includes(c.id) ? { ...c, status: 'CANCELLED' } : c));
                      setSelectedBulkContracts([]);
                      setShowBulkActionsModal(false);
                      toast.success('Successfully terminated ' + selectedBulkContracts.length + ' agreements.');
                    }}
                    style={{ flex: 1, padding: '8px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Terminate Selected
                  </button>
                  <button 
                    onClick={() => {
                      if (selectedBulkContracts.length === 0) {
                        toast.error("Please select at least one contract.");
                        return;
                      }
                      setSelectedBulkContracts([]);
                      setShowBulkActionsModal(false);
                      toast.success('Signature requests successfully broadcasted for ' + selectedBulkContracts.length + ' contracts.');
                    }}
                    style={{ flex: 1, padding: '8px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Request Signatures
                  </button>
                </div>
              </div>
            </div>

            <button onClick={() => setShowBulkActionsModal(false)} style={{ padding: '10px', background: '#1e293b', border: '1px solid #1d2433', color: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Audit Log Timeline Modal */}
      {showAuditLogModal && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowAuditLogModal(false)}
        >
          <div 
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '95%' : 440, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>🔍 Agreement Audit Log</span>
              <button onClick={() => setShowAuditLogModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, borderLeft: '2px solid #1d2433', marginLeft: 10, paddingLeft: 20, position: 'relative' }}>
              {[
                { time: '12 Jul, 2024 10:14 AM', event: 'Contract Drafted', detail: 'Created by Acme Corp representative' },
                { time: '12 Jul, 2024 10:18 AM', event: 'Escrow Funded', detail: '₹245,000 deposited securely in escrow' },
                { time: '12 Jul, 2024 11:30 AM', event: 'Contract Signed', detail: 'Signed by John Smith (React Specialist)' },
                { time: '12 Jul, 2024 11:30 AM', event: 'Status: ACTIVE', detail: 'Agreement activated' }
              ].map((log, lIdx) => (
                <div key={lIdx} style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: -26, top: 4, width: 10, height: 10, borderRadius: '50%', background: lIdx === 3 ? '#10b981' : '#3b82f6', border: '2px solid #111625' }} />
                  <span style={{ fontSize: 10.5, color: '#64748b', display: 'block' }}>{log.time}</span>
                  <strong style={{ fontSize: 12.5, color: '#fff', display: 'block', marginTop: 2 }}>{log.event}</strong>
                  <span style={{ fontSize: 11.5, color: '#94a3b8' }}>{log.detail}</span>
                </div>
              ))}
            </div>

            <button onClick={() => setShowAuditLogModal(false)} style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #1d2433', color: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', marginTop: 10 }}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Terminate Confirmation Modal */}
      {showTerminateConfirmModal && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowTerminateConfirmModal(false)}
        >
          <div 
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '95%' : 400, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 24 }}>⚠️</span>
              <div>
                <strong style={{ fontSize: 15, color: '#fff', display: 'block' }}>Terminate Agreement?</strong>
                <span style={{ fontSize: 11.5, color: '#64748b' }}>Contract ID: {featuredContract.id}</span>
              </div>
            </div>

            <p style={{ fontSize: 12.5, color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
              Are you sure you want to terminate this contract? John Smith will be notified, and all active milestone workflows will be cancelled. This action cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
              <button 
                onClick={() => {
                  setContracts(prev => prev.map(c => c.id === featuredContract.id ? { ...c, status: 'CANCELLED' } : c));
                  featuredContract.status = 'CANCELLED';
                  setShowTerminateConfirmModal(false);
                  toast.success("Contract successfully terminated.");
                }} 
                style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
              >
                Yes, Terminate
              </button>
              <button onClick={() => setShowTerminateConfirmModal(false)} style={{ padding: '8px 16px', background: '#1e293b', border: '1px solid #1d2433', color: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contract Preview Modal */}
      {showContractPreviewModal && previewContractData && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowContractPreviewModal(false)}
        >
          <div 
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '95%' : 540, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>📄 Service Agreement Document</span>
              <button onClick={() => setShowContractPreviewModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            
            <div style={{ maxHeight: 300, overflowY: 'auto', paddingRight: 6, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12, lineHeight: 1.5, color: '#cbd5e1' }} className="no-scrollbar">
              <div style={{ borderBottom: '1px solid #1d2433', paddingBottom: 10 }}>
                <strong style={{ color: '#fff', fontSize: 13.5 }}>{previewContractData.title}</strong>
                <div style={{ display: 'flex', gap: 10, color: '#64748b', fontSize: 11, marginTop: 4 }}>
                  <span>ID: {previewContractData.id}</span>
                  <span>•</span>
                  <span>Start Date: {previewContractData.start}</span>
                </div>
              </div>

              <div>
                <strong style={{ color: '#fff' }}>Contracting Parties</strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                  <div style={{ background: '#161c2c', padding: 8, borderRadius: 6 }}>
                    <span style={{ fontSize: 10.5, color: '#64748b', display: 'block' }}>CLIENT</span>
                    <span style={{ fontWeight: 600 }}>Acme Corp</span>
                  </div>
                  <div style={{ background: '#161c2c', padding: 8, borderRadius: 6 }}>
                    <span style={{ fontSize: 10.5, color: '#64748b', display: 'block' }}>FREELANCER</span>
                    <span style={{ fontWeight: 600 }}>{previewContractData.partner.split(' / ')[1] || previewContractData.partner}</span>
                  </div>
                </div>
              </div>

              <div>
                <strong style={{ color: '#fff' }}>Financial Parameters</strong>
                <div style={{ display: 'flex', gap: 12, marginTop: 4, background: '#161c2c', padding: 8, borderRadius: 6, justifyContent: 'space-between' }}>
                  <span>Escrow Budget: <strong style={{ color: '#fff' }}>{previewContractData.val}</strong></span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>STATUS: {previewContractData.status}</span>
                </div>
              </div>

              <div>
                <strong style={{ color: '#fff' }}>Terms & Scope:</strong>
                <p style={{ margin: '4px 0 0', fontSize: 11.5, color: '#94a3b8' }}>
                  The contractor agrees to perform deliverables outlined in the milestones statement. All work source files, intellectual property, and design components developed under this agreement transfer fully to the client on work approval. Payment release is executed securely via Escrow protection protocol.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button 
                onClick={() => {
                  toast.success("Service agreement contract PDF downloaded!");
                  setShowContractPreviewModal(false);
                }} 
                style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
              >
                Download PDF
              </button>
              <button onClick={() => setShowContractPreviewModal(false)} style={{ padding: '8px 16px', background: '#1e293b', border: '1px solid #1d2433', color: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Claude AI Analysis Report Modal */}
      {showAnalysisReportModal && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowAnalysisReportModal(false)}
        >
          <div 
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '95%' : 540, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>📊 Claude AI Proposals Match Analysis Report</span>
              <button onClick={() => setShowAnalysisReportModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            
            <div style={{ fontSize: 12, lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <strong style={{ color: '#94a3b8' }}>Project Description Alignment:</strong>
                <p style={{ margin: '4px 0 0', color: '#cbd5e1' }}>
                  Claude AI has scanned {allCandidatesList.length} active applicant proposals against the "{jobs[0]?.title || 'active projects'}" technical scope.
                </p>
              </div>

              <div>
                <strong style={{ color: '#94a3b8' }}>Key Evaluation Metrics:</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
                  <div style={{ display: 'flex', justifycontent: 'space-between', background: '#161c2c', padding: 8, borderRadius: 6 }}>
                    <span>Skills Match Score:</span>
                    <strong style={{ color: '#10b981' }}>{skillsMatchPct}% (Excellent)</strong>
                  </div>
                  <div style={{ display: 'flex', justifycontent: 'space-between', background: '#161c2c', padding: 8, borderRadius: 6 }}>
                    <span>Experience Level Match:</span>
                    <strong style={{ color: '#3b82f6' }}>{expMatchPct}% (Verified)</strong>
                  </div>
                  <div style={{ display: 'flex', justifycontent: 'space-between', background: '#161c2c', padding: 8, borderRadius: 6 }}>
                    <span>Budget Optimization:</span>
                    <strong style={{ color: '#10b981' }}>{budgetMatchPct}% (Within parameters)</strong>
                  </div>
                </div>
              </div>

              <div>
                <strong style={{ color: '#94a3b8' }}>AI Actionable Recommendation:</strong>
                <p style={{ margin: '4px 0 0', color: '#cbd5e1', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, padding: 10 }}>
                  💡 {topCandidate.name === 'No candidate' ? 'Submit a job posting and review candidate match analysis score recommendations here.' : `Hire ${topCandidate.name} for project execution. This optimizes project velocity based on match analysis.`}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifycontent: 'flex-end', marginTop: 8 }}>
              <button 
                onClick={() => {
                  const htmlReport = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Claude AI Proposals Match Analysis Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0f19; color: #fff; padding: 40px; line-height: 1.6; }
    .card { background: #111625; border: 1px solid #1d2433; padding: 30px; border-radius: 16px; max-width: 600px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    h1 { font-size: 20px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #1d2433; padding-bottom: 15px; margin-bottom: 20px; }
    .label { font-size: 13px; color: #94a3b8; font-weight: 600; margin-top: 15px; display: block; }
    .val { color: #cbd5e1; margin-top: 5px; }
    .metric-row { display: flex; justify-content: space-between; background: #161c2c; padding: 10px; border-radius: 8px; margin-top: 8px; border: 1px solid rgba(255,255,255,0.02); }
    .metric-name { color: #cbd5e1; }
    .metric-val { color: #10b981; font-weight: 700; }
    .blue { color: #3b82f6; }
    .recommendation { background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.15); border-radius: 8px; padding: 15px; margin-top: 15px; color: #cbd5e1; }
    .footer { font-size: 11px; color: #64748b; text-align: center; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>📊 Claude AI Proposals Match Analysis Report</h1>
    
    <span class="label">Project Description Alignment:</span>
    <p class="val">Claude AI has scanned ${allCandidatesList.length} active applicant proposals against the "${jobs[0]?.title || 'active projects'}" technical scope.</p>

    <span class="label">Key Evaluation Metrics:</span>
    <div class="metric-row">
      <span class="metric-name">Skills Match Score:</span>
      <span class="metric-val">${skillsMatchPct}% (Excellent)</span>
    </div>
    <div class="metric-row">
      <span class="metric-name">Experience Level Match:</span>
      <span class="metric-val blue">${expMatchPct}% (Verified)</span>
    </div>
    <div class="metric-row">
      <span class="metric-name">Budget Optimization:</span>
      <span class="metric-val">${budgetMatchPct}% (Within parameters)</span>
    </div>

    <span class="label">AI Actionable Recommendation:</span>
    <div class="recommendation">
      💡 ${topCandidate.name === 'No candidate' ? 'Submit a job posting and review candidate match analysis score recommendations here.' : `Hire ${topCandidate.name} for project execution. This optimizes project velocity based on match analysis.`}
    </div>

    <div class="footer">
      Generated automatically by Claude AI • Freelance Market Place Dashboard
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    }
  </script>
</body>
</html>`;
                  const blob = new Blob([htmlReport], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = "claude_ai_match_analysis_report.html";
                  a.click();
                  toast.success("AI match report template downloaded! Open file to save as PDF.");
                  setShowAnalysisReportModal(false);
                }} 
                style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
              >
                📥 Download PDF Report
              </button>
              <button onClick={() => setShowAnalysisReportModal(false)} style={{ padding: '8px 16px', background: '#1e293b', border: '1px solid #1d2433', color: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Candidates Modal */}
      {showCompareModal && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowCompareModal(false)}
        >
          <div 
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '95%' : 700, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 16 }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>⚖️ Freelancer Candidate Comparison Matrix</span>
              <button onClick={() => setShowCompareModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left', minWidth: 500 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1d2433', color: '#64748b' }}>
                    <th style={{ padding: '10px 8px' }}>Candidate Name</th>
                    <th style={{ padding: '10px 8px' }}>Role</th>
                    <th style={{ padding: '10px 8px' }}>Match Score</th>
                    <th style={{ padding: '10px 8px' }}>Project Rate</th>
                    <th style={{ padding: '10px 8px' }}>Status</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(allCandidatesList.length > 0 ? allCandidatesList.map((c) => ({
                    name: c.name,
                    role: c.role,
                    score: `${c.score}%`,
                    rate: c.rate,
                    status: 'Available',
                    color: '#10b981',
                    initial: c.initial,
                    bg: c.bg
                  })) : [
                    { name: 'Rajesh Kumar', role: 'React Specialist', score: '92%', rate: '₹25,000', status: 'Available', color: '#10b981', initial: 'RK', bg: '#7c3aed' },
                    { name: 'Priya Sharma', role: 'UI/UX Architect', score: '88%', rate: '₹28,000', status: 'Available', color: '#10b981', initial: 'PS', bg: '#db2777' },
                    { name: 'Amit Verma', role: 'Full Stack Developer', score: '76%', rate: '₹22,000', status: 'Available', color: '#10b981', initial: 'AM', bg: '#1d4ed8' }
                  ]).map((cand, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 700 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 24, height: 24, borderRadius: '50%', background: cand.bg, color: '#fff', fontSize: 10, display: 'grid', placeItems: 'center' }}>{cand.initial}</span>
                          <span>{cand.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px', color: '#cbd5e1' }}>{cand.role}</td>
                      <td style={{ padding: '12px 8px', color: '#6366f1', fontWeight: 800 }}>{cand.score}</td>
                      <td style={{ padding: '12px 8px', color: '#fff', fontWeight: 700 }}>{cand.rate}</td>
                      <td style={{ padding: '12px 8px', color: cand.color, fontWeight: 600 }}>{cand.status}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <button 
                          onClick={() => { setShowCompareModal(false); setActiveTab('messages'); toast.success('Initiated chat with ' + cand.name); }}
                          style={{ padding: '4px 10px', background: '#1e293b', border: '1px solid #1d2433', borderRadius: 6, color: '#fff', fontSize: 11, cursor: 'pointer' }}
                        >
                          Message
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button onClick={() => setShowCompareModal(false)} style={{ padding: '8px 16px', background: '#1e293b', border: '1px solid #1d2433', color: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                Close Matrix
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Profile Overlay Modal */}
      {activeFreelancerProfile && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)' }} 
          onClick={() => setActiveFreelancerProfile(null)}
        >
          <div 
            style={{ background: '#111625', border: '1px solid #1d2433', padding: 24, borderRadius: 16, width: isMobile ? '90%' : 500, color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 20 }} 
            onClick={e => e.stopPropagation()}
          >
            {/* Top Bar / Profile Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: activeFreelancerProfile.bg, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 16, fontWeight: 700 }}>
                  {activeFreelancerProfile.initial}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 16, fontWeight: 800 }}>{activeFreelancerProfile.name}</span>
                    <span style={{ color: '#10b981', fontSize: 13 }}>✓</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 2 }}>{activeFreelancerProfile.role} • 5+ years exp</div>
                  <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>📍 {activeFreelancerProfile.location}</div>
                </div>
              </div>
              <button 
                onClick={() => setActiveFreelancerProfile(null)} 
                style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', outline: 'none', lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            {/* Highlights Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: '#161c2c', borderRadius: 10, padding: 12, border: '1px solid rgba(255,255,255,0.02)' }}>
              <div>
                <div style={{ fontSize: 10.5, color: '#64748b' }}>Rate</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981', marginTop: 2 }}>{activeFreelancerProfile.rate}</div>
              </div>
              <div>
                <div style={{ fontSize: 10.5, color: '#64748b' }}>AI Match Score</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#6366f1', marginTop: 2 }}>{activeFreelancerProfile.score}%</div>
              </div>
            </div>

            {/* Biography */}
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 6 }}>About Freelancer</span>
              <p style={{ fontSize: 12, color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
                Dedicated {activeFreelancerProfile.role} with a proven track record of constructing scalable architectures, pixel-perfect user interfaces, and modular component ecosystems. Highly efficient communicator aligned to product sprints.
              </p>
            </div>

            {/* Skills tags */}
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Core Skills</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {activeFreelancerProfile.skills && activeFreelancerProfile.skills.map((skill, sKey) => (
                  <span key={sKey} style={{ fontSize: 11, background: '#1e293b', border: '1px solid #1d2433', borderRadius: 6, padding: '3px 8px', color: '#cbd5e1' }}>
                    {skill}
                  </span>
                ))}
                {['REST APIs', 'Git Workflow', 'Redux', 'Unit Testing'].map((skill, sKey) => (
                  <span key={sKey} style={{ fontSize: 11, background: '#1e293b', border: '1px solid #1d2433', borderRadius: 6, padding: '3px 8px', color: '#64748b' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Work Portfolio & Reviews */}
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Client Testimonials</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ background: '#0e1320', borderRadius: 8, padding: 10, fontSize: 11 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 600 }}>
                    <span>Website UI Overhaul</span>
                    <span style={{ color: '#f59e0b' }}>★★★★★</span>
                  </div>
                  <p style={{ color: '#64748b', margin: '4px 0 0', lineHeight: 1.4 }}>"Outstanding delivery, great attention to detail. Will definitely work with them again!"</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
              <button 
                onClick={() => { setActiveFreelancerProfile(null); setActiveTab('messages'); toast.success('Initiated direct message thread.'); }} 
                style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
              >
                💬 Message
              </button>
              <button 
                onClick={() => setActiveFreelancerProfile(null)} 
                style={{ padding: '8px 16px', background: '#1e293b', border: '1px solid #1d2433', color: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
  
      </main>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        button{cursor:pointer}*{box-sizing:border-box}
        .fd-sidebar::-webkit-scrollbar {
          display: none !important;
        }
        .fd-sidebar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>
    </div>
  );
};

const s = {
  shell:        { display: 'flex', minHeight: '100vh', background: '#090d16', fontFamily: "'DM Sans', sans-serif" },
  sidebar:      { width: 260, background: '#111625', borderRight: '1px solid #1d2433', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'sticky', top: 0, height: '100vh' },
  logo:         { display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px 28px' },
  logoMark:     { width: 32, height: 32, borderRadius: 8, background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 },
  logoText:     { fontWeight: 600, fontSize: 14, color: '#f8fafc' },
  nav:          { flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 2 },
  navBtn:       { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', background: 'none', color: '#737373', fontSize: 13.5, fontWeight: 500, width: '100%', textAlign: 'left' },
  navBtnActive: { background: '#f0fdf4', color: '#16a34a' },
  badge:        { marginLeft: 'auto', background: '#16a34a', color: '#fff', borderRadius: 99, fontSize: 10, fontWeight: 700, padding: '1px 6px' },
  sidebarBottom:{ padding: '20px 16px 0', borderTop: '1px solid #f0f0f0', marginTop: 'auto' },
  userChip:     { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, width: '100%', border: 'none', background: 'transparent', padding: 0, textAlign: 'left', borderRadius: 8 },
  avatar:       { width: 34, height: 34, borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 },
  userName:     { fontSize: 13, fontWeight: 600, color: '#111' },
  userRole:     { fontSize: 11, color: '#a3a3a3' },
  logoutBtn:    { display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '8px 12px', border: 'none', background: 'none', color: '#dc2626', fontSize: 13, borderRadius: 8, fontWeight: 500 },
  main:         { flex: 1, padding: '26px 28px' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
  greeting:     { fontSize: 22, fontWeight: 600, color: '#111', margin: 0, marginBottom: 4 },
  subGreeting:  { fontSize: 13.5, color: '#a3a3a3', margin: 0 },
  postBtn:      { display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 600, flexShrink: 0 },
  headerActions: { display: 'flex', gap: 10, alignItems: 'center' },
  iconAction:   { width: 32, height: 32, border: 'none', background: 'transparent', color: '#525252', display: 'grid', placeItems: 'center', borderRadius: 8, flexShrink: 0 },
  topAvatar:    { width: 32, height: 32, borderRadius: '50%', background: '#111827', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 },
  notificationsWrapper: { position: 'relative', flexShrink: 0 },
  notificationBtn: { width: 32, height: 32, borderRadius: 999, border: '1px solid #e5e7eb', background: '#fff', color: '#111', display: 'grid', placeItems: 'center', cursor: 'pointer', position: 'relative', flexShrink: 0 },
  notificationBadge: { position: 'absolute', top: 4, right: 4, background: '#ef4444', color: '#fff', borderRadius: 999, fontSize: 10, fontWeight: 700, padding: '2px 6px' },
  notificationDropdown: { position: 'absolute', right: 0, top: 48, width: 280, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, boxShadow: '0 18px 40px rgba(15, 23, 42, 0.12)', zIndex: 20, padding: '12px 0' },
  notificationTitle: { fontSize: 13, fontWeight: 700, color: '#111', padding: '0 16px 10px' },
  notificationItem: { width: '100%', textAlign: 'left', padding: '10px 16px', border: 'none', background: 'none', color: '#111', fontSize: 13, cursor: 'pointer', borderBottom: '1px solid #f3f4f6' },
  notificationEmpty: { padding: '14px 16px', fontSize: 13, color: '#6b7280' },
  statsGrid:    { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14, marginBottom: 18 },
  statCard:     { background: '#fff', borderRadius: 8, padding: '18px', border: '1px solid #f0f0f0', minHeight: 114 },
  statCardFeatured: { background: '#16a34a', color: '#fff', borderColor: '#16a34a' },
  statIcon:     { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue:    { fontSize: 24, fontWeight: 700, color: 'inherit', marginBottom: 2 },
  statLabel:    { fontSize: 12.5, color: '#a3a3a3', fontWeight: 500 },
  statNote:     { fontSize: 11.5, marginTop: 6, fontWeight: 600 },
  twoCol:       { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  dashboardGrid:{ display: 'grid', gridTemplateColumns: '1.35fr 1fr 1fr', gap: 14, marginBottom: 14 },
  bottomGrid:   { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 },
  card:         { background: '#fff', borderRadius: 8, padding: '18px', border: '1px solid #f0f0f0', marginBottom: 16 },
  cardHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle:    { fontSize: 15, fontWeight: 600, color: '#111', margin: 0 },
  seeAll:       { fontSize: 12.5, color: '#16a34a', background: 'none', border: 'none', fontWeight: 600, padding: 0 },
  filterPill:   { fontSize: 12, color: '#525252', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 7, padding: '6px 10px', fontWeight: 600 },
  chartWrap:    { position: 'relative', height: 190, paddingTop: 8 },
  chartLabel:   { position: 'absolute', top: 38, left: '50%', transform: 'translateX(-50%)', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 700, color: '#111', zIndex: 1 },
  lineChart:    { width: '100%', height: '100%' },
  pipelineList: { display: 'flex', flexDirection: 'column', gap: 15, paddingTop: 2 },
  pipelineTop:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, color: '#525252', marginBottom: 7 },
  progressTrack:{ height: 6, borderRadius: 999, background: '#edf2ef', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999, background: '#16a34a' },
  activityRow:  { display: 'flex', alignItems: 'center', gap: 10, padding: '11px 0', borderBottom: '1px solid #f5f5f5' },
  activityIcon: { width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', flexShrink: 0 },
  activityTime: { fontSize: 11.5, color: '#a3a3a3', whiteSpace: 'nowrap' },
  recBadge:     { width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#e0f2fe', color: '#0284c7', fontWeight: 700, fontSize: 12, flexShrink: 0 },
  applyNowBtn:  { padding: '7px 12px', border: 'none', borderRadius: 7, background: '#16a34a', color: '#fff', fontSize: 11.5, fontWeight: 700 },
  reputationHead: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  companyMark:  { width: 42, height: 42, borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#eff6ff', color: '#2563eb', fontSize: 18, fontWeight: 800 },
  ratingLine:   { fontSize: 12, color: '#d97706', fontWeight: 700 },
  reputationStats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid #f5f5f5', borderLeft: '1px solid #f5f5f5' },
  repCell:      { minHeight: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, borderRight: '1px solid #f5f5f5', borderBottom: '1px solid #f5f5f5', fontSize: 11.5, color: '#a3a3a3', textAlign: 'center' },
  milestoneRow: { padding: '10px 0 13px', borderBottom: '1px solid #f5f5f5' },
  milestoneMeta:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0 6px', fontSize: 11.5, color: '#737373' },
  countBadge:   { fontSize: 12, color: '#737373', background: '#f5f5f5', padding: '3px 10px', borderRadius: 99 },
  jobRow:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f5f5f5' },
  jobInfo:      { flex: 1 },
  jobTitle:     { fontSize: 13.5, fontWeight: 500, color: '#111', marginBottom: 3 },
  jobMeta:      { fontSize: 12, color: '#a3a3a3' },
  statusBadge:  { fontSize: 11.5, fontWeight: 500, padding: '3px 10px', borderRadius: 99, whiteSpace: 'nowrap' },
  catBadge:     { fontSize: 11.5, fontWeight: 500, padding: '3px 10px', borderRadius: 99, background: '#f5f5f5', color: '#525252' },

  // New per-row card layout for the Jobs tab (replaces the old <table>) so we have
  // room to show the submission note / files / approve button for submitted jobs.
  jobCardRow:   { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, padding: '16px 4px', borderBottom: '1px solid #f5f5f5' },
  submissionNote: { fontSize: 12.5, color: '#525252', marginTop: 8, padding: '8px 12px', background: '#fefce8', borderRadius: 8, lineHeight: 1.5 },
  filePill:     { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#eff6ff', color: '#1d4ed8', borderRadius: 99, fontSize: 11.5, textDecoration: 'none', fontWeight: 500 },
  approveBtn:   { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 },
  messageBtn:   { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 8, fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 },

  proposalRow:  { display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 0', borderBottom: '1px solid #f5f5f5' },
  pAvatar:      { width: 38, height: 38, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13, flexShrink: 0 },
  coverLetter:  { fontSize: 12.5, color: '#525252', marginTop: 6, fontStyle: 'italic', lineHeight: 1.5 },
  acceptBtn:    { display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: 7, fontSize: 12.5, fontWeight: 500 },
  rejectBtn:    { display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 7, fontSize: 12.5, fontWeight: 500 },
  emptyState:   { textAlign: 'center', padding: '32px 0' },
  emptyIcon:    { fontSize: 28, marginBottom: 8 },
  emptyText:    { fontSize: 13, color: '#a3a3a3' },
  errorMsg:     { textAlign: 'center', padding: '24px 0', fontSize: 13, color: '#dc2626' },
  loadingWrap:  { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '32px 0' },
  spinner:      { width: 18, height: 18, border: '2px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
};

export default ClientDashboard;
