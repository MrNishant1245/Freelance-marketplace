import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { categoryData } from '../data/categoryData';
import toast from 'react-hot-toast';

const getAccentColor = (slug) => {
  const mapping = {
    'web-development': '#10B981',
    'app-development': '#3B82F6',
    'ai-ml': '#8B5CF6',
    'graphic-design': '#EC4899',
    'content-writing': '#F59E0B',
    'video-editing': '#EF4444',
    'digital-marketing': '#10B981',
    'ui-ux': '#3B82F6',
    'cloud': '#8B5CF6',
    'cyber-security': '#EF4444'
  };
  return mapping[slug] || '#10B981';
};

const getAccentBg = (slug) => {
  const mapping = {
    'web-development': 'rgba(16, 185, 129, 0.08)',
    'app-development': 'rgba(59, 130, 246, 0.08)',
    'ai-ml': 'rgba(139, 92, 246, 0.08)',
    'graphic-design': 'rgba(236, 72, 153, 0.08)',
    'content-writing': 'rgba(245, 158, 11, 0.08)',
    'video-editing': 'rgba(239, 68, 68, 0.08)',
    'digital-marketing': 'rgba(16, 185, 129, 0.08)',
    'ui-ux': 'rgba(59, 130, 246, 0.08)',
    'cloud': 'rgba(139, 92, 246, 0.08)',
    'cyber-security': 'rgba(239, 68, 68, 0.08)'
  };
  return mapping[slug] || 'rgba(16, 185, 129, 0.08)';
};

