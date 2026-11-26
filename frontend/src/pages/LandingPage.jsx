import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// ── Auto-Suggestions Master Dataset ──────────────────────────────────────────
const ALL_SUGGESTIONS = [
  // Top Skills & Roles
  { title: 'Java Developer', type: 'Skill & Role', category: 'Backend Development', icon: '☕', sub: 'Spring Boot, Microservices, Enterprise Java' },
  { title: 'Web Designer', type: 'Skill & Role', category: 'Web Development', icon: '🎨', sub: 'UI/UX Design, Figma, Responsive Web' },
  { title: 'AI/ML Developer', type: 'Skill & Role', category: 'AI & Machine Learning', icon: '🧠', sub: 'Python, TensorFlow, PyTorch, LLMs' },
  { title: 'Content Writer', type: 'Skill & Role', category: 'Content Writing', icon: '✍️', sub: 'SEO Articles, Copywriting, Blogs' },
  { title: 'Mobile App Developer', type: 'Skill & Role', category: 'Mobile Apps', icon: '📱', sub: 'Flutter, React Native, iOS & Android' },
  { title: 'React.js Developer', type: 'Skill', category: 'Web Development', icon: '⚛️', sub: 'Front-end Architecture, Next.js, Redux' },
  { title: 'Full Stack Engineer', type: 'Skill & Role', category: 'Web Development', icon: '💻', sub: 'Node.js, React, MongoDB, PostgreSQL' },
  { title: 'Graphic Designer', type: 'Skill', category: 'Graphic Design', icon: '🖌️', sub: 'Logos, Branding, Photoshop, Illustrator' },
  { title: 'Digital Marketer', type: 'Skill', category: 'Digital Marketing', icon: '📈', sub: 'SEO, Google Ads, Social Media Marketing' },
  { title: 'Cybersecurity Expert', type: 'Skill', category: 'IT & Security', icon: '🛡️', sub: 'Penetration Testing, Audits, Network Security' },
  { title: 'Cloud DevOps Architect', type: 'Skill', category: 'Web Development', icon: '☁️', sub: 'AWS, Docker, Kubernetes, CI/CD' },
  { title: 'Video Editor & Animator', type: 'Skill', category: 'Media & Video', icon: '🎬', sub: 'Premiere Pro, After Effects, Motion Graphics' },

  // Categories
  { title: 'Web Development', type: 'Category', category: 'Web Development', icon: '🌐', sub: '12,400+ Vouched Web Developers & Projects' },
  { title: 'Mobile Apps', type: 'Category', category: 'Mobile Apps', icon: '📲', sub: '8,200+ Vouched App Developers & Projects' },
  { title: 'AI & Machine Learning', type: 'Category', category: 'AI & Machine Learning', icon: '🤖', sub: '5,100+ AI Specialists & Data Scientists' },
  { title: 'Graphic Design', type: 'Category', category: 'Graphic Design', icon: '🖼️', sub: '9,800+ Creative Designers & Brand Experts' },
  { title: 'Content Writing', type: 'Category', category: 'Content Writing', icon: '📝', sub: '6,400+ Copywriters & Content Strategists' },
  { title: 'Digital Marketing', type: 'Category', category: 'Digital Marketing', icon: '🚀', sub: '4,900+ Growth Hackers & Marketers' },
];

