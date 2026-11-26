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

const getServiceIcon = (name, accent) => {
  const svgStyle = { width: 22, height: 22, stroke: accent, fill: 'none', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  
  switch (name) {
    // ── Web Development ──
    case 'Website Development':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case 'Landing Pages':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      );
    case 'Portfolio Website':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case 'E-Commerce Website':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      );
    case 'Business Website':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    case 'SaaS Dashboard':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case 'CMS Website':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case 'API Development':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
          <line x1="6" y1="10" x2="6" y2="14" />
          <line x1="18" y1="10" x2="18" y2="14" />
        </svg>
      );

    // ── App Development ──
    case 'Android Apps':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <path d="M12 2v4M4.93 4.93l2.83 2.83M19.07 4.93l-2.83 2.83M12 8a6 6 0 0 1 6 6v8H6v-8a6 6 0 0 1 6-6z" />
        </svg>
      );
    case 'iOS Apps':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <rect x="5" y="2" width="14" height="20" rx="4" />
          <circle cx="12" cy="18" r="1.5" />
        </svg>
      );
    case 'Flutter Development':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <path d="M12 2L2 12h5l10-10H12zM22 12L12 22h5l5-5V12z" />
        </svg>
      );
    case 'React Native Apps':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <ellipse cx="12" cy="12" rx="4" ry="11" transform="rotate(30 12 12)" />
          <ellipse cx="12" cy="12" rx="4" ry="11" transform="rotate(90 12 12)" />
          <ellipse cx="12" cy="12" rx="4" ry="11" transform="rotate(150 12 12)" />
          <circle cx="12" cy="12" r="1.5" />
        </svg>
      );
    case 'Hybrid Apps':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <rect x="2" y="4" width="14" height="16" rx="2" />
          <rect x="12" y="8" width="10" height="12" rx="2" />
        </svg>
      );
    case 'App Store Submission':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <path d="M12 2v14M12 2l-4 4M12 2l4 4M4 20h16v2H4z" />
        </svg>
      );

    // ── AI & ML ──
    case 'Chatbots':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <path d="M12 6V2M9 22h6" />
          <circle cx="8" cy="12" r="1.5" />
          <circle cx="16" cy="12" r="1.5" />
        </svg>
      );
    case 'Recommendation Systems':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <path d="M12 2L2 22h20L12 2z" />
          <circle cx="12" cy="13" r="2.5" />
        </svg>
      );
    case 'LLM Apps':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="3" />
          <circle cx="5" cy="12" r="3" />
          <circle cx="19" cy="12" r="3" />
          <circle cx="12" cy="19" r="3" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="7.12" y1="10.12" x2="16.88" y2="13.88" />
        </svg>
      );
    case 'NLP':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 10h8M8 14h6" />
        </svg>
      );
    case 'Vision AI':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case 'Model Fine-tuning':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      );

    // ── Graphic Design ──
    case 'Logo':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case 'Branding':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
    case 'Banner':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="7" cy="11" r="1.5" />
          <polyline points="2 15 12 9 22 15" />
        </svg>
      );
    case 'Poster':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
    case 'Social Media':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01" />
        </svg>
      );
    case 'Illustration':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <path d="M12 19l7-7 3 3-7 7-3-3z" />
          <path d="M19 12L8.5 1.5 1 9l10.5 10.5L19 12z" />
        </svg>
      );
    case 'Packaging':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <polyline points="21 8 21 21 3 21 3 8" />
          <rect x="1" y="3" width="22" height="5" />
        </svg>
      );

    // ── Content Writing ──
    case 'Blogs':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case 'SEO Articles':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <circle cx="11.5" cy="13.5" r="2.5" />
          <line x1="16" y1="18" x2="13.3" y2="15.3" />
        </svg>
      );
    case 'Technical Writing':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case 'Copywriting':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <path d="M12 19c-1.12 0-2.68-.44-3.58-1.34L5 14.34a2.69 2.69 0 0 1 0-3.8l3.42-3.42C9.32 6.22 10.88 6 12 6h2v13h-2z" />
          <path d="M17 9l4-2v10l-4-2" />
        </svg>
      );
    case 'Ghost Writing':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
          <line x1="16" y1="8" x2="2" y2="22" />
        </svg>
      );

    // ── Video Editing ──
    case 'YouTube Editing':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          <polygon points="6 9 11 12 6 15 6 9" />
        </svg>
      );
    case 'Shorts':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <rect x="5" y="2" width="14" height="20" rx="3" />
          <polygon points="10 9 15 12 10 15 10 9" />
        </svg>
      );
    case 'Reels':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
          <line x1="7" y1="2" x2="7" y2="22" />
          <line x1="17" y1="2" x2="17" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
        </svg>
      );
    case 'Motion Graphics':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
          <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
        </svg>
      );
    case 'VFX':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <path d="M18 2l4 4M2 18l16-16M18 22l4-4M15 15l-3-3" />
          <circle cx="6" cy="6" r="2" />
        </svg>
      );

    // ── Digital Marketing ──
    case 'SEO':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <path d="M11 8v6M8 11h6" />
        </svg>
      );
    case 'SEM':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
    case 'Google Ads':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      );
    case 'Facebook Ads':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 17v-5h3v-3c0-3 1.5-4 4.5-4h2.5v3h-1.5c-1 0-1.5.5-1.5 1.5v2.5h3l-.5 3h-2.5v5H9z" />
        </svg>
      );
    case 'Instagram Marketing':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
    case 'Email Marketing':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      );

    // ── UI/UX ──
    case 'Wireframes':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
        </svg>
      );
    case 'Figma':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <path d="M12 2a3 3 0 0 0-3 3v3h3V5a3 3 0 0 0-3-3zM9 8a3 3 0 0 0-3 3v3h3v-3a3 3 0 0 0-3-3zM15 8a3 3 0 0 0 3-3V2h-3v3a3 3 0 0 0 3 3z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case 'Prototype':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <circle cx="5" cy="5" r="3" />
          <circle cx="19" cy="5" r="3" />
          <circle cx="12" cy="19" r="3" />
          <line x1="5" y1="8" x2="12" y2="16" />
          <line x1="19" y1="8" x2="12" y2="16" />
        </svg>
      );
    case 'Design System':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      );
    case 'Mobile App Design':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <rect x="5" y="2" width="14" height="20" rx="3" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      );

    // ── Cloud ──
    case 'AWS':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case 'Azure':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
        </svg>
      );
    case 'Google Cloud':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <polygon points="12 2 22 7.5 22 16.5 12 22 2 16.5 2 7.5" />
        </svg>
      );
    case 'Docker':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <rect x="3" y="10" width="8" height="6" />
          <rect x="13" y="10" width="8" height="6" />
          <rect x="8" y="4" width="8" height="6" />
        </svg>
      );
    case 'Kubernetes':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="2" x2="12" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
        </svg>
      );
    case 'DevOps':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <path d="M12 12c-2-2.67-4.5-4-7.5-4a6 6 0 1 0 0 12c3 0 5.5-1.33 7.5-4 2 2.67 4.5 4 7.5 4a6 6 0 1 0 0-12c-3 0-5.5 1.33-7.5 4z" />
        </svg>
      );

    // ── Cyber Security ──
    case 'Pen Testing':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case 'SOC':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
          <circle cx="12" cy="14" r="2" />
        </svg>
      );
    case 'Malware Analysis':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <path d="M12 2v20M17 5H7M19 12H5M17 19H7" />
        </svg>
      );
    case 'Network Security':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case 'Ethical Hacking':
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      );

    default:
      return (
        <svg {...svgStyle} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
  }
};