const getServiceDetails = (serviceName) => {
  const defaults = {
    budget: '₹35,000 - ₹75,000',
    timeline: '7 - 14 Days',
    tech: 'React, Node.js, Express',
    desc: 'Custom engineered software solutions tailored to match high scalability requirements and performance standards.'
  };

  const details = {
    // Web Development
    'Website Development': {
      budget: '₹40,000 - ₹90,000',
      timeline: '10 - 20 Days',
      tech: 'React, Next.js, Node.js',
      desc: 'Complete full-stack website designed with modern standards, fully responsive layouts, SEO optimizations, and analytics integration.'
    },
    'Landing Pages': {
      budget: '₹15,000 - ₹30,000',
      timeline: '3 - 7 Days',
      tech: 'HTML5, TailwindCSS, Javascript',
      desc: 'High-converting single page websites designed to capture leads, showcase product features, and drive user registration.'
    },
    'Portfolio Website': {
      budget: '₹12,000 - ₹25,000',
      timeline: '4 - 8 Days',
      tech: 'React, Vanilla CSS, Framer Motion',
      desc: 'Stunning personal and professional portfolios to highlight project galleries, resumes, credentials, and testimonials.'
    },
    'E-Commerce Website': {
      budget: '₹60,000 - ₹1,50,000',
      timeline: '15 - 30 Days',
      tech: 'Next.js, Stripe, MongoDB',
      desc: 'Fully featured shopping portals with secure checkout channels, shopping carts, product management backends, and admin dashboards.'
    },
    'Business Website': {
      budget: '₹30,000 - ₹60,000',
      timeline: '7 - 14 Days',
      tech: 'WordPress, PHP, MySQL',
      desc: 'Corporate sites optimized to represent company profiles, client services, testimonials, and career forms.'
    },
    'SaaS Dashboard': {
      budget: '₹80,000 - ₹2,00,000',
      timeline: '20 - 45 Days',
      tech: 'React, Redux, PostgreSQL',
      desc: 'Analytical administrative user interfaces with interactive charts, security logging, role-based controls, and API integrations.'
    },
    'CMS Website': {
      budget: '₹25,000 - ₹50,000',
      timeline: '7 - 12 Days',
      tech: 'WordPress, Strapi, GraphQL',
      desc: 'Content management solutions allowing non-technical teams to instantly update blogs, case studies, and resources.'
    },
    'API Development': {
      budget: '₹30,000 - ₹70,000',
      timeline: '6 - 12 Days',
      tech: 'Node.js, Express, Swagger',
      desc: 'Secure, high-throughput REST and GraphQL backend interfaces with detailed documentation and validation layers.'
    },

    // App Development
    'Android Apps': {
      budget: '₹70,000 - ₹1,50,000',
      timeline: '15 - 35 Days',
      tech: 'Kotlin, Jetpack Compose',
      desc: 'Native Android applications compiled with modern architectural guidelines, responsive controls, and play store readiness.'
    },
    'iOS Apps': {
      budget: '₹80,000 - ₹1,80,000',
      timeline: '20 - 40 Days',
      tech: 'Swift, SwiftUI, Combine',
      desc: 'Premium native iOS layouts adhering to Apple human interface guidelines, secure keychains, and push notifications.'
    },
    'Flutter Development': {
      budget: '₹60,000 - ₹1,30,000',
      timeline: '15 - 30 Days',
      tech: 'Flutter, Dart, Provider',
      desc: 'High-performance cross-platform apps sharing a single codebase for fast time-to-market across iOS and Android systems.'
    },
    'React Native Apps': {
      budget: '₹65,000 - ₹1,40,000',
      timeline: '18 - 32 Days',
      tech: 'React Native, Redux, Expo',
      desc: 'Dynamic hybrid applications built using React syntax, enabling rapid feature parity and native performance modules.'
    },

    // AI & ML
    'Chatbots': {
      budget: '₹40,000 - ₹90,000',
      timeline: '8 - 18 Days',
      tech: 'OpenAI API, LangChain, Node.js',
      desc: 'Interactive conversation agents trained on your business datasets to handle automated customer support.'
    },
    'Recommendation Systems': {
      budget: '₹80,000 - ₹2,00,000',
      timeline: '20 - 45 Days',
      tech: 'Python, PyTorch, Pinecone',
      desc: 'Collaborative filtering and content-based recommendation algorithms to drive e-commerce sales conversions.'
    },
    'LLM Apps': {
      budget: '₹50,000 - ₹1,20,000',
      timeline: '10 - 22 Days',
      tech: 'LangChain, GPT-4, VectorDB',
      desc: 'Retrieval Augmented Generation (RAG) pipelines enabling semantic lookups across enterprise knowledge bases.'
    }
  };

  return details[serviceName] || {
    ...defaults,
    desc: `Professional quality ${serviceName} solutions custom-tailored to fit high scalability needs.`
  };
};