// ── SVG Icon Helper ──────────────────────────────────────────────────────────
const Icon = ({ name, size = 20, color = 'currentColor' }) => {
  const icons = {
    search: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    check: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
    shield: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    lock: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    award: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
    users: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    code: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
    mobile: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
    brain: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z"/></svg>,
    palette: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.21-.64-1.67-.38-.43-.6-.98-.6-1.57 0-1.24 1.01-2.26 2.26-2.26H18c2.21 0 4-1.79 4-4 0-4.42-4.03-8-10-8z"/></svg>,
    edit: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    chart: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    cloud: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M18 10h-1.26A8 8 0 1 0 3 16.3"/><path d="M16 16l-4-4-4 4"/><line x1="12" y1="12" x2="12" y2="21"/></svg>,
    lockShield: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="12" r="3"/></svg>,
    arrowRight: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    star: <svg width={size} height={size} fill="#f59e0b" stroke="#f59e0b" strokeWidth="1" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    bookmark: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
    message: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    briefcase: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
    file: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>,
    mail: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg>
  };
  return icons[name] || null;
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [howItWorksTab, setHowItWorksTab] = useState('clients'); // 'clients' | 'freelancers'
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  // Click outside & Escape key listeners to close suggestions popup
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Compute live filtered suggestions
  const filteredSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return ALL_SUGGESTIONS.slice(0, 6);
    }
    return ALL_SUGGESTIONS.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.sub.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [searchQuery]);

  const handleSelectSuggestion = (item) => {
    setSearchQuery(item.title);
    if (['Web Development', 'Mobile Apps', 'AI & Machine Learning', 'Graphic Design', 'Content Writing', 'Digital Marketing'].includes(item.category)) {
      setSelectedCategory(item.category);
    }
    setShowSuggestions(false);
    toast.success(`Selected suggestion: "${item.title}"`, { icon: '✨' });
    if (isAuthenticated) {
      navigate(user?.role === 'freelancer' ? '/freelancer/dashboard' : '/dashboard');
    } else {
      navigate('/login');
    }
  };

  // ── Dynamic Font Injection ──
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, []);

  const handleNavAction = (target) => {
    if (target === 'find-freelancers') {
      if (isAuthenticated) navigate(user?.role === 'client' ? '/dashboard' : '/freelancer/dashboard');
      else navigate('/login');
    } else if (target === 'find-jobs') {
      if (isAuthenticated) navigate(user?.role === 'freelancer' ? '/freelancer/dashboard' : '/dashboard');
      else navigate('/login');
    } else if (target === 'register-freelancer') {
      navigate('/register', { state: { role: 'freelancer' } });
    } else if (target === 'register-client') {
      navigate('/register', { state: { role: 'client' } });
    } else {
      navigate('/login');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Please enter a skill, service, or keyword to search!');
      return;
    }
    toast.success(`Searching for "${searchQuery}" in ${selectedCategory}...`, { icon: '🔍' });
    if (isAuthenticated) {
      navigate(user?.role === 'freelancer' ? '/freelancer/dashboard' : '/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast.error('Please enter a valid email address!');
      return;
    }
    toast.success('Thank you for subscribing to FreelanceHub newsletter!', { icon: '🎉' });
    setNewsletterEmail('');
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{
      fontFamily: "'DM Sans', system-ui, sans-serif",
      color: '#0f172a',
      background: '#ffffff',
      minHeight: '100vh',
      lineHeight: 1.5,
      overflowX: 'hidden'
    }}>
      {/* Dynamic Font Styling & Cyan Primary Token */}
      <style>{`
        :root {
          --primary-cyan: #06b6d4;
          --primary-cyan-hover: #0891b2;
          --primary-blue: #2563eb;
          --bg-light: #f8fafc;
          --text-heading: #0f172a;
          --text-muted: #64748b;
          --border-color: #e2e8f0;
        }
        .fh-heading { fontFamily: 'Outfit', system-ui, sans-serif; }
        .fh-btn-cyan {
          background: linear-gradient(135deg, #06b6d4 0%, #0284c7 100%);
          color: #ffffff;
          border: none;
          font-weight: 600;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(6, 182, 212, 0.25);
        }
        .fh-btn-cyan:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(6, 182, 212, 0.35);
        }
        .fh-btn-outline {
          background: #ffffff;
          color: #0284c7;
          border: 1.5px solid #06b6d4;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        .fh-btn-outline:hover {
          background: #ecfeff;
          border-color: #0891b2;
        }
        .fh-card-hover {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .fh-card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px -5px rgba(6, 182, 212, 0.12);
          border-color: #a5f3fc;
        }
        .fh-glow-bg {
          background: radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.08) 0%, rgba(255, 255, 255, 0) 70%);
        }
      `}</style>

      {/* ── 1. HEADER / NAVBAR ───────────────────────────────────────────── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e2e8f0',
        padding: '14px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: 1400,
        margin: '0 auto'
      }}>
        {/* Brand Logo */}
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 800,
            fontSize: 16,
            boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)'
          }}>
            F
          </div>
          <span className="fh-heading" style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Freelance<span style={{ color: '#06b6d4' }}>Hub</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <span onClick={() => navigate('/')} style={{ fontSize: 14.5, fontWeight: 600, color: '#06b6d4', cursor: 'pointer' }}>Home</span>
          <span onClick={() => handleNavAction('find-freelancers')} style={{ fontSize: 14.5, fontWeight: 500, color: '#475569', cursor: 'pointer' }}>Find Freelancers</span>
          <span onClick={() => handleNavAction('find-jobs')} style={{ fontSize: 14.5, fontWeight: 500, color: '#475569', cursor: 'pointer' }}>Find Jobs</span>
          <span onClick={() => scrollToSection('categories')} style={{ fontSize: 14.5, fontWeight: 500, color: '#475569', cursor: 'pointer' }}>Categories</span>
          <span onClick={() => scrollToSection('how-it-works')} style={{ fontSize: 14.5, fontWeight: 500, color: '#475569', cursor: 'pointer' }}>How It Works</span>
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button 
            onClick={() => scrollToSection('search-bar')} 
            style={{ background: '#f1f5f9', border: 'none', width: 38, height: 38, borderRadius: '50%', display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#475569' }}
            title="Search"
          >
            <Icon name="search" size={18} />
          </button>

          {isAuthenticated ? (
            <button 
              className="fh-btn-cyan" 
              onClick={() => navigate(user?.role === 'freelancer' ? '/freelancer/dashboard' : '/dashboard')}
              style={{ padding: '9px 20px', borderRadius: 8, fontSize: 14 }}
            >
              Go to Dashboard →
            </button>
          ) : (
            <>
              <button 
                onClick={() => navigate('/login')}
                style={{ background: 'none', border: 'none', color: '#0f172a', fontWeight: 600, fontSize: 14, cursor: 'pointer', padding: '8px 12px' }}
              >
                Login
              </button>
              <button 
                className="fh-btn-cyan" 
                onClick={() => navigate('/register')}
                style={{ padding: '9px 22px', borderRadius: 8, fontSize: 14 }}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </header>

      {/* ── 2. HERO SECTION ──────────────────────────────────────────────── */}
      <section className="fh-glow-bg" style={{ padding: '60px 40px 80px', maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 40, alignItems: 'center' }}>
          
          {/* Hero Left Content */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#ecfeff', border: '1px solid #a5f3fc', padding: '6px 14px', borderRadius: 99, fontSize: 12.5, fontWeight: 700, color: '#0891b2', marginBottom: 20 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4', display: 'inline-block' }} />
              India's #1 Next-Gen Freelance Marketplace
            </div>

            <h1 className="fh-heading" style={{ fontSize: 50, fontWeight: 800, color: '#0f172a', lineHeight: 1.15, marginBottom: 18, letterSpacing: '-0.02em' }}>
              Find the Right Talent. <br />
              Build Something <span style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Great.</span>
            </h1>

            <p style={{ fontSize: 16.5, color: '#64748b', lineHeight: 1.6, marginBottom: 32, maxWidth: 540 }}>
              Connect with skilled freelancers, hire vetted professionals, and get your projects completed faster with transparent AI matching and escrow protection.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
              <button 
                className="fh-btn-cyan" 
                onClick={() => handleNavAction('register-client')}
                style={{ padding: '14px 28px', borderRadius: 10, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}
              >
                Find a Freelancer <Icon name="arrowRight" size={18} color="#fff" />
              </button>
              <button 
                className="fh-btn-outline" 
                onClick={() => handleNavAction('register-freelancer')}
                style={{ padding: '14px 28px', borderRadius: 10, fontSize: 15 }}
              >
                Start Freelancing
              </button>
            </div>

            {/* 4 Trust Highlights / Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, borderTop: '1px solid #e2e8f0', paddingTop: 24 }}>
              {[
                { icon: 'shield', label: 'Verified', sub: 'Professionals' },
                { icon: 'lock', label: 'Secure', sub: 'Payments' },
                { icon: 'award', label: 'Quality', sub: 'Work' },
                { icon: 'users', label: 'Flexible', sub: 'Hiring' },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: '#ecfeff', color: '#06b6d4', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Icon name={item.icon} size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{item.label}</div>
                    <div style={{ fontSize: 11.5, color: '#64748b' }}>{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Right Visual Card Mockup */}
          <div style={{ position: 'relative' }}>
            <div style={{
              background: '#ffffff',
              borderRadius: 20,
              border: '1px solid #e2e8f0',
              boxShadow: '0 20px 40px -10px rgba(6, 182, 212, 0.15)',
              padding: 24,
              position: 'relative',
              zIndex: 2
            }}>
              {/* Card Header Preview */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 16 }}>
                    RS
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Rahul Sharma</div>
                    <div style={{ fontSize: 12.5, color: '#64748b' }}>Full Stack Engineer • ★ 4.9 (124)</div>
                  </div>
                </div>
                <span style={{ background: '#ecfeff', color: '#0891b2', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 99 }}>
                  🛡️ Peer-Vouched
                </span>
              </div>

              {/* Progress & Milestone Preview */}
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 16, border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
                  <span>SaaS Platform Development</span>
                  <span style={{ color: '#06b6d4' }}>85% Completed</span>
                </div>
                <div style={{ height: 8, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: '85%', height: '100%', background: 'linear-gradient(90deg, #06b6d4 0%, #2563eb 100%)', borderRadius: 99 }} />
                </div>
              </div>

              {/* Live Proposal Coach Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: 10 }}>
                <span style={{ fontSize: 18 }}>🤖</span>
                <div style={{ fontSize: 12, color: '#15803d', fontWeight: 600 }}>
                  AI Proposal Match: 96% fit • Budget reality check verified
                </div>
              </div>
            </div>

            {/* Floating Stat Pill 1 */}
            <div style={{
              position: 'absolute',
              top: -15,
              right: -15,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              padding: '10px 16px',
              borderRadius: 12,
              boxShadow: '0 10px 20px rgba(0,0,0,0.06)',
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <span style={{ fontSize: 20 }}>💼</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>12,400+</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Active Jobs Posted</div>
              </div>
            </div>

            {/* Floating Stat Pill 2 */}
            <div style={{
              position: 'absolute',
              bottom: -20,
              left: -20,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              padding: '10px 16px',
              borderRadius: 12,
              boxShadow: '0 10px 20px rgba(0,0,0,0.06)',
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <span style={{ fontSize: 20 }}>🔒</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>100% Escrow</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Protected Payments</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 3. SEARCH BAR SECTION ────────────────────────────────────────── */}
      <section id="search-bar" style={{ background: '#f8fafc', padding: '40px 40px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          
          <div ref={searchContainerRef} style={{ position: 'relative' }}>
            <form onSubmit={handleSearchSubmit} style={{
              display: 'flex',
              alignItems: 'center',
              background: '#ffffff',
              border: showSuggestions ? '2px solid #06b6d4' : '2px solid #06b6d4',
              borderRadius: showSuggestions ? '14px 14px 4px 4px' : 14,
              padding: '6px 8px 6px 16px',
              boxShadow: showSuggestions ? '0 12px 30px -5px rgba(6, 182, 212, 0.25)' : '0 8px 25px -5px rgba(6, 182, 212, 0.15)',
              gap: 12,
              transition: 'all 0.2s ease'
            }}>
              <Icon name="search" size={20} color="#06b6d4" />
              <input
                type="text"
                placeholder="Search for skills, services or freelancers..."
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: 15,
                  color: '#0f172a',
                  background: 'transparent'
                }}
              />

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  border: 'none',
                  borderLeft: '1px solid #e2e8f0',
                  paddingLeft: 12,
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: '#475569',
                  outline: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  height: 36
                }}
              >
                <option>All Categories</option>
                <option>Web Development</option>
                <option>Mobile Apps</option>
                <option>AI & Machine Learning</option>
                <option>Graphic Design</option>
                <option>Content Writing</option>
                <option>Digital Marketing</option>
              </select>

              <button
                type="submit"
                className="fh-btn-cyan"
                style={{ padding: '12px 28px', borderRadius: 10, fontSize: 14.5, flexShrink: 0 }}
              >
                Search
              </button>
            </form>

            {/* Floating Auto-Suggestions Dropdown Popup */}
            {showSuggestions && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                right: 0,
                background: '#ffffff',
                borderRadius: 14,
                border: '1.5px solid #06b6d4',
                boxShadow: '0 20px 40px -10px rgba(6, 182, 212, 0.25), 0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
                maxHeight: 380,
                overflowY: 'auto',
                padding: '10px 0'
              }}>
                {/* Header bar inside suggestions */}
                <div style={{ padding: '6px 18px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0891b2', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{searchQuery.trim() ? '🔍 Live Search Suggestions' : '🔥 Popular & Trending Suggestions'}</span>
                  </span>
                  <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                    {filteredSuggestions.length} result{filteredSuggestions.length !== 1 ? 's' : ''} found
                  </span>
                </div>

                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectSuggestion(item)}
                      style={{
                        padding: '10px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        borderLeft: '3px solid transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ecfeff';
                        e.currentTarget.style.borderLeftColor = '#06b6d4';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderLeftColor = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{item.icon}</span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>{item.title}</span>
                            <span style={{
                              fontSize: 10.5,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 99,
                              background: item.type === 'Category' ? '#e0f2fe' : item.type === 'Skill' ? '#ecfeff' : '#f0fdf4',
                              color: item.type === 'Category' ? '#0369a1' : item.type === 'Skill' ? '#0891b2' : '#15803d'
                            }}>
                              {item.type}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{item.sub}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#06b6d4', fontSize: 12, fontWeight: 600 }}>
                        <span>Select</span>
                        <Icon name="arrowRight" size={14} color="#06b6d4" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '24px 18px', textAlign: 'center', color: '#64748b', fontSize: 13.5 }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>🔍</div>
                    No exact match found for "<strong>{searchQuery}</strong>".
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                      Press <strong>Search</strong> button or hit Enter to search all freelancers & jobs.
                    </div>
                  </div>
                )}

                {/* Footer info bar */}
                <div style={{ padding: '8px 18px 4px', borderTop: '1px solid #f1f5f9', marginTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
                  <span>Tip: Type any skill like "Java", "Web", "AI", "React", or "Design"</span>
                  <span>Press Esc to close</span>
                </div>
              </div>
            )}
          </div>

          {/* Popular Searches Tags */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, flexWrap: 'wrap', fontSize: 13 }}>
            <span style={{ fontWeight: 600, color: '#64748b' }}>Popular Searches:</span>
            {['Java Developer', 'Web Designer', 'AI/ML Developer', 'Content Writer', 'Mobile App Developer'].map((tag, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSearchQuery(tag);
                  handleSelectSuggestion({ title: tag, category: 'All Categories' });
                }}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: 99,
                  padding: '4px 12px',
                  fontSize: 12.5,
                  color: '#0284c7',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#06b6d4';
                  e.currentTarget.style.background = '#ecfeff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.background = '#ffffff';
                }}
              >
                {tag}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* ── 4. POPULAR CATEGORIES ────────────────────────────────────────── */}
      <section id="categories" style={{ padding: '70px 40px', maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
          <div>
            <h2 className="fh-heading" style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Popular Categories
            </h2>
            <p style={{ fontSize: 14.5, color: '#64748b', margin: '6px 0 0' }}>
              Explore top talents across specialized technical & creative domains
            </p>
          </div>
          <button 
            onClick={() => handleNavAction('find-freelancers')}
            style={{ background: 'none', border: 'none', color: '#06b6d4', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            View All Categories <Icon name="arrowRight" size={16} color="#06b6d4" />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {[
            { icon: 'code', title: 'Web Development', count: '3,450+ Freelancers' },
            { icon: 'mobile', title: 'App Development', count: '2,850+ Freelancers' },
            { icon: 'brain', title: 'AI & Machine Learning', count: '1,250+ Freelancers' },
            { icon: 'palette', title: 'Graphic Design', count: '2,130+ Freelancers' },
            { icon: 'edit', title: 'Content Writing', count: '3,120+ Freelancers' },
            { icon: 'chart', title: 'Digital Marketing', count: '2,220+ Freelancers' },
            { icon: 'cloud', title: 'Cloud & DevOps', count: '1,620+ Freelancers' },
            { icon: 'lockShield', title: 'Cyber Security', count: '1,150+ Freelancers' },
          ].map((cat, idx) => (
            <div 
              key={idx}
              className="fh-card-hover"
              onClick={() => handleNavAction('find-freelancers')}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 16,
                padding: 24,
                cursor: 'pointer'
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ecfeff', color: '#06b6d4', display: 'grid', placeItems: 'center', marginBottom: 16 }}>
                <Icon name={cat.icon} size={22} />
              </div>
              <h3 className="fh-heading" style={{ fontSize: 16.5, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
                {cat.title}
              </h3>
              <p style={{ fontSize: 12.5, color: '#64748b', margin: '0 0 16px' }}>{cat.count}</p>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#06b6d4', display: 'flex', alignItems: 'center', gap: 4 }}>
                Explore <Icon name="arrowRight" size={14} color="#06b6d4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. HOW IT WORKS ──────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ background: '#f8fafc', padding: '70px 40px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', textAlign: 'center' }}>
          
          <h2 className="fh-heading" style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
            How It Works
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', margin: '0 0 30px' }}>
            Simple, transparent 4-step workflow designed for speed and reliability
          </p>

          {/* Toggle Switch */}
          <div style={{ display: 'inline-flex', background: '#e2e8f0', borderRadius: 99, padding: 4, marginBottom: 50 }}>
            <button
              onClick={() => setHowItWorksTab('clients')}
              style={{
                padding: '9px 24px',
                borderRadius: 99,
                border: 'none',
                background: howItWorksTab === 'clients' ? '#06b6d4' : 'transparent',
                color: howItWorksTab === 'clients' ? '#ffffff' : '#475569',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              👥 For Clients
            </button>
            <button
              onClick={() => setHowItWorksTab('freelancers')}
              style={{
                padding: '9px 24px',
                borderRadius: 99,
                border: 'none',
                background: howItWorksTab === 'freelancers' ? '#06b6d4' : 'transparent',
                color: howItWorksTab === 'freelancers' ? '#ffffff' : '#475569',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              💼 For Freelancers
            </button>
          </div>

          {/* 4 Steps Grid Flow */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, textAlign: 'left', position: 'relative' }}>
            {(howItWorksTab === 'clients' ? [
              { num: '01', title: 'Post a Project', desc: 'Share your project details, budget and requirements with live reality check.' },
              { num: '02', title: 'Find Talent', desc: 'Browse profiles or let AI match and unseal batched fair proposals.' },
              { num: '03', title: 'Hire & Discuss', desc: 'Hire the best match, lock escrow deposit and collaborate cleanly.' },
              { num: '04', title: 'Get Work Done', desc: 'Track progress on WIP timeline and approve milestone payouts safely.' },
            ] : [
              { num: '01', title: 'Create Profile', desc: 'Showcase your skills, portfolio, rates and claim peer-vouched badges.' },
              { num: '02', title: 'Browse Jobs', desc: 'Explore matching projects and get AI proposal coaching recommendations.' },
              { num: '03', title: 'Submit Proposal', desc: 'Send compelling bids with delivery estimates and transparent split rates.' },
              { num: '04', title: 'Get Paid Safely', desc: 'Complete milestones, post progress updates and receive instant payouts.' },
            ]).map((step, idx) => (
              <div key={idx} style={{ background: '#ffffff', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', position: 'relative' }}>
                <div style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: '#06b6d4',
                  background: '#ecfeff',
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  display: 'grid',
                  placeItems: 'center',
                  marginBottom: 16
                }}>
                  {step.num}
                </div>
                <h3 className="fh-heading" style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 6. WHY CHOOSE OUR PLATFORM ────────────────────────────────────── */}
      <section style={{ padding: '70px 40px', maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <h2 className="fh-heading" style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
            Why Choose Our Platform?
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', margin: 0 }}>
            Built specifically to address real marketplace friction with unmatched trust & transparency
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {[
            { icon: 'shield', title: 'Verified Professionals', desc: 'Peer-vouched skill badges and verified work samples guarantee top talent.' },
            { icon: 'lock', title: 'Secure Payments', desc: 'Milestone-locked escrow and no-ghost deposits protect both sides.' },
            { icon: 'message', title: 'Direct Communication', desc: 'Built-in real-time chat, file sharing, and video calling.' },
            { icon: 'star', title: 'Reviews & Ratings', desc: 'Transparent two-way reviews with right of reply rebuttal windows.' },
          ].map((feat, idx) => (
            <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, textAlign: 'left' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ecfeff', color: '#06b6d4', display: 'grid', placeItems: 'center', marginBottom: 16 }}>
                <Icon name={feat.icon} size={22} />
              </div>
              <h3 className="fh-heading" style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                {feat.title}
              </h3>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. FEATURED SECTION (FREELANCERS & JOBS) ──────────────────────── */}
      <section style={{ background: '#f8fafc', padding: '70px 40px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
            
            {/* Left Column: Featured Freelancers */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 className="fh-heading" style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Featured Freelancers
                </h2>
                <button onClick={() => handleNavAction('find-freelancers')} style={{ background: 'none', border: 'none', color: '#06b6d4', fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>
                  View All Freelancers →
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { name: 'Rahul Sharma', role: 'Full Stack Developer', rating: '4.9', reviews: 124, success: '98%', skills: ['React', 'Node.js', 'MongoDB'], rate: '₹1,200 / hr' },
                  { name: 'Priya Verma', role: 'UI/UX Designer', rating: '4.8', reviews: 96, success: '97%', skills: ['Figma', 'Adobe XD', 'UI Design'], rate: '₹900 / hr' },
                  { name: 'Amit Patel', role: 'Mobile App Developer', rating: '4.9', reviews: 88, success: '96%', skills: ['Flutter', 'Dart', 'Firebase'], rate: '₹1,100 / hr' },
                  { name: 'Neha Singh', role: 'Content Writer', rating: '4.8', reviews: 76, success: '95%', skills: ['SEO', 'Blog Writing', 'Copywriting'], rate: '₹600 / hr' },
                ].map((free, idx) => (
                  <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 14 }}>
                        {free.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{free.name}</div>
                        <div style={{ fontSize: 11.5, color: '#64748b' }}>{free.role}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, marginBottom: 12 }}>
                      <span style={{ color: '#f59e0b', fontWeight: 700 }}>★ {free.rating} ({free.reviews})</span>
                      <span style={{ color: '#64748b' }}>•</span>
                      <span style={{ color: '#06b6d4', fontWeight: 700 }}>{free.success} Success</span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
                      {free.skills.map((s, sIdx) => (
                        <span key={sIdx} style={{ background: '#f1f5f9', color: '#475569', fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 4 }}>
                          {s}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{free.rate}</span>
                      <button onClick={() => handleNavAction('find-freelancers')} style={{ background: '#ecfeff', border: 'none', color: '#0891b2', fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 6, cursor: 'pointer' }}>
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Featured Jobs */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 className="fh-heading" style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Featured Jobs
                </h2>
                <button onClick={() => handleNavAction('find-jobs')} style={{ background: 'none', border: 'none', color: '#06b6d4', fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>
                  View All Jobs →
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { title: 'Java Backend Developer', budget: '₹25,000 – ₹40,000', tags: ['Java', 'Spring Boot', 'MySQL'], type: 'Full Time' },
                  { title: 'React Developer', budget: '₹30,000 – ₹50,000', tags: ['React', 'Node.js', 'MongoDB'], type: 'Remote' },
                  { title: 'UI/UX Designer', budget: '₹15,000 – ₹25,000', tags: ['Figma', 'UI Design', 'Prototyping'], type: 'Part Time' },
                ].map((job, idx) => (
                  <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>{job.title}</h3>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#06b6d4' }}>{job.budget}</div>
                      </div>
                      <span style={{ background: '#f1f5f9', color: '#475569', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>
                        {job.type}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {job.tags.map((t, tIdx) => (
                          <span key={tIdx} style={{ background: '#ecfeff', color: '#0891b2', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6 }}>
                            {t}
                          </span>
                        ))}
                      </div>
                      <button onClick={() => handleNavAction('find-jobs')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }} title="Bookmark">
                        <Icon name="bookmark" size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 8. TESTIMONIALS ──────────────────────────────────────────────── */}
      <section style={{ padding: '70px 40px', maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
          <div>
            <h2 className="fh-heading" style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              What Our Users Say
            </h2>
            <p style={{ fontSize: 14.5, color: '#64748b', margin: '6px 0 0' }}>
              Real feedback from clients and top-rated freelancers growing on FreelanceHub
            </p>
          </div>
          <button style={{ background: 'none', border: 'none', color: '#06b6d4', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            View All Reviews →
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {[
            { name: 'Ankit Mehta', role: 'Business Owner', text: '"I found a skilled developer for my project within a few days. The platform is easy to use and very reliable."' },
            { name: 'Sneha Kapoor', role: 'Full Stack Developer', text: '"The platform helps me find relevant projects and great clients. Payments are always on time via escrow."' },
            { name: 'Vikram Malhotra', role: 'Product Manager', text: '"Guided dispute mediation and sub-hire team split features make managing large contracts effortless."' },
          ].map((t, idx) => (
            <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                {[...Array(5)].map((_, i) => <Icon key={i} name="star" size={16} />)}
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginLeft: 4 }}>5.0</span>
              </div>
              <p style={{ fontSize: 13.5, color: '#334155', fontStyle: 'italic', marginBottom: 20, lineHeight: 1.5 }}>
                {t.text}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#06b6d4', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13 }}>
                  {t.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>{t.name}</div>
                  <div style={{ fontSize: 11.5, color: '#64748b' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 9. FINAL CALL TO ACTION (CTA) ────────────────────────────────── */}
      <section style={{ padding: '0 40px 70px', maxWidth: 1300, margin: '0 auto' }}>
        <div style={{
          background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
          borderRadius: 24,
          padding: '50px 60px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          boxShadow: '0 20px 40px -10px rgba(6, 182, 212, 0.35)'
        }}>
          <div>
            <h2 className="fh-heading" style={{ fontSize: 34, fontWeight: 800, color: '#ffffff', margin: '0 0 10px', letterSpacing: '-0.01em' }}>
              Ready to Start Your Next Project?
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)', margin: '0 0 28px', maxWidth: 500 }}>
              Find talented professionals or start earning with your skills on India's premier freelance marketplace.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button 
                onClick={() => handleNavAction('register-client')}
                style={{
                  background: '#ffffff',
                  color: '#0284c7',
                  border: 'none',
                  padding: '13px 28px',
                  borderRadius: 10,
                  fontSize: 14.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
                }}
              >
                Find a Freelancer
              </button>
              <button 
                onClick={() => handleNavAction('register-freelancer')}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  border: '1.5px solid rgba(255,255,255,0.4)',
                  padding: '13px 28px',
                  borderRadius: 10,
                  fontSize: 14.5,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Start Freelancing
              </button>
            </div>
          </div>

          {/* Decorative CTA Icon Graphic */}
          <div style={{ fontSize: 80, opacity: 0.95 }}>
            🚀
          </div>
        </div>
      </section>

      {/* ── 10. FOOTER ───────────────────────────────────────────────────── */}
      <footer style={{ background: '#090d16', color: '#94a3b8', padding: '60px 40px 30px', borderTop: '1px solid #1e293b' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr repeat(4, 1fr) 1.25fr', gap: 32, marginBottom: 40 }}>
            
            {/* Logo & Tagline */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
                  color: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 800,
                  fontSize: 14
                }}>
                  F
                </div>
                <span className="fh-heading" style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }}>
                  Freelance<span style={{ color: '#06b6d4' }}>Hub</span>
                </span>
              </div>
              <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, marginBottom: 16 }}>
                Connect. Work. Grow.<br />
                The trusted platform for modern Indian freelancers and growing businesses.
              </p>
              <div style={{ display: 'flex', gap: 12, fontSize: 16 }}>
                <span>🌐</span> <span>🐦</span> <span>💼</span> <span>📸</span>
              </div>
            </div>

            {/* Links Column 1: Platform */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', marginBottom: 16 }}>Platform</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                <span onClick={() => handleNavAction('find-freelancers')} style={{ cursor: 'pointer' }}>Find Freelancers</span>
                <span onClick={() => handleNavAction('find-jobs')} style={{ cursor: 'pointer' }}>Find Jobs</span>
                <span onClick={() => scrollToSection('categories')} style={{ cursor: 'pointer' }}>Categories</span>
                <span onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>Pricing</span>
              </div>
            </div>

            {/* Links Column 2: Resources */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', marginBottom: 16 }}>Resources</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                <span onClick={() => scrollToSection('how-it-works')} style={{ cursor: 'pointer' }}>How It Works</span>
                <span onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>FAQs</span>
                <span onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>Support</span>
                <span onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>Contact Us</span>
              </div>
            </div>

            {/* Links Column 3: Company */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', marginBottom: 16 }}>Company</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                <span style={{ cursor: 'pointer' }}>About Us</span>
                <span style={{ cursor: 'pointer' }}>Blog</span>
                <span style={{ cursor: 'pointer' }}>Careers</span>
                <span style={{ cursor: 'pointer' }}>Terms & Conditions</span>
              </div>
            </div>

            {/* Links Column 4: Legal */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', marginBottom: 16 }}>Legal</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
                <span style={{ cursor: 'pointer' }}>Terms of Service</span>
                <span style={{ cursor: 'pointer' }}>Cookie Policy</span>
              </div>
            </div>

            {/* Newsletter Subscription Column */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', marginBottom: 16 }}>Stay Updated</h4>
              <p style={{ fontSize: 12.5, color: '#94a3b8', marginBottom: 12 }}>
                Subscribe to our newsletter for latest freelance trends and job alerts.
              </p>
              <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', gap: 6 }}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #334155',
                    background: '#1e293b',
                    color: '#fff',
                    fontSize: 12.5,
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  className="fh-btn-cyan"
                  style={{ padding: '8px 14px', borderRadius: 8, fontSize: 13 }}
                  title="Subscribe"
                >
                  📩
                </button>
              </form>
            </div>

          </div>

          {/* Bottom Bar Copyright */}
          <div style={{
            borderTop: '1px solid #1e293b',
            paddingTop: 24,
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            fontSize: 12.5,
            color: '#64748b'
          }}>
            <div>© 2026 FreelanceHub. All rights reserved.</div>
            <div style={{ display: 'flex', gap: 16 }}>
              <span>Privacy</span>
              <span>Terms</span>
              <span>Cookies</span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
