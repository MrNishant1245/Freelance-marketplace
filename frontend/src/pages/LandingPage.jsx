import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [activeFaq, setActiveFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Stats Counters
  const [freelancers, setFreelancers] = useState(0);
  const [projects, setProjects] = useState(0);
  const [payments, setPayments] = useState(0);
  const [successRate, setSuccessRate] = useState(0);

  // Dynamic Google Font Injection
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Stats counting animation
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

      setFreelancers(fc);
      setProjects(pc);
      setPayments(payc);
      setSuccessRate(sc);

      if (done) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

  const handleHireFreelancer = () => {
    if (isAuthenticated) {
      if (user?.role === 'client') {
        navigate('/post-job');
      } else {
        navigate('/freelancer/dashboard');
      }
    } else {
      navigate('/register?role=client');
    }
  };

  const handleBecomeFreelancer = () => {
    if (isAuthenticated) {
      if (user?.role === 'freelancer') {
        navigate('/freelancer/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/register?role=freelancer');
    }
  };

  const handleSearch = (term) => {
    if (!term) return;
    if (isAuthenticated) {
      if (user?.role === 'freelancer') {
        navigate(`/freelancer/dashboard?search=${encodeURIComponent(term)}`);
      } else {
        navigate(`/dashboard?search=${encodeURIComponent(term)}`);
      }
    } else {
      navigate(`/login?search=${encodeURIComponent(term)}`);
    }
  };

  const handleHireNow = (freelancerName) => {
    if (isAuthenticated) {
      if (user?.role === 'client') {
        navigate('/post-job', {
          state: {
            templateData: {
              title: `Specialized Project Proposal for ${freelancerName}`,
              description: `Hi ${freelancerName},\n\nWe love your profile and would like to invite you to propose on our upcoming project.\n\nPlease share your availability and feedback.\n\nBest,\n${user?.firstName || 'Client'}`
            }
          }
        });
      } else {
        toast.error('You are signed in as a Freelancer. Only clients can invite freelancers to projects.');
      }
    } else {
      navigate(`/register?role=client&invite=${encodeURIComponent(freelancerName)}`);
    }
  };

  const categories = [
    { title: 'Web Development', count: '3,450 Freelancers', price: 'Avg. ₹1,200/hr', icon: '💻', bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981' },
    { title: 'App Development', count: '2,120 Freelancers', price: 'Avg. ₹1,500/hr', icon: '📱', bg: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' },
    { title: 'AI & ML', count: '1,280 Freelancers', price: 'Avg. ₹2,500/hr', icon: '🤖', bg: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' },
    { title: 'Graphic Design', count: '1,890 Freelancers', price: 'Avg. ₹900/hr', icon: '🎨', bg: 'rgba(236, 72, 153, 0.1)', color: '#EC4899' },
    { title: 'Content Writing', count: '1,450 Freelancers', price: 'Avg. ₹700/hr', icon: '✍️', bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' },
    { title: 'Video Editing', count: '1,150 Freelancers', price: 'Avg. ₹1,100/hr', icon: '🎬', bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' },
    { title: 'Digital Marketing', count: '1,560 Freelancers', price: 'Avg. ₹800/hr', icon: '📊', bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981' },
    { title: 'UI UX', count: '1,980 Freelancers', price: 'Avg. ₹1,300/hr', icon: '📐', bg: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' },
    { title: 'Cloud', count: '940 Freelancers', price: 'Avg. ₹2,000/hr', icon: '☁️', bg: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' },
    { title: 'Cyber Security', count: '820 Freelancers', price: 'Avg. ₹2,200/hr', icon: '🔒', bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }
  ];

  const freelancersList = [
    { name: 'John Smith', role: 'React Developer', rate: '₹1200/hr', success: '98% Job Success', initial: 'JS', bg: '#10B981' },
    { name: 'Priya Sharma', role: 'UI/UX Designer', rate: '₹900/hr', success: '95% Job Success', initial: 'PS', bg: '#3B82F6' },
    { name: 'Amit Verma', role: 'AI Engineer', rate: '₹2500/hr', success: '100% Job Success', initial: 'AV', bg: '#8B5CF6' },
    { name: 'Sarah Connor', role: 'Cyber Security Analyst', rate: '₹2200/hr', success: '99% Job Success', initial: 'SC', bg: '#EF4444' },
    { name: 'David Miller', role: 'Cloud Architect', rate: '₹2000/hr', success: '97% Job Success', initial: 'DM', bg: '#F59E0B' }
  ];

  const nextFreelancer = () => {
    setCarouselIndex((prev) => (prev + 1) % (freelancersList.length - 2));
  };

  const prevFreelancer = () => {
    setCarouselIndex((prev) => (prev - 1 + (freelancersList.length - 2)) % (freelancersList.length - 2));
  };

  return (
    <div style={{ background: '#0F172A', color: '#FFFFFF', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif", overflowX: 'hidden' }}>
      
      {/* ─── NAVBAR ─── */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 8%', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18 }}>FM</div>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>FreelanceMarket</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="nav-links">
          <span className="nav-item" onClick={() => scrollToSection('categories')}>Explore</span>
          <span className="nav-item" onClick={() => scrollToSection('freelancers')}>Find Freelancers</span>
          <span className="nav-item" onClick={() => scrollToSection('projects')}>Find Jobs</span>
          <span className="nav-item" onClick={() => scrollToSection('pricing')}>Pricing</span>
          <span className="nav-item" onClick={() => scrollToSection('about')}>About</span>
          <span className="nav-item" onClick={() => scrollToSection('contact')}>Contact</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={handleSignIn} style={{ background: 'none', border: 'none', color: '#94A3B8', fontWeight: 600, fontSize: 14.5, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = '#94A3B8'}>Sign In</button>
          <button onClick={handleJoinNow} style={{ background: '#10B981', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontSize: 14.5, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 20px -6px rgba(16, 185, 129, 0.4)', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.target.style.transform = 'none'}>Join Now</button>
        </div>
      </nav>

      {/* ─── SECTION 1: HERO (100vh) ─── */}
      <section style={{ minHeight: 'calc(100vh - 80px)', padding: '60px 8%', display: 'flex', alignItems: 'center', position: 'relative' }}>
        {/* Decorative Gradients */}
        <div style={{ position: 'absolute', top: '15%', left: '5%', width: 350, height: 350, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.12)', filter: 'blur(120px)', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.12)', filter: 'blur(130px)', zIndex: 0 }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 60, width: '100%', alignItems: 'center', zIndex: 10 }}>
          {/* Hero Left Content */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '6px 16px', borderRadius: 99, fontSize: 12.5, fontWeight: 700, color: '#10B981', textTransform: 'uppercase', marginBottom: 24 }}>
              🤖 AI Talent Matching • 🔒 Escrow Protected • ⚡ Fast Hiring
            </div>
            <h1 style={{ fontSize: '3.6rem', fontWeight: 900, lineHeight: 1.15, margin: '0 0 20px', letterSpacing: '-0.03em' }}>
              Find the Perfect <br />
              <span style={{ background: 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Freelancer</span> <br />
              for Every Project.
            </h1>
            <p style={{ fontSize: 17, color: '#94A3B8', margin: '0 0 36px', lineHeight: 1.6, maxWidth: 540 }}>
              Hire pre-vetted remote talent instantly. Complete work safely under milestone escrow agreements and AI candidate fit auditing.
            </p>

            {/* Search Bar */}
            <div style={{ display: 'flex', background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 6, maxWidth: 540, marginBottom: 20, boxShadow: '0 12px 30px rgba(0,0,0,0.3)' }}>
              <input 
                type="text" 
                placeholder="Search services, skills, or job titles..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, background: 'none', border: 'none', padding: '0 18px', color: '#fff', fontSize: 15, outline: 'none' }}
              />
              <button onClick={() => handleSearch(searchQuery)} style={{ background: '#10B981', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                🔍 Search
              </button>
            </div>

            {/* Popular Searches */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>Popular Searches:</span>
              {['React', 'UI/UX', 'Python', 'AI', 'Flutter', 'Video Editing', 'Logo Design'].map((tag, i) => (
                <span 
                  key={i} 
                  onClick={() => handleSearch(tag)}
                  style={{ fontSize: 12.5, color: '#CBD5E1', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: 8, cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.04)'}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: 16, marginTop: 40 }}>
              <button onClick={handleHireFreelancer} style={{ background: '#10B981', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 22px -5px rgba(16, 185, 129, 0.4)' }}>
                Hire Freelancer
              </button>
              <button onClick={handleBecomeFreelancer} style={{ background: 'transparent', border: '1.5px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 10, padding: '14px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'border-color 0.2s' }} onMouseEnter={(e) => e.target.style.borderColor = '#10B981'} onMouseLeave={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}>
                Become Freelancer
              </button>
            </div>
          </div>

          {/* Right Side: Professional Figma-Style Collaboration Canvas Mockup */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: 460, background: 'linear-gradient(145deg, #111827 0%, #0B0F19 100%)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: 24, boxShadow: '0 25px 60px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}>
              {/* Figma Canvas header banner */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }} />
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} />
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Figma Workspace Mockup</div>
              </div>

              {/* Developer editor mockup pane */}
              <div style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12, padding: 16, fontFamily: 'monospace', fontSize: 12, color: '#38BDF8', marginBottom: 16, position: 'relative' }}>
                <div style={{ color: '#64748B', marginBottom: 8 }}>// React Component Collaboration</div>
                <div><span style={{ color: '#F472B6' }}>const</span> <span style={{ color: '#FCD34D' }}>FreelanceMarket</span> = () =&gt; &#123;</div>
                <div style={{ paddingLeft: 12 }}><span style={{ color: '#F472B6' }}>const</span> [aiMatches] = useState(true);</div>
                <div style={{ paddingLeft: 12 }}><span style={{ color: '#F472B6' }}>return</span> &lt;<span style={{ color: '#10B981' }}>EscrowProtected</span> /&gt;;</div>
                <div>&#125;;</div>
                {/* Developer cursor */}
                <div style={{ position: 'absolute', bottom: 12, right: 30, background: '#8B5CF6', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>↗</span> Dev cursor
                </div>
              </div>

              {/* Designer design card mockup pane */}
              <div style={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12, padding: 18, position: 'relative' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', marginBottom: 12 }}>UI Kit Alignment</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>F</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ width: '80%', height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, marginBottom: 6 }} />
                    <div style={{ width: '40%', height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3 }} />
                  </div>
                </div>
                {/* Designer cursor */}
                <div style={{ position: 'absolute', top: 25, right: 60, background: '#EC4899', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>↗</span> Designer
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: TRUSTED COMPANIES (Scrolling Marquee) ─── */}
      <section style={{ padding: '40px 0', background: '#0B0F19', overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.15em', textAlign: 'center', marginBottom: 24 }}>Trusted by global leaders</div>
        
        {/* Marquee track wrapper */}
        <div className="marquee-container" style={{ display: 'flex', overflow: 'hidden', width: '100%' }}>
          <div className="marquee-content" style={{ display: 'flex', gap: 60, whiteSpace: 'nowrap', minWidth: '100%', justifyContent: 'space-around', animation: 'marqueeScroll 25s linear infinite' }}>
            {['Google', 'Microsoft', 'Amazon', 'Adobe', 'Netflix', 'OpenAI', 'Spotify', 'Google', 'Microsoft', 'Amazon', 'Adobe', 'Netflix', 'OpenAI', 'Spotify'].map((company, i) => (
              <span key={i} style={{ fontSize: 20, fontWeight: 900, color: '#334155', letterSpacing: '-0.02em' }}>{company}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: STATISTICS ─── */}
      <section style={{ padding: '80px 8%', background: '#0F172A', textAlign: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {[
            { num: `${freelancers}K+`, label: 'Freelancers' },
            { num: `${projects}+`, label: 'Projects Completed' },
            { num: `₹${payments}Cr+`, label: 'Payments Protected' },
            { num: `${successRate}%`, label: 'Success Rate' }
          ].map((stat, i) => (
            <div key={i} style={{ padding: 24, background: '#111827', border: '1px solid rgba(255,255,255,0.02)', borderRadius: 16 }}>
              <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#10B981', marginBottom: 6 }}>{stat.num}</div>
              <div style={{ fontSize: 13.5, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECTION 4: POPULAR CATEGORIES ─── */}
      <section id="categories" style={{ padding: '80px 8%', background: '#0B0F19' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.02em' }}>Popular Categories</h2>
          <p style={{ color: '#94A3B8', fontSize: 15 }}>Explore talent across major technology domains</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
          {categories.map((cat, i) => (
            <div key={i} className="category-card" onClick={() => handleSearch(cat.title)} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 14, padding: 24, cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.transform = 'translateY(-4px)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'none'; }}>
              <span style={{ fontSize: 28, display: 'inline-block', marginBottom: 16, background: cat.bg, padding: 8, borderRadius: 10 }}>{cat.icon}</span>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{cat.title}</div>
              <div style={{ fontSize: 12.5, color: '#94A3B8', marginBottom: 4 }}>{cat.count}</div>
              <div style={{ fontSize: 12.5, color: cat.color, fontWeight: 700 }}>{cat.price}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECTION 5: WHY CHOOSE US ─── */}
      <section id="about" style={{ padding: '80px 8%', background: '#0F172A' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.02em' }}>Why Choose Us</h2>
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

      {/* ─── SECTION 6: HOW IT WORKS (Timeline Steps Connector) ─── */}
      <section style={{ padding: '80px 8%', background: '#0B0F19' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.02em' }}>How It Works</h2>
          <p style={{ color: '#94A3B8', fontSize: 15 }}>Simple timeline to hire the best talent</p>
        </div>
        
        {/* Timeline connection connector container */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap', position: 'relative' }}>
          {[
            { step: '1', title: 'Post Project', desc: 'Describe scope & details' },
            { step: '2', title: 'Receive Proposals', desc: 'Bids from active talent' },
            { step: '3', title: 'AI Ranking', desc: 'Instantly audited fit' },
            { step: '4', title: 'Hire Freelancer', desc: 'Award & sign contracts' },
            { step: '5', title: 'Escrow Payment', desc: 'Fund secure milestones' },
            { step: '6', title: 'Project Delivered', desc: 'Approve & release payout' }
          ].map((item, i) => (
            <div key={i} style={{ flex: 1, minWidth: 150, textAlign: 'center', position: 'relative', padding: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.08)', border: '1.5px solid #10B981', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, margin: '0 auto 16px', boxShadow: '0 0 16px rgba(16, 185, 129, 0.1)' }}>{item.step}</div>
              <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 11.5, color: '#64748B' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECTION 7: FEATURED FREELANCERS (Carousel) ─── */}
      <section id="freelancers" style={{ padding: '80px 8%', background: '#0F172A' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.02em' }}>Featured Freelancers</h2>
          <p style={{ color: '#94A3B8', fontSize: 15 }}>Top developers ready to build</p>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          {/* Previous Arrow */}
          <button onClick={prevFreelancer} style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }} onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.08)'} onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.04)'}>◀</button>
          
          {/* Carousel Wrapper */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, width: '100%', maxWidth: 1000, overflow: 'hidden' }}>
            {freelancersList.slice(carouselIndex, carouselIndex + 3).map((free, i) => (
              <div key={i} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 16, padding: 24, textAlign: 'center', transition: 'all 0.3s' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: free.bg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20, margin: '0 auto 16px', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}>{free.initial}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{free.name}</div>
                <div style={{ color: '#F59E0B', fontSize: 12, marginBottom: 12 }}>★★★★★</div>
                <div style={{ fontSize: 13.5, color: '#94A3B8', marginBottom: 4 }}>{free.role}</div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: '#10B981', marginBottom: 6 }}>{free.rate}</div>
                <div style={{ fontSize: 12.5, color: '#64748B', marginBottom: 20 }}>{free.success}</div>
                <button onClick={() => handleHireNow(free.name)} style={{ width: '100%', padding: '10px 0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.08)'} onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.04)'}>Hire Now</button>
              </div>
            ))}
          </div>

          {/* Next Arrow */}
          <button onClick={nextFreelancer} style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }} onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.08)'} onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.04)'}>▶</button>
        </div>
      </section>

      {/* ─── SECTION 8: FEATURED PROJECTS ─── */}
      <section id="projects" style={{ padding: '80px 8%', background: '#0B0F19' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.02em' }}>Featured Projects</h2>
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
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 16px', lineHeight: 1.2, letterSpacing: '-0.02em' }}>Meet Your AI Hiring Assistant</h2>
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
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.02em' }}>Testimonials</h2>
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
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.02em' }}>Platform Features</h2>
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
      <section id="pricing" style={{ padding: '80px 8%', background: '#0B0F19' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.02em' }}>Pricing Plans</h2>
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

      {/* ─── SECTION 13: FAQ (Accordion) ─── */}
      <section style={{ padding: '80px 8%', background: '#0F172A' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.02em' }}>Frequently Asked Questions</h2>
          <p style={{ color: '#94A3B8', fontSize: 15 }}>Got questions? We have answers.</p>
        </div>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { q: 'How does Escrow work?', a: 'Escrow payment safety ensures that funds are deposited securely by the client at start. Money is only transferred to the freelancer upon explicit client approval of the milestone deliverables.' },
            { q: 'How AI Ranking works?', a: 'Our built-in AI parser reads files/CVs, matches keywords to project job briefs, and generates an automated match rate compatibility score between 0% and 100%.' },
            { q: 'Can I withdraw anytime?', a: 'Yes. Freelancers can initiate withdrawals to active bank accounts immediately as soon as a milestone is approved and released by the client.' },
            { q: 'How payments work?', a: 'Payments are protected dynamically inside milestone compartments. The client pays to fund a milestone, the freelancer delivers the work, and the client releases the fund upon review.' }
          ].map((faq, i) => (
            <div key={i} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12, padding: 18, cursor: 'pointer' }} onClick={() => toggleFaq(i)}>
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
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 16px', letterSpacing: '-0.02em' }}>Ready to build your next project?</h2>
        <p style={{ fontSize: 16, color: '#94A3B8', marginBottom: 32 }}>Start hiring in less than 5 minutes.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          <button onClick={handleHireFreelancer} style={{ background: '#10B981', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 22px -5px rgba(16, 185, 129, 0.4)' }}>
            Hire Freelancer
          </button>
          <button onClick={handleBecomeFreelancer} style={{ background: 'transparent', border: '1.5px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 10, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            Become Freelancer
          </button>
        </div>
      </section>

      {/* ─── SECTION 15: FOOTER ─── */}
      <footer id="contact" style={{ padding: '60px 8% 40px', background: '#0B0F19', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
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
              <span style={{ cursor: 'pointer' }} onClick={() => scrollToSection('about')}>About Us</span>
              <span style={{ cursor: 'pointer' }}>Careers</span>
              <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
              <span style={{ cursor: 'pointer' }}>Terms of Service</span>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: 13, textTransform: 'uppercase', color: '#64748B', fontWeight: 700, marginBottom: 16 }}>Resources</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#94A3B8' }}>
              <span style={{ cursor: 'pointer' }}>Blog</span>
              <span style={{ cursor: 'pointer' }} onClick={() => scrollToSection('contact')}>Contact Support</span>
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

        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.06); }
          100% { transform: scale(1); }
        }
      `}</style>

    </div>
  );
};

export default LandingPage;
