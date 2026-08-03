import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [activeFaq, setActiveFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactive Freelancers Carousel State
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Animated Statistics State
  const [freelancerCount, setFreelancerCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const [paymentCount, setPaymentCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);

  useEffect(() => {
    let fc = 0;
    let pc = 0;
    let payc = 0;
    let sc = 0;
    const interval = setInterval(() => {
      let done = true;
      if (fc < 12) { fc += 1; done = false; }
      if (pc < 8500) { pc += 250; done = false; }
      if (payc < 25) { payc += 1; done = false; }
      if (sc < 99) { sc += 3; done = false; }
      
      setFreelancerCount(fc);
      setProjectCount(pc);
      setPaymentCount(payc);
      setSuccessCount(sc);
      
      if (done) clearInterval(interval);
    }, 35);
    return () => clearInterval(interval);
  }, []);

  const handleJoinNow = () => {
    if (isAuthenticated) {
      navigate(user?.role === 'freelancer' ? '/freelancer/dashboard' : '/dashboard');
    } else {
      navigate('/register');
    }
  };

  const handleSignIn = () => {
    if (isAuthenticated) {
      navigate(user?.role === 'freelancer' ? '/freelancer/dashboard' : '/dashboard');
    } else {
      navigate('/login');
    }
  };

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const featuredFreelancers = [
    { name: 'John Smith', rating: '★★★★★', role: 'React Developer', rate: '₹1200/hr', success: '98% Job Success', avatarBg: '#10B981' },
    { name: 'Priya Sharma', rating: '★★★★★', role: 'UI/UX Designer', rate: '₹900/hr', success: '95% Job Success', avatarBg: '#3B82F6' },
    { name: 'Amit Verma', rating: '★★★★★', role: 'AI Engineer', rate: '₹2500/hr', success: '100% Job Success', avatarBg: '#8B5CF6' },
    { name: 'Sarah Connor', rating: '★★★★★', role: 'Cyber Security Analyst', rate: '₹2200/hr', success: '99% Job Success', avatarBg: '#EF4444' },
    { name: 'David Miller', rating: '★★★★★', role: 'Cloud Architect', rate: '₹2000/hr', success: '97% Job Success', avatarBg: '#F59E0B' }
  ];

  const nextFreelancer = () => {
    setCarouselIndex((prev) => (prev + 1) % (featuredFreelancers.length - 2));
  };

  const prevFreelancer = () => {
    setCarouselIndex((prev) => (prev - 1 + (featuredFreelancers.length - 2)) % (featuredFreelancers.length - 2));
  };

  // Modern Styled SVG Icons
  const icons = {
    web: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    app: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
    ai: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
    design: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
        <path d="M12 6V12L16 14" />
      </svg>
    ),
    security: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    writing: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    video: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M23 7l-7 5 7 5V7z" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
    marketing: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    uiux: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    cloud: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
      </svg>
    )
  };

  return (
    <div style={{ background: '#0F172A', color: '#FFFFFF', minHeight: '100vh', fontFamily: "'Outfit', sans-serif", overflowX: 'hidden' }}>
      
      {/* ─── NAVBAR ─── */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 8%', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18 }}>FM</div>
          <span style={{ fontSize: 20, fontWeight: 800, tracking: '-0.03em' }}>FreelanceMarket</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="nav-links">
          <span className="nav-item" onClick={() => navigate('/login')}>Explore</span>
          <span className="nav-item" onClick={() => navigate('/login')}>Find Freelancers</span>
          <span className="nav-item" onClick={() => navigate('/login')}>Find Jobs</span>
          <span className="nav-item" onClick={() => navigate('/login')}>Pricing</span>
          <span className="nav-item" onClick={() => navigate('/login')}>About</span>
          <span className="nav-item" onClick={() => navigate('/login')}>Contact</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={handleSignIn} style={{ background: 'none', border: 'none', color: '#94A3B8', fontWeight: 600, fontSize: 14.5, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = '#94A3B8'}>Sign In</button>
          <button onClick={handleJoinNow} style={{ background: '#10B981', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontSize: 14.5, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 20px -6px rgba(16, 185, 129, 0.4)', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.target.style.transform = 'none'}>Join Now</button>
        </div>
      </nav>

      {/* ─── SECTION 1: HERO (100vh) ─── */}
      <section style={{ minHeight: 'calc(100vh - 80px)', padding: '60px 8%', display: 'flex', alignItems: 'center', position: 'relative' }}>
        {/* Glow Effects */}
        <div style={{ position: 'absolute', top: '15%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', filter: 'blur(100px)', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: 350, height: 350, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.12)', filter: 'blur(120px)', zIndex: 0 }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 60, width: '100%', alignItems: 'center', zIndex: 10 }}>
          {/* Left Text and Search */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '6px 16px', borderRadius: 99, fontSize: 12.5, fontWeight: 700, color: '#10B981', textTransform: 'uppercase', marginBottom: 24 }}>
              🤖 AI Talent Matching • 🔒 Escrow Protected • ⚡ Fast Hiring
            </div>
            <h1 style={{ fontSize: '3.6rem', fontWeight: 800, lineHeight: 1.15, margin: '0 0 20px', tracking: '-0.02em' }}>
              Find the Perfect <br />
              <span style={{ background: 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Freelancer</span> for Every Project.
            </h1>
            <p style={{ fontSize: 17, color: '#94A3B8', margin: '0 0 36px', lineHeight: 1.6, maxWidth: 540 }}>
              Hire top-tier background verified designers, engineers, and AI developers. Protect payments securely inside milestone escrows.
            </p>

            {/* Search Bar */}
            <div style={{ display: 'flex', background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 6, maxWidth: 540, marginBottom: 20, boxShadow: '0 12px 30px rgba(0,0,0,0.2)' }}>
              <input 
                type="text" 
                placeholder="Search services, skills, or job titles..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, background: 'none', border: 'none', padding: '0 18px', color: '#fff', fontSize: 15, outline: 'none' }}
              />
              <button onClick={() => navigate(`/login?search=${searchQuery}`)} style={{ background: '#10B981', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                🔍 Search
              </button>
            </div>

            {/* Popular Searches */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>Popular:</span>
              {['React', 'UI/UX', 'Python', 'AI', 'Flutter', 'Video Editing'].map((tag, i) => (
                <span 
                  key={i} 
                  onClick={() => navigate(`/login?search=${tag}`)}
                  style={{ fontSize: 12.5, color: '#CBD5E1', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: 8, cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.04)'}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Hero CTAs */}
            <div style={{ display: 'flex', gap: 16, marginTop: 40 }}>
              <button onClick={() => navigate('/register')} style={{ background: '#10B981', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 22px -5px rgba(16, 185, 129, 0.4)' }}>
                Hire Freelancer
              </button>
              <button onClick={() => navigate('/register')} style={{ background: 'transparent', border: '1.5px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 10, padding: '14px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'border-color 0.2s' }} onMouseEnter={(e) => e.target.style.borderColor = '#10B981'} onMouseLeave={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}>
                Become Freelancer
              </button>
            </div>
          </div>

          {/* Right Illustration/Mockup */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 440, height: 440, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
              {/* Header inside Mockup */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8' }}>🤖 AI Talent Auditor</span>
                <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>Match Rate 98%</span>
              </div>
              {/* Profile Card */}
              <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}>VG</div>
                  <div>
                    <div style={{ fontSize: 14.5, fontWeight: 700 }}>Vivek Gahlan</div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>React Native specialist</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                  {['React', 'TypeScript', 'Tailwind', 'Redux'].map((skill, i) => (
                    <span key={i} style={{ fontSize: 11, color: '#94A3B8', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: 4 }}>{skill}</span>
                  ))}
                </div>
              </div>
              {/* Audio/Voice verification mockup */}
              <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#94A3B8', marginBottom: 10 }}>🎙️ Verified Voice Note Resume</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: 10 }}>
                  <button style={{ width: 28, height: 28, borderRadius: '50%', background: '#10B981', border: 'none', color: '#fff', fontSize: 12 }}>▶</button>
                  <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, position: 'relative' }}>
                    <div style={{ width: '40%', height: '100%', background: '#10B981', borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 11, color: '#64748B' }}>0:12</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: TRUSTED COMPANIES ─── */}
      <section style={{ padding: '40px 8%', background: '#0B0F19', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 20 }}>Trusted by global leaders</div>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: 32, flexWrap: 'wrap', opacity: 0.65 }}>
          {['Google', 'Microsoft', 'Amazon', 'Adobe', 'Netflix', 'OpenAI', 'Spotify'].map((company, i) => (
            <span key={i} style={{ fontSize: 18, fontWeight: 800, color: '#94A3B8' }}>{company}</span>
          ))}
        </div>
      </section>

      {/* ─── SECTION 3: STATISTICS ─── */}
      <section style={{ padding: '60px 8%', background: '#0F172A', textAlign: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
          {[
            { num: `${freelancerCount}K+`, label: 'Freelancers' },
            { num: `${projectCount}+`, label: 'Projects' },
            { num: `₹${paymentCount}Cr+`, label: 'Payments' },
            { num: `${successCount}%`, label: 'Success Rate' }
          ].map((stat, i) => (
            <div key={i} style={{ padding: 20 }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10B981', marginBottom: 8, transition: 'all 0.5s ease' }}>{stat.num}</div>
              <div style={{ fontSize: 14, color: '#94A3B8', fontWeight: 600 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECTION 4: POPULAR CATEGORIES ─── */}
      <section style={{ padding: '80px 8%', background: '#0B0F19' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 10px' }}>Popular Categories</h2>
          <p style={{ color: '#94A3B8', fontSize: 15 }}>Explore talent across major technology domains</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
          {[
            { title: 'Web Development', freelancers: '3.4k freelancers', price: 'Avg. ₹1200/hr', icon: 'web' },
            { title: 'App Development', freelancers: '2.1k freelancers', price: 'Avg. ₹1500/hr', icon: 'app' },
            { title: 'AI & ML', freelancers: '1.2k freelancers', price: 'Avg. ₹2500/hr', icon: 'ai' },
            { title: 'Graphic Design', freelancers: '1.8k freelancers', price: 'Avg. ₹900/hr', icon: 'design' },
            { title: 'Content Writing', freelancers: '1.4k freelancers', price: 'Avg. ₹700/hr', icon: 'writing' },
            { title: 'Video Editing', freelancers: '1.1k freelancers', price: 'Avg. ₹1100/hr', icon: 'video' },
            { title: 'Digital Marketing', freelancers: '1.5k freelancers', price: 'Avg. ₹800/hr', icon: 'marketing' },
            { title: 'UI UX', freelancers: '1.9k freelancers', price: 'Avg. ₹1300/hr', icon: 'uiux' },
            { title: 'Cloud', freelancers: '900 freelancers', price: 'Avg. ₹2000/hr', icon: 'cloud' },
            { title: 'Cyber Security', freelancers: '800 freelancers', price: 'Avg. ₹2200/hr', icon: 'security' }
          ].map((cat, i) => (
            <div key={i} className="category-card" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 14, padding: 24, cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.transform = 'translateY(-4px)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'none'; }}>
              <span style={{ color: '#10B981', display: 'inline-block', marginBottom: 16 }}>{icons[cat.icon] || icons['web']}</span>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{cat.title}</div>
              <div style={{ fontSize: 12.5, color: '#94A3B8', marginBottom: 4 }}>{cat.freelancers}</div>
              <div style={{ fontSize: 12.5, color: '#10B981', fontWeight: 700 }}>{cat.price}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECTION 5: WHY CHOOSE US ─── */}
      <section style={{ padding: '80px 8%', background: '#0F172A' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 10px' }}>Why Choose Us</h2>
          <p style={{ color: '#94A3B8', fontSize: 15 }}>Designed for complete transparency and efficiency</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {[
            { title: 'AI Matching', desc: 'Our smart AI recommends matching freelancers instantly based on credentials.', icon: '🤖' },
            { title: 'Escrow Payments', desc: 'Your money stays protected inside secure milestone-based escrows.', icon: '🔒' },
            { title: 'Verified Professionals', desc: 'Background verified freelancers with portfolio verification audits.', icon: '✅' },
            { title: 'Secure Contracts', desc: 'Digital agreements signed dynamically for every project milestone.', icon: '📜' }
          ].map((item, i) => (
            <div key={i} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 14, padding: 24 }}>
              <span style={{ fontSize: 28, display: 'block', marginBottom: 16 }}>{item.icon}</span>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>{item.title}</div>
              <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECTION 6: HOW IT WORKS ─── */}
      <section style={{ padding: '80px 8%', background: '#0B0F19' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 10px' }}>How It Works</h2>
          <p style={{ color: '#94A3B8', fontSize: 15 }}>Simple timeline to hire the best talent</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {[
            { step: '1', title: 'Post Project' },
            { step: '2', title: 'Receive Proposals' },
            { step: '3', title: 'AI Ranking' },
            { step: '4', title: 'Hire Freelancer' },
            { step: '5', title: 'Escrow Payment' },
            { step: '6', title: 'Project Delivered' }
          ].map((item, i) => (
            <div key={i} style={{ flex: 1, minWidth: 150, textAlign: 'center', position: 'relative', padding: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', border: '1.5px solid #10B981', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, margin: '0 auto 16px' }}>{item.step}</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{item.title}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECTION 7: FEATURED FREELANCERS (Carousel) ─── */}
      <section style={{ padding: '80px 8%', background: '#0F172A' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 10px' }}>Featured Freelancers</h2>
          <p style={{ color: '#94A3B8', fontSize: 15 }}>Top developers ready to build</p>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          {/* Previous Arrow */}
          <button onClick={prevFreelancer} style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }} onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.08)'} onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.04)'}>◀</button>
          
          {/* Carousel Wrapper */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, width: '100%', maxWidth: 1000, overflow: 'hidden' }}>
            {featuredFreelancers.slice(carouselIndex, carouselIndex + 3).map((free, i) => (
              <div key={i} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 16, padding: 24, textAlign: 'center', animation: 'fadeIn 0.4s ease' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: free.avatarBg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20, margin: '0 auto 16px', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}>{free.name[0]}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{free.name}</div>
                <div style={{ color: '#F59E0B', fontSize: 12, marginBottom: 12 }}>{free.rating}</div>
                <div style={{ fontSize: 13.5, color: '#94A3B8', marginBottom: 4 }}>{free.role}</div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: '#10B981', marginBottom: 6 }}>{free.rate}</div>
                <div style={{ fontSize: 12.5, color: '#64748B', marginBottom: 20 }}>{free.success}</div>
                <button onClick={() => navigate('/login')} style={{ width: '100%', padding: '10px 0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.08)'} onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.04)'}>Hire Now</button>
              </div>
            ))}
          </div>

          {/* Next Arrow */}
          <button onClick={nextFreelancer} style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }} onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.08)'} onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.04)'}>▶</button>
        </div>
      </section>

      {/* ─── SECTION 8: FEATURED PROJECTS ─── */}
      <section style={{ padding: '80px 8%', background: '#0B0F19' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 10px' }}>Active Projects</h2>
          <p style={{ color: '#94A3B8', fontSize: 15 }}>Recent requests from clients</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {[
            { title: 'Build E-commerce Website', budget: '₹50,000', tags: ['React', 'Node', 'MongoDB'], proposals: '15 proposals' },
            { title: 'Flutter App Development', budget: '₹75,000', tags: ['Flutter', 'Firebase', 'Dart'], proposals: '8 proposals' },
            { title: 'AI Chatbot Integration', budget: '₹40,000', tags: ['OpenAI', 'Python', 'FastAPI'], proposals: '12 proposals' }
          ].map((proj, i) => (
            <div key={i} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{proj.title}</div>
                <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 16 }}>Budget: <strong style={{ color: '#10B981' }}>{proj.budget}</strong></div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                  {proj.tags.map((tag, tIdx) => (
                    <span key={tIdx} style={{ fontSize: 11.5, color: '#3B82F6', background: 'rgba(59,130,246,0.08)', padding: '3px 8px', borderRadius: 4 }}>{tag}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 14 }}>
                <span style={{ fontSize: 12, color: '#64748B' }}>{proj.proposals}</span>
                <span style={{ fontSize: 12, color: '#10B981', fontWeight: 700, cursor: 'pointer' }} onClick={() => navigate('/login')}>Apply →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECTION 9: AI FEATURES (USP) ─── */}
      <section style={{ padding: '80px 8%', background: '#0F172A', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700, color: '#8B5CF6', textTransform: 'uppercase', marginBottom: 20 }}>Our Unique Selling Proposition</div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 16px', lineHeight: 1.2 }}>Meet Your AI Hiring Assistant</h2>
            <p style={{ fontSize: 15, color: '#94A3B8', lineHeight: 1.6, marginBottom: 28 }}>
              Let our customized AI matching models read resumes, rank freelancer proposals automatically by alignment score, and speed up recruitment cycles.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { title: 'Resume Matching', desc: 'Extracts skill sets directly from portfolios.' },
                { title: 'Skill Analysis & Fit Verification', desc: 'Correlates bid letters to project requirements.' },
                { title: 'Candidate Ranking', desc: 'Generates real-time alignment scores instantly.' },
                { title: 'Project Recommendation', desc: 'Bridges active freelancers to new job posts.' }
              ].map((feature, i) => (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                  <span style={{ color: '#10B981', fontSize: 16 }}>✔</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{feature.title}</div>
                    <div style={{ fontSize: 12.5, color: '#94A3B8', marginTop: 2 }}>{feature.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {/* Floating Robot Mockup Illustration */}
            <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 440, boxShadow: '0 20px 40px rgba(0,0,0,0.15)', position: 'relative', animation: 'float 3.5s ease-in-out infinite' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 24 }}>
                <span style={{ fontSize: 36, animation: 'pulse 2s infinite' }}>🤖</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>Candidate Fit Ranking</div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>Audit finished in 1.4s</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { name: 'John Smith (React)', score: '98%', match: 'Perfect Match' },
                  { name: 'Priya Sharma (Design)', score: '91%', match: 'High Match' },
                  { name: 'Sarah Connor (Security)', score: '88%', match: 'Optimal Match' }
                ].map((item, idx) => (
                  <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>
                      <span>{item.name}</span>
                      <span style={{ color: '#10B981' }}>{item.score}</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                      <div style={{ width: item.score, height: '100%', background: '#10B981', borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 10: TESTIMONIALS ─── */}
      <section style={{ padding: '80px 8%', background: '#0B0F19' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 10px' }}>What Clients Say</h2>
          <p style={{ color: '#94A3B8', fontSize: 15 }}>Success stories from startups and developers</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {[
            { rating: '★★★★★', quote: 'Hired an amazing React developer within 2 days. The AI Resume Ranking was extremely accurate.', author: 'Google Tech Lead' },
            { rating: '★★★★★', quote: 'Escrow payment gave us complete peace of mind. Highly recommend the payment safety.', author: 'Startup Founder' }
          ].map((test, i) => (
            <div key={i} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 16, padding: 32 }}>
              <div style={{ color: '#F59E0B', fontSize: 14, marginBottom: 14 }}>{test.rating}</div>
              <p style={{ fontSize: 14.5, color: '#CBD5E1', lineHeight: 1.6, margin: '0 0 20px', fontStyle: 'italic' }}>"{test.quote}"</p>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8' }}>{test.author}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECTION 11: PLATFORM FEATURES ─── */}
      <section style={{ padding: '80px 8%', background: '#0F172A' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 10px' }}>Feature Rich Ecosystem</h2>
          <p style={{ color: '#94A3B8', fontSize: 15 }}>Everything you need for remote development collaboration</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { name: 'Live Chat', desc: 'Secure real-time messages.' },
            { name: 'Contracts', desc: 'Legally signed agreements.' },
            { name: 'Escrow Safety', desc: 'Milestone protection funds.' },
            { name: 'Milestones', desc: 'Iterative delivery trackers.' },
            { name: 'AI Ranking', desc: 'Talent match algorithms.' },
            { name: 'Invoices', desc: 'Clean receipt management.' },
            { name: 'Reports', desc: 'Work tracking charts.' },
            { name: 'Analytics', desc: 'Financial summaries.' }
          ].map((feat, i) => (
            <div key={i} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: '#10B981', marginBottom: 6 }}>✔ {feat.name}</div>
              <div style={{ fontSize: 12.5, color: '#94A3B8' }}>{feat.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECTION 12: PRICING ─── */}
      <section style={{ padding: '80px 8%', background: '#0B0F19' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 10px' }}>Simple Pricing Plans</h2>
          <p style={{ color: '#94A3B8', fontSize: 15 }}>Choose a plan that fits your business scale</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 960, margin: '0 auto' }}>
          {[
            { title: 'Client Plan', price: 'FREE', features: ['Post Unlimited Projects', 'Receive Proposals', 'Escrow Payment Protection', 'Standard Communication'] },
            { title: 'Freelancer Plan', price: 'FREE', features: ['Apply to Unlimited Jobs', 'Voice & Text Messages', 'Milestone Invoice Tracker', 'Secure Bank Withdrawals'] },
            { title: 'Premium Plan', price: '₹4,999/mo', features: ['AI Resume Ranking Assistant', 'Priority Client Support', 'Zero Proposal Audits', 'Premium Analytics Logs'] }
          ].map((plan, i) => (
            <div key={i} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 12 }}>{plan.title}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#10B981', marginBottom: 20 }}>{plan.price}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {plan.features.map((feat, fIdx) => (
                    <span key={fIdx} style={{ fontSize: 12.5, color: '#94A3B8' }}>• {feat}</span>
                  ))}
                </div>
              </div>
              <button onClick={() => navigate('/register')} style={{ width: '100%', padding: '12px 0', background: '#10B981', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, marginTop: 32, cursor: 'pointer' }}>Get Started</button>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECTION 13: FAQ ─── */}
      <section style={{ padding: '80px 8%', background: '#0F172A' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 10px' }}>Frequently Asked Questions</h2>
          <p style={{ color: '#94A3B8', fontSize: 15 }}>Got questions? We have answers.</p>
        </div>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { q: 'How does Escrow work?', a: 'Escrow payment safety ensures that funds are deposited securely by the client at start. Money is only transferred to the freelancer upon explicit client approval of the milestone deliverables.' },
            { q: 'How AI Ranking works?', a: 'Our built-in AI parser reads files/CVs, matches keywords to project job briefs, and generates an automated match rate compatibility score between 0% and 100%.' },
            { q: 'Can I withdraw anytime?', a: 'Yes. Freelancers can initiate withdrawals to active bank accounts immediately as soon as a milestone is approved and released by the client.' },
            { q: 'How payments work?', a: 'Payments are protected dynamically inside milestone compartments. The client pays to fund a milestone, the freelancer delivers the work, and the client releases the fund upon review.' }
          ].map((faq, i) => (
            <div key={i} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12, padding: 18, cursor: 'pointer', transition: 'all 0.3s ease' }} onClick={() => toggleFaq(i)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, fontSize: 14.5 }}>
                <span>{faq.q}</span>
                <span style={{ color: '#10B981', fontSize: 16 }}>{activeFaq === i ? '−' : '+'}</span>
              </div>
              <div style={{ maxHeight: activeFaq === i ? '200px' : '0px', overflow: 'hidden', transition: 'max-height 0.3s ease-in-out' }}>
                <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5, marginTop: 12, marginBottom: 0 }}>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECTION 14: CTA ─── */}
      <section style={{ padding: '100px 8%', background: 'linear-gradient(135deg, #111827 0%, #0F172A 100%)', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 16px' }}>Ready to build your next project?</h2>
        <p style={{ fontSize: 16, color: '#94A3B8', marginBottom: 32 }}>Start hiring top talent in less than 5 minutes.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          <button onClick={() => navigate('/register')} style={{ background: '#10B981', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 22px -5px rgba(16, 185, 129, 0.4)' }}>
            Hire Freelancer
          </button>
          <button onClick={() => navigate('/register')} style={{ background: 'transparent', border: '1.5px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 10, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            Become Freelancer
          </button>
        </div>
      </section>

      {/* ─── SECTION 15: FOOTER ─── */}
      <footer style={{ padding: '60px 8% 40px', background: '#0B0F19', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, marginBottom: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>FM</div>
              <span style={{ fontSize: 16, fontWeight: 800 }}>FreelanceMarket</span>
            </div>
            <p style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.6 }}>AI-powered hiring marketplace protecting contracts with secure milestone escrows.</p>
          </div>
          <div>
            <h4 style={{ fontSize: 13, textTransform: 'uppercase', color: '#64748B', fontWeight: 700, marginBottom: 16 }}>Company</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#94A3B8' }}>
              <span style={{ cursor: 'pointer' }}>About Us</span>
              <span style={{ cursor: 'pointer' }}>Careers</span>
              <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
              <span style={{ cursor: 'pointer' }}>Terms of Service</span>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: 13, textTransform: 'uppercase', color: '#64748B', fontWeight: 700, marginBottom: 16 }}>Resources</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#94A3B8' }}>
              <span style={{ cursor: 'pointer' }}>Blog</span>
              <span style={{ cursor: 'pointer' }}>Contact Support</span>
              <span style={{ cursor: 'pointer' }}>System Status</span>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: 13, textTransform: 'uppercase', color: '#64748B', fontWeight: 700, marginBottom: 16 }}>Contact</h4>
            <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>
              support@freelancemarket.com <br />
              New Delhi, India
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: 20, textAlign: 'center', fontSize: 12, color: '#64748B' }}>
          © {new Date().getFullYear()} FreelanceMarket. All rights reserved.
        </div>
      </footer>

      {/* Local Hover & Transition Styles */}
      <style>{`
        .nav-item {
          font-size: 14.5px;
          color: #94A3B8;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.2s;
        }
        .nav-item:hover {
          color: #FFFFFF;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
      `}</style>

    </div>
  );
};

export default LandingPage;
