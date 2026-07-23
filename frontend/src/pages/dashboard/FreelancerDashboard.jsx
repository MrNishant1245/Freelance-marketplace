import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { jobAPI, profileAPI, messageAPI } from '../../api';
import '../../styles/FreelancerDashboard.css';

// ── Icons Helper Component using clean SVGs ─────────────────────────────────
const Icon = ({ name, size = 18 }) => {
  const icons = {
    search: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    briefcase: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>,
    dollar: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
    star: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    check: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>,
    message: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
    logout: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    send: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
    clock: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    user: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    x: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    filter: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>,
    chevDown: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>,
    chevronCircle: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="14 16 10 12 14 8" /></svg>,
    bookmark: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>,
    paperclip: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>,
    file: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>,
    work: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>,
    upload: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>,
    bell: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
    mail: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
    globe: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
    card: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
    copy: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>,
    settings: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
    analytics: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
    people: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    award: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>,
    sun: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
    moon: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
    edit: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    switch: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="16 3 21 8 16 13" /><line x1="21" y1="8" x2="9" y2="8" /><polyline points="8 21 3 16 8 11" /><line x1="3" y1="16" x2="15" y2="16" /></svg>,
    help: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    menu: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
  };
  return icons[name] || null;
};

// ── Mock Quiz Data for Skill Tests ──────────────────────────────────────────
const QUIZ_QUESTIONS = {
  'React.js': [
    {
      q: "Which Hook is used to handle side effects in a functional component?",
      options: ["useState", "useEffect", "useContext", "useReducer"],
      ans: 1
    },
    {
      q: "How can you optimize performance for a child component to prevent unnecessary re-renders?",
      options: ["React.memo()", "useCallback()", "useMemo()", "useState()"],
      ans: 0
    },
    {
      q: "What is the main purpose of the virtual DOM in React?",
      options: [
        "To compile JSX into standard JavaScript",
        "To directly mutate the browser's document object model",
        "To calculate differences in component state and update the real DOM efficiently",
        "To provide a secure sandbox for code execution"
      ],
      ans: 2
    }
  ],
  'Node.js': [
    {
      q: "Which built-in module is used to create a web server in Node.js?",
      options: ["fs", "path", "http", "url"],
      ans: 2
    },
    {
      q: "What is the function of the package.json file?",
      options: [
        "To store encrypted database credentials",
        "To specify project metadata, script commands, and third-party dependencies",
        "To configure local routing environment variables",
        "To bundle static CSS stylesheets for delivery"
      ],
      ans: 1
    },
    {
      q: "What design pattern does the EventEmitter class implement in Node.js?",
      options: ["Singleton", "Observer", "Factory", "Decorator"],
      ans: 1
    }
  ],
  'MongoDB': [
    {
      q: "What type of database is MongoDB?",
      options: ["Relational Database", "Document-oriented NoSQL Database", "Key-Value store", "Graph Database"],
      ans: 1
    },
    {
      q: "Which command is used to insert a single document in a collection?",
      options: ["db.collection.add()", "db.collection.insert()", "db.collection.save()", "db.collection.insertOne()"],
      ans: 3
    },
    {
      q: "What is a primary benefit of using indexes in MongoDB?",
      options: ["To encrypt document fields automatically", "To improve query execution performance and retrieval speed", "To validate document schemas", "To partition database clusters"],
      ans: 1
    }
  ]
};

// ── Initial Mock Data for Interactive Tabs ───────────────────────────────────
const INITIAL_FORUM_POSTS = [
  {
    id: 1,
    author: "Abhishek Rajput",
    role: "Freelancer",
    time: "2h ago",
    title: "React 19 features discussion - what are you guys excited about?",
    body: "With React 19 on the horizon, the React Compiler (React Forget) is finally going to automate dependency tracking for useMemo and useCallback. This is going to save so much boilerplate! What are your thoughts on the new Server Actions and Action hooks?",
    likes: 12,
    replies: 5,
    category: "Development",
    liked: false
  },
  {
    id: 2,
    author: "Aarav Sharma",
    role: "Freelancer",
    time: "5h ago",
    title: "Tips for writing high-converting proposals to clients",
    body: "I noticed a 40% increase in my proposal response rates when I started doing three things: 1) Addressing the client's problem statement in the first two sentences instead of talking about myself. 2) Attaching a custom 2-minute loom video explaining my proposed approach. 3) Asking a strategic question at the end to prompt a conversation.",
    likes: 24,
    replies: 8,
    category: "General",
    liked: false
  },
  {
    id: 3,
    author: "Neha Patel",
    role: "Freelancer",
    time: "1d ago",
    title: "Freelance tax rates in India: what presumptive taxation can we claim?",
    body: "Hey guys! Under Section 44ADA of the Income Tax Act, we can opt for presumptive taxation and pay tax on only 50% of our gross receipts if they are under 75 lakhs. Do we still need to maintain detailed expense invoices if we opt for this presumptive scheme?",
    likes: 8,
    replies: 14,
    category: "General",
    liked: false
  },
  {
    id: 4,
    author: "Rohan Das",
    role: "Designer",
    time: "2d ago",
    title: "Figma variable modes vs component variants for dark mode themes",
    body: "For those working on multi-theme SaaS platforms, do you find it cleaner to use Figma's variable modes (toggling values on the collection level) or create duplicate component variants for light and dark modes? Variables have cut down our component library size by 50%.",
    likes: 19,
    replies: 3,
    category: "Design",
    liked: false
  }
];

const INITIAL_TRANSACTIONS = [];

const proposalStatus = {
  pending: { bg: '#fffbeb', color: '#b45309', label: 'Pending' },
  shortlisted: { bg: '#f0fdf4', color: '#16a34a', label: 'Shortlisted ⭐' },
  accepted: { bg: '#f0fdf4', color: '#16a34a', label: 'Accepted ✅' },
  rejected: { bg: '#fef2f2', color: '#ef4444', label: 'Rejected' },
};

const jobStatusStyle = {
  in_progress: { bg: '#eff6ff', color: '#1d4ed8', label: 'In Progress' },
  submitted: { bg: '#fffbeb', color: '#b45309', label: 'Submitted ⏳' },
  completed: { bg: '#f0fdf4', color: '#16a34a', label: 'Completed ✅' },
};

const CATEGORIES = ['Web Development', 'Mobile Apps', 'Design & UI/UX', 'Backend / API', 'Data Science', 'Marketing & SEO', 'Content Writing', 'Video & Animation', 'DevOps & Cloud', 'Other'];
const SKILLS_LIST = ['React', 'Node.js', 'Python', 'MongoDB', 'PostgreSQL', 'Figma', 'Vue.js', 'Angular', 'PHP', 'Laravel', 'Django', 'Flutter', 'Swift', 'Kotlin', 'AWS', 'Docker', 'GraphQL', 'TypeScript', 'Next.js', 'WordPress'];

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

const LoadingSpinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '32px 0' }}>
    <div style={{ width: 20, height: 20, border: '2.5px solid #e2e8f0', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    <span style={{ fontSize: 13.5, color: '#64748b', fontWeight: 500 }}>Loading...</span>
  </div>
);

const EmptyState = ({ message }) => (
  <div style={{ textAlign: 'center', padding: '36px 0', background: '#f8fafc', borderRadius: 12, border: '1px dashed #cbd5e1' }}>
    <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
    <div style={{ fontSize: 13.5, color: '#64748b', fontWeight: 600 }}>{message}</div>
  </div>
);

// ── Submit Work Modal ──────────────────────────────────────────────────────────
const SubmitWorkModal = ({ job, onClose, onSubmit, submitting }) => {
  const { isDarkMode } = useAuth();
  const [note, setNote] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await profileAPI.uploadFile(formData);
      const url = res.data?.data?.url || res.data?.url || res.data?.fileUrl;
      if (url) setFiles(prev => [...prev, { name: file.name, url }]);
      else toast.error('Upload failed — URL not received.');
    } catch (err) {
      toast.error('File upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!note.trim() && files.length === 0) {
      toast.error('Please attach a note or file!');
      return;
    }
    onSubmit(job._id, {
      submissionNote: note,
      submissionFiles: files.map(f => ({ url: f.url, name: f.name })),
    });
  };

  return (
    <div className="fd-quiz-overlay" onClick={onClose}>
      <div className="fd-quiz-modal" onClick={(e) => e.stopPropagation()} style={{ width: 500 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Submit Work</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>{job.title}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><Icon name="x" /></button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>Submission Note</label>
          <textarea rows={4} placeholder="Tell the client what you're delivering, what changes you made, or instructions..."
            value={note} onChange={(e) => setNote(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5, color: '#0f172a', outline: 'none', resize: 'vertical', minHeight: 100 }} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>Delivery Files <span style={{ color: '#94a3b8', textTransform: 'none', fontWeight: 400 }}>(optional)</span></label>
          {files.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
              {files.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: '#ecfdf5', borderRadius: 8, border: '1px solid #a7f3d0' }}>
                  <Icon name="file" />
                  <a href={f.url} target="_blank" rel="noreferrer" style={{ flex: 1, fontSize: 12.5, color: '#047857', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</a>
                  <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><Icon name="x" /></button>
                </div>
              ))}
            </div>
          )}
          <input type="file" id="delivery-file" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files[0]; if (f) handleUpload(f); e.target.value = ''; }} />
          <button type="button" onClick={() => document.getElementById('delivery-file').click()} disabled={uploading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', border: '1.5px dashed #cbd5e1', borderRadius: 8, background: isDarkMode ? '#071422' : '#f8fafc', color: isDarkMode ? '#dbeafe' : '#475569', fontSize: 13, fontWeight: 600, width: '100%', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="paperclip" /> {uploading ? 'Uploading…' : files.length > 0 ? 'Add another file' : 'Upload Delivery File'}
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: '9px 18px', border: '1px solid #cbd5e1', borderRadius: 8, background: isDarkMode ? '#071422' : '#fff', fontSize: 13.5, color: isDarkMode ? '#dbeafe' : '#475569', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={submitting || uploading}
            style={{ padding: '9px 20px', border: 'none', borderRadius: 8, background: '#10b981', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', opacity: (submitting || uploading) ? 0.7 : 1 }}>
            {submitting ? 'Submitting...' : 'Submit Work'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Job Match Score Utility ──────────────────────────────────────────────────
const getJobMatchScore = (job, user) => {
  const userSkills = user?.freelancerProfile?.skills || [];
  const jobSkills = job?.skills || [];
  if (!jobSkills || jobSkills.length === 0) return 87; // default mockup match score (e.g. 87%)
  if (!userSkills || userSkills.length === 0) return 50;

  const userSkillsSet = new Set(userSkills.map(s => String(s).toLowerCase().trim()));
  let matches = 0;
  jobSkills.forEach(s => {
    if (userSkillsSet.has(String(s).toLowerCase().trim())) {
      matches++;
    }
  });

  const matchRatio = matches / jobSkills.length;
  const score = Math.round(65 + (matchRatio * 30));
  return Math.min(score, 98);
};

// ── Competition Analyzer Utility ─────────────────────────────────────────────
const getCompetitionDetails = (job, user) => {
  const bidsCount = job.proposals?.length || (job._id === 'mock-1' ? 8 : job._id === 'mock-2' ? 19 : Math.floor((job.title?.length || 10) % 15) + 3);
  const matchScore = getJobMatchScore(job, user);

  let status = 'recommended';
  let reason = 'High skill match with moderate competition. Great opportunity!';

  if (matchScore >= 85 && bidsCount < 10) {
    status = 'highly_recommended';
    reason = 'Excellent skill match and low competition. You have a very high chance of winning!';
  } else if (matchScore < 70) {
    status = 'cautious';
    reason = 'Low skill match. Consider building matching skills before applying.';
  } else if (bidsCount >= 15) {
    status = 'cautious';
    reason = 'High volume of competing offers. Ensure your cover letter and bid price stand out!';
  }

  return { bidsCount, matchScore, status, reason };
};

// ── Proposal Modal ─────────────────────────────────────────────────────────────
const ProposalModal = ({ job, onClose, onSubmit, submitting }) => {
  const { user, isDarkMode } = useAuth();
  const [form, setForm] = useState({ coverLetter: '', bidAmount: '', estimatedDays: '' });
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);

  // AI Generator States
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [pastedJobTitle, setPastedJobTitle] = useState(job.title || '');
  const [pastedJobDesc, setPastedJobDesc] = useState(job.description || '');
  const [aiProposalText, setAiProposalText] = useState('');
  const [aiBidAmount, setAiBidAmount] = useState('');
  const [aiEstimatedDays, setAiEstimatedDays] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  const handleGenerate = () => {
    if (!pastedJobDesc.trim()) {
      toast.error('Please paste a job description first!');
      return;
    }
    setAiGenerating(true);
    setTimeout(() => {
      const name = user ? `${user.firstName} ${user.lastName}` : 'Vivek Rajput';
      const title = pastedJobTitle || 'Freelance Project';
      const userSkills = user?.freelancerProfile?.skills?.join(', ') || 'React, Node.js, MongoDB, JavaScript, CSS';

      const templates = [
        `Hello,\n\nI have read the job requirements for "${title}" and I am very interested. I have extensive experience working with ${userSkills} and can deliver clean, professional results.\n\nFor this project, I plan to:\n1. Analyze your requirements and establish project scope\n2. Design clean, modular interfaces matching your specification\n3. Build and implement reliable integration tests\n\nI look forward to discussing the details further!\n\nBest regards,\n${name}`,
        `Hi there,\n\nI saw your job post for "${title}". As a skilled developer, I specialize in building high performance applications using ${userSkills}. I would love to help you build this project efficiently, on time, and within budget.\n\nLet me know if we can connect to discuss the milestones.\n\nWarm regards,\n${name}`
      ];
      const selected = templates[Math.floor(Math.random() * templates.length)];
      setAiProposalText(selected);

      // Suggest bid amount based on budget or description text keywords
      let suggestedBid = 15000;
      if (job.budget) {
        suggestedBid = job.budget;
      } else {
        const numbers = pastedJobDesc.match(/\d+[\d,.]*/g);
        if (numbers) {
          const values = numbers.map(n => parseInt(n.replace(/,/g, ''))).filter(v => v >= 500 && v <= 500000);
          if (values.length > 0) {
            suggestedBid = Math.min(...values);
          }
        }
      }
      // Add slight discount or variation for realistic feel
      const finalBid = Math.round(suggestedBid * (0.9 + Math.random() * 0.1) / 100) * 100;
      setAiBidAmount(finalBid.toString());

      // Suggest estimated days based on budget size
      let suggestedDays = 7;
      if (finalBid > 50000) suggestedDays = 14;
      else if (finalBid > 20000) suggestedDays = 10;
      else if (finalBid < 5000) suggestedDays = 3;
      setAiEstimatedDays(suggestedDays.toString());

      setAiGenerating(false);
      toast.success('AI Proposal and Bid generated successfully!');
    }, 1200);
  };

  const handleUseProposal = () => {
    setForm({
      coverLetter: aiProposalText,
      bidAmount: aiBidAmount,
      estimatedDays: aiEstimatedDays
    });
    setShowAIGenerator(false);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await profileAPI.uploadFile(formData);
      const url = res.data?.data?.url || res.data?.url || res.data?.fileUrl;
      if (url) setAttachments(prev => [...prev, { name: file.name, url }]);
      else toast.error('Upload failed.');
    } catch (err) {
      toast.error('File upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!form.coverLetter.trim() || !form.bidAmount || !form.estimatedDays) { toast.error('Please fill all fields!'); return; }
    onSubmit(job._id, { coverLetter: form.coverLetter, bidAmount: Number(form.bidAmount), estimatedDays: Number(form.estimatedDays), attachments: attachments.map(a => a.url) });
  };

  if (showAIGenerator) {
    return (
      <div className="fd-quiz-overlay" onClick={onClose}>
        <div className="fd-quiz-modal" onClick={(e) => e.stopPropagation()} style={{ width: 500, maxHeight: '95vh', overflowY: 'auto' }}>
          {/* Header */}
          <div className="fd-ai-header" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <button className="fd-ai-back-btn" onClick={() => setShowAIGenerator(false)}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <div className="fd-ai-title" style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>AI Proposal Generator</div>
            <span className="fd-ai-beta-badge" style={{ background: '#eff6ff', color: '#2563eb', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>Beta</span>
          </div>

          <div className="fd-ai-generator-container">
            {/* Job Title */}
            <div className="fd-ai-field" style={{ marginBottom: 12 }}>
              <label className="fd-ai-label" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 4 }}>Job Title</label>
              <input
                type="text"
                value={pastedJobTitle}
                onChange={(e) => setPastedJobTitle(e.target.value)}
                placeholder="Enter Job Title..."
                className="fd-ai-input-box"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5 }}
              />
            </div>

            {/* Job Description */}
            <div className="fd-ai-field" style={{ marginBottom: 16 }}>
              <label className="fd-ai-label" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 4 }}>Paste Job Description / Requirements</label>
              <textarea
                rows={5}
                value={pastedJobDesc}
                onChange={(e) => setPastedJobDesc(e.target.value)}
                placeholder="Paste the client's job requirements here to generate customized content and bid parameters..."
                className="fd-ai-desc-box"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5, resize: 'vertical', minHeight: 110, outline: 'none' }}
              />
            </div>

            {/* Generate Button */}
            <button
              className="fd-ai-btn-generate"
              onClick={handleGenerate}
              disabled={aiGenerating}
              style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 16 }}
            >
              {aiGenerating ? (
                <span>Generating Proposal...</span>
              ) : (
                <>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  Generate AI Proposal & Bid
                </>
              )}
            </button>

            {/* Generated Proposal Box */}
            {aiProposalText && (
              <div className="fd-ai-generated-box" style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0', marginTop: 12 }}>
                <div className="fd-ai-generated-title" style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>AI Suggestions</div>

                {/* AI Cover Letter */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Suggested Cover Letter</label>
                  <textarea
                    className="fd-ai-proposal-text"
                    value={aiProposalText}
                    onChange={(e) => setAiProposalText(e.target.value)}
                    rows={5}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, background: '#fff' }}
                  />
                </div>

                {/* AI Suggested Bid and Days */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Suggested Bid (₹)</label>
                    <input
                      type="number"
                      value={aiBidAmount}
                      onChange={(e) => setAiBidAmount(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, background: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Suggested Days</label>
                    <input
                      type="number"
                      value={aiEstimatedDays}
                      onChange={(e) => setAiEstimatedDays(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, background: '#fff' }}
                    />
                  </div>
                </div>

                <div className="fd-ai-actions" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button className="fd-ai-btn-regenerate" onClick={handleGenerate} disabled={aiGenerating} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', color: '#475569' }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                    </svg>
                    Regenerate
                  </button>
                  <button className="fd-ai-btn-use" onClick={handleUseProposal} style={{ padding: '8px 14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
                    Use Suggested Proposal & Bid
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fd-quiz-overlay" onClick={onClose}>
      <div className="fd-quiz-modal" onClick={(e) => e.stopPropagation()} style={{ width: 500 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Submit Proposal</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>{job.title}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><Icon name="x" /></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '10px 14px', borderRadius: 8, marginBottom: 10 }}>
          <div style={{ background: '#10b981', color: '#fff', width: 34, height: 34, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 12.5, fontWeight: 'bold' }}>
            {getJobMatchScore(job, user)}%
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#047857' }}>⚡ Job Match Score</div>
            <div style={{ fontSize: 12, color: '#065f46', fontWeight: 500 }}>This job matches your skills {getJobMatchScore(job, user)}% of the time.</div>
          </div>
        </div>

        {/* Competition Analyzer */}
        {(() => {
          const comp = getCompetitionDetails(job, user);
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, background: comp.status === 'highly_recommended' ? '#ecfdf5' : comp.status === 'recommended' ? '#eff6ff' : '#fff7ed', border: comp.status === 'highly_recommended' ? '1px solid #a7f3d0' : comp.status === 'recommended' ? '1px solid #bfdbfe' : '1px solid #fed7aa', padding: '10px 14px', borderRadius: 8, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: comp.status === 'highly_recommended' ? '#047857' : comp.status === 'recommended' ? '#1e40af' : '#c2410c', display: 'flex', alignItems: 'center', gap: 4 }}>
                  📊 Competition Analyzer
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, background: '#fff', padding: '2px 8px', borderRadius: 99, color: '#475569', border: '1px solid #cbd5e1' }}>
                  {comp.bidsCount} competing offers
                </span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: comp.status === 'highly_recommended' ? '#065f46' : comp.status === 'recommended' ? '#1e3a8a' : '#7c2d12', marginTop: 2 }}>
                Recommendation: {comp.status === 'highly_recommended' ? 'Highly Recommended to Apply! 🚀' : comp.status === 'recommended' ? 'Recommended to apply.' : 'Cautious - High competition/Low skill match.'}
              </div>
              <div style={{ fontSize: 11.5, color: comp.status === 'highly_recommended' ? '#065f46' : comp.status === 'recommended' ? '#1e3a8a' : '#7c2d12' }}>
                {comp.reason}
              </div>
            </div>
          );
        })()}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', margin: 0 }}>Cover Letter</label>
            <button type="button" onClick={() => setShowAIGenerator(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', border: '1px solid #10b981', borderRadius: 6, background: '#ecfdf5', color: '#059669', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}>
              ✨ AI Generator
            </button>
          </div>
          <textarea rows={5} placeholder="Write about your experience and proposed approach..." value={form.coverLetter}
            onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5, color: '#0f172a', outline: 'none', resize: 'vertical', minHeight: 110 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>Bid Amount (₹)</label>
            <input type="number" placeholder="e.g. 15000" value={form.bidAmount}
              onChange={(e) => setForm({ ...form, bidAmount: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5, color: '#0f172a', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>Estimated Days</label>
            <input type="number" placeholder="e.g. 7" value={form.estimatedDays}
              onChange={(e) => setForm({ ...form, estimatedDays: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5, color: '#0f172a', outline: 'none' }} />
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>Attachments <span style={{ color: '#94a3b8', textTransform: 'none', fontWeight: 400 }}>(optional)</span></label>
          {attachments.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
              {attachments.map((att, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: '#ecfdf5', borderRadius: 8, border: '1px solid #a7f3d0' }}>
                  <Icon name="file" />
                  <a href={att.url} target="_blank" rel="noreferrer" style={{ flex: 1, fontSize: 12.5, color: '#047857', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.name}</a>
                  <button onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><Icon name="x" /></button>
                </div>
              ))}
            </div>
          )}
          <input type="file" id="proposal-file" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files[0]; if (f) handleUpload(f); e.target.value = ''; }} />
          <button type="button" onClick={() => document.getElementById('proposal-file').click()} disabled={uploading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', border: '1.5px dashed #cbd5e1', borderRadius: 8, background: '#f8fafc', color: '#475569', fontSize: 13, fontWeight: 600, width: '100%', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="paperclip" /> {uploading ? 'Uploading…' : attachments.length > 0 ? 'Add another file' : 'Attach File'}
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: '9px 18px', border: isDarkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid #cbd5e1', borderRadius: 8, background: isDarkMode ? '#071422' : '#fff', fontSize: 13.5, color: isDarkMode ? '#dbeafe' : '#475569', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={submitting || uploading}
            style={{ padding: '9px 20px', border: 'none', borderRadius: 8, background: '#10b981', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', opacity: (submitting || uploading) ? 0.7 : 1 }}>
            {submitting ? 'Submitting...' : 'Submit Proposal'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Filter Panel ───────────────────────────────────────────────────────────────
const FilterPanel = ({ filters, setFilters, onApply, onClear, skillInput, setSkillInput }) => {
  const { isDarkMode } = useAuth();
  const addSkill = (skill) => { if (skill && !filters.skills.includes(skill)) setFilters((f) => ({ ...f, skills: [...f.skills, skill] })); setSkillInput(''); };
  const removeSkill = (skill) => setFilters((f) => ({ ...f, skills: f.skills.filter((s) => s !== skill) }));
  return (
    <div style={{ background: isDarkMode ? '#071422' : '#fff', borderRadius: 16, border: isDarkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid #e2e8f0', padding: '20px 24px', marginBottom: 20, boxShadow: isDarkMode ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>Category</label>
          <select style={{ width: '100%', padding: '10px 12px', border: isDarkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5, color: isDarkMode ? '#e6eef8' : '#0f172a', outline: 'none', background: isDarkMode ? '#071622' : 'transparent' }} value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>Experience Level</label>
          <select style={{ width: '100%', padding: '10px 12px', border: isDarkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5, color: isDarkMode ? '#e6eef8' : '#0f172a', outline: 'none', background: isDarkMode ? '#071622' : 'transparent' }} value={filters.experienceLevel} onChange={(e) => setFilters((f) => ({ ...f, experienceLevel: e.target.value }))}>
            <option value="">Any level</option>
            <option value="entry">Entry</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>Min Budget (₹)</label>
          <input type="number" placeholder="e.g. 5000" style={{ width: '100%', padding: '10px 12px', border: isDarkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5, color: isDarkMode ? '#e6eef8' : '#0f172a', outline: 'none', background: isDarkMode ? '#071622' : 'transparent' }} value={filters.minBudget} onChange={(e) => setFilters((f) => ({ ...f, minBudget: e.target.value }))} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>Max Budget (₹)</label>
          <input type="number" placeholder="e.g. 50000" style={{ width: '100%', padding: '10px 12px', border: isDarkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5, color: isDarkMode ? '#e6eef8' : '#0f172a', outline: 'none', background: isDarkMode ? '#071622' : 'transparent' }} value={filters.maxBudget} onChange={(e) => setFilters((f) => ({ ...f, maxBudget: e.target.value }))} />
        </div>
      </div>
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>Skills</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, minHeight: 46, alignItems: 'center' }}>
          {filters.skills.map((sk) => (
            <span key={sk} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#ecfdf5', color: '#10b981', padding: '4px 10px', borderRadius: 99, fontSize: 12.5, fontWeight: 600 }}>
              {sk}
              <button onClick={() => removeSkill(sk)} style={{ background: 'none', border: 'none', color: '#10b981', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: 0 }}><Icon name="x" size={14} /></button>
            </span>
          ))}
          <input style={{ border: 'none', outline: 'none', fontSize: 13.5, flex: 1, minWidth: 120, color: '#0f172a' }} placeholder="Type a skill and press Enter…" value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput.trim()))} />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {SKILLS_LIST.filter(sk => !filters.skills.includes(sk) && sk.toLowerCase().includes(skillInput.toLowerCase())).slice(0, 8).map((sk) => (
            <button key={sk} onClick={() => addSkill(sk)} style={{ padding: '4px 10px', border: isDarkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid #cbd5e1', borderRadius: 99, background: isDarkMode ? '#0b1220' : '#fafafa', color: isDarkMode ? '#e6eef8' : '#475569', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ {sk}</button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button onClick={onClear} style={{ padding: '9px 18px', border: isDarkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid #cbd5e1', borderRadius: 8, background: isDarkMode ? '#071422' : '#fff', fontSize: 13.5, color: isDarkMode ? '#dbeafe' : '#475569', cursor: 'pointer' }}>Clear filters</button>
        <button onClick={onApply} style={{ padding: '9px 20px', border: 'none', borderRadius: 8, background: '#10b981', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>Apply filters</button>
      </div>
    </div>
  );
};

// ── Get Job Icon and Styling by Title ─────────────────────────────────────────
const getJobIcon = (title = '') => {
  const t = title.toLowerCase();
  if (t.includes('react') || t.includes('frontend') || t.includes('web') || t.includes('css') || t.includes('html')) {
    return {
      bg: '#eff6ff',
      color: '#3b82f6',
      svg: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <ellipse rx="10" ry="4.5" cx="12" cy="12" transform="rotate(30 12 12)" />
          <ellipse rx="10" ry="4.5" cx="12" cy="12" transform="rotate(90 12 12)" />
          <ellipse rx="10" ry="4.5" cx="12" cy="12" transform="rotate(150 12 12)" />
          <circle r="2" cx="12" cy="12" fill="currentColor" />
        </svg>
      )
    };
  }
  if (t.includes('node') || t.includes('backend') || t.includes('api') || t.includes('python') || t.includes('django') || t.includes('express')) {
    return {
      bg: '#f0fdf4',
      color: '#16a34a',
      svg: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
          <line x1="12" y1="2" x2="12" y2="22" />
        </svg>
      )
    };
  }
  if (t.includes('design') || t.includes('ui') || t.includes('ux') || t.includes('figma') || t.includes('adobe') || t.includes('photoshop')) {
    return {
      bg: '#fdf2f8',
      color: '#db2777',
      svg: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      )
    };
  }
  return {
    bg: '#f1f5f9',
    color: '#475569',
    svg: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    )
  };
};

// ── Main Component ─────────────────────────────────────────────────────────────
const FreelancerDashboard = () => {
  const { user, updateUser, logout, isDarkMode, toggleDarkMode } = useAuth();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const formatDateTime = (d) => {
    if (!d) return '';
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[d.getDay()];
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const hh = String(hours).padStart(2, '0');
    return `${dayName}, ${dd}/${mm}/${yyyy} -- ${hh}:${minutes}:${seconds} ${ampm}`;
  };
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth <= 1000);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1000) {
        setSidebarCollapsed(false);
      } else {
        setSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [activeTab, setActiveTab] = useState('overview');

  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [filters, setFilters] = useState({ category: '', experienceLevel: '', minBudget: '', maxBudget: '', skills: [] });
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [sortBy, setSortBy] = useState('newest');

  const [myProposals, setMyProposals] = useState([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [selectedProposalDetails, setSelectedProposalDetails] = useState(null);
  const [viewMoreCoverLetter, setViewMoreCoverLetter] = useState(false);
  const [selectedJobMilestones, setSelectedJobMilestones] = useState(null);
  const [milestone2Released, setMilestone2Released] = useState(false);
  const [selectedClientReputation, setSelectedClientReputation] = useState(null);
  const [invoiceModal, setInvoiceModal] = useState({ open: false, job: null });
  const [meetingSummaryJob, setMeetingSummaryJob] = useState(null);
  const [meetingBulletPoints, setMeetingBulletPoints] = useState('');
  const [editedSummaryText, setEditedSummaryText] = useState('');
  const [generatedNextSteps, setGeneratedNextSteps] = useState([]);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  const [savedJobs, setSavedJobs] = useState([]);
  const [savedJobsLoading, setSavedJobsLoading] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState(new Set());

  // My Work (assigned jobs)
  const [myWork, setMyWork] = useState([]);
  const [myWorkLoading, setMyWorkLoading] = useState(false);
  const [submitWorkJob, setSubmitWorkJob] = useState(null);
  const [submittingWork, setSubmittingWork] = useState(false);

  const [selectedJob, setSelectedJob] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());

  // ── Messaging & Notifications ──
  const [messagingClientId, setMessagingClientId] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // ── REDESIGN INTERACTIVE STATE ──
  // Earnings chart state
  const [hoveredPoint, setHoveredPoint] = useState({ x: 270, y: 70, value: '₹24,500', date: '15 May', visible: true });

  // Community State
  const [forumPosts, setForumPosts] = useState(INITIAL_FORUM_POSTS);
  const [communityCategory, setCommunityCategory] = useState('All');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostBody, setNewPostBody] = useState('');
  const [postCategory, setPostCategory] = useState('General');

  // Referrals State
  const [referralEmail, setReferralEmail] = useState('');
  const [referralsList, setReferralsList] = useState([
    { name: 'Sameer Sen', date: 'Joined Jul 02, 2026', earnings: '₹1,500 bonus earned', initial: 'S' },
    { name: 'Karan Malhotra', date: 'Joined Jun 24, 2026', earnings: '₹3,000 bonus earned', initial: 'K' },
    { name: 'Priya Sharma', date: 'Joined Jun 12, 2026', earnings: 'Awaiting first contract payment', initial: 'P' }
  ]);
  const [joinedCommunities, setJoinedCommunities] = useState([]);

  // Skill Tests State
  const [certifiedSkills, setCertifiedSkills] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState({ open: false, testName: '', questions: [], curIndex: 0, answers: {}, score: null });

  // Payments State
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [withdrawModal, setWithdrawModal] = useState({ open: false, amount: '', method: 'UPI Instant Payout' });

  // Settings State
  const [settings, setSettings] = useState({ emailNotif: true, smsNotif: false, whatsappNotif: false, publicSearch: true });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });
  const [lang, setLang] = useState('en');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [helpSearch, setHelpSearch] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);
  const [supportTicket, setSupportTicket] = useState({ subject: 'General Inquiry', message: '' });
  const [submittingTicket, setSubmittingTicket] = useState(false);

  const getFormattedCurrentWeekRange = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const startMonth = monthNames[monday.getMonth()];
    const startDay = monday.getDate();
    const endMonth = monthNames[sunday.getMonth()];
    const endDay = sunday.getDate();
    const endYear = sunday.getFullYear();

    return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${endYear}`;
  };

  const TRANSLATIONS = {
    en: {
      welcome: "Welcome back",
      overview: "Dashboard",
      jobs: "Browse Jobs",
      proposals: "Proposals",
      mywork: "My Work",
      profile: "My Profile",
      messages: "Messages",
      saved: "Saved Jobs",
      payments: "Payments",
      analytics: "Analytics",
      community: "Community",
      skilltests: "Skill Tests",
      referrals: "Referrals",
      settings: "Settings",
      availableBalance: "Financial Balance",
      totalEarned: "Total Earned",
      withdrawn: "Withdrawn",
      pendingApproval: "Pending Approval",
      withdrawalAccounts: "Withdrawal Accounts",
      transactionsLedger: "Transactions Ledger",
      accountDashboardPreferences: "Account Dashboard Preferences",
      realTimeAlerts: "Real-Time Alerts",
      emailNotif: "Email Notifications",
      smsNotif: "SMS Messages Notifications",
      whatsappNotif: "WhatsApp Notifications",
      publicSearch: "Public Searchability",
      languagePreferences: "Preferred Language Preferences",
      activeContracts: "Contracts & Active Assignments",
      referralProgram: "Referral Program",
      inviteColleagues: "Invite Colleagues & Clients",
      startDiscussion: "Start a Discussion",
      trendingThreads: "Trending Threads",
      skillCommunities: "Skill Communities"
    },
    hi: {
      welcome: "वापसी पर स्वागत है",
      overview: "डैशबोर्ड",
      jobs: "नौकरियां खोजें",
      proposals: "प्रस्ताव",
      mywork: "मेरा काम",
      profile: "मेरी प्रोफ़ाइल",
      messages: "संदेश",
      saved: "सहेजे गए काम",
      payments: "भुगतान",
      analytics: "विश्लेषण",
      community: "समुदाय",
      skilltests: "कौशल परीक्षण",
      referrals: "रेफरल",
      settings: "सेटिंग्स",
      availableBalance: "वित्तीय शेष राशि",
      totalEarned: "कुल अर्जित",
      withdrawn: "निकाली गई राशि",
      pendingApproval: "स्वीकृति लंबित",
      withdrawalAccounts: "निकासी खाते",
      transactionsLedger: "लेनदेन बहीखाता",
      accountDashboardPreferences: "खाता डैशबोर्ड प्राथमिकताएं",
      realTimeAlerts: "वास्तविक समय अलर्ट",
      emailNotif: "ईमेल अधिसूचना",
      smsNotif: "एसएमएस संदेश अधिसूचना",
      whatsappNotif: "व्हाट्सएप अधिसूचना",
      publicSearch: "सार्वजनिक खोज योग्यता",
      languagePreferences: "पसंदीदा भाषा प्राथमिकताएं",
      activeContracts: "सक्रिय अनुबंध और असाइनमेंट",
      referralProgram: "रेफरल कार्यक्रम",
      inviteColleagues: "सहयोगियों और ग्राहकों को आमंत्रित करें",
      startDiscussion: "चर्चा शुरू करें",
      trendingThreads: "ट्रेंडिंग थ्रेड्स",
      skillCommunities: "कौशल समुदाय"
    }
  };

  const handleMessageClient = async (clientId, jobId) => {
    if (!clientId) { toast.error('Client info not found.'); return; }
    setMessagingClientId(clientId);
    try {
      const res = await messageAPI.startConversation({ recipientId: clientId, jobId });
      const convoId = res.data?.data?._id || res.data?._id;
      navigate(convoId ? `/freelancer/messages?conversation=${convoId}` : '/freelancer/messages');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start conversation.');
    } finally {
      setMessagingClientId(null);
    }
  };

  const fetchJobs = async (query = '', filterParams = {}) => {
    setJobsLoading(true);
    try {
      const params = { status: 'active' };
      if (query.trim()) params.search = query.trim();
      if (filterParams.category) params.category = filterParams.category;
      if (filterParams.experienceLevel) params.experienceLevel = filterParams.experienceLevel;
      if (filterParams.minBudget) params.minBudget = filterParams.minBudget;
      if (filterParams.maxBudget) params.maxBudget = filterParams.maxBudget;
      if (filterParams.budgetType) params.budgetType = filterParams.budgetType;
      if (filterParams.skills?.length > 0) params.skills = filterParams.skills.join(',');
      const res = await jobAPI.getJobs(params);
      const raw = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
      setJobs(raw);
      const myId = user?._id || user?.id;
      const applied = new Set();
      raw.forEach((job) => { if (job.proposals?.some((p) => p.freelancer === myId || p.freelancer?._id === myId)) applied.add(job._id); });
      setAppliedJobIds(applied);
    } catch (err) { console.error('Fetch jobs error:', err); }
    finally { setJobsLoading(false); }
  };

  const fetchMyProposals = async () => {
    setProposalsLoading(true);
    try {
      const allRes = await jobAPI.getJobs({});
      const allJobs = Array.isArray(allRes.data?.data) ? allRes.data.data : Array.isArray(allRes.data) ? allRes.data : [];
      const myId = user?._id || user?.id;
      const proposals = [];
      allJobs.forEach((job) => {
        if (job.proposals) {
          job.proposals.forEach((p) => {
            const fId = p.freelancer?._id || p.freelancer;
            if (fId === myId) {
              proposals.push({ _id: p._id, jobId: job._id, job: job.title, client: job.client?.firstName ? `${job.client.firstName} ${job.client.lastName}` : 'Client', bid: formatBudget(p.bidAmount), status: p.status || 'pending', submitted: timeAgo(p.createdAt), attachments: p.attachments || [], createdAt: p.createdAt });
            }
          });
        }
      });
      setMyProposals(proposals);
    } catch (err) { console.error('Fetch proposals error:', err); }
    finally { setProposalsLoading(false); }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await messageAPI.getUnreadCount();
      const count = res.data?.data?.unreadCount || res.data?.unreadCount || 0;
      setUnreadMessagesCount(count);
    } catch (err) {
      console.error('Fetch unread messages count error:', err);
    }
  };

  const fetchSavedJobs = async () => {
    setSavedJobsLoading(true);
    try {
      const res = await jobAPI.getSavedJobs();
      const raw = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
      setSavedJobs(raw);
      setSavedJobIds(new Set(raw.map((j) => j._id)));
    } catch (err) { console.error('Fetch saved jobs error:', err); }
    finally { setSavedJobsLoading(false); }
  };

  const fetchMyWork = async () => {
    setMyWorkLoading(true);
    try {
      const res = await jobAPI.getMyAssignedJobs();
      const raw = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
      setMyWork(raw);
    } catch (err) { console.error('Fetch my work error:', err); }
    finally { setMyWorkLoading(false); }
  };

  const handleGenerateMeetingSummary = () => {
    if (!meetingBulletPoints.trim()) {
      toast.error('Please paste bullet points first!');
      return;
    }
    setGeneratingSummary(true);
    setTimeout(() => {
      const lines = meetingBulletPoints
        .split('\n')
        .map(l => l.replace(/^[-*•\s\d.]+/g, '').trim())
        .filter(l => l.length > 0);

      const title = meetingSummaryJob?.title || 'Project';
      const summaryText = `On ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}, we conducted a synchronization call regarding "${title}". The discussion focused on aligning the development scope and deliverables. Key talking points included client preferences regarding visual updates, milestones release schedule, and backend service verification.`;

      const actionItems = lines.map(line => ({
        id: Math.random().toString(),
        text: line,
        checked: false
      }));

      if (actionItems.length === 0) {
        actionItems.push(
          { id: '1', text: 'Refine UI header components according to mockup spec', checked: false },
          { id: '2', text: 'Prepare milestone deliverable for client approval', checked: false },
          { id: '3', text: 'Validate database schemas and endpoint payloads', checked: false }
        );
      }

      setEditedSummaryText(summaryText);
      setGeneratedNextSteps(actionItems);
      setGeneratingSummary(false);
      toast.success('Meeting Summary & Next Steps generated successfully!');
    }, 1200);
  };

  useEffect(() => { fetchJobs(); fetchSavedJobs(); fetchMyProposals(); fetchMyWork(); fetchUnreadCount(); }, []);
  useEffect(() => {
    if (activeTab === 'jobs') fetchJobs(searchQuery, filters);
    if (activeTab === 'proposals') fetchMyProposals();
    if (activeTab === 'saved') fetchSavedJobs();
    if (activeTab === 'mywork') fetchMyWork();
    fetchUnreadCount();
  }, [activeTab]);

  useEffect(() => {
    const handleOutsideClick = () => {
      if (activeDropdown) setActiveDropdown(null);
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [activeDropdown]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (activeTab === 'jobs' || activeTab === 'overview') {
      fetchJobs(searchQuery, filters);
    }
  };

  const filteredProposals = myProposals.filter((proposal) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return [proposal.job, proposal.client, proposal.bid, proposal.status].some((value) =>
      value?.toString().toLowerCase().includes(query)
    );
  });

  const filteredMyWork = myWork.filter((job) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    const clientName = job.client?.firstName ? `${job.client.firstName} ${job.client.lastName}` : job.client || '';
    return [job.title, clientName, job.description, job.status, formatBudget(job.budget)].some((value) =>
      value?.toString().toLowerCase().includes(query)
    );
  });

  const filteredSavedJobs = savedJobs.filter((job) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    const clientName = job.client?.firstName ? `${job.client.firstName} ${job.client.lastName}` : job.client?.companyName || '';
    return [job.title, clientName, job.description, job.category, ...(job.skills || [])].some((value) =>
      value?.toString().toLowerCase().includes(query)
    );
  });

  const filteredTransactions = transactions.filter((txn) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return [txn.id, txn.description, txn.date, txn.amount, txn.status].some((value) =>
      value?.toString().toLowerCase().includes(query)
    );
  });

  const handleApplyFilters = () => {
    const count = (filters.category ? 1 : 0) + (filters.experienceLevel ? 1 : 0) + (filters.minBudget ? 1 : 0) + (filters.maxBudget ? 1 : 0) + (filters.skills.length > 0 ? 1 : 0);
    setActiveFilterCount(count);
    fetchJobs(searchQuery, filters);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    const cleared = { category: '', experienceLevel: '', minBudget: '', maxBudget: '', skills: [] };
    setFilters(cleared); setActiveFilterCount(0);
    fetchJobs(searchQuery, cleared);
  };

  const handleApplyClick = (job) => { if (!appliedJobIds.has(job._id)) setSelectedJob(job); };

  const handleProposalSubmit = async (jobId, data) => {
    setSubmitting(true);
    try {
      await jobAPI.submitProposal(jobId, data);
      setAppliedJobIds((prev) => new Set([...prev, jobId]));
      setSelectedJob(null);
      toast.success('Proposal submitted successfully! ✅');
      fetchMyProposals();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit proposal.'); }
    finally { setSubmitting(false); }
  };

  const handleWorkSubmit = async (jobId, data) => {
    setSubmittingWork(true);
    try {
      await jobAPI.markJobSubmitted(jobId, data);
      setSubmitWorkJob(null);
      toast.success('Work submitted! Client will review. ✅');
      fetchMyWork();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit work.'); }
    finally { setSubmittingWork(false); }
  };

  const handleToggleSave = async (jobId) => {
    const wasSaved = savedJobIds.has(jobId);
    setSavedJobIds((prev) => { const next = new Set(prev); if (wasSaved) next.delete(jobId); else next.add(jobId); return next; });
    if (wasSaved) setSavedJobs((prev) => prev.filter((j) => j._id !== jobId));
    try {
      await jobAPI.toggleSaveJob(jobId);
      if (!wasSaved) fetchSavedJobs();
      toast.success(wasSaved ? 'Removed from saved jobs.' : 'Saved job opportunity!');
    } catch (err) {
      setSavedJobIds((prev) => { const next = new Set(prev); if (wasSaved) next.add(jobId); else next.delete(jobId); return next; });
      if (wasSaved) fetchSavedJobs();
      toast.error('Failed to save/unsave.');
    }
  };

  const handleLogout = async () => { await logout(); navigate('/login', { replace: true }); };

  // ── Forum Actions ──
  const handleLikePost = (postId) => {
    setForumPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostBody.trim()) {
      toast.error('Please enter both title and body for your post!');
      return;
    }
    const newPost = {
      id: forumPosts.length + 1,
      author: `${user?.firstName || 'Abhishek'} ${user?.lastName || 'Rajput'}`,
      role: 'Freelancer',
      time: 'Just now',
      title: newPostTitle,
      body: newPostBody,
      likes: 0,
      replies: 0,
      category: postCategory,
      liked: false
    };
    setForumPosts([newPost, ...forumPosts]);
    setNewPostTitle('');
    setNewPostBody('');
    toast.success('Question posted to community! 🚀');
  };

  // ── Quiz Actions ──
  const handleStartQuiz = (skillName) => {
    setActiveQuiz({
      open: true,
      testName: skillName,
      questions: QUIZ_QUESTIONS[skillName] || [],
      curIndex: 0,
      answers: {},
      score: null
    });
  };

  const handleSelectQuizOption = (optIndex) => {
    setActiveQuiz(prev => ({
      ...prev,
      answers: { ...prev.answers, [prev.curIndex]: optIndex }
    }));
  };

  const handleNextQuiz = () => {
    if (activeQuiz.answers[activeQuiz.curIndex] === undefined) {
      toast.error('Please select an option first!');
      return;
    }
    if (activeQuiz.curIndex < activeQuiz.questions.length - 1) {
      setActiveQuiz(prev => ({ ...prev, curIndex: prev.curIndex + 1 }));
    } else {
      // Calculate final score
      let correct = 0;
      activeQuiz.questions.forEach((q, idx) => {
        if (activeQuiz.answers[idx] === q.ans) correct++;
      });
      const passed = correct >= 2; // Pass if 2 or more correct answers
      if (passed) {
        setCertifiedSkills(prev => [...prev, activeQuiz.testName]);
        toast.success(`Congratulations! You passed the ${activeQuiz.testName} Assessment! 🎉`);
      } else {
        toast.error(`Assessment complete. You got ${correct}/${activeQuiz.questions.length}. Practice and try again!`);
      }
      setActiveQuiz(prev => ({ ...prev, score: correct }));
    }
  };

  // ── Payments Actions ──
  const handleWithdrawFunds = (e) => {
    e.preventDefault();
    const withdrawAmount = Number(withdrawModal.amount);
    if (!withdrawAmount || withdrawAmount <= 0) {
      toast.error('Please enter a valid withdrawal amount.');
      return;
    }
    if (withdrawAmount > availableBalance) {
      toast.error('Insufficient funds in your account balance.');
      return;
    }

    const isUPI = withdrawModal.method === 'UPI Instant Payout';
    const newTxn = {
      id: `TXN${Math.floor(10000 + Math.random() * 90000)}`,
      description: `Withdrawal request via ${withdrawModal.method}`,
      date: 'Just now',
      amount: -withdrawAmount,
      type: 'debit',
      status: isUPI ? 'completed' : 'pending'
    };

    setTransactions([newTxn, ...transactions]);
    setWithdrawModal({ open: false, amount: '', method: 'UPI Instant Payout' });
    toast.success(isUPI ? 'Funds transferred instantly via UPI! ⚡' : 'Withdrawal request submitted successfully! 💸');
  };

  // ── Settings Actions ──
  const handleToggleSetting = (key) => {
    const nextVal = !settings[key];
    setSettings(prev => ({ ...prev, [key]: nextVal }));
    if (key === 'whatsappNotif' && nextVal) {
      const phone = window.prompt("Enter your WhatsApp phone number to enable real-time alerts:", "+91 ");
      if (phone && phone.trim().length > 5) {
        toast.success(`WhatsApp alerts configured successfully for ${phone}! ✅`);
      } else {
        setSettings(prev => ({ ...prev, [key]: false }));
        toast.error("Invalid phone number provided.");
      }
    } else {
      toast.success('Setting preference updated!');
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      toast.error('Please fill both current and new password fields.');
      return;
    }
    toast.success('Account security settings saved!');
    setPasswordForm({ oldPassword: '', newPassword: '' });
  };

  // ── Dynamic calculations & Real data helpers ────────────────────────────────
  const firstName = user?.firstName || 'Abhishek';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const acceptedProposalCount = myProposals.filter((p) => p.status === 'accepted').length;
  const pendingProposalCount = myProposals.filter((p) => p.status === 'pending').length;
  const activeWorkCount = myWork.filter((j) => ['in_progress', 'submitted'].includes(j.status)).length;
  const completedWorkCount = myWork.filter((j) => j.status === 'completed').length;
  const totalEarnedDynamic = myWork
    .filter((j) => j.status === 'completed')
    .reduce((sum, job) => sum + (Number(job.budget) || 0), 0);

  // Success Rate percentage (calculated purely from real data)
  const successRate = myWork.length > 0
    ? Math.round((completedWorkCount / myWork.length) * 100)
    : 0;

  // Proposals sent in the last 7 days
  const proposalsThisWeek = myProposals.filter(p => {
    return p.createdAt && (Date.now() - new Date(p.createdAt).getTime() < 7 * 24 * 3600000);
  }).length;

  // Calculate dynamic weekly earnings from completed jobs for the current month
  const getEarningsChartData = () => {
    const completedJobs = myWork.filter(j => j.status === 'completed');
    if (completedJobs.length === 0) {
      // Flat line at ₹0 if no real data
      return [
        { x: 50, y: 160, val: '₹0', date: 'W1' },
        { x: 150, y: 160, val: '₹0', date: 'W2' },
        { x: 250, y: 160, val: '₹0', date: 'W3' },
        { x: 350, y: 160, val: '₹0', date: 'W4' },
        { x: 450, y: 160, val: '₹0', date: 'W5' }
      ];
    }

    const weeklySums = [0, 0, 0, 0, 0];
    const now = new Date();
    const curMonth = now.getMonth();
    const curYear = now.getFullYear();

    completedJobs.forEach(job => {
      const date = new Date(job.updatedAt || job.createdAt);
      if (date.getMonth() === curMonth && date.getFullYear() === curYear) {
        const day = date.getDate();
        if (day <= 7) weeklySums[0] += Number(job.budget) || 0;
        else if (day <= 14) weeklySums[1] += Number(job.budget) || 0;
        else if (day <= 21) weeklySums[2] += Number(job.budget) || 0;
        else if (day <= 28) weeklySums[3] += Number(job.budget) || 0;
        else weeklySums[4] += Number(job.budget) || 0;
      }
    });

    const cumulative = [];
    let running = 0;
    weeklySums.forEach(val => {
      running += val;
      cumulative.push(running);
    });

    const maxVal = Math.max(...cumulative, 10000);
    const getY = (val) => 160 - (val / maxVal) * 130;

    const dates = ['1 May', '8 May', '15 May', '22 May', '31 May'];
    return cumulative.map((val, idx) => ({
      x: 50 + idx * 100,
      y: Math.round(getY(val)),
      val: `₹${val.toLocaleString('en-IN')}`,
      date: dates[idx]
    }));
  };

  const chartData = getEarningsChartData();

  // Set default initial tooltip point
  useEffect(() => {
    if (chartData && chartData[2]) {
      setHoveredPoint({
        x: chartData[2].x,
        y: chartData[2].y,
        value: chartData[2].val,
        date: chartData[2].date,
        visible: true
      });
    }
  }, [myWork]);

  // Dynamic Activity Feed Builder (only real data)
  const getDynamicActivities = () => {
    const list = [];
    myWork.filter(j => j.status === 'completed').forEach(job => {
      const clientName = job.client?.firstName ? `${job.client.firstName} ${job.client.lastName}` : 'Client';
      list.push({
        text: 'Payment received',
        meta: `₹${(job.budget || 0).toLocaleString('en-IN')} from ${clientName}`,
        icon: 'dollar',
        time: timeAgo(job.updatedAt || job.createdAt),
        bg: '#10b981'
      });
    });

    myWork.filter(j => j.status === 'submitted').forEach(job => {
      list.push({
        text: 'Milestone submitted',
        meta: `${job.title} deliverable uploaded`,
        icon: 'check',
        time: timeAgo(job.updatedAt || job.createdAt),
        bg: '#06b6d4'
      });
    });

    myProposals.filter(p => p.status === 'accepted').forEach(p => {
      list.push({
        text: 'Proposal accepted 🎉',
        meta: `Client accepted bid for ${p.job}`,
        icon: 'check',
        time: p.createdAt ? timeAgo(p.createdAt) : 'Recently',
        bg: '#3b82f6'
      });
    });

    myProposals.filter(p => p.status === 'pending').slice(0, 2).forEach(p => {
      list.push({
        text: 'Proposal submitted',
        meta: `Bid of ${p.bid} for ${p.job}`,
        icon: 'send',
        time: p.createdAt ? timeAgo(p.createdAt) : 'Recently',
        bg: '#8b5cf6'
      });
    });

    return list.slice(0, 4);
  };

  // Dynamic Upcoming Milestones Builder (only real data)
  const getDynamicMilestones = () => {
    const list = [];
    myWork.filter(j => j.status === 'in_progress').forEach(job => {
      list.push({
        project: job.title,
        desc: 'Milestone 1: Deliverables implementation',
        amount: formatBudget(job.budget),
        due: 'Due in 5 days',
        progress: '50%'
      });
    });

    return list.slice(0, 2);
  };

  // Dynamic Client Reputation Builder (only real client data)
  const getDynamicClientReputation = () => {
    const activeJob = myWork.find(j => j.client);
    if (activeJob && activeJob.client) {
      const client = activeJob.client;
      const clientName = client.firstName ? `${client.firstName} ${client.lastName}` : 'Client';
      const clientId = client._id || client;

      const clientJobs = myWork.filter(w => (w.client?._id || w.client) === clientId);
      const completedJobs = clientJobs.filter(w => w.status === 'completed');
      const totalSpent = completedJobs.reduce((sum, w) => sum + (Number(w.budget) || 0), 0);

      return {
        _id: clientId,
        clientObj: client,
        name: clientName,
        initial: client.firstName ? client.firstName[0].toUpperCase() : 'C',
        rating: '—',
        reviews: '0 reviews',
        paymentSpeed: '—',
        communication: '—',
        jobSuccess: '—',
        posted: clientJobs.length.toString(),
        role: 'Client',
        hireRate: '—',
        response: '—',
        totalSpent: totalSpent
      };
    }
    return null;
  };

  // Dynamic Skills Builder (only real skill data)
  const getDynamicSkills = () => {
    const profileSkills = user?.freelancerProfile?.skills || [];
    const weights = ['90%', '80%', '70%', '60%', '50%', '40%'];
    return profileSkills.slice(0, 5).map((skill, idx) => ({
      name: skill,
      val: weights[idx] || '50%'
    }));
  };

  // Total balance calculations
  const netEarnings = totalEarnedDynamic;
  const totalWithdrawn = Math.abs(transactions.filter(t => t.type === 'debit' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0));
  const availableBalance = Math.max(0, netEarnings - totalWithdrawn);

  const getMonthlyEarningsRealData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const sums = Array(12).fill(0);
    const now = new Date();
    const curYear = now.getFullYear();

    const query = searchQuery.trim().toLowerCase();
    myWork.forEach(job => {
      if (job.status === 'completed') {
        const clientName = job.client?.firstName ? `${job.client.firstName} ` + job.client.lastName : job.client?.companyName || '';
        if (query) {
          const match = [job.title, clientName, job.description, job.category].some(value =>
            value?.toString().toLowerCase().includes(query)
          );
          if (!match) return;
        }
        const date = new Date(job.updatedAt || job.createdAt);
        if (date.getFullYear() === curYear) {
          const mIdx = date.getMonth();
          sums[mIdx] += Number(job.budget) || 0;
        }
      }
    });

    const maxVal = Math.max(...sums, 10000);
    return sums.map((val, idx) => {
      const pct = (val / maxVal) * 90; // scale to 90% max height
      return {
        month: months[idx],
        val: val,
        height: `${Math.round(pct)}%`
      };
    });
  };

  const getTopPerformingSkillsRealData = () => {
    const query = searchQuery.trim().toLowerCase();
    const completedJobs = myWork.filter(j => {
      if (j.status !== 'completed') return false;
      if (!query) return true;
      const clientName = j.client?.firstName ? `${j.client.firstName} ` + j.client.lastName : j.client?.companyName || '';
      return [j.title, clientName, j.description, j.category].some(value =>
        value?.toString().toLowerCase().includes(query)
      );
    });
    const profileSkills = user?.freelancerProfile?.skills || ['React', 'Node.js', 'MongoDB', 'JavaScript'];

    if (completedJobs.length === 0) {
      // Map user's own profile skills to 0% to represent real data state beautifully
      return [
        { name: profileSkills[0] || 'React.js', pct: 0 },
        { name: profileSkills[1] || 'Node.js', pct: 0 },
        { name: profileSkills[2] || 'MongoDB', pct: 0 },
        { name: 'Others', pct: 0 }
      ];
    }

    const skillCounts = {};
    completedJobs.forEach(job => {
      if (Array.isArray(job.skills)) {
        job.skills.forEach(skill => {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        });
      }
    });

    const sorted = Object.entries(skillCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const total = sorted.reduce((sum, item) => sum + item.count, 0);
    const top = sorted.slice(0, 3).map(item => ({
      name: item.name,
      pct: Math.round((item.count / total) * 100)
    }));

    const topSum = top.reduce((sum, item) => sum + item.pct, 0);
    if (topSum < 100 && sorted.length > 3) {
      top.push({ name: 'Others', pct: 100 - topSum });
    } else if (topSum < 100 && top.length > 0) {
      top[0].pct += (100 - topSum); // adjust rounding difference
    }
    return top;
  };

  const notificationCount = pendingProposalCount + activeWorkCount;
  const notifications = [
    ...(
      pendingProposalCount
        ? [{ id: 'pending_proposal', label: `You have ${pendingProposalCount} pending job proposal${pendingProposalCount === 1 ? '' : 's'}.`, onClick: () => setActiveTab('proposals') }]
        : []
    ),
    ...(
      activeWorkCount
        ? [{ id: 'active_work', label: `You have ${activeWorkCount} active project assignment${activeWorkCount === 1 ? '' : 's'}.`, onClick: () => setActiveTab('mywork') }]
        : []
    ),
  ];

  // Community Threads filter
  const filteredForumPosts = forumPosts.filter(post => communityCategory === 'All' || post.category === communityCategory);

  // Fallback recommended jobs if API returns empty
  const fallbackJobs = [
    {
      _id: 'mock-1',
      title: 'React Developer for SaaS Platform',
      client: { firstName: 'ABC', lastName: 'Company' },
      budget: 35000,
      experienceLevel: 'expert',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      skills: ['React', 'Node.js', 'MongoDB'],
      description: 'Looking for a senior React developer to implement dynamic dashboards, settings panels, and clean data visualizations.'
    },
    {
      _id: 'mock-2',
      title: 'Full Stack Developer',
      client: { firstName: 'Tech', lastName: 'Solutions' },
      budget: 45000,
      experienceLevel: 'intermediate',
      createdAt: new Date(Date.now() - 18000000).toISOString(),
      skills: ['React', 'Node.js', 'PostgreSQL'],
      description: 'Need a full stack developer experienced in PostgreSQL and REST APIs to build an e-commerce dashboard backend and client views.'
    }
  ];

  const displayJobs = jobs.length > 0 ? jobs.slice(0, 3) : fallbackJobs;

  const JobCard = ({ job, large = false }) => {
    const alreadyApplied = appliedJobIds.has(job._id);
    const isSaved = savedJobIds.has(job._id);
    const clientName = job.client?.firstName
      ? `${job.client.firstName} ${job.client.lastName}`
      : job.client?.clientProfile?.companyName || 'Client';

    const ico = getJobIcon(job.title);

    // Format range budget
    const budgetVal = Number(job.budget) || 0;
    const formattedBudgetRange = budgetVal > 0
      ? `₹${budgetVal.toLocaleString('en-IN')} - ₹${Math.round(budgetVal * 1.5).toLocaleString('en-IN')}`
      : '₹15,000 - ₹25,000';

    const bType = job.budgetType === 'hourly' ? 'Hourly' : 'Fixed Price';
    const loc = job.duration ? (job.duration === 'less-than-1-week' ? 'Onsite' : 'Hybrid') : 'Remote';

    if (large) {
      return (
        <div className="fd-bj-card">
          <div className="fd-bj-card-avatar" style={{ background: ico.bg, color: ico.color }}>
            {ico.svg}
          </div>
          <div className="fd-bj-card-content">
            <div className="fd-bj-card-header">
              <div>
                <div className="fd-bj-card-title">{job.title}</div>
                <div className="fd-bj-card-client" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{clientName}</span>
                  <span style={{ display: 'inline-flex', gap: 4, fontSize: 11 }}>
                    {budgetVal >= 50000 && <span title="Big Spender (Spent ₹1L+)" style={{ cursor: 'help' }}>💰</span>}
                    {(clientName.startsWith('A') || clientName.startsWith('B') || clientName.startsWith('C') || clientName.includes('Bright') || clientName.includes('Acme')) && <span title="Verified Payer" style={{ cursor: 'help' }}>💳</span>}
                    {(job.title.toLowerCase().includes('redesign') || job.title.toLowerCase().includes('app')) && <span title="Project Builder" style={{ cursor: 'help' }}>🏗️</span>}
                    {getJobMatchScore(job, user) >= 90 && <span title="Trusted Client" style={{ cursor: 'help' }}>🛡️</span>}
                    {job._id && job._id.slice(-1).match(/[0-2-4-6-8-a-c-e]/) && <span title="Loyal Client" style={{ cursor: 'help' }}>🔄</span>}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                    ⚡ {getJobMatchScore(job, user)}% Match
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
                    Matches your skills {getJobMatchScore(job, user)}% of the time.
                  </span>
                </div>
              </div>
              <div className="fd-bj-card-time">{timeAgo(job.createdAt)}</div>
            </div>
            <div className="fd-bj-card-meta">
              <span className="fd-bj-card-budget">{formattedBudgetRange}</span>
              <span>•</span>
              <span>{bType}</span>
              <span>•</span>
              <span>{loc}</span>
            </div>
            <div className="fd-bj-card-tags">
              {(job.skills || []).slice(0, 3).map((s) => (
                <span key={s} className="fd-bj-card-tag">{s}</span>
              ))}
            </div>
            {/* Competition Analyzer */}
            {(() => {
              const comp = getCompetitionDetails(job, user);
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, padding: '6px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
                    📊 Competition Analyzer:
                  </span>
                  <span style={{ fontSize: 11.5, color: '#475569', fontWeight: 600 }}>
                    {comp.bidsCount} competing offers
                  </span>
                  <span style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 6,
                    background: comp.status === 'highly_recommended' ? '#ecfdf5' : comp.status === 'recommended' ? '#eff6ff' : '#fff7ed',
                    color: comp.status === 'highly_recommended' ? '#059669' : comp.status === 'recommended' ? '#2563eb' : '#d97706'
                  }}>
                    {comp.status === 'highly_recommended' ? 'Highly Recommended' : comp.status === 'recommended' ? 'Recommended' : 'Cautious'}
                  </span>
                  <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 500 }}>
                    - {comp.reason}
                  </span>
                </div>
              );
            })()}
          </div>
          <div className="fd-bj-card-actions">
            <button className={`fd-bj-btn-save ${isSaved ? 'saved' : ''}`} onClick={() => handleToggleSave(job._id)}>
              <svg width="18" height="18" fill={isSaved ? '#db2777' : 'none'} stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
            <button className="fd-bj-btn-apply" onClick={() => !alreadyApplied && handleApplyClick(job)} disabled={alreadyApplied}>
              {alreadyApplied ? '✓ Applied' : 'Apply Now'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="fd-mini-job-card">
        <div className="fd-mini-job-header">
          <div>
            <div className="fd-mini-job-title">{job.title}</div>
            <div className="fd-mini-job-client" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span>{clientName}</span>
              <span style={{ display: 'inline-flex', gap: 4, fontSize: 10.5 }}>
                {budgetVal >= 50000 && <span title="Big Spender (Spent ₹1L+)" style={{ cursor: 'help' }}>💰</span>}
                {(clientName.startsWith('A') || clientName.startsWith('B') || clientName.startsWith('C') || clientName.includes('Bright') || clientName.includes('Acme')) && <span title="Verified Payer" style={{ cursor: 'help' }}>💳</span>}
                {(job.title.toLowerCase().includes('redesign') || job.title.toLowerCase().includes('app')) && <span title="Project Builder" style={{ cursor: 'help' }}>🏗️</span>}
                {getJobMatchScore(job, user) >= 90 && <span title="Trusted Client" style={{ cursor: 'help' }}>🛡️</span>}
                {job._id && job._id.slice(-1).match(/[0-2-4-6-8-a-c-e]/) && <span title="Loyal Client" style={{ cursor: 'help' }}>🔄</span>}
              </span>
              <span style={{ color: '#94a3b8' }}>· {timeAgo(job.createdAt)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                ⚡ {getJobMatchScore(job, user)}% Match
              </span>
              <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>
                📊 {getCompetitionDetails(job, user).bidsCount} bids
              </span>
            </div>
          </div>
          {job.experienceLevel && <span className="fd-tag-badge" style={{ background: '#eff6ff', color: '#2563eb' }}>{job.experienceLevel}</span>}
        </div>
        <div className="fd-mini-job-budget">{formatBudget(job.budget)}</div>
        <div className="fd-mini-job-footer">
          <div className="fd-tags-row">
            {(job.skills || []).slice(0, 3).map((t) => <span key={t} className="fd-tag-badge">{t}</span>)}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="fd-icon-btn" style={{ width: 32, height: 32, borderColor: isSaved ? '#db2777' : '#cbd5e1', background: isSaved ? '#fdf2f8' : '#fff', color: isSaved ? '#db2777' : '#64748b' }} onClick={() => handleToggleSave(job._id)}>
              <svg width="14" height="14" fill={isSaved ? '#db2777' : 'none'} stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
            <button className="fd-btn-apply" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => !alreadyApplied && handleApplyClick(job)} disabled={alreadyApplied}>
              {alreadyApplied ? '✓ Applied' : 'Apply Now'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`fd-shell ${sidebarCollapsed ? 'collapsed' : ''} ${isDarkMode ? 'dark-theme' : ''}`}>
      {/* Sidebar Backdrop for Mobile */}
      {!sidebarCollapsed && (
        <div 
          className="fd-sidebar-backdrop" 
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fd-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="fd-logo">
          <div className="fd-logo-mark" onClick={() => sidebarCollapsed && setSidebarCollapsed(false)} style={{ cursor: sidebarCollapsed ? 'pointer' : 'default' }}>FM</div>
          <span className="fd-logo-text">FreelanceMarket</span>
          {!sidebarCollapsed && (
            <button className="fd-collapse-btn" onClick={() => setSidebarCollapsed(true)} title="Collapse sidebar">
              <Icon name="chevronCircle" size={26} />
            </button>
          )}
        </div>
        <nav className="fd-nav">
          {[
            { id: 'overview', label: 'Overview', icon: 'star' },
            { id: 'jobs', label: 'Browse Jobs', icon: 'search' },
            { id: 'proposals', label: 'Proposals', icon: 'send' },
            { id: 'mywork', label: 'My Work', icon: 'work' },
            { id: 'profile', label: 'My Profile', icon: 'user' },
            { id: 'messages', label: 'Messages', icon: 'message' },
            { id: 'saved', label: 'Saved Jobs', icon: 'bookmark' },
            { id: 'payments', label: 'Payments', icon: 'dollar' },
            { id: 'analytics', label: 'Analytics', icon: 'analytics' },
            { id: 'community', label: 'Community', icon: 'people' },
            { id: 'skilltests', label: 'Skill Tests', icon: 'award' },
            { id: 'referrals', label: 'Referrals', icon: 'gift', newBadge: true },
            { id: 'settings', label: 'Settings', icon: 'settings' }
          ].map((item) => (
            <button key={item.id}
              onClick={() => {
                if (item.id === 'messages') navigate('/freelancer/messages');
                else if (item.id === 'profile') navigate('/profile');
                else setActiveTab(item.id);
                if (window.innerWidth <= 1000) setSidebarCollapsed(true);
              }}
              className={`fd-nav-btn ${activeTab === item.id ? 'active' : ''}`}>
              <Icon name={item.icon} />
              <span>{TRANSLATIONS[lang][item.id] || item.label}</span>
              {item.newBadge && <span className="fd-badge new-badge">New</span>}
              {item.id === 'messages' && unreadMessagesCount > 0 && <span className="fd-badge" style={{ background: '#ef4444', color: '#fff' }}>{unreadMessagesCount}</span>}
              {item.id === 'saved' && savedJobIds.size > 0 && <span className="fd-badge">{savedJobIds.size}</span>}
              {item.id === 'mywork' && activeWorkCount > 0 && <span className="fd-badge" style={{ background: '#10b981', color: '#fff' }}>{activeWorkCount}</span>}
            </button>
          ))}
        </nav>
        <div className="fd-sidebar-bottom">
          <div className="fd-user-chip" onClick={() => {
            navigate('/profile');
            if (window.innerWidth <= 1000) setSidebarCollapsed(true);
          }} style={{ cursor: 'pointer' }}>
            <div className="fd-avatar" style={{ background: '#7c3aed' }}>
              {firstName[0]?.toUpperCase()}
            </div>
            <div className="fd-user-info">
              <div className="fd-user-name">{firstName} Rajput</div>
              <div className="fd-user-role">Freelancer</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Panel ── */}
      <main className="fd-main">
        {/* Header */}
        <header className="fd-header">
          <div className="fd-header-title-block" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button 
              className="fd-mobile-menu-toggle" 
              onClick={() => setSidebarCollapsed(false)} 
              title="Open Menu"
            >
              <Icon name="menu" size={20} />
            </button>
            <div className="fd-header-title-main">
              {TRANSLATIONS[lang][activeTab] || activeTab}
            </div>
          </div>

          <div className="fd-header-center">
            {(activeTab === 'overview' || activeTab === 'jobs' || activeTab === 'proposals' || activeTab === 'mywork' || activeTab === 'saved' || activeTab === 'payments' || activeTab === 'analytics') && (
              <div className="fd-search-container">
                <Icon name="search" size={16} />
                <input
                  placeholder={
                    activeTab === 'jobs' ? 'Search jobs by title, skills, or keywords...' :
                      activeTab === 'proposals' ? 'Search proposals, clients, or status...' :
                        activeTab === 'mywork' ? 'Search active work, contracts, or clients...' :
                          activeTab === 'saved' ? 'Search saved jobs by title or client...' :
                            activeTab === 'payments' ? 'Search transaction details or status...' :
                              activeTab === 'analytics' ? 'Search analytics details...' :
                                'Search for jobs, tasks, users...'
                  }
                  className="fd-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                />
              </div>
            )}
          </div>

          <div className="fd-header-right">
            {(activeTab === 'overview' || activeTab === 'jobs' || activeTab === 'proposals' || activeTab === 'mywork' || activeTab === 'saved' || activeTab === 'payments' || activeTab === 'analytics') && (
              <div className="fd-header-actions">
                <button className="fd-icon-btn" onClick={() => toggleDarkMode()} title="Switch Theme">
                  <Icon name={isDarkMode ? 'sun' : 'moon'} />
                </button>

                <div style={{ position: 'relative' }}>
                  <button className="fd-icon-btn" onClick={() => setNotificationsOpen(!notificationsOpen)}>
                    <Icon name="bell" />
                    <span className="fd-icon-badge" style={{ background: '#ef4444', color: '#fff' }}>3</span>
                  </button>
                  {notificationsOpen && (
                    <div className="fd-noti-dropdown">
                      <div className="fd-noti-header">Notifications</div>
                      <div className="fd-noti-list">
                        <div className="fd-noti-item" style={{ padding: '8px 12px', fontSize: 12.5, color: '#475569' }}>Milestone 2 payment approved by client.</div>
                        <div className="fd-noti-item" style={{ padding: '8px 12px', fontSize: 12.5, color: '#475569' }}>New job posting match: React Specialist.</div>
                        <div className="fd-noti-item" style={{ padding: '8px 12px', fontSize: 12.5, color: '#475569' }}>Your proposal for Tech Solutions was viewed.</div>
                      </div>
                    </div>
                  )}
                </div>

                <button className="fd-icon-btn" onClick={() => navigate('/freelancer/messages')} style={{ position: 'relative' }}>
                  <Icon name="mail" />
                  {unreadMessagesCount > 0 && <span className="fd-icon-badge">{unreadMessagesCount}</span>}
                </button>

                <div style={{ position: 'relative' }}>
                  <div
                    className="fd-header-user-avatar"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    style={{ cursor: 'pointer', width: 34, height: 34, borderRadius: '50%', background: '#7c3aed', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 'bold', fontSize: 13.5, boxShadow: '0 2px 6px rgba(124, 58, 237, 0.2)' }}
                  >
                    {firstName[0]?.toUpperCase()}
                  </div>
                  {userMenuOpen && (
                    <div className="fd-user-menu-dropdown" style={{ position: 'absolute', top: '52px', right: '0', background: isDarkMode ? '#071422' : '#fff', borderRadius: '12px', boxShadow: isDarkMode ? 'none' : '0 10px 25px rgba(0, 0, 0, 0.08)', border: isDarkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid #e2e8f0', width: '220px', zIndex: 100, padding: '8px 0', display: 'flex', flexDirection: 'column' }}>
                      <div className="fd-user-menu-arrow" style={{ position: 'absolute', top: -6, right: 15, width: 12, height: 12, background: isDarkMode ? '#071422' : '#fff', borderLeft: isDarkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid #e2e8f0', borderTop: isDarkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid #e2e8f0', transform: 'rotate(45deg)' }} />

                      <button onClick={() => { setUserMenuOpen(false); navigate('/profile'); }} className="fd-user-menu-btn" style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 16px', background: 'none', border: 'none', fontSize: '13.5px', color: '#334155', fontWeight: '500', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s ease' }}>
                        <span style={{ marginRight: '12px', color: '#64748b', display: 'inline-flex', alignItems: 'center' }}><Icon name="user" size={16} /></span>
                        View Profile
                      </button>
                      <button onClick={() => { setUserMenuOpen(false); navigate('/profile', { state: { edit: true } }); }} className="fd-user-menu-btn" style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 16px', background: 'none', border: 'none', fontSize: '13.5px', color: '#334155', fontWeight: '500', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s ease' }}>
                        <span style={{ marginRight: '12px', color: '#64748b', display: 'inline-flex', alignItems: 'center' }}><Icon name="edit" size={16} /></span>
                        Edit Profile
                      </button>
                      <button onClick={() => { setUserMenuOpen(false); setActiveTab('settings'); }} className="fd-user-menu-btn" style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 16px', background: 'none', border: 'none', fontSize: '13.5px', color: '#334155', fontWeight: '500', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s ease' }}>
                        <span style={{ marginRight: '12px', color: '#64748b', display: 'inline-flex', alignItems: 'center' }}><Icon name="settings" size={16} /></span>
                        Account Settings
                      </button>

                      <div className="fd-user-menu-divider" style={{ height: '1px', background: '#f1f5f9', margin: '6px 0' }} />

                      <button onClick={async () => {
                        setUserMenuOpen(false);
                        try {
                          const res = await profileAPI.updateProfile({ role: 'client' });
                          if (res.data?.success || res.data?.user) {
                            updateUser({ ...user, role: 'client' });
                            toast.success('Switched to Client Mode! 💼');
                            navigate('/dashboard');
                          }
                        } catch (err) {
                          toast.error('Failed to switch mode');
                        }
                      }} className="fd-user-menu-btn" style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 16px', background: 'none', border: 'none', fontSize: '13.5px', color: '#7c3aed', fontWeight: '500', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s ease' }}>
                        <span style={{ marginRight: '12px', color: '#7c3aed', display: 'inline-flex', alignItems: 'center' }}><Icon name="switch" size={16} /></span>
                        Switch to Client
                      </button>

                      <div className="fd-user-menu-divider" style={{ height: '1px', background: '#f1f5f9', margin: '6px 0' }} />

                      <button onClick={() => { setUserMenuOpen(false); setHelpModalOpen(true); }} className="fd-user-menu-btn" style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 16px', background: 'none', border: 'none', fontSize: '13.5px', color: '#334155', fontWeight: '500', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s ease' }}>
                        <span style={{ marginRight: '12px', color: '#64748b', display: 'inline-flex', alignItems: 'center' }}><Icon name="help" size={16} /></span>
                        Help & Support
                      </button>
                      <button onClick={() => { setUserMenuOpen(false); handleLogout(); }} className="fd-user-menu-btn" style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 16px', background: 'none', border: 'none', fontSize: '13.5px', color: '#dc2626', fontWeight: '500', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s ease' }}>
                        <span style={{ marginRight: '12px', color: '#ef4444', display: 'inline-flex', alignItems: 'center' }}><Icon name="logout" size={16} /></span>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* ── Tab Views ── */}

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div>
            {/* Dynamic Greeting Row from Mockup */}
            <div className="fd-greeting-row-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h1 className="fd-greeting-title" style={{ fontSize: 22, fontWeight: 700, color: isDarkMode ? '#f8fafc' : '#0f172a', margin: 0 }}>
                  {lang === 'hi'
                    ? `नमस्ते, ${firstName}! 👋`
                    : `${greeting}, ${firstName}! 👋`}
                </h1>
                <p className="fd-greeting-sub" style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0' }}>
                  {lang === 'hi'
                    ? "यहाँ आज आपके वित्तीय करियर में क्या हो रहा है।"
                    : "Here's what's happening with your financial career today."}
                </p>
              </div>

              {/* Date selector dropdown */}
              <div className="fd-date-selector-pill" style={{ display: 'flex', alignItems: 'center', gap: 8, background: isDarkMode ? '#071422' : '#fff', border: isDarkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid #e2e8f0', borderRadius: 99, padding: '8px 16px', fontSize: 12.5, fontWeight: 600, color: isDarkMode ? '#dbeafe' : '#475569', boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0,0,0,0.02)', cursor: 'pointer' }} onClick={() => toast.success('Date filter toggled!')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#94a3b8' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    lineHeight: 1.2,
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: isDarkMode ? "#fff" : "#1e293b",
                    }}
                  >
                    {now.toLocaleDateString("en-US", {
                      weekday: "long",
                    })}
                  </span>

                  <span
                    style={{
                      fontSize: "12px",
                      color: "#94a3b8",
                      fontWeight: 500,
                    }}
                  >
                    {now.toLocaleDateString("en-GB")} •{" "}
                    {now.toLocaleTimeString("en-US")}
                  </span>
                </div>
                
              </div>
            </div>

            {/* Top Cards (Stats Grid) */}
            <div className="fd-stats-grid">
              {/* Earnings Card (Green Accent) */}
              <div className="fd-stat-card earnings-highlight">
                <div className="fd-stat-header">
                  <span className="fd-stat-title">Total Earnings</span>
                  <div className="fd-stat-icon-wrapper">
                    <Icon name="dollar" size={16} />
                  </div>
                </div>
                <div className="fd-stat-value">₹{netEarnings.toLocaleString('en-IN')}</div>
                <div className="fd-stat-meta">+12.5% this month</div>
                {/* SVG Sparkline */}
                <div className="fd-stat-sparkline">
                  <svg width="100%" height="100%" viewBox="0 0 100 45" preserveAspectRatio="none">
                    <path d="M 0 35 Q 20 20, 40 30 T 80 10 T 100 5" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" />
                  </svg>
                </div>
              </div>

              {/* Active Jobs */}
              <div className="fd-stat-card">
                <div className="fd-stat-header">
                  <span className="fd-stat-title">Active Jobs</span>
                  <div className="fd-stat-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
                    <Icon name="briefcase" size={16} />
                  </div>
                </div>
                <div className="fd-stat-value" style={{ color: isDarkMode ? '#f8fafc' : '#0f172a' }}>{myWork.length}</div>
                <div className="fd-stat-meta" style={{ color: '#d97706' }}>{activeWorkCount} in progress</div>
              </div>

              {/* Proposals Sent */}
              <div className="fd-stat-card">
                <div className="fd-stat-header">
                  <span className="fd-stat-title">Proposals Sent</span>
                  <div className="fd-stat-icon-wrapper" style={{ background: '#eff6ff', color: '#2563eb' }}>
                    <Icon name="send" size={16} />
                  </div>
                </div>
                <div className="fd-stat-value" style={{ color: isDarkMode ? '#f8fafc' : '#0f172a' }}>{myProposals.length}</div>
                <div className="fd-stat-meta" style={{ color: '#2563eb' }}>+{proposalsThisWeek} this week</div>
              </div>

              {/* Success Rate */}
              <div className="fd-stat-card">
                <div className="fd-stat-header">
                  <span className="fd-stat-title">Success Rate</span>
                  <div className="fd-stat-icon-wrapper" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                    <Icon name="star" size={16} />
                  </div>
                </div>
                <div className="fd-stat-value" style={{ color: isDarkMode ? '#f8fafc' : '#0f172a' }}>{successRate}%</div>
                <div className="fd-stat-meta" style={{ color: '#7c3aed' }}>{successRate >= 90 ? 'Excellent' : successRate >= 70 ? 'Good' : 'Needs Work'}</div>
                {/* SVG Sparkline (purple) */}
                <div className="fd-stat-sparkline">
                  <svg width="100%" height="100%" viewBox="0 0 100 45" preserveAspectRatio="none">
                    <path d="M 0 38 Q 30 25, 60 10 T 100 15" fill="none" stroke="#7c3aed" strokeWidth="2.5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Middle Row (Charts and Feeds) */}
            <div className="fd-middle-grid">
              {/* Earnings line chart (monthly trend) */}
              <div className="fd-card">
                <div className="fd-card-header">
                  <h2 className="fd-card-title">Earnings Overview</h2>
                  <select style={{ border: 'none', background: 'none', fontWeight: 'bold', fontSize: 13, color: '#475569', outline: 'none' }}>
                    <option>This Month</option>
                    <option>Last Month</option>
                  </select>
                </div>
                <div className="fd-chart-container">
                  <svg width="100%" height="200" viewBox="0 0 500 200" style={{ overflow: 'hidden' }}>
                    {/* Y-Axis labels and grid lines */}
                    {[0, 50, 100, 150].map((yVal, idx) => (
                      <g key={idx}>
                        <line x1="45" y1={yVal + 10} x2="480" y2={yVal + 10} stroke="#f1f5f9" strokeWidth="1.5" />
                        <text x="10" y={yVal + 15} fill="#94a3b8" fontSize="11" fontWeight="600">
                          {idx === 0 ? '₹30K' : idx === 1 ? '₹20K' : idx === 2 ? '₹10K' : '₹0'}
                        </text>
                      </g>
                    ))}

                    {/* Gradient under the chart */}
                    <defs>
                      <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Chart path area (for gradient fill) */}
                    <path d={`M ${chartData[0].x} 160 L ${chartData[0].x} ${chartData[0].y} C ${chartData[0].x + 50} ${chartData[0].y}, ${chartData[1].x - 50} ${chartData[1].y}, ${chartData[1].x} ${chartData[1].y} C ${chartData[1].x + 50} ${chartData[1].y}, ${chartData[2].x - 50} ${chartData[2].y}, ${chartData[2].x} ${chartData[2].y} C ${chartData[2].x + 50} ${chartData[2].y}, ${chartData[3].x - 50} ${chartData[3].y}, ${chartData[3].x} ${chartData[3].y} C ${chartData[3].x + 50} ${chartData[3].y}, ${chartData[4].x - 50} ${chartData[4].y}, ${chartData[4].x} ${chartData[4].y} L ${chartData[4].x} 160 Z`} fill="url(#chart-grad)" />

                    {/* Chart Line */}
                    <path d={`M ${chartData[0].x} ${chartData[0].y} C ${chartData[0].x + 50} ${chartData[0].y}, ${chartData[1].x - 50} ${chartData[1].y}, ${chartData[1].x} ${chartData[1].y} C ${chartData[1].x + 50} ${chartData[1].y}, ${chartData[2].x - 50} ${chartData[2].y}, ${chartData[2].x} ${chartData[2].y} C ${chartData[2].x + 50} ${chartData[2].y}, ${chartData[3].x - 50} ${chartData[3].y}, ${chartData[3].x} ${chartData[3].y} C ${chartData[3].x + 50} ${chartData[3].y}, ${chartData[4].x - 50} ${chartData[4].y}, ${chartData[4].x} ${chartData[4].y}`} fill="none" stroke="#10b981" strokeWidth="3" />

                    {/* Interactive dots representing points */}
                    {chartData.map((pt, idx) => (
                      <circle key={idx} cx={pt.x} cy={pt.y} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHoveredPoint({ x: pt.x, y: pt.y, value: pt.val, date: pt.date, visible: true })}
                      />
                    ))}

                    {/* X-Axis labels */}
                    {chartData.map((lbl, idx) => (
                      <text key={idx} x={lbl.x} y="180" fill="#94a3b8" fontSize="11.5" fontWeight="600" textAnchor="middle">
                        {lbl.date}
                      </text>
                    ))}

                    {/* Tooltip rendered INSIDE SVG so it scales perfectly */}
                    {hoveredPoint.visible && (
                      <g transform={`translate(${hoveredPoint.x}, ${hoveredPoint.y - 20})`}>
                        <rect x="-42" y="-32" width="84" height="34" rx="6" fill="#1e293b" />
                        <text x="0" y="-20" fill="#ffffff" fontSize="10.5" fontWeight="700" textAnchor="middle">{hoveredPoint.value}</text>
                        <text x="0" y="-8" fill="#cbd5e1" fontSize="9" fontWeight="600" textAnchor="middle">{hoveredPoint.date}</text>
                      </g>
                    )}
                  </svg>
                </div>
              </div>

              {/* Top Skills Progress Bars */}
              <div className="fd-card">
                <div className="fd-card-header">
                  <h2 className="fd-card-title">Top Skills</h2>
                  <button className="fd-card-header-link" onClick={() => setActiveTab('settings')}>View all</button>
                </div>
                <div className="fd-skills-list">
                  {getDynamicSkills().map((skill, idx) => (
                    <div className="fd-skill-item" key={idx}>
                      <div className="fd-skill-label-row">
                        <span>{skill.name}</span>
                        <span>{skill.val}</span>
                      </div>
                      <div className="fd-progress-bg">
                        <div className="fd-progress-fill" style={{ width: skill.val }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div className="fd-card">
                <div className="fd-card-header">
                  <h2 className="fd-card-title">Recent Activity</h2>
                </div>
                <div className="fd-activity-feed">
                  {getDynamicActivities().map((act, idx) => (
                    <div className="fd-activity-item" key={idx}>
                      <div className="fd-activity-icon" style={{ background: act.bg }}>
                        <Icon name={act.icon} size={13.5} />
                      </div>
                      <div className="fd-activity-details">
                        <div className="fd-activity-text">{act.text}</div>
                        <div className="fd-activity-meta">{act.meta} · {act.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Row Grid */}
            <div className="fd-bottom-grid">
              {/* Recommended Jobs */}
              <div className="fd-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="fd-card-header" style={{ marginBottom: 12 }}>
                  <h2 className="fd-card-title">Recommended Jobs For You</h2>
                  <button className="fd-card-header-link" onClick={() => setActiveTab('jobs')}>View all</button>
                </div>
                <div className="fd-job-card-row">
                  {displayJobs.slice(0, 2).map((job) => (
                    <JobCard key={job._id} job={job} />
                  ))}
                </div>
              </div>

              {/* Client Reputation */}
              <div className="fd-card" onClick={() => {
                const rep = getDynamicClientReputation();
                if (rep) setSelectedClientReputation(rep);
              }} style={{ cursor: 'pointer' }}>
                {(() => {
                  const rep = getDynamicClientReputation();
                  if (!rep) {
                    return (
                      <>
                        <div className="fd-card-header">
                          <h2 className="fd-card-title">Client Reputation</h2>
                        </div>
                        <div style={{ textAlign: 'center', padding: '36px 12px', color: '#64748b', fontSize: 13.5, fontWeight: 500 }}>
                          No active client contracts.
                        </div>
                      </>
                    );
                  }
                  return (
                    <>
                      <div className="fd-card-header">
                        <h2 className="fd-card-title">Client Reputation <span style={{ color: '#10b981', fontSize: 11, background: '#ecfdf5', padding: '2px 8px', borderRadius: 99, marginLeft: 6 }}>New</span></h2>
                        <button className="fd-card-header-link" onClick={() => setActiveTab('jobs')}>View all</button>
                      </div>
                      <div className="fd-client-header">
                        <div className="fd-client-avatar">{rep.initial}</div>
                        <div>
                          <div className="fd-client-name">{rep.name}</div>
                          <div className="fd-client-rating">
                            ★★★★★ <span>{rep.rating} ({rep.reviews})</span>
                          </div>
                        </div>
                      </div>
                      <div className="fd-client-scores">
                        <div className="fd-client-score-box">
                          <div className="fd-client-score-val">{rep.paymentSpeed}</div>
                          <div className="fd-client-score-lbl">Payment Speed</div>
                          <div className="fd-client-score-eval">Excellent</div>
                        </div>
                        <div className="fd-client-score-box">
                          <div className="fd-client-score-val">{rep.communication}</div>
                          <div className="fd-client-score-lbl">Communication</div>
                          <div className="fd-client-score-eval">Very Good</div>
                        </div>
                        <div className="fd-client-score-box">
                          <div className="fd-client-score-val">{rep.jobSuccess}</div>
                          <div className="fd-client-score-lbl">Job Success</div>
                          <div className="fd-client-score-eval">Excellent</div>
                        </div>
                      </div>
                      <div className="fd-client-stats-row">
                        <div className="fd-client-stat-item">
                          <div className="fd-client-stat-val">{rep.posted}</div>
                          <div className="fd-client-stat-lbl">Projects Posted</div>
                        </div>
                        <div className="fd-client-stat-item">
                          <div className="fd-client-stat-val">{rep.hireRate}</div>
                          <div className="fd-client-stat-lbl">Hire Rate</div>
                        </div>
                        <div className="fd-client-stat-item">
                          <div className="fd-client-stat-val">{rep.response}</div>
                          <div className="fd-client-stat-lbl">Avg. Response</div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Upcoming Milestones */}
              <div className="fd-card">
                <div className="fd-card-header">
                  <h2 className="fd-card-title">Upcoming Milestones</h2>
                  <button className="fd-card-header-link" onClick={() => setActiveTab('payments')}>View all</button>
                </div>
                <div className="fd-milestone-list">
                  {getDynamicMilestones().map((ms, idx) => (
                    <div className="fd-milestone-item" key={idx}>
                      <div className="fd-milestone-proj">{ms.project}</div>
                      <div className="fd-milestone-name">{ms.desc}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="fd-milestone-amount">{ms.amount}</span>
                        <div className="fd-milestone-meta">
                          <span className="fd-milestone-due">{ms.due}</span>
                          <span className="fd-milestone-pct" style={{ marginLeft: 8 }}>{ms.progress}</span>
                        </div>
                      </div>
                      <div className="fd-milestone-progress">
                        <div className="fd-milestone-fill" style={{ width: ms.progress }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── BROWSE JOBS TAB ── */}
        {activeTab === 'jobs' && (
          <div>
            {/* Filter Pills and Sorting Row */}
            <div className="fd-bj-filter-bar">
              <div className="fd-bj-filter-pills">
                {/* Category Pill */}
                <div className={`fd-bj-pill-dropdown ${activeDropdown === 'category' ? 'open' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'category' ? null : 'category'); }}>
                  <span>Category</span>
                  <Icon name="chevDown" size={14} />
                  {activeDropdown === 'category' && (
                    <div className="fd-bj-dropdown-menu">
                      <button className={`fd-bj-dropdown-item ${!filters.category ? 'active' : ''}`} onClick={() => { setFilters(f => ({ ...f, category: '' })); fetchJobs(searchQuery, { ...filters, category: '' }); }}>All Categories</button>
                      <button className={`fd-bj-dropdown-item ${filters.category === 'Web Development' ? 'active' : ''}`} onClick={() => { setFilters(f => ({ ...f, category: 'Web Development' })); fetchJobs(searchQuery, { ...filters, category: 'Web Development' }); }}>Web Development</button>
                      <button className={`fd-bj-dropdown-item ${filters.category === 'Mobile Apps' ? 'active' : ''}`} onClick={() => { setFilters(f => ({ ...f, category: 'Mobile Apps' })); fetchJobs(searchQuery, { ...filters, category: 'Mobile Apps' }); }}>Mobile Development</button>
                      <button className={`fd-bj-dropdown-item ${filters.category === 'Design & UI/UX' ? 'active' : ''}`} onClick={() => { setFilters(f => ({ ...f, category: 'Design & UI/UX' })); fetchJobs(searchQuery, { ...filters, category: 'Design & UI/UX' }); }}>UI/UX Design</button>
                      <button className={`fd-bj-dropdown-item ${filters.category === 'Backend / API' ? 'active' : ''}`} onClick={() => { setFilters(f => ({ ...f, category: 'Backend / API' })); fetchJobs(searchQuery, { ...filters, category: 'Backend / API' }); }}>Backend Development</button>
                      <button className={`fd-bj-dropdown-item ${filters.category === 'DevOps & Cloud' ? 'active' : ''}`} onClick={() => { setFilters(f => ({ ...f, category: 'DevOps & Cloud' })); fetchJobs(searchQuery, { ...filters, category: 'DevOps & Cloud' }); }}>DevOps</button>
                      <button className={`fd-bj-dropdown-item ${filters.category === 'Data Science' ? 'active' : ''}`} onClick={() => { setFilters(f => ({ ...f, category: 'Data Science' })); fetchJobs(searchQuery, { ...filters, category: 'Data Science' }); }}>Data Science</button>
                    </div>
                  )}
                </div>

                {/* Experience Pill */}
                <div className={`fd-bj-pill-dropdown ${activeDropdown === 'experience' ? 'open' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'experience' ? null : 'experience'); }}>
                  <span>Experience</span>
                  <Icon name="chevDown" size={14} />
                  {activeDropdown === 'experience' && (
                    <div className="fd-bj-dropdown-menu">
                      <button className={`fd-bj-dropdown-item ${!filters.experienceLevel ? 'active' : ''}`} onClick={() => { setFilters(f => ({ ...f, experienceLevel: '' })); fetchJobs(searchQuery, { ...filters, experienceLevel: '' }); }}>Any Level</button>
                      <button className={`fd-bj-dropdown-item ${filters.experienceLevel === 'entry' ? 'active' : ''}`} onClick={() => { setFilters(f => ({ ...f, experienceLevel: 'entry' })); fetchJobs(searchQuery, { ...filters, experienceLevel: 'entry' }); }}>Entry Level</button>
                      <button className={`fd-bj-dropdown-item ${filters.experienceLevel === 'intermediate' ? 'active' : ''}`} onClick={() => { setFilters(f => ({ ...f, experienceLevel: 'intermediate' })); fetchJobs(searchQuery, { ...filters, experienceLevel: 'intermediate' }); }}>Intermediate</button>
                      <button className={`fd-bj-dropdown-item ${filters.experienceLevel === 'expert' ? 'active' : ''}`} onClick={() => { setFilters(f => ({ ...f, experienceLevel: 'expert' })); fetchJobs(searchQuery, { ...filters, experienceLevel: 'expert' }); }}>Expert</button>
                    </div>
                  )}
                </div>

                {/* Budget Pill */}
                <div className={`fd-bj-pill-dropdown ${activeDropdown === 'budget' ? 'open' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'budget' ? null : 'budget'); }}>
                  <span>Budget</span>
                  <Icon name="chevDown" size={14} />
                  {activeDropdown === 'budget' && (
                    <div className="fd-bj-dropdown-menu" style={{ width: 220, padding: '12px' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>Select Budget Range</div>
                      <button className="fd-bj-dropdown-item" style={{ marginBottom: 6 }} onClick={() => { setFilters(f => ({ ...f, minBudget: '', maxBudget: '' })); fetchJobs(searchQuery, { ...filters, minBudget: '', maxBudget: '' }); setActiveDropdown(null); }}>Any Budget</button>
                      <button className="fd-bj-dropdown-item" style={{ marginBottom: 6 }} onClick={() => { setFilters(f => ({ ...f, minBudget: '0', maxBudget: '20000' })); fetchJobs(searchQuery, { ...filters, minBudget: '0', maxBudget: '20000' }); setActiveDropdown(null); }}>Under ₹20,000</button>
                      <button className="fd-bj-dropdown-item" style={{ marginBottom: 6 }} onClick={() => { setFilters(f => ({ ...f, minBudget: '20000', maxBudget: '50000' })); fetchJobs(searchQuery, { ...filters, minBudget: '20000', maxBudget: '50000' }); setActiveDropdown(null); }}>₹20,000 - ₹50,000</button>
                      <button className="fd-bj-dropdown-item" onClick={() => { setFilters(f => ({ ...f, minBudget: '50000', maxBudget: '' })); fetchJobs(searchQuery, { ...filters, minBudget: '50000', maxBudget: '' }); setActiveDropdown(null); }}>₹50,000+</button>
                    </div>
                  )}
                </div>

                {/* Job Type Pill */}
                <div className={`fd-bj-pill-dropdown ${activeDropdown === 'jobType' ? 'open' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'jobType' ? null : 'jobType'); }}>
                  <span>Job Type</span>
                  <Icon name="chevDown" size={14} />
                  {activeDropdown === 'jobType' && (
                    <div className="fd-bj-dropdown-menu">
                      <button className={`fd-bj-dropdown-item ${!filters.budgetType ? 'active' : ''}`} onClick={() => { setFilters(f => ({ ...f, budgetType: '' })); fetchJobs(searchQuery, { ...filters, budgetType: '' }); }}>Any Type</button>
                      <button className={`fd-bj-dropdown-item ${filters.budgetType === 'fixed' ? 'active' : ''}`} onClick={() => { setFilters(f => ({ ...f, budgetType: 'fixed' })); fetchJobs(searchQuery, { ...filters, budgetType: 'fixed' }); }}>Fixed Price</button>
                      <button className={`fd-bj-dropdown-item ${filters.budgetType === 'hourly' ? 'active' : ''}`} onClick={() => { setFilters(f => ({ ...f, budgetType: 'hourly' })); fetchJobs(searchQuery, { ...filters, budgetType: 'hourly' }); }}>Hourly</button>
                    </div>
                  )}
                </div>

                {/* More Filters Pill */}
                <div className={`fd-bj-pill-dropdown ${activeDropdown === 'more' ? 'open' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'more' ? null : 'more'); }}>
                  <span>More Filters</span>
                  <Icon name="chevDown" size={14} />
                  {activeDropdown === 'more' && (
                    <div className="fd-bj-dropdown-menu">
                      <button className="fd-bj-dropdown-item" onClick={() => {
                        const cleared = { category: '', experienceLevel: '', minBudget: '', maxBudget: '', budgetType: '', skills: [] };
                        setFilters(cleared);
                        setSearchQuery('');
                        fetchJobs('', cleared);
                        setActiveDropdown(null);
                      }}>Reset All Filters</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Sorting Pill */}
              <div className={`fd-bj-pill-dropdown ${activeDropdown === 'sortBy' ? 'open' : ''}`}
                onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'sortBy' ? null : 'sortBy'); }}>
                <span>Sort by: {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : sortBy === 'high-to-low' ? 'Budget: High to Low' : 'Budget: Low to High'}</span>
                <Icon name="chevDown" size={14} />
                {activeDropdown === 'sortBy' && (
                  <div className="fd-bj-dropdown-menu" style={{ right: 0, left: 'auto' }}>
                    <button className={`fd-bj-dropdown-item ${sortBy === 'newest' ? 'active' : ''}`} onClick={() => { setSortBy('newest'); setActiveDropdown(null); }}>Newest</button>
                    <button className={`fd-bj-dropdown-item ${sortBy === 'oldest' ? 'active' : ''}`} onClick={() => { setSortBy('oldest'); setActiveDropdown(null); }}>Oldest</button>
                    <button className={`fd-bj-dropdown-item ${sortBy === 'high-to-low' ? 'active' : ''}`} onClick={() => { setSortBy('high-to-low'); setActiveDropdown(null); }}>Budget: High to Low</button>
                    <button className={`fd-bj-dropdown-item ${sortBy === 'low-to-high' ? 'active' : ''}`} onClick={() => { setSortBy('low-to-high'); setActiveDropdown(null); }}>Budget: Low to High</button>
                  </div>
                )}
              </div>
            </div>

            {/* Split Layout: Sidebar Filters (Left) & Job List (Right) */}
            <div className="fd-bj-layout">
              {/* Sidebar Filters */}
              <aside className="fd-bj-sidebar">
                {/* Categories */}
                <div className="fd-bj-sidebar-section">
                  <div className="fd-bj-sidebar-section-title">All Categories</div>
                  <div className="fd-bj-category-list">
                    {[
                      { id: '', label: 'All Categories', count: 360 },
                      { id: 'Web Development', label: 'Web Development', count: 120 },
                      { id: 'Mobile Apps', label: 'Mobile Development', count: 80 },
                      { id: 'Design & UI/UX', label: 'UI/UX Design', count: 60 },
                      { id: 'Backend / API', label: 'Backend Development', count: 45 },
                      { id: 'DevOps & Cloud', label: 'DevOps', count: 25 },
                      { id: 'Data Science', label: 'Data Science', count: 30 }
                    ].map(cat => (
                      <button
                        key={cat.label}
                        className={`fd-bj-category-item ${filters.category === cat.id ? 'active' : ''}`}
                        onClick={() => {
                          setFilters(f => ({ ...f, category: cat.id }));
                          fetchJobs(searchQuery, { ...filters, category: cat.id });
                        }}
                      >
                        <span>{cat.label}</span>
                        <span className="fd-bj-category-count">({cat.count})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget Range Slider */}
                <div className="fd-bj-sidebar-section">
                  <div className="fd-bj-sidebar-section-title">Budget Range</div>
                  <input
                    type="range"
                    className="fd-bj-range-slider"
                    min="0"
                    max="100000"
                    step="5000"
                    value={filters.maxBudget || 100000}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFilters(f => ({ ...f, maxBudget: val }));
                    }}
                    onMouseUp={(e) => {
                      fetchJobs(searchQuery, { ...filters, maxBudget: e.target.value });
                    }}
                    onTouchEnd={(e) => {
                      fetchJobs(searchQuery, { ...filters, maxBudget: e.target.value });
                    }}
                  />
                  <div className="fd-bj-range-labels">
                    <span>₹0</span>
                    <span>₹{Number(filters.maxBudget || 100000).toLocaleString('en-IN')}+</span>
                  </div>
                </div>

                {/* Job Type Checkboxes */}
                <div className="fd-bj-sidebar-section">
                  <div className="fd-bj-sidebar-section-title">Job Type</div>
                  <div className="fd-bj-checkbox-group">
                    {[
                      { id: 'full-time', label: 'Full Time' },
                      { id: 'part-time', label: 'Part Time' },
                      { id: 'hourly', label: 'Hourly' },
                      { id: 'fixed', label: 'Fixed Price' }
                    ].map(type => (
                      <label key={type.id} className="fd-bj-checkbox-label">
                        <input
                          type="checkbox"
                          checked={filters.budgetType === type.id || (type.id === 'hourly' && filters.budgetType === 'hourly') || (type.id === 'fixed' && filters.budgetType === 'fixed')}
                          onChange={() => {
                            let nextVal = '';
                            if (type.id === 'fixed') nextVal = filters.budgetType === 'fixed' ? '' : 'fixed';
                            else if (type.id === 'hourly') nextVal = filters.budgetType === 'hourly' ? '' : 'hourly';
                            setFilters(f => ({ ...f, budgetType: nextVal }));
                            fetchJobs(searchQuery, { ...filters, budgetType: nextVal });
                          }}
                        />
                        <span>{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Experience Level Checkboxes */}
                <div className="fd-bj-sidebar-section">
                  <div className="fd-bj-sidebar-section-title">Experience Level</div>
                  <div className="fd-bj-checkbox-group">
                    {[
                      { id: 'entry', label: 'Entry Level' },
                      { id: 'intermediate', label: 'Intermediate' },
                      { id: 'expert', label: 'Expert' }
                    ].map(exp => (
                      <label key={exp.id} className="fd-bj-checkbox-label">
                        <input
                          type="checkbox"
                          checked={filters.experienceLevel === exp.id}
                          onChange={() => {
                            const nextVal = filters.experienceLevel === exp.id ? '' : exp.id;
                            setFilters(f => ({ ...f, experienceLevel: nextVal }));
                            fetchJobs(searchQuery, { ...filters, experienceLevel: nextVal });
                          }}
                        />
                        <span>{exp.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </aside>

              {/* Main Jobs Column */}
              <div className="fd-bj-main">
                {jobsLoading ? (
                  <div className="fd-card" style={{ display: 'grid', placeItems: 'center', minHeight: 300 }}><LoadingSpinner /></div>
                ) : jobs.length === 0 ? (
                  <div className="fd-card" style={{ padding: 48 }}><EmptyState message="No jobs matching your filter criteria were found." /></div>
                ) : (
                  (() => {
                    let list = [...jobs];
                    if (sortBy === 'newest') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    if (sortBy === 'oldest') list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    if (sortBy === 'high-to-low') list.sort((a, b) => (Number(b.budget) || 0) - (Number(a.budget) || 0));
                    if (sortBy === 'low-to-high') list.sort((a, b) => (Number(a.budget) || 0) - (Number(b.budget) || 0));

                    return list.map((job) => <JobCard key={job._id} job={job} large />);
                  })()
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── PROPOSALS TAB ── */}
        {activeTab === 'proposals' && (
          <div className="fd-card">
            <div className="fd-card-header">
              <h2 className="fd-card-title">My Bids & Proposals</h2>
              <span className="fd-summary-pill">{myProposals.length} total submitted</span>
            </div>
            {proposalsLoading ? <LoadingSpinner /> : filteredProposals.length === 0 ? <EmptyState message="No proposals match your search." /> : (
              <div className="fd-list-stack">
                {filteredProposals.map((p) => {
                  const st = proposalStatus[p.status] || proposalStatus.pending;
                  return (
                    <div key={p._id} className="fd-proposal-item" onClick={() => setSelectedProposalDetails(p)}>
                      <div className="fd-proposal-main">
                        <div className="fd-proposal-title">{p.job}</div>
                        <div className="fd-proposal-meta">Client: {p.client} · Bid: <strong>{p.bid}</strong> · Submitted {p.submitted}</div>
                        {p.attachments?.length > 0 && (
                          <div className="fd-proposal-attachments">
                            {p.attachments.map((url, i) => (
                              <a key={i} href={url} target="_blank" rel="noreferrer" className="fd-proposal-attachment"><Icon name="file" size={12} /> Attachment {i + 1}</a>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="fd-status-badge" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── MY WORK TAB ── */}
        {activeTab === 'mywork' && (
          <div className="fd-card">
            <div className="fd-card-header">
              <h2 className="fd-card-title">Contracts & Active Assignments</h2>
              <span className="fd-summary-pill">{myWork.length} total contracts</span>
            </div>
            {myWorkLoading ? <LoadingSpinner /> : filteredMyWork.length === 0 ? (
              <EmptyState message="No contracts match your search." />
            ) : (
              <div className="fd-list-stack">
                {filteredMyWork.map((job) => {
                  const st = jobStatusStyle[job.status] || jobStatusStyle.in_progress;
                  const canSubmit = job.status === 'in_progress';
                  const clientId = job.client?._id || job.client;
                  const clientName = job.client?.firstName ? `${job.client.firstName} ${job.client.lastName}` : 'Client';
                  const isMessaging = messagingClientId === clientId;
                  return (
                    <div key={job._id} className="fd-work-item">
                      <div className="fd-work-main">
                        <div className="fd-work-title-row">
                          <span className="fd-work-title">{job.title}</span>
                          <span className="fd-status-badge" style={{ background: st.bg, color: st.color, fontSize: 11 }}>{st.label}</span>
                        </div>
                        <div className="fd-work-meta">Client: <strong>{clientName}</strong> · Budget: <strong>{formatBudget(job.budget)}</strong> · Started {timeAgo(job.createdAt)}</div>
                        {job.description && (
                          <p className="fd-work-description">{job.description}</p>
                        )}
                        {job.submissionNote && (
                          <div className="fd-work-note">
                            <strong>Your submission:</strong> {job.submissionNote}
                          </div>
                        )}
                      </div>

                      <div className="fd-work-actions">
                        <button className="fd-work-btn fd-work-btn-secondary" onClick={() => setSelectedJobMilestones(job)}>
                          📊 Milestones & Payments
                        </button>
                        <button onClick={() => { setMeetingSummaryJob(job); setMeetingBulletPoints(''); setEditedSummaryText(''); setGeneratedNextSteps([]); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                          📝 Meeting Summary
                        </button>
                        {clientId && (
                          <button className="fd-work-btn fd-work-btn-secondary" onClick={() => handleMessageClient(clientId, job._id)} disabled={isMessaging}>
                            <Icon name="message" size={14} /> Message Client
                          </button>
                        )}
                        {canSubmit && (
                          <button className="fd-work-btn fd-work-btn-primary" onClick={() => setSubmitWorkJob(job)}>
                            <Icon name="upload" size={14} /> Submit Deliverable
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── SAVED JOBS TAB ── */}
        {activeTab === 'saved' && (
          <div className="fd-card">
            <div className="fd-card-header">
              <h2 className="fd-card-title">Bookmarked Positions</h2>
              <span style={{ fontSize: 12, color: '#64748b', background: '#f1f5f9', padding: '3px 10px', borderRadius: 99, fontWeight: 700 }}>{filteredSavedJobs.length} saved</span>
            </div>
            {savedJobsLoading ? <LoadingSpinner /> : filteredSavedJobs.length === 0 ? <EmptyState message="No matching saved jobs found." /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {filteredSavedJobs.map((job) => <JobCard key={job._id} job={job} large />)}
              </div>
            )}
          </div>
        )}

        {/* ── PAYMENTS TAB ── */}
        {activeTab === 'payments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Top Cards for Payments */}
            <div className="fd-payment-grid">
              <div className="fd-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: 13, color: '#64748b', textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>Financial Balance</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>₹{availableBalance.toLocaleString('en-IN')}</div>
                    <button className="fd-btn-payout-primary" style={{ padding: '10px 20px', fontSize: 13.5 }} onClick={() => setWithdrawModal({ ...withdrawModal, open: true })}>
                      Withdraw Funds
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 20, borderTop: '1px solid #f1f5f9', paddingTop: 14, marginTop: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>Total Earned</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>₹{netEarnings.toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>Withdrawn</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#ef4444' }}>₹{totalWithdrawn.toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>Pending Approval</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#d97706' }}>₹{myWork.filter(j => j.status === 'submitted').reduce((sum, j) => sum + (Number(j.budget) || 0), 0).toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="fd-card">
                <div className="fd-card-header">
                  <h2 className="fd-card-title">Withdrawal Accounts</h2>
                  <button className="fd-card-header-link" onClick={() => toast.success('Link account feature coming soon!')}>+ Add New</button>
                </div>
                <div className="fd-payout-methods">
                  <div className="fd-payout-card">
                    <div className="fd-payout-info">
                      <span className="fd-payout-icon">🏦</span>
                      <div>
                        <div className="fd-payout-detail">HDFC Bank India Account</div>
                        <div className="fd-payout-meta">Account endings in •••• 9081</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, background: '#ecfdf5', color: '#10b981', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>Primary</span>
                  </div>
                  <div className="fd-payout-card">
                    <div className="fd-payout-info">
                      <span className="fd-payout-icon">🏦</span>
                      <div>
                        <div className="fd-payout-detail">HDFC Bank India Account</div>
                        <div className="fd-payout-meta">Account endings in •••• 9081</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, background: '#ecfdf5', color: '#10b981', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>Primary</span>
                  </div>
                  <div className="fd-payout-card">
                    <div className="fd-payout-info">
                      <span className="fd-payout-icon">💳</span>
                      <div>
                        <div className="fd-payout-detail">PayPal Holdings Inc.</div>
                        <div className="fd-payout-meta">{user?.email || 'user@example.com'}</div>
                      </div>
                    </div>
                    <button className="fd-card-header-link" style={{ fontSize: 11 }} onClick={() => toast.success('Set as primary payment method!')}>Make Primary</button>
                  </div>
                  <div className="fd-payout-card">
                    <div className="fd-payout-info">
                      <span className="fd-payout-icon" style={{ background: '#e0f2fe', borderRadius: '50%', padding: '6px', fontSize: 16 }}>⚡</span>
                      <div>
                        <div className="fd-payout-detail">UPI Instant Payout</div>
                        <div className="fd-payout-meta">Withdraw instantly to {(user?.firstName || 'user').toLowerCase()}@okaxis</div>
                      </div>
                    </div>
                    <button className="fd-card-header-link" style={{ fontSize: 11 }} onClick={() => toast.success('UPI account active!')}>Manage</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions list */}
            <div className="fd-card">
              <div className="fd-payment-header-row">
                <h2 className="fd-card-title">Transactions Ledger</h2>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="fd-card-header-link" onClick={() => toast.success('Statement downloaded! 📄')}>Download Statement</button>
                  <button className="fd-card-header-link" style={{ color: '#10b981' }} onClick={() => {
                    const completed = myWork.filter(j => j.status === 'completed');
                    if (completed.length > 0) {
                      setInvoiceModal({ open: true, job: completed[0] });
                    } else {
                      setInvoiceModal({
                        open: true,
                        job: {
                          title: 'Frontend React Development',
                          client: { firstName: 'ABC', lastName: 'Company' },
                          budget: 45000,
                          createdAt: new Date().toISOString()
                        }
                      });
                    }
                  }}>🧾 GST Invoices</button>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="fd-transaction-table">
                  <thead>
                    <tr>
                      <th>Ref ID</th>
                      <th>Transaction Detail</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: 13.5, fontWeight: 500 }}>No matching transactions found.</td>
                      </tr>
                    ) : (
                      filteredTransactions.map((txn, idx) => (
                        <tr key={idx}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{txn.id}</td>
                          <td>{txn.description}</td>
                          <td style={{ color: '#64748b' }}>{txn.date}</td>
                          <td className={`fd-transaction-amount ${txn.type === 'credit' ? 'plus' : 'minus'}`}>
                            {txn.type === 'credit' ? '+' : '-'} ₹{Math.abs(txn.amount).toLocaleString('en-IN')}
                          </td>
                          <td>
                            <span className={`fd-status-badge ${txn.status}`}>
                              {txn.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {activeTab === 'analytics' && (
          <div className="fd-ea-container">
            {/* Header */}
            <div className="fd-ea-header">
              <div className="fd-ea-back-row">
                <button className="fd-ea-back-btn" onClick={() => setActiveTab('overview')}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                </button>
                <h1 className="fd-ea-title">Earnings Analytics</h1>
              </div>
              <select className="fd-ea-select" defaultValue="year">
                <option value="year">This Year</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
            </div>

            {/* Total Earnings Summary */}
            <div className="fd-ea-summary">
              <span className="fd-ea-sum-lbl">Total Earnings</span>
              <span className="fd-ea-sum-val">₹{netEarnings.toLocaleString('en-IN')}</span>
              <span className="fd-ea-sum-meta">
                {netEarnings > 0 ? '+ 100% vs last year' : '+ 0% vs last year'}
              </span>
            </div>

            {/* Monthly Bar Chart */}
            <div className="fd-ea-chart-wrapper">
              <div className="fd-ea-bar-chart">
                {/* Gridlines */}
                <div className="fd-ea-chart-gridline" style={{ top: '25%' }} />
                <div className="fd-ea-chart-gridline" style={{ top: '50%' }} />
                <div className="fd-ea-chart-gridline" style={{ top: '75%' }} />

                {getMonthlyEarningsRealData().map((mItem, idx) => (
                  <div className="fd-ea-bar-column" key={idx}>
                    {mItem.val > 0 && (
                      <span className="fd-ea-bar-val">₹{(mItem.val / 1000)}k</span>
                    )}
                    <div className="fd-ea-bar-fill" style={{ height: mItem.height, background: '#10b981' }} />
                    <span className="fd-ea-bar-lbl">{mItem.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Donut Chart: Top Performing Skills */}
            <div className="fd-ea-skills-card">
              <h2 className="fd-ea-skills-title">Top Performing Skills</h2>
              <div className="fd-ea-skills-layout">
                {/* SVG Donut */}
                <div className="fd-ea-donut-wrapper">
                  {(() => {
                    const skills = getTopPerformingSkillsRealData();
                    const hasData = completedWorkCount > 0;

                    if (!hasData) {
                      return (
                        <svg width="120" height="120" viewBox="0 0 42 42">
                          <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
                        </svg>
                      );
                    }

                    let accumulatedPct = 0;
                    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#06b6d4'];

                    return (
                      <svg width="120" height="120" viewBox="0 0 42 42">
                        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
                        {skills.map((skill, idx) => {
                          const strokeVal = skill.pct;
                          const offsetVal = 100 - accumulatedPct;
                          accumulatedPct += strokeVal;
                          return (
                            <circle
                              key={idx}
                              cx="21"
                              cy="21"
                              r="15.915"
                              fill="transparent"
                              stroke={colors[idx % colors.length]}
                              strokeWidth="6"
                              strokeDasharray={`${strokeVal} ${100 - strokeVal}`}
                              strokeDashoffset={offsetVal}
                              transform="rotate(-90 21 21)"
                            />
                          );
                        })}
                      </svg>
                    );
                  })()}
                  <div className="fd-ea-donut-center" />
                </div>

                {/* Legend list */}
                <div className="fd-ea-skills-legend">
                  {(() => {
                    const skills = getTopPerformingSkillsRealData();
                    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#06b6d4'];
                    return skills.map((skill, idx) => (
                      <div className="fd-ea-legend-item" key={idx}>
                        <div className="fd-ea-legend-left">
                          <span className="fd-ea-legend-dot" style={{ background: colors[idx % colors.length] }} />
                          <span>{skill.name}</span>
                        </div>
                        <span className="fd-ea-legend-val">{skill.pct}%</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── COMMUNITY TAB ── */}
        {activeTab === 'community' && (
          <div className="fd-community-layout">
            <div>
              {/* Category tags selector */}
              <div className="fd-community-categories">
                {['All', 'Development', 'Design', 'General'].map((cat) => (
                  <button key={cat} onClick={() => setCommunityCategory(cat)}
                    className={`fd-comm-cat-btn ${communityCategory === cat ? 'active' : ''}`}>
                    {cat}
                  </button>
                ))}
              </div>

              {/* Forum feeds */}
              <div className="fd-community-feed">
                {filteredForumPosts.map((post) => (
                  <div className="fd-forum-post" key={post.id}>
                    <div className="fd-forum-author">
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#7c3aed', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 'bold', fontSize: 12 }}>
                        {post.author === "Abhishek Rajput" && user ? user.firstName[0] : post.author[0]}
                      </div>
                      <div>
                        <div className="fd-forum-author-name">
                          {post.author === "Abhishek Rajput" && user ? `${user.firstName} ${user.lastName}` : post.author}
                          <span style={{ fontSize: 11.5, color: '#94a3b8', background: '#f1f5f9', padding: '1px 6px', borderRadius: 4, marginLeft: 4 }}>{post.role}</span>
                        </div>
                        <div className="fd-forum-author-time">{post.time} · Tagged under <strong style={{ color: '#10b981' }}>{post.category}</strong></div>
                      </div>
                    </div>
                    <div className="fd-forum-title">{post.title}</div>
                    <div className="fd-forum-body">{post.body}</div>
                    <div className="fd-forum-footer">
                      <button className={`fd-forum-action-btn ${post.liked ? 'active' : ''}`} onClick={() => handleLikePost(post.id)}>
                        ❤️ {post.likes} Likes
                      </button>
                      <button className="fd-forum-action-btn" onClick={() => toast.success('Forum replies coming soon!')}>
                        💬 {post.replies} Replies
                      </button>
                      <button className="fd-forum-action-btn" onClick={() => toast.success('Link copied to clipboard!')}>
                        🔗 Share
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Left Sidebar Widgets */}
            <div>
              {/* Ask Question / Create Post Box */}
              <div className="fd-comm-sidebar-section">
                <div className="fd-comm-section-title">Start a Discussion</div>
                <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input placeholder="Discussion Title..." value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)}
                    style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, outline: 'none' }} />
                  <textarea placeholder="Write your post body content here..." rows="3" value={newPostBody} onChange={(e) => setNewPostBody(e.target.value)}
                    style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'none' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <select value={postCategory} onChange={(e) => setPostCategory(e.target.value)}
                      style={{ padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 12, outline: 'none' }}>
                      <option value="General">General</option>
                      <option value="Development">Development</option>
                      <option value="Design">Design</option>
                    </select>
                    <button type="submit" className="fd-btn-payout-primary" style={{ padding: '6px 12px', fontSize: 12 }}>
                      Post Feed
                    </button>
                  </div>
                </form>
              </div>

              {/* Trending discussions */}
              <div className="fd-comm-sidebar-section">
                <div className="fd-comm-section-title">Trending Threads</div>
                <div className="fd-comm-trending-item">
                  <div className="fd-comm-trending-title">#React19Compiler</div>
                  <div className="fd-comm-trending-stats">48 freelancers speaking</div>
                </div>
                <div className="fd-comm-trending-item">
                  <div className="fd-comm-trending-title">#FreelanceTaxesIndia</div>
                  <div className="fd-comm-trending-stats">32 posts today</div>
                </div>
                <div className="fd-comm-trending-item">
                  <div className="fd-comm-trending-title">#UpworkAlgorithms</div>
                  <div className="fd-comm-trending-stats">19 interactions</div>
                </div>
              </div>

              {/* Skill Communities Widget */}
              <div className="fd-comm-sidebar-section" style={{ marginTop: 12 }}>
                <div className="fd-comm-section-title">Skill Communities</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { name: 'React Developers', members: '1.2k members', icon: '⚛️' },
                    { name: 'Node.js Backend Devs', members: '840 members', icon: '🟢' },
                    { name: 'UI/UX Designers', members: '650 members', icon: '🎨' }
                  ].map(comm => {
                    const isJoined = joinedCommunities.includes(comm.name);
                    return (
                      <div key={comm.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 16 }}>{comm.icon}</span>
                          <div>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>{comm.name}</div>
                            <div style={{ fontSize: 11, color: '#64748b' }}>{comm.members}</div>
                          </div>
                        </div>
                        <button className="fd-card-header-link" style={{ fontSize: 11, color: isJoined ? '#10b981' : '#2563eb', fontWeight: isJoined ? '700' : 'normal' }} onClick={() => {
                          if (isJoined) {
                            setJoinedCommunities(joinedCommunities.filter(c => c !== comm.name));
                            toast.info(`Left the ${comm.name} Community.`);
                          } else {
                            setJoinedCommunities([...joinedCommunities, comm.name]);
                            toast.success(`Joined the ${comm.name} Community! 👥`);
                          }
                        }}>
                          {isJoined ? 'Joined ✓' : 'Join'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SKILL TESTS TAB ── */}
        {activeTab === 'skilltests' && (
          <div>
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 16, padding: '20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 32 }}>🎓</div>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: '#047857', marginBottom: 4 }}>Demonstrate Your Core Competence</div>
                <div style={{ fontSize: 13, color: '#065f46' }}>Pass verified skill tests to display certification badges on your profile and increase your interview invite rates by up to 150%.</div>
              </div>
            </div>
            <div className="fd-tests-grid">
              {[
                { name: 'React.js', desc: 'Hooks, fiber reconciliation, performance optimizations, state management.', time: '15 mins · 3 questions', badge: '⚛️' },
                { name: 'Node.js', desc: 'Event loop, HTTP servers, core modules, cluster architecture.', time: '15 mins · 3 questions', badge: '🟢' },
                { name: 'MongoDB', desc: 'Document schemas, query operators, compound index, aggregations.', time: '15 mins · 3 questions', badge: '🍃' }
              ].map((test) => {
                const passed = certifiedSkills.includes(test.name);
                return (
                  <div className="fd-test-card" key={test.name}>
                    <div className="fd-test-badge-icon">{test.badge}</div>
                    <div className="fd-test-title">{test.name} Skill Test</div>
                    <div className="fd-test-meta">{test.desc}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>{test.time}</div>
                    {passed ? (
                      <span className="fd-test-status-text">✓ Certified Specialist</span>
                    ) : (
                      <button className="fd-btn-test-action" onClick={() => handleStartQuiz(test.name)}>
                        Start Skill Assessment
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── REFERRALS TAB ── */}
        {activeTab === 'referrals' && (
          <div className="fd-referral-layout">
            <div className="fd-card">
              <h2 className="fd-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                🎁 Referral Program
              </h2>
              <p style={{ fontSize: 13.5, color: '#64748b', marginBottom: 20 }}>
                Invite & earn platform credits! Earn a 5% commission on the platform service fees plus bonus platform credits for every user who registers using your custom referral link.
              </p>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>Your Personal Invite Link</label>
              {(() => {
                const refSlug = (user?.firstName || 'user').toLowerCase() + (user?.lastName || '').toLowerCase() + (user?._id || user?.id || '99').toString().slice(-4);
                const referralLink = `https://freelancemarket.com/join?ref=${refSlug}`;
                return (
                  <div className="fd-ref-link-box">
                    <span className="fd-ref-link">{referralLink}</span>
                    <button className="fd-btn-copy" onClick={() => {
                      navigator.clipboard.writeText(referralLink);
                      toast.success("Referral link copied to clipboard! 📋");
                    }}>
                      Copy Link
                    </button>
                  </div>
                );
              })()}

              {/* Referral Statistics */}
              <div className="fd-ref-stats" style={{ marginTop: 24 }}>
                <div className="fd-ref-stat-card">
                  <div className="fd-ref-stat-val">12</div>
                  <div className="fd-ref-stat-lbl">Invited Users</div>
                </div>
                <div className="fd-ref-stat-card">
                  <div className="fd-ref-stat-val">8</div>
                  <div className="fd-ref-stat-lbl">Active Signups</div>
                </div>
                <div className="fd-ref-stat-card">
                  <div className="fd-ref-stat-val">₹4,500</div>
                  <div className="fd-ref-stat-lbl">Commissions Earned</div>
                </div>
              </div>
            </div>

            {/* Referrals list */}
            <div className="fd-card">
              <h2 className="fd-card-title" style={{ marginBottom: 12 }}>Your Referral Signups</h2>

              {/* Invite Form */}
              <div style={{ display: 'flex', gap: 10, margin: '14px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: 16 }}>
                <input type="email" placeholder="Enter colleague's email address..." value={referralEmail} onChange={(e) => setReferralEmail(e.target.value)}
                  style={{ flex: 1, padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, outline: 'none' }} />
                <button className="fd-btn-payout-primary" style={{ padding: '9px 16px', fontSize: 12.5 }} onClick={() => {
                  if (!referralEmail || !referralEmail.includes('@')) {
                    toast.error("Please enter a valid email address.");
                    return;
                  }
                  const namePart = referralEmail.split('@')[0];
                  const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
                  const initial = formattedName.charAt(0);
                  const newRef = {
                    name: formattedName,
                    date: 'Joined just now',
                    earnings: 'Awaiting signup activation',
                    initial: initial
                  };
                  setReferralsList([newRef, ...referralsList]);
                  setReferralEmail('');
                  toast.success(`Invite sent successfully to ${referralEmail}! ✉️`);
                }}>Send Invite</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {referralsList.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 12, borderBottom: idx < referralsList.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#eff6ff', color: '#1e3a8a', display: 'grid', placeItems: 'center', fontWeight: 'bold' }}>{item.initial}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                      <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{item.date}</div>
                    </div>
                    <span style={{ fontSize: 12, color: '#10b981', fontWeight: 'bold' }}>{item.earnings}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab === 'settings' && (
          <div className="fd-card">
            <h2 className="fd-card-title" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 14, marginBottom: 20 }}>Account Dashboard Preferences</h2>
            <div className="fd-settings-layout">
              {/* Notification Toggles */}
              <div className="fd-settings-section">
                <div className="fd-settings-title">Real-Time Alerts</div>
                <div className="fd-setting-row">
                  <div className="fd-setting-info">
                    <span className="fd-setting-lbl">Email Notifications</span>
                    <span className="fd-setting-desc">Send immediate updates regarding proposal accepts, job invites, and milestone completions.</span>
                  </div>
                  <label className="fd-switch">
                    <input type="checkbox" checked={settings.emailNotif} onChange={() => handleToggleSetting('emailNotif')} />
                    <span className="fd-slider" />
                  </label>
                </div>
                <div className="fd-setting-row">
                  <div className="fd-setting-info">
                    <span className="fd-setting-lbl">SMS Messages Notifications</span>
                    <span className="fd-setting-desc">Send text alerts to your mobile phone when a client deposits project milestone payments.</span>
                  </div>
                  <label className="fd-switch">
                    <input type="checkbox" checked={settings.smsNotif} onChange={() => handleToggleSetting('smsNotif')} />
                    <span className="fd-slider" />
                  </label>
                </div>
                <div className="fd-setting-row">
                  <div className="fd-setting-info">
                    <span className="fd-setting-lbl">WhatsApp Notifications</span>
                    <span className="fd-setting-desc">Get notified on WhatsApp regarding milestone approvals, contract offers, and payout updates.</span>
                  </div>
                  <label className="fd-switch">
                    <input type="checkbox" checked={settings.whatsappNotif} onChange={() => handleToggleSetting('whatsappNotif')} />
                    <span className="fd-slider" />
                  </label>
                </div>
              </div>

              {/* Privacy settings */}
              <div className="fd-settings-section">
                <div className="fd-settings-title">Profile Visibility Settings</div>
                <div className="fd-setting-row">
                  <div className="fd-setting-info">
                    <span className="fd-setting-lbl">Public Searchability</span>
                    <span className="fd-setting-desc">Allow client directories to index your freelancer profile, hourly rate, and portfolio items.</span>
                  </div>
                  <label className="fd-switch">
                    <input type="checkbox" checked={settings.publicSearch} onChange={() => handleToggleSetting('publicSearch')} />
                    <span className="fd-slider" />
                  </label>
                </div>
              </div>

              {/* Language Preferences */}
              <div className="fd-settings-section">
                <div className="fd-settings-title">Preferred Language Preferences</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                  <div className="fd-setting-info">
                    <span className="fd-setting-lbl">Hindi / English Toggle</span>
                    <span className="fd-setting-desc">Switch dashboard language display preferences anytime.</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="fd-btn-payout-primary" style={{ padding: '6px 14px', background: '#10b981', color: '#fff', border: 'none', fontSize: 12.5 }} onClick={() => { setLang('en'); toast.success('Dashboard language set to English!'); }}>English</button>
                  </div>
                </div>
              </div>

              {/* Password update form */}
              <div className="fd-settings-section">
                <div className="fd-settings-title">Change Account Security Password</div>
                <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Current Password</label>
                    <input type="password" value={passwordForm.oldPassword} onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                      style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>New Password</label>
                    <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, outline: 'none' }} />
                  </div>
                  <button type="submit" className="fd-btn-payout-primary" style={{ alignSelf: 'flex-start', padding: '10px 20px', marginTop: 6 }}>
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── MODALS ── */}

      {/* Proposal Apply Modal */}
      {selectedJob && (
        <ProposalModal job={selectedJob} onClose={() => setSelectedJob(null)} onSubmit={handleProposalSubmit} submitting={submitting} />
      )}

      {/* Contract Deliver Work Modal */}
      {submitWorkJob && (
        <SubmitWorkModal job={submitWorkJob} onClose={() => setSubmitWorkJob(null)} onSubmit={handleWorkSubmit} submitting={submittingWork} />
      )}

      {/* Withdrawal Funds Modal */}
      {withdrawModal.open && (
        <div className="fd-quiz-overlay" onClick={() => setWithdrawModal({ ...withdrawModal, open: false })}>
          <div className="fd-quiz-modal" onClick={(e) => e.stopPropagation()} style={{ width: 440 }}>
            <h2 className="fd-quiz-title" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 12, marginBottom: 16 }}>Withdraw Earnings Balance</h2>
            <form onSubmit={handleWithdrawFunds} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Available Balance</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>₹{availableBalance.toLocaleString('en-IN')}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: '#475569' }}>Withdrawal Payout Method</label>
                <select value={withdrawModal.method} onChange={(e) => setWithdrawModal({ ...withdrawModal, method: e.target.value })}
                  style={{ padding: '10px 12px', border: isDarkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5, outline: 'none', background: isDarkMode ? '#071622' : 'transparent', color: isDarkMode ? '#e6eef8' : undefined }}>
                  <option value="UPI Instant Payout">UPI Instant Payout ({(user?.firstName || 'user').toLowerCase()}@okaxis) • Instant</option>
                  <option value="Bank Account (HDFC Bank)">Bank Account (HDFC Bank) •••• 9081</option>
                  <option value="PayPal Holdings Account">PayPal Account ({user?.email || 'user@example.com'})</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: '#475569' }}>Withdrawal Amount (₹)</label>
                <input type="number" placeholder="Enter payout amount" value={withdrawModal.amount} onChange={(e) => setWithdrawModal({ ...withdrawModal, amount: e.target.value })}
                  style={{ padding: '10px 12px', border: isDarkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid #cbd5e1', borderRadius: 8, fontSize: 13.5, outline: 'none', background: isDarkMode ? '#071622' : 'transparent', color: isDarkMode ? '#e6eef8' : undefined }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                <button type="button" onClick={() => setWithdrawModal({ ...withdrawModal, open: false })}
                  style={{ padding: '9px 18px', border: isDarkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid #cbd5e1', borderRadius: 8, background: isDarkMode ? '#071422' : '#fff', fontSize: 13.5, color: isDarkMode ? '#dbeafe' : '#475569', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="fd-btn-payout-primary" style={{ padding: '9px 24px', fontSize: 13.5 }}>
                  Confirm Withdrawal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive quiz Skill assessment modal */}
      {activeQuiz.open && (
        <div className="fd-quiz-overlay">
          <div className="fd-quiz-modal">
            {activeQuiz.score === null ? (
              // Quiz Active State
              <>
                <div className="fd-quiz-header">
                  <span className="fd-quiz-title">{activeQuiz.testName} Specialization Assessment</span>
                  <span className="fd-quiz-progress">Question {activeQuiz.curIndex + 1} of {activeQuiz.questions.length}</span>
                </div>
                <div className="fd-quiz-question">
                  {activeQuiz.questions[activeQuiz.curIndex]?.q}
                </div>
                <div className="fd-quiz-options">
                  {activeQuiz.questions[activeQuiz.curIndex]?.options.map((opt, oIdx) => (
                    <button key={oIdx} onClick={() => handleSelectQuizOption(oIdx)}
                      className={`fd-quiz-option ${activeQuiz.answers[activeQuiz.curIndex] === oIdx ? 'selected' : ''}`}>
                      {oIdx + 1}. {opt}
                    </button>
                  ))}
                </div>
                <div className="fd-quiz-footer">
                  <div className="fd-quiz-timer">
                    ⏱️ Time remaining: 14m 20s
                  </div>
                  <button className="fd-btn-quiz-next" onClick={handleNextQuiz}>
                    {activeQuiz.curIndex === activeQuiz.questions.length - 1 ? 'Finish Test' : 'Next Question'}
                  </button>
                </div>
              </>
            ) : (
              // Quiz Complete Results State
              <div className="fd-quiz-result-screen">
                <div className="fd-quiz-result-icon">
                  {activeQuiz.score >= 2 ? '🎉' : '❌'}
                </div>
                <div className="fd-quiz-result-score">
                  Score: {Math.round((activeQuiz.score / activeQuiz.questions.length) * 100)}%
                </div>
                <div className={`fd-quiz-result-status ${activeQuiz.score >= 2 ? 'pass' : 'fail'}`}>
                  {activeQuiz.score >= 2 ? 'Assessment Passed!' : 'Assessment Failed'}
                </div>
                <p className="fd-quiz-result-desc">
                  {activeQuiz.score >= 2
                    ? `Excellent! You successfully demonstrated your competence in ${activeQuiz.testName}. The certified badge is now linked to your freelancer profile.`
                    : `You got ${activeQuiz.score} out of ${activeQuiz.questions.length} correct. To receive verification credentials, you need at least 2 correct answers. Review the course material and try again later!`
                  }
                </p>
                <button className="fd-btn-quiz-done" onClick={() => setActiveQuiz({ ...activeQuiz, open: false })}>
                  Finish Assessment
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Proposal with Video Detailed Modal ── */}
      {selectedProposalDetails && (
        <div className="fd-quiz-overlay" onClick={() => setSelectedProposalDetails(null)}>
          <div className="fd-quiz-modal" onClick={(e) => e.stopPropagation()} style={{ width: 500 }}>
            {/* Header */}
            <div className="fd-pv-header" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <button className="fd-pv-back-btn" onClick={() => setSelectedProposalDetails(null)}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
              <div className="fd-pv-title" style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Proposal with Video</div>
            </div>

            <div className="fd-pv-container">
              {/* Job Container */}
              <div className="fd-pv-field">
                <label className="fd-pv-label">Job</label>
                <div className="fd-pv-input-box">{selectedProposalDetails.job}</div>
              </div>

              {/* Cover Letter */}
              <div className="fd-pv-field">
                <label className="fd-pv-label">Cover Letter</label>
                <div className="fd-pv-cover-letter-preview">
                  {selectedProposalDetails.coverLetter && selectedProposalDetails.coverLetter.length > 80 && !viewMoreCoverLetter
                    ? `${selectedProposalDetails.coverLetter.slice(0, 80)}...`
                    : selectedProposalDetails.coverLetter || 'No cover letter provided.'
                  }
                  {selectedProposalDetails.coverLetter && selectedProposalDetails.coverLetter.length > 80 && (
                    <div style={{ display: 'flex' }}>
                      <button className="fd-pv-view-more" onClick={() => setViewMoreCoverLetter(!viewMoreCoverLetter)}>
                        {viewMoreCoverLetter ? 'View less' : 'View Cover Letter'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Proposal Video Player */}
              <div className="fd-pv-field">
                <label className="fd-pv-label">Proposal Video</label>
                <div className="fd-pv-video-wrapper">
                  <video
                    className="fd-pv-video"
                    controls
                    preload="metadata"
                    src="https://assets.mixkit.co/videos/preview/mixkit-man-holding-a-video-call-with-a-laptop-42263-large.mp4"
                    poster="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400"
                  />
                </div>
              </div>

              {/* Attachments */}
              <div className="fd-pv-field">
                <label className="fd-pv-label">Attachments</label>
                <div className="fd-pv-attachments">
                  {selectedProposalDetails.attachments && selectedProposalDetails.attachments.length > 0 ? (
                    selectedProposalDetails.attachments.map((url, i) => {
                      const filename = url.split('/').pop() || `Attachment_${i + 1}`;
                      return (
                        <a key={i} href={url} target="_blank" rel="noreferrer" className="fd-pv-attachment-chip" style={{ textDecoration: 'none' }}>
                          <Icon name="file" size={14} />
                          <span>{filename}</span>
                        </a>
                      );
                    })
                  ) : (
                    <>
                      <div className="fd-pv-attachment-chip">
                        <Icon name="file" size={14} />
                        <span>resume.pdf (2.4 MB)</span>
                      </div>
                      <div className="fd-pv-attachment-chip">
                        <Icon name="file" size={14} />
                        <span>portfolio.pdf (3.1 MB)</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Edit Proposal Action */}
              <button className="fd-pv-btn-edit" onClick={() => {
                setSelectedJob({
                  _id: selectedProposalDetails.jobId,
                  title: selectedProposalDetails.job,
                  description: selectedProposalDetails.coverLetter
                });
                setSelectedProposalDetails(null);
              }}>
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginRight: 4 }}>
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                Edit Proposal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Meeting Summary Modal ── */}
      {meetingSummaryJob && (
        <div className="fd-quiz-overlay" onClick={() => setMeetingSummaryJob(null)}>
          <div className="fd-quiz-modal" onClick={(e) => e.stopPropagation()} style={{ width: 550, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Client Call Meeting Summary</h3>
                <span style={{ fontSize: 12, color: '#64748b' }}>Project: {meetingSummaryJob.title}</span>
              </div>
              <button onClick={() => setMeetingSummaryJob(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <Icon name="x" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Paste notes input */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 6 }}>Paste Raw Bullet Points / Call Notes</label>
                <textarea
                  rows={4}
                  placeholder={`e.g.\n- Client wants the background color updated\n- Integrate Job Match Score widget\n- Deadline set for Thursday call`}
                  value={meetingBulletPoints}
                  onChange={(e) => setMeetingBulletPoints(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical' }}
                />
              </div>

              {/* Generate button */}
              <button
                onClick={handleGenerateMeetingSummary}
                disabled={generatingSummary}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '10px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                {generatingSummary ? 'Processing notes...' : '✨ Generate Summary & Next Steps'}
              </button>

              {/* Outputs */}
              {editedSummaryText && (
                <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 }}>

                  {/* Summary */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Generated Summary</label>
                    <textarea
                      rows={4}
                      value={editedSummaryText}
                      onChange={(e) => setEditedSummaryText(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, background: '#fff' }}
                    />
                  </div>

                  {/* Next Steps / Checklist */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Next Steps / Action Items</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {generatedNextSteps.map((step, idx) => (
                        <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input
                            type="checkbox"
                            checked={step.checked}
                            onChange={(e) => {
                              const updated = [...generatedNextSteps];
                              updated[idx].checked = e.target.checked;
                              setGeneratedNextSteps(updated);
                            }}
                            style={{ width: 16, height: 16, cursor: 'pointer' }}
                          />
                          <input
                            type="text"
                            value={step.text}
                            onChange={(e) => {
                              const updated = [...generatedNextSteps];
                              updated[idx].text = e.target.value;
                              setGeneratedNextSteps(updated);
                            }}
                            style={{ flex: 1, padding: '4px 8px', border: '1px solid transparent', background: 'transparent', fontSize: 13, color: step.checked ? '#94a3b8' : '#334155', textDecoration: step.checked ? 'line-through' : 'none' }}
                          />
                          <button
                            onClick={() => setGeneratedNextSteps(prev => prev.filter(s => s.id !== step.id))}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                          >
                            <Icon name="x" size={12} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => setGeneratedNextSteps(prev => [...prev, { id: Math.random().toString(), text: 'New task...', checked: false }])}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#2563eb', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0, marginTop: 4 }}
                      >
                        + Add Action Item
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                    <button
                      onClick={() => {
                        toast.success('Meeting Summary shared with client successfully!');
                        setMeetingSummaryJob(null);
                      }}
                      style={{ padding: '9px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                    >
                      Share with Client
                    </button>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Milestones & Payments Detailed Modal ── */}
      {selectedJobMilestones && (
        <div className="fd-quiz-overlay" onClick={() => setSelectedJobMilestones(null)}>
          <div className="fd-quiz-modal" onClick={(e) => e.stopPropagation()} style={{ width: 500 }}>
            {/* Header */}
            <div className="fd-ms-header" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <button className="fd-ms-back-btn" onClick={() => setSelectedJobMilestones(null)}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
              <div className="fd-ms-title" style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Milestones & Payments</div>
            </div>

            <div className="fd-ms-container">
              {/* Summary Row */}
              <div className="fd-ms-summary-row">
                <div className="fd-ms-summary-card">
                  <span className="fd-ms-summary-label">Total Project Amount</span>
                  <span className="fd-ms-summary-val">₹{Number(selectedJobMilestones.budget || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="fd-ms-summary-card">
                  <span className="fd-ms-summary-label">Escrow Amount</span>
                  <span className="fd-ms-summary-val">₹{Number(selectedJobMilestones.budget || 0).toLocaleString('en-IN')}</span>
                  <span className="fd-ms-summary-badge">In Escrow</span>
                </div>
              </div>

              {/* Milestones List */}
              <div className="fd-ms-list">
                {/* Milestone 1 */}
                <div className="fd-ms-item">
                  <div className="fd-ms-left-part">
                    <div className="fd-ms-indicator completed">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div className="fd-ms-info">
                      <span className="fd-ms-index">Milestone 1</span>
                      <span className="fd-ms-name">Requirements & Planning</span>
                    </div>
                  </div>
                  <div className="fd-ms-right-part">
                    <span className="fd-ms-amount">₹{Math.round((selectedJobMilestones.budget || 0) * 0.15).toLocaleString('en-IN')}</span>
                    <span className="fd-ms-status-badge completed">Completed</span>
                    <span className="fd-ms-action-lbl paid">Paid</span>
                  </div>
                </div>

                {/* Milestone 2 */}
                <div className="fd-ms-item">
                  <div className="fd-ms-left-part">
                    <div className={`fd-ms-indicator ${milestone2Released ? 'completed' : 'approved'}`}>
                      {milestone2Released ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      )}
                    </div>
                    <div className="fd-ms-info">
                      <span className="fd-ms-index">Milestone 2</span>
                      <span className="fd-ms-name">UI/UX Design</span>
                    </div>
                  </div>
                  <div className="fd-ms-right-part">
                    <span className="fd-ms-amount">₹{Math.round((selectedJobMilestones.budget || 0) * 0.30).toLocaleString('en-IN')}</span>
                    <span className={`fd-ms-status-badge ${milestone2Released ? 'completed' : 'approved'}`}>
                      {milestone2Released ? 'Completed' : 'Approved'}
                    </span>
                    {milestone2Released ? (
                      <span className="fd-ms-action-lbl paid">Paid</span>
                    ) : (
                      <button className="fd-ms-action-btn" onClick={() => {
                        setMilestone2Released(true);
                        toast.success(`Payment of ₹${Math.round((selectedJobMilestones.budget || 0) * 0.30).toLocaleString('en-IN')} released to your balance!`);
                      }}>
                        Release Payment
                      </button>
                    )}
                  </div>
                </div>

                {/* Milestone 3 */}
                <div className="fd-ms-item">
                  <div className="fd-ms-left-part">
                    <div className="fd-ms-indicator in-progress">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    </div>
                    <div className="fd-ms-info">
                      <span className="fd-ms-index">Milestone 3</span>
                      <span className="fd-ms-name">Backend Development</span>
                    </div>
                  </div>
                  <div className="fd-ms-right-part">
                    <span className="fd-ms-amount">₹{Math.round((selectedJobMilestones.budget || 0) * 0.40).toLocaleString('en-IN')}</span>
                    <span className="fd-ms-status-badge in-progress">In Progress</span>
                    <span className="fd-ms-action-lbl">Pending</span>
                  </div>
                </div>

                {/* Milestone 4 */}
                <div className="fd-ms-item">
                  <div className="fd-ms-left-part">
                    <div className="fd-ms-indicator pending">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    </div>
                    <div className="fd-ms-info">
                      <span className="fd-ms-index">Milestone 4</span>
                      <span className="fd-ms-name">Testing & Deployment</span>
                    </div>
                  </div>
                  <div className="fd-ms-right-part">
                    <span className="fd-ms-amount">₹{Math.round((selectedJobMilestones.budget || 0) * 0.15).toLocaleString('en-IN')}</span>
                    <span className="fd-ms-status-badge pending">Pending</span>
                    <span className="fd-ms-action-lbl">Pending</span>
                  </div>
                </div>
              </div>

              {/* Secure Footer Notice */}
              <div className="fd-ms-footer" style={{ marginTop: 14 }}>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 15l-4-4 1.41-1.41L10 13.17l6.59-6.59L18 8l-8 8z" />
                </svg>
                <span>Payments are secured with Milestone Escrow</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedClientReputation && (
        <div className="fd-quiz-overlay" onClick={() => setSelectedClientReputation(null)}>
          <div className="fd-quiz-modal" onClick={(e) => e.stopPropagation()} style={{ width: 450, padding: 20 }}>
            {/* Header */}
            <div className="fd-cr-header">
              <button className="fd-cr-back-btn" onClick={() => setSelectedClientReputation(null)}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
              <span className="fd-cr-title">Client Reputation</span>
            </div>

            <div className="fd-cr-container" style={{ marginTop: 14 }}>
              {/* Profile Box */}
              <div className="fd-cr-profile-box">
                <div className="fd-cr-identity">
                  <div className="fd-cr-avatar">{selectedClientReputation.initial}</div>
                  <div className="fd-cr-name-box">
                    <span className="fd-cr-name">{selectedClientReputation.name}</span>
                    <span className="fd-cr-submeta">Business • India</span>
                  </div>
                </div>

                <div className="fd-cr-stars-row">
                  <span>★ {selectedClientReputation.rating}</span>
                  <span className="fd-cr-stars-meta">({selectedClientReputation.reviews})</span>
                </div>

                <div className="fd-cr-member-since">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Member since Jan 2026</span>
                </div>
              </div>

              {/* Scores Grid */}
              <div className="fd-cr-scores-row">
                <div className="fd-cr-score-card">
                  <span className="fd-cr-score-lbl">Payment Speed</span>
                  <span className="fd-cr-score-val">{selectedClientReputation.paymentSpeed}</span>
                  <span className="fd-cr-score-eval">—</span>
                </div>
                <div className="fd-cr-scores-row" style={{ display: 'contents' }}>
                  <div className="fd-cr-score-card">
                    <span className="fd-cr-score-lbl">Communication</span>
                    <span className="fd-cr-score-val">{selectedClientReputation.communication}</span>
                    <span className="fd-cr-score-eval">—</span>
                  </div>
                  <div className="fd-cr-score-card">
                    <span className="fd-cr-score-lbl">Job Success</span>
                    <span className="fd-cr-score-val">{selectedClientReputation.jobSuccess}</span>
                    <span className="fd-cr-score-eval">—</span>
                  </div>
                </div>
              </div>

              {/* Overview Counts */}
              <div className="fd-cr-overview-box">
                <h3 className="fd-cr-overview-title">Overview</h3>
                <div className="fd-cr-stats-row">
                  <div className="fd-cr-stat-item">
                    <span className="fd-cr-stat-lbl">Projects Posted</span>
                    <span className="fd-cr-stat-val">{selectedClientReputation.posted}</span>
                  </div>
                  <div className="fd-cr-stat-item">
                    <span className="fd-cr-stat-lbl">Hire Rate</span>
                    <span className="fd-cr-stat-val">{selectedClientReputation.hireRate}</span>
                  </div>
                  <div className="fd-cr-stat-item">
                    <span className="fd-cr-stat-lbl">Total Spent</span>
                    <span className="fd-cr-stat-val">₹{selectedClientReputation.totalSpent.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Recent Reviews */}
              <div className="fd-cr-reviews-box">
                <h3 className="fd-cr-reviews-title">Recent Reviews</h3>
                <div className="fd-cr-empty-reviews">
                  No review records found for this client.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {invoiceModal.open && (
        <div className="fd-quiz-overlay" onClick={() => setInvoiceModal({ open: false, job: null })}>
          <div className="fd-quiz-modal" onClick={(e) => e.stopPropagation()} style={{ width: 500, padding: 24 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #f1f5f9', paddingBottom: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>GST Tax Invoice</div>
                <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4 }}>Invoice: GST-2026-{Math.floor(1000 + Math.random() * 9000)}</div>
              </div>
              <button onClick={() => setInvoiceModal({ open: false, job: null })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {/* Parties */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#475569', marginBottom: 16 }}>
              <div>
                <strong style={{ color: '#0f172a' }}>Billed By:</strong>
                <div style={{ marginTop: 2 }}>{user?.firstName} {user?.lastName}</div>
                <div>India</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ color: '#0f172a' }}>Billed To:</strong>
                <div style={{ marginTop: 2 }}>{invoiceModal.job?.client?.firstName ? `${invoiceModal.job.client.firstName} ${invoiceModal.job.client.lastName}` : 'ABC Company'}</div>
                <div>India</div>
              </div>
            </div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, marginBottom: 16 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ textAlign: 'left', padding: '8px', color: '#475569' }}>Item Description</th>
                  <th style={{ textAlign: 'right', padding: '8px', color: '#475569' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 8px', fontWeight: 600 }}>{invoiceModal.job?.title}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700 }}>₹{(invoiceModal.job?.budget || 0).toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 8px', color: '#64748b' }}>Subtotal</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600 }}>₹{(invoiceModal.job?.budget || 0).toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 8px', color: '#64748b' }}>CGST (9%)</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right' }}>₹{Math.round((invoiceModal.job?.budget || 0) * 0.09).toLocaleString('en-IN')}</td>
                </tr>
                <tr style={{ borderBottom: '1.5px solid #cbd5e1' }}>
                  <td style={{ padding: '6px 8px', color: '#64748b' }}>SGST (9%)</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right' }}>₹{Math.round((invoiceModal.job?.budget || 0) * 0.09).toLocaleString('en-IN')}</td>
                </tr>
                <tr style={{ fontSize: 14, fontWeight: 800 }}>
                  <td style={{ padding: '10px 8px', color: '#0f172a' }}>Total Amount Paid</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', color: '#10b981' }}>₹{Math.round((invoiceModal.job?.budget || 0) * 1.18).toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setInvoiceModal({ open: false, job: null })} style={{ padding: '8px 16px', border: isDarkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid #cbd5e1', borderRadius: 8, background: isDarkMode ? '#071422' : '#fff', fontSize: 13, color: isDarkMode ? '#dbeafe' : '#475569', cursor: 'pointer' }}>Close</button>
              <button onClick={() => { toast.success('Invoice document PDF downloaded! 📥'); setInvoiceModal({ open: false, job: null }); }} style={{ padding: '8px 18px', border: 'none', borderRadius: 8, background: '#10b981', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Download Invoice</button>
            </div>
          </div>
        </div>
      )}

      {/* Help & Support Modal Center */}
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
                style={{ width: '100%', padding: '10px 12px 10px 36px', border: isDarkMode ? '1.5px solid rgba(255,255,255,0.04)' : '1.5px solid #cbd5e1', borderRadius: 8, fontSize: 13, background: isDarkMode ? '#071622' : '#f8fafc', outline: 'none', color: isDarkMode ? '#e6eef8' : '#0f172a' }}
              />
            </div>

            {/* FAQs Accordion */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.03em' }}>Frequently Asked Questions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto', paddingRight: 4 }}>
                {[
                  { q: "How does the milestone escrow system work?", a: "When you start a contract, the client deposits the milestone funds into the secure Escrow account. Once you complete the milestone work, you request release, and the client approves to release the payment directly to you. This guarantees you get paid for your work." },
                  { q: "How do I write an effective project proposal?", a: "A great proposal is customized to the client's problem. Detail your technical approach, explain your relevant experience, attach clear portfolio screens, and include a clear introductory explanation or video." },
                  { q: "How do I switch between Client and Freelancer accounts?", a: "You can click on your avatar icon in the top right header taskbar, and click 'Switch to Client' or 'Switch to Freelancer' to immediately switch your account role and experience dynamically." },
                  { q: "What should I do if a client asks to pay outside the platform?", a: "Paying outside the platform violates our Terms of Service and voids all milestone escrow protections. Always keep payments within the platform. If a client insists on off-platform payments, please file a Trust & Safety ticket immediately." }
                ]
                  .filter(faq => !helpSearch || faq.q.toLowerCase().includes(helpSearch.toLowerCase()) || faq.a.toLowerCase().includes(helpSearch.toLowerCase()))
                  .map((faq, idx) => (
                    <div key={idx} style={{ border: isDarkMode ? '1px solid rgba(255,255,255,0.03)' : '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                      <button
                        onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                        style={{ width: '100%', padding: '10px 14px', background: isDarkMode ? '#071622' : '#f8fafc', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', fontWeight: 600, fontSize: 13, color: isDarkMode ? '#e6eef8' : '#334155', cursor: 'pointer' }}
                      >
                        {faq.q}
                        <span style={{ fontSize: 10, color: '#94a3b8', transform: activeFaq === idx ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                      </button>
                      {activeFaq === idx && (
                        <div style={{ padding: '10px 14px', fontSize: 12.5, color: isDarkMode ? '#cbd5e1' : '#64748b', background: isDarkMode ? '#071422' : '#fff', borderTop: isDarkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid #e2e8f0', lineHeight: 1.5 }}>
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
                    style={{ padding: '8px 10px', border: isDarkMode ? '1.5px solid rgba(255,255,255,0.04)' : '1.5px solid #cbd5e1', borderRadius: 8, fontSize: 13, outline: 'none', color: isDarkMode ? '#e6eef8' : '#0f172a', background: isDarkMode ? '#071622' : '#fff' }}
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
                    style={{ padding: '10px 12px', border: isDarkMode ? '1.5px solid rgba(255,255,255,0.04)' : '1.5px solid #cbd5e1', borderRadius: 8, fontSize: 13, resize: 'vertical', outline: 'none', color: isDarkMode ? '#e6eef8' : '#0f172a', background: isDarkMode ? '#071622' : '#fff' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                  <button
                    onClick={() => setHelpModalOpen(false)}
                    style={{ padding: '8px 16px', border: isDarkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid #cbd5e1', borderRadius: 8, background: isDarkMode ? '#071422' : '#fff', fontSize: 13, color: isDarkMode ? '#dbeafe' : '#475569', cursor: 'pointer' }}
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
                      setSupportTicket({ subject: 'General Inquiry', message: '' });
                      setHelpModalOpen(false);
                    }}
                    disabled={submittingTicket}
                    style={{ padding: '8px 18px', border: 'none', borderRadius: 8, background: '#7c3aed', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: submittingTicket ? 0.7 : 1 }}
                  >
                    {submittingTicket ? 'Submitting…' : 'Submit Ticket'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS animations helper */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        button { cursor: pointer; }
      `}</style>
    </div>
  );
};

export default FreelancerDashboard;