const CategoryLandingPage = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [activeFaq, setActiveFaq] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [activeDocModal, setActiveDocModal] = useState(null);
  
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
              <div style={{ width: 44, height: 44, borderRadius: 10, background: accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, border: `1px solid ${accent}1b`, boxShadow: `0 4px 12px ${accent}15` }}>
                {getServiceIcon(service, accent)}
              </div>
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
      <footer id="contact" style={{ padding: '60px 8% 40px', background: '#0B0F19', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, marginBottom: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>FM</div>
              <span style={{ fontSize: 16, fontWeight: 800 }}>FreelanceMarket</span>
            </div>
            <p style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.6 }}>AI-powered hiring marketplace protecting contracts with secure milestone escrows.</p>
          </div>
          <div>
            <h4 style={{ fontSize: 13, textTransform: 'uppercase', color: '#64748B', fontWeight: 700, marginBottom: 16 }}>Company</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#94A3B8' }}>
              <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>About Us</span>
              <span style={{ cursor: 'pointer' }} onClick={() => toast.success('Join our remote-first team! Email your CV to careers@freelancemarket.com', { icon: '💼' })}>Careers</span>
              <span style={{ cursor: 'pointer' }} onClick={() => setActiveDocModal('privacy')}>Privacy Policy</span>
              <span style={{ cursor: 'pointer' }} onClick={() => setActiveDocModal('terms')}>Terms of Service</span>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: 13, textTransform: 'uppercase', color: '#64748B', fontWeight: 700, marginBottom: 16 }}>Resources</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#94A3B8' }}>
              <span style={{ cursor: 'pointer' }} onClick={() => toast('Our engineering & design blog is coming soon!', { icon: '✍️' })}>Blog</span>
              <span style={{ cursor: 'pointer' }} onClick={() => {
                const contactEl = document.getElementById('contact');
                if (contactEl) {
                  contactEl.scrollIntoView({ behavior: 'smooth' });
                }
              }}>Contact Support</span>
              <span style={{ cursor: 'pointer' }} onClick={() => toast.success('All systems fully operational. (Uptime: 100%)', { icon: '🟢' })}>System Status</span>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: 13, textTransform: 'uppercase', color: '#64748B', fontWeight: 700, marginBottom: 16 }}>Contact</h4>
            <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>
              <a href="mailto:support@freelancemarket.com" style={{ color: 'inherit', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = 'inherit'}>support@freelancemarket.com</a> <br />
              <a href="https://maps.google.com/?q=New+Delhi,+India" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = 'inherit'}>New Delhi, India</a>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: 20, textAlign: 'center', fontSize: 12, color: '#64748B' }}>
          © {new Date().getFullYear()} FreelanceMarket. All rights reserved.
        </div>
      </footer>

      {activeDocModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 32, width: '90%', maxWidth: 500, position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <button onClick={() => setActiveDocModal(null)} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', color: '#64748B', fontSize: 18, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = '#64748B'}>✕</button>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, color: '#fff' }}>
              {activeDocModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
            </h3>
            <p style={{ fontSize: 13.5, color: '#94A3B8', lineHeight: 1.6, whiteSpace: 'pre-line', margin: '0 0 24px' }}>
              {activeDocModal === 'privacy' 
                ? 'We value your trust. All personal details, project details, and communication files are fully SSL encrypted.\n\nPayment tokens and transactional balances are managed directly by secure, PCI-compliant payment gateways (Razorpay and Stripe) without caching raw card info on our local servers.'
                : 'By registering on FreelanceMarket, you agree to: \n\n• Maintain clean and professional communication.\n• Secure all client-freelancer contracts using our built-in Escrow Milestone payments system.\n• Avoid payment circumvention outside the platform logs.'
              }
            </p>
            <button onClick={() => setActiveDocModal(null)} style={{ width: '100%', padding: '12px 0', background: accent, border: 'none', borderRadius: 10, color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}

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