const CategoryLandingPage = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [activeFaq, setActiveFaq] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  
  const data = categoryData[categorySlug];
  if (!data) {
    return (
      <div style={{ background: '#0F172A', color: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 16 }}>Category Not Found</h2>
        <p style={{ color: '#94A3B8', marginBottom: 24 }}>The requested skill category does not exist or has been relocated.</p>
        <button onClick={() => navigate('/')} style={{ background: '#10B981', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 28px', fontWeight: 700, cursor: 'pointer' }}>Back to Home</button>
      </div>
    );
  }

  const accent = getAccentColor(categorySlug);
  const accentBg = getAccentBg(categorySlug);

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

  const handleSignIn = () => {
    if (isAuthenticated) {
      navigate(user?.role === 'freelancer' ? '/freelancer/dashboard' : '/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleJoinNow = () => {
    if (isAuthenticated) {
      navigate(user?.role === 'freelancer' ? '/freelancer/dashboard' : '/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div style={{ background: '#0F172A', color: '#FFFFFF', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif", overflowX: 'hidden' }}>
      
      {/* ─── NAVBAR ─── */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 8%', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18 }}>FM</div>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>FreelanceMarket</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="nav-links">
          <span style={{ fontSize: '14.5px', color: '#94A3B8', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/#categories')}>Explore</span>
          <span style={{ fontSize: '14.5px', color: '#94A3B8', fontWeight: 600, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: document.getElementById('freelancers')?.offsetTop - 80, behavior: 'smooth' })}>Freelancers</span>
          <span style={{ fontSize: '14.5px', color: '#94A3B8', fontWeight: 600, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: document.getElementById('portfolio')?.offsetTop - 80, behavior: 'smooth' })}>Projects</span>
          <span style={{ fontSize: '14.5px', color: '#94A3B8', fontWeight: 600, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: document.getElementById('pricing')?.offsetTop - 80, behavior: 'smooth' })}>Pricing</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {isAuthenticated ? (
            <>
              <span style={{ fontSize: 14, color: '#94A3B8' }}>Hi, <strong>{user?.firstName || 'User'}</strong></span>
              <button onClick={handleSignIn} style={{ background: accent, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontSize: 14.5, fontWeight: 700, cursor: 'pointer' }}>Dashboard</button>
            </>
          ) : (
            <>
              <button onClick={handleSignIn} style={{ background: 'none', border: 'none', color: '#94A3B8', fontWeight: 600, fontSize: 14.5, cursor: 'pointer' }}>Sign In</button>
              <button onClick={handleJoinNow} style={{ background: accent, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontSize: 14.5, fontWeight: 700, cursor: 'pointer', boxShadow: `0 8px 20px -6px ${accent}66` }}>Join Now</button>
            </>
          )}
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section style={{ minHeight: 'calc(80vh - 80px)', padding: '60px 8%', display: 'flex', alignItems: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 350, height: 350, borderRadius: '50%', background: `${accent}1b`, filter: 'blur(120px)', zIndex: 0 }} />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 60, width: '100%', alignItems: 'center', zIndex: 10 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: accentBg, border: `1px solid ${accent}33`, padding: '6px 16px', borderRadius: 99, fontSize: 12.5, fontWeight: 700, color: accent, marginBottom: 24 }}>
              ⭐⭐⭐⭐⭐ {data.rating} • {data.freelancerCount} • {data.projectCount}
            </div>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1.15, margin: '0 0 20px', letterSpacing: '-0.03em' }}>
              {data.heroTitle}
            </h1>
            <p style={{ fontSize: 18, color: '#94A3B8', lineHeight: 1.6, marginBottom: 36, maxWidth: 540 }}>
              {data.heroSubtitle}
            </p>
            <div style={{ display: 'flex', gap: 16 }}>
              <button onClick={handleHireFreelancer} style={{ background: accent, color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: `0 10px 22px -5px ${accent}55` }}>
                Hire Freelancer
              </button>
              <button onClick={handleBecomeFreelancer} style={{ background: 'transparent', border: '1.5px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 10, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.borderColor = accent} onMouseLeave={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}>
                Become Freelancer
              </button>
            </div>
          </div>

          {/* Hero Illustration Mockup */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: 450, background: 'linear-gradient(145deg, #111827 0%, #0B0F19 100%)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: 24, position: 'relative' }}>
              <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 16, marginBottom: 20 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} />
              </div>
              <div style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12, padding: 16, fontFamily: 'monospace', fontSize: 12, color: accent, minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ color: '#64748B' }}>// AI Talent Profiling Engine</span> <br />
                  <span style={{ color: '#FCD34D' }}>Category:</span> "{data.title}" <br />
                  <span style={{ color: '#FCD34D' }}>Verified Talents:</span> {data.freelancerCount} <br />
                  <span style={{ color: '#FCD34D' }}>Rating Index:</span> 4.93 / 5.00
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#10B981' }}>● Match Quality: 99.8%</span>
                  <span style={{ background: accent, color: '#fff', borderRadius: 4, padding: '2px 8px', fontSize: 10 }}>ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUSTED COMPANIES ─── */}
      <section style={{ padding: '40px 8%', background: '#0B0F19', borderY: '1px solid rgba(255,255,255,0.02)', textAlign: 'center' }}>
        <p style={{ color: '#64748B', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>Trusted by industry leaders worldwide</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.5, flexWrap: 'wrap', gap: 24 }}>
          {['Google', 'Amazon', 'Microsoft', 'Adobe', 'Infosys', 'Wipro'].map((comp, idx) => (
            <span key={idx} style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: '#94A3B8' }}>{comp}</span>
          ))}
        </div>
      </section>

      {/* ─── STATISTICS ─── */}
      <section style={{ padding: '80px 8%', background: '#0F172A', textAlign: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {data.statBoxes.map((stat, i) => (
            <div key={i} style={{ padding: 24, background: '#111827', border: '1px solid rgba(255,255,255,0.02)', borderRadius: 16 }}>
              <div style={{ fontSize: '2.8rem', fontWeight: 800, color: accent, marginBottom: 6 }}>{stat.num}</div>
              <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── POPULAR SKILLS ─── */}
      <section style={{ padding: '60px 8%', background: '#0B0F19', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Popular Skills in {data.title}</h3>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, maxWidth: 800, margin: '0 auto' }}>
          {data.skills.map((skill, i) => (
            <span key={i} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 20px', fontSize: 13.5, fontWeight: 600, color: '#CBD5E1' }}>
              {skill}
            </span>
          ))}
        </div>
      </section>

      {/* ─── SERVICES SECTION ─── */}
      <section style={{ padding: '80px 8%', background: '#0F172A' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.02em' }}>Services Offered</h2>
          <p style={{ color: '#94A3B8', fontSize: 15 }}>Tailored solutions for your business objectives</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {data.services.map((service, i) => (
            <div key={i} onClick={() => setSelectedService(service)} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 14, padding: 24, cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = 'translateY(-3px)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ fontSize: 24, marginBottom: 14 }}>✔</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>{service}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURED FREELANCERS ─── */}
      <section id="freelancers" style={{ padding: '80px 8%', background: '#0B0F19' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.02em' }}>Featured Freelancers</h2>
          <p style={{ color: '#94A3B8', fontSize: 15 }}>Vetted experts with proven track records</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
          {data.featuredFreelancers.map((freelancer, i) => (
            <div key={i} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: freelancer.bg || accent, color: '#fff', fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                {freelancer.initial}
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 4px', color: '#fff' }}>{freelancer.name}</h4>
              <p style={{ fontSize: 13, color: accent, fontWeight: 600, margin: '0 0 10px' }}>{freelancer.role}</p>
              <div style={{ color: '#F59E0B', fontSize: 12.5, marginBottom: 8 }}>⭐⭐⭐⭐⭐</div>
              <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 20px' }}>{freelancer.success}</p>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 20 }}>{freelancer.rate}</div>
              <button onClick={() => handleHireNow(freelancer.name)} style={{ width: '100%', padding: '10px 0', background: accent, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                Hire Now
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PORTFOLIO SHOWCASE ─── */}
      <section id="portfolio" style={{ padding: '80px 8%', background: '#0F172A' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.02em' }}>Recent Projects</h2>
          <p style={{ color: '#94A3B8', fontSize: 15 }}>Browse work delivered successfully on the platform</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
          {data.portfolio.map((proj, i) => (
            <div key={i} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 180 }}>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{proj.title}</h4>
                <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: '4px 10px', color: '#94A3B8', display: 'inline-block' }}>{proj.tech}</span>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: 16, marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B', fontSize: 12.5 }}>Budget</span>
                <span style={{ color: '#10B981', fontWeight: 700, fontSize: 14.5 }}>{proj.budget}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── WHY HIRE THROUGH US ─── */}
      <section style={{ padding: '80px 8%', background: '#0B0F19' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.02em' }}>Why Hire Through Us</h2>
          <p style={{ color: '#94A3B8', fontSize: 15 }}>Designed for complete transparency and efficiency</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {[
            { title: 'AI Talent Matching', desc: 'Our smart AI matches candidate credentials to project briefs instantly.' },
            { title: 'Verified Developers', desc: 'Pre-vetted portfolio reviews and background verification checks.' },
            { title: 'Escrow Payments', desc: 'Milestone protection funds. Freelancers are paid only on approval.' },
            { title: 'Secure Contracts', desc: 'Legally binding digital agreements signed before starting work.' },
            { title: 'Milestone Payments', desc: 'Break projects down into deliverables to scale securely.' },
            { title: '24x7 Support', desc: 'Dedicated client support lines to assist with mediation and setup.' }
          ].map((item, i) => (
            <div key={i} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 14, padding: 24 }}>
              <div style={{ color: accent, fontSize: 18, fontWeight: 800, marginBottom: 12 }}>✔ {item.title}</div>
              <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── DEVELOPMENT PROCESS ─── */}
      <section style={{ padding: '80px 8%', background: '#0F172A', textAlign: 'center' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.02em' }}>Development Process</h2>
          <p style={{ color: '#94A3B8', fontSize: 15 }}>Simple timeline to project completion</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {['Post Project', 'Receive Proposals', 'AI Ranking', 'Interview', 'Hire', 'Project Delivered'].map((step, idx) => (
            <React.Fragment key={idx}>
              <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.03)', padding: '16px 24px', borderRadius: 12 }}>
                <span style={{ fontSize: 11, color: accent, fontWeight: 700, display: 'block', textTransform: 'uppercase', marginBottom: 4 }}>Step {idx + 1}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{step}</span>
              </div>
              {idx < 5 && <span style={{ color: '#64748B', fontSize: 16 }}>➔</span>}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ─── TECHNOLOGIES ─── */}
      <section style={{ padding: '60px 8%', background: '#0B0F19' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Supported Tech Stacks</h3>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, maxWidth: 800, margin: '0 auto' }}>
          {data.technologies.map((tech, i) => (
            <span key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: '#CBD5E1' }}>
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* ─── CLIENT REVIEWS ─── */}
      <section style={{ padding: '80px 8%', background: '#0F172A' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.02em' }}>Client Reviews</h2>
          <p style={{ color: '#94A3B8', fontSize: 15 }}>Success stories in the {data.title} category</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 900, margin: '0 auto' }}>
          {data.reviews.map((rev, i) => (
            <div key={i} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 16, padding: 28 }}>
              <div style={{ color: '#F59E0B', fontSize: 12, marginBottom: 12 }}>{rev.rating}</div>
              <p style={{ fontSize: 14, color: '#CBD5E1', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 16 }}>"{rev.quote}"</p>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#94A3B8' }}>{rev.author}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" style={{ padding: '80px 8%', background: '#0B0F19' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.02em' }}>Pricing Models</h2>
          <p style={{ color: '#94A3B8', fontSize: 15 }}>Flexible options aligned to project scopes</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 900, margin: '0 auto' }}>
          {data.pricing.map((tier, i) => (
            <div key={i} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 12 }}>{tier.title}</h4>
                <div style={{ fontSize: 24, fontWeight: 800, color: accent, marginBottom: 20 }}>{tier.price}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {tier.features.map((feat, fIdx) => (
                    <span key={fIdx} style={{ fontSize: 12.5, color: '#94A3B8' }}>• {feat}</span>
                  ))}
                </div>
              </div>
              <button onClick={handleHireFreelancer} style={{ width: '100%', padding: '12px 0', background: accent, border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, marginTop: 32, cursor: 'pointer' }}>Get Started</button>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FAQ SECTION ─── */}
      <section style={{ padding: '80px 8%', background: '#0F172A' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.02em' }}>Frequently Asked Questions</h2>
          <p style={{ color: '#94A3B8', fontSize: 15 }}>Find fast answers to common category questions</p>
        </div>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data.faqs.map((faq, i) => (
            <div key={i} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12, padding: 18, cursor: 'pointer' }} onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, fontSize: 14.5 }}>
                <span>{faq.q}</span>
                <span style={{ color: accent, fontSize: 16 }}>{activeFaq === i ? '−' : '+'}</span>
              </div>
              {activeFaq === i && (
                <p style={{ color: '#94A3B8', fontSize: 13.5, lineHeight: 1.6, margin: '14px 0 0', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: 12 }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section style={{ padding: '100px 8%', background: 'linear-gradient(135deg, #111827 0%, #0F172A 100%)', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 16px', letterSpacing: '-0.02em' }}>{data.ctaTitle}</h2>
        <p style={{ fontSize: 16, color: '#94A3B8', marginBottom: 32 }}>{data.ctaSubtitle}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          <button onClick={handleHireFreelancer} style={{ background: accent, color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: `0 10px 22px -5px ${accent}55` }}>
            Hire Now
          </button>
          <button onClick={handleHireFreelancer} style={{ background: 'transparent', border: '1.5px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 10, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            Post Project
          </button>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ padding: '60px 8% 40px', background: '#0B0F19', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>FM</div>
            <span style={{ fontSize: 16, fontWeight: 800 }}>FreelanceMarket</span>
          </div>
          <span style={{ fontSize: 13, color: '#64748B' }}>AI-powered hiring marketplace protecting contracts with secure milestone escrows.</span>
        </div>
        <div style={{ textAlign: 'center', fontSize: 12, color: '#64748B' }}>
          © {new Date().getFullYear()} FreelanceMarket. All rights reserved.
        </div>
      </footer>

      {selectedService && (() => {
        const details = getServiceDetails(selectedService);
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 32, width: '90%', maxWidth: 500, position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
              <button onClick={() => setSelectedService(null)} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', color: '#64748B', fontSize: 18, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = '#64748B'}>✕</button>
              <div style={{ display: 'inline-flex', background: accentBg, border: `1px solid ${accent}33`, color: accent, padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 16 }}>Service Overview</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, color: '#fff' }}>{selectedService}</h3>
              <p style={{ fontSize: 13.5, color: '#94A3B8', lineHeight: 1.6, margin: '0 0 24px' }}>{details.desc}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, borderY: '1px solid rgba(255,255,255,0.04)', paddingY: 16, marginBottom: 24 }}>
                <div>
                  <span style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 4 }}>Est. Budget Range</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#10B981' }}>{details.budget}</span>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 4 }}>Est. Timeline</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{details.timeline}</span>
                </div>
              </div>
              <div style={{ marginBottom: 28 }}>
                <span style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 8 }}>Technologies</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {details.tech.split(', ').map((t, idx) => (
                    <span key={idx} style={{ fontSize: 11.5, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 6, padding: '4px 10px', color: '#94A3B8' }}>{t}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => {
                  setSelectedService(null);
                  if (isAuthenticated) {
                    if (user?.role === 'client') {
                      navigate('/post-job', {
                        state: {
                          templateData: {
                            title: `Looking for ${selectedService} Specialist`,
                            description: `We are seeking an expert to build a ${selectedService} custom platform.\n\nProject Scope:\n- Timeline: ${details.timeline}\n- Key Tech: ${details.tech}\n\nPlease share your portfolio.`
                          }
                        }
                      });
                    } else {
                      toast.error('Only Client accounts can post project briefs.');
                    }
                  } else {
                    navigate(`/register?role=client&service=${encodeURIComponent(selectedService)}`);
                  }
                }} style={{ flex: 1, padding: '12px 0', background: accent, border: 'none', borderRadius: 10, color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>Post Project</button>
                <button onClick={() => setSelectedService(null)} style={{ padding: '12px 20px', background: 'transparent', border: '1.5px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default CategoryLandingPage;
