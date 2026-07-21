import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileAPI, jobAPI, reviewAPI } from '../api';
import toast from 'react-hot-toast';

// ── Icons Helper ─────────────────────────────────────────────────────────────
const Icon = ({ name, size = 16 }) => {
  const icons = {
    user: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    edit: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    camera: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>,
    back: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>,
    save: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>,
    plus: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    x: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    lock: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
    image: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>,
    link: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>,
    trash: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>,
    upload: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>,
    logout: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    work: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>,
    mail: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
    phone: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
    github: <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>,
    linkedin: <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>,
    star: <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24" style={{ color: '#d97706' }}><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
  };
  return icons[name] || null;
};

const SKILLS_LIST = ['React', 'Node.js', 'Python', 'MongoDB', 'Figma', 'Vue.js', 'Angular', 'PHP', 'Laravel', 'Django', 'Flutter', 'Swift', 'AWS', 'Docker', 'TypeScript', 'Next.js', 'WordPress', 'GraphQL', 'Tailwind CSS', 'HTML', 'CSS', 'Git', 'Github', 'PostgreSQL', 'Firebase', 'REST API'];
const AVAILABILITY = ['full-time', 'part-time', 'not-available'];
const EXPERIENCE_LEVELS = ['entry', 'intermediate', 'expert'];

// ── Portfolio Add/Edit Modal ───────────────────────────────────────────────────
const PortfolioModal = ({ item, onClose, onSave, accentColor }) => {
  const [form, setForm] = useState({
    title: item?.title || '',
    description: item?.description || '',
    imageUrl: item?.imageUrl || '',
    projectUrl: item?.projectUrl || '',
    tags: item?.tags || item?.technologies || [],
  });
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await profileAPI.uploadFile(formData);
      const url = res.data?.url || res.data?.fileUrl;
      if (url) setForm(f => ({ ...f, imageUrl: url }));
      else toast.error('Upload failed');
    } catch (err) {
      toast.error('Image upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const addTag = (t) => { if (t && !form.tags.includes(t)) setForm(f => ({ ...f, tags: [...f.tags, t] })); setTagInput(''); };
  const removeTag = (t) => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }));

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required!'); return; }
    setSaving(true);
    try {
      await onSave({ ...form, technologies: form.tags }, item?._id);
      onClose();
    } catch (err) {
      toast.error('Failed to save: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={ps.overlay} onClick={onClose}>
      <div style={ps.modal} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#111' }}>{item ? 'Edit Portfolio Item' : 'Add Portfolio Item'}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#737373' }}><Icon name="x" /></button>
        </div>

        {/* Image upload */}
        <div style={{ marginBottom: 16 }}>
          <label style={ps.label}>Project Image / Screenshot</label>
          <div style={{ ...ps.imageBox, borderColor: form.imageUrl ? accentColor : '#e5e7eb' }}>
            {form.imageUrl ? (
              <div style={{ position: 'relative' }}>
                <img src={form.imageUrl} alt="preview" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8 }} />
                <button onClick={() => setForm(f => ({ ...f, imageUrl: '' }))} style={ps.imageRemove}><Icon name="x" /></button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 16px' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🖼️</div>
                <div style={{ fontSize: 13, color: '#737373', marginBottom: 12 }}>Upload a project screenshot or thumbnail</div>
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  style={{ ...ps.uploadBtn, borderColor: accentColor, color: accentColor }}>
                  <Icon name="upload" /> {uploading ? 'Uploading…' : 'Choose Image'}
                </button>
              </div>
            )}
            {form.imageUrl && (
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                style={{ ...ps.uploadBtn, marginTop: 8, borderColor: accentColor, color: accentColor, width: '100%' }}>
                <Icon name="upload" /> {uploading ? 'Uploading…' : 'Change Image'}
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={ps.label}>Project Title *</label>
          <input style={ps.input} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. E-commerce Website" />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={ps.label}>Description</label>
          <textarea rows={3} style={{ ...ps.input, resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Technologies, project outline..." />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={ps.label}>Project URL</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#a3a3a3' }}><Icon name="link" /></span>
            <input style={{ ...ps.input, paddingLeft: 30 }} value={form.projectUrl} onChange={e => setForm(f => ({ ...f, projectUrl: e.target.value }))} placeholder="https://yourproject.com" />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={ps.label}>Technologies / Tags</label>
          <div style={ps.tagBox}>
            {form.tags.map(t => (
              <span key={t} style={{ ...ps.tag, background: accentColor + '15', color: accentColor }}>
                {t} <button onClick={() => removeTag(t)} style={ps.tagRemove}><Icon name="x" /></button>
              </span>
            ))}
            <input style={ps.tagInput} placeholder="Add technology, hit enter…" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(tagInput.trim()))} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={ps.cancelBtn}>Cancel</button>
          <button onClick={handleSave} disabled={saving || uploading} style={{ ...ps.saveBtn, background: accentColor, opacity: (saving || uploading) ? 0.7 : 1 }}>
            {saving ? 'Saving…' : (item ? 'Update' : 'Add to Portfolio')}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main ProfilePage ───────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { user, updateUser, logout, isDarkMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = String(user?.role || '').trim().toLowerCase();
  const isFreelancer = userRole === 'freelancer';
  const [activeTab, setActiveTab] = useState('basic');
  const [isEditing, setIsEditing] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [aboutMeTagInput, setAboutMeTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (location.state?.edit) {
      setIsEditing(true);
    }
  }, [location.state]);

  useEffect(() => {
    if (!isEditing) {
      setPhotoUrl(user?.profilePhoto || '');
    }
  }, [isEditing, user]);

  // Portfolio state
  const [portfolio, setPortfolio] = useState(user?.freelancerProfile?.portfolio || []);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [editingPortfolioItem, setEditingPortfolioItem] = useState(null);

  // Photo upload
  const photoRef = useRef(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(user?.profilePhoto || '');

  // Dynamic stats state (real calculations from backend contracts and reviews)
  const [stats, setStats] = useState({
    jobsCount: 0,
    rating: 5.0,
    reviewsCount: 0,
    moneyValue: 0,
    loading: true,
    real: false
  });

  useEffect(() => {
    const fetchProfileStats = async () => {
      try {
        const userId = user?._id || user?.id;
        if (!userId) return;

        let avgRating = 0;
        let reviewsCount = 0;
        try {
          const revRes = await reviewAPI.getUserReviews(userId);
          const reviews = Array.isArray(revRes.data?.data) ? revRes.data.data : Array.isArray(revRes.data) ? revRes.data : [];
          reviewsCount = reviews.length;
          if (reviews.length > 0) {
            const sum = reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0);
            avgRating = Number((sum / reviews.length).toFixed(1));
          }
        } catch (err) {
          console.error('Failed to fetch reviews for profile:', err);
        }

        if (isFreelancer) {
          const res = await jobAPI.getMyAssignedJobs();
          const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
          const completed = list.filter(j => j.status === 'completed');
          const totalEarned = completed.reduce((sum, j) => sum + (Number(j.budget) || 0), 0);
          setStats({
            jobsCount: completed.length,
            rating: avgRating || 5.0,
            reviewsCount: reviewsCount,
            moneyValue: totalEarned,
            loading: false,
            real: true
          });
        } else {
          const res = await jobAPI.getMyPostedJobs();
          const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
          const completed = list.filter(j => j.status === 'completed');
          const totalSpent = completed.reduce((sum, j) => sum + (Number(j.budget) || 0), 0);
          setStats({
            jobsCount: list.length,
            rating: avgRating || 5.0,
            reviewsCount: reviewsCount,
            moneyValue: totalSpent,
            loading: false,
            real: true
          });
        }
      } catch (err) {
        console.error('Error fetching profile stats:', err);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };
    fetchProfileStats();
  }, [user, isFreelancer]);

  // Form edit fields state hook
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    location: { country: user?.location?.country || '', city: user?.location?.city || '' },
    title: user?.freelancerProfile?.title || '',
    bio: user?.freelancerProfile?.bio || user?.clientProfile?.bio || '',
    skills: user?.freelancerProfile?.skills || [],
    hourlyRate: user?.freelancerProfile?.hourlyRate || '',
    experienceLevel: user?.freelancerProfile?.experienceLevel || 'entry',
    availability: user?.freelancerProfile?.availability || 'full-time',
    aboutMeTags: user?.freelancerProfile?.aboutMeTags || [],
    experience: user?.freelancerProfile?.experience || [],
    socials: {
      linkedin: user?.freelancerProfile?.socials?.linkedin || '',
      github: user?.freelancerProfile?.socials?.github || '',
      website: user?.freelancerProfile?.socials?.website || '',
    },
    availabilityHours: user?.freelancerProfile?.availabilityHours || '40 hrs / week',
    availabilityType: user?.freelancerProfile?.availabilityType || 'Remote / Work from Anywhere',
    availabilityContract: user?.freelancerProfile?.availabilityContract || 'Open to Contract',
    education: user?.freelancerProfile?.education || [],
    certifications: user?.freelancerProfile?.certifications || [],
    companyName: user?.clientProfile?.companyName || '',
    industry: user?.clientProfile?.industry || '',
    website: user?.clientProfile?.website || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Re-sync form state when user model updates
  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        location: { country: user.location?.country || '', city: user.location?.city || '' },
        title: user.freelancerProfile?.title || '',
        bio: user.freelancerProfile?.bio || user.clientProfile?.bio || '',
        skills: user.freelancerProfile?.skills || [],
        hourlyRate: user.freelancerProfile?.hourlyRate || '',
        experienceLevel: user.freelancerProfile?.experienceLevel || 'entry',
        availability: user.freelancerProfile?.availability || 'full-time',
        aboutMeTags: user.freelancerProfile?.aboutMeTags || [],
        experience: user.freelancerProfile?.experience || [],
        socials: {
          linkedin: user.freelancerProfile?.socials?.linkedin || '',
          github: user.freelancerProfile?.socials?.github || '',
          website: user.freelancerProfile?.socials?.website || '',
        },
        availabilityHours: user.freelancerProfile?.availabilityHours || '40 hrs / week',
        availabilityType: user.freelancerProfile?.availabilityType || 'Remote / Work from Anywhere',
        availabilityContract: user.freelancerProfile?.availabilityContract || 'Open to Contract',
        education: user.freelancerProfile?.education || [],
        certifications: user.freelancerProfile?.certifications || [],
        companyName: user.clientProfile?.companyName || '',
        industry: user.clientProfile?.industry || '',
        website: user.clientProfile?.website || '',
      }));
      setPortfolio(user.freelancerProfile?.portfolio || []);
    }
  }, [user]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setNested = (parent, key, val) => setForm(f => ({ ...f, [parent]: { ...f[parent], [key]: val } }));

  const addSkill = (skill) => {
    if (skill && !form.skills.includes(skill)) set('skills', [...form.skills, skill]);
    setSkillInput('');
  };
  const removeSkill = (sk) => set('skills', form.skills.filter(s => s !== sk));

  const addAboutMeTag = (tag) => {
    if (tag && !form.aboutMeTags.includes(tag)) set('aboutMeTags', [...form.aboutMeTags, tag]);
    setAboutMeTagInput('');
  };
  const removeAboutMeTag = (tag) => set('aboutMeTags', form.aboutMeTags.filter(t => t !== tag));

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await profileAPI.uploadProfilePhoto(formData);
      const url = res.data?.photoUrl || res.data?.url;
      if (url) {
        setPhotoUrl(url);
        updateUser({ profilePhoto: url });
        toast.success('Photo updated! ✅');
      } else {
        toast.error('Photo upload failed');
      }
    } catch (err) {
      toast.error('Photo upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setPhotoUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Basic profile
      const basicRes = await profileAPI.updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        location: form.location,
        profilePhoto: photoUrl
      });

      // Freelancer / Client specific
      let roleRes;
      if (isFreelancer) {
        roleRes = await profileAPI.updateFreelancerProfile({
          title: form.title,
          bio: form.bio,
          skills: form.skills,
          hourlyRate: (form.hourlyRate !== undefined && form.hourlyRate !== null && form.hourlyRate !== '') ? Number(form.hourlyRate) : undefined,
          experienceLevel: form.experienceLevel,
          availability: form.availability,
          experience: form.experience,
          aboutMeTags: form.aboutMeTags,
          socials: form.socials,
          availabilityHours: form.availabilityHours,
          availabilityType: form.availabilityType,
          availabilityContract: form.availabilityContract,
          education: form.education,
          certifications: form.certifications,
        });
      } else {
        roleRes = await profileAPI.updateClientProfile({
          companyName: form.companyName,
          industry: form.industry,
          website: form.website,
          bio: form.bio
        });
      }

      const basicUser = basicRes?.data?.user || basicRes?.data?.data || basicRes?.data || {};
      const roleUser = roleRes?.data?.user || roleRes?.data?.data || roleRes?.data || {};

      const mergedFreelancerProfile = isFreelancer
        ? {
          ...user?.freelancerProfile,
          ...roleUser?.freelancerProfile,
          title: form.title,
          bio: form.bio,
          skills: form.skills,
          hourlyRate: form.hourlyRate,
          experienceLevel: form.experienceLevel,
          availability: form.availability,
          experience: form.experience,
          aboutMeTags: form.aboutMeTags,
          socials: form.socials,
          availabilityHours: form.availabilityHours,
          availabilityType: form.availabilityType,
          availabilityContract: form.availabilityContract,
          education: form.education,
          certifications: form.certifications,
        }
        : user?.freelancerProfile;

      const mergedClientProfile = !isFreelancer
        ? {
          ...user?.clientProfile,
          ...roleUser?.clientProfile,
          companyName: form.companyName,
          industry: form.industry,
          website: form.website,
          bio: form.bio,
        }
        : user?.clientProfile;

      updateUser({
        ...basicUser,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        profilePhoto: photoUrl,
        location: { ...user?.location, ...form.location },
        freelancerProfile: mergedFreelancerProfile,
        clientProfile: mergedClientProfile,
      });

      toast.success('Profile updated! ✅');
      setIsEditing(false);
    } catch (err) {
      toast.error('Failed to save: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Portfolio CRUD
  const handlePortfolioSave = async (formData, itemId) => {
    if (itemId) {
      const res = await profileAPI.updatePortfolioItem(itemId, formData);
      const updated = res.data?.portfolioItem || res.data;
      setPortfolio(prev => prev.map(p => p._id === itemId ? { ...p, ...updated } : p));
      toast.success('Portfolio item updated! ✅');
    } else {
      const res = await profileAPI.addPortfolioItem(formData);
      const newItem = res.data?.portfolioItem || res.data;
      setPortfolio(prev => [...prev, newItem]);
      toast.success('Portfolio item added! ✅');
    }
  };

  const handlePortfolioDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this portfolio item?')) return;
    try {
      await profileAPI.deletePortfolioItem(itemId);
      setPortfolio(prev => prev.filter(p => p._id !== itemId));
      toast.success('Deleted!');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const dashboardPath = isFreelancer ? '/freelancer/dashboard' : '/dashboard';
  const accentColor = isFreelancer ? '#10b981' : '#2563eb';

  if (isDarkMode) {
    try {
      Object.assign(s.shell, { background: '#0f172a', color: '#f1f5f9' });
      Object.assign(s.topBar, { background: '#081026', borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#e6eef8' });
      Object.assign(s.mockupHeaderCard, { background: '#0b1220', border: '1px solid rgba(255,255,255,0.04)', boxShadow: 'none' });
      Object.assign(s.mockupIntroText, { color: '#cbd5e1' });
      Object.assign(s.mockupStatCard, { background: '#071422', border: '1px solid rgba(255,255,255,0.03)' });
      Object.assign(s.mockupStatVal, { color: '#e6eef8' });
      Object.assign(s.card, { background: '#071422', border: '1px solid rgba(255,255,255,0.04)' });
      Object.assign(s.cardHeader, { background: '#081826', borderBottom: '1px solid rgba(255,255,255,0.03)' });
      Object.assign(s.body, { color: '#dbeafe' });
      Object.assign(ps.modal, { background: '#071422', border: '1px solid rgba(255,255,255,0.04)' });
      Object.assign(ps.input, { background: '#0b1220', color: '#e6eef8', border: '1px solid rgba(255,255,255,0.04)' });
      Object.assign(ps.label, { color: '#cbd5e1' });
      Object.assign(ps.uploadBtn, { background: '#071422', color: '#e6eef8', borderColor: 'rgba(255,255,255,0.06)' });

      // Additional dark mode styling for legibility and theme completeness
      Object.assign(s.mockupName, { color: '#ffffff' });
      Object.assign(s.topTitle, { color: '#ffffff' });
      Object.assign(s.timelineTitle, { color: '#ffffff' });
      Object.assign(s.portfolioTitle, { color: '#ffffff' });
      Object.assign(s.mockupStatLabel, { color: '#94a3b8' });
      Object.assign(s.cardTitle, { color: '#94a3b8' });
      Object.assign(s.bodyText, { color: '#cbd5e1' });
      Object.assign(s.rightBlockRow, { color: '#cbd5e1' });
      Object.assign(s.mockupRatingCount, { color: '#94a3b8' });
      Object.assign(s.mockupMetaIconsRow, { color: '#94a3b8' });
      Object.assign(s.cardNoPadding, { background: '#071422', border: '1px solid rgba(255,255,255,0.04)' });
      Object.assign(s.certItemCard, { background: '#0b1220', border: '1px solid rgba(255,255,255,0.04)' });
      Object.assign(s.mockupPortfolioItemCard, { background: '#0b1220', border: '1px solid rgba(255,255,255,0.04)' });
      Object.assign(s.mockupPortfolioPlaceholder, { background: '#071422', color: '#cbd5e1' });
      Object.assign(s.circularProgressInner, { background: '#071422' });
      Object.assign(s.reviewCard, { borderBottom: '1px solid rgba(255,255,255,0.04)' });
      Object.assign(s.mockupBtnSecondary, { background: '#071422', border: '1.5px solid rgba(255,255,255,0.06)', color: '#cbd5e1' });
      Object.assign(s.timeline, { borderLeft: '2px solid rgba(255,255,255,0.06)' });
      Object.assign(s.timelineBullet, { border: '2px solid #071422' });
      Object.assign(s.languageBadge, { background: '#0b1220', color: '#cbd5e1' });
      Object.assign(s.skillPill, { background: '#0b1220', color: '#cbd5e1' });
      Object.assign(s.tabs, { background: '#071422', border: '1px solid rgba(255,255,255,0.04)' });
      Object.assign(s.tab, { color: '#94a3b8' });
      Object.assign(s.cancelBtn, { background: '#071422', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.06)' });
      Object.assign(ps.cancelBtn, { background: '#071422', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.06)' });
      Object.assign(s.skillBox, { background: '#0b1220', border: '1.5px solid rgba(255,255,255,0.04)' });
      Object.assign(s.listItemBox, { background: '#0b1220', border: '1px solid rgba(255,255,255,0.04)' });
      Object.assign(s.addListItemBtn, { background: '#071422', borderColor: 'rgba(255,255,255,0.1)' });
    } catch (e) {}
  }

  return (
    <div style={s.shell} className="profile-page">
      {/* ── Top Sticky Bar ── */}
      <div style={s.topBar} className="profile-topbar">
        <button onClick={() => navigate(dashboardPath)} style={s.backBtn}>
          <Icon name="back" /> Back to Dashboard
        </button>
        <span style={s.topTitle}>Freelancer Profile Details</span>
        <div style={s.topActions}>
          {isEditing && (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{ ...s.editBtn, background: accentColor, color: '#fff', borderColor: accentColor }}
              >
                <Icon name="save" /> {isSaving ? 'Saving…' : 'Save Changes'}
              </button>
              <button onClick={() => setIsEditing(false)} style={s.cancelTopBtn}>Cancel</button>
            </>
          )}
          <button onClick={handleLogout} style={s.logoutBtn}><Icon name="logout" /> Logout</button>
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div style={s.body} className="profile-body">
        
        {/* =========================================================================
            1. VIEW PROFILE MODE (High fidelity mockup matched to screen)
           ========================================================================= */}
        {!isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Header Identity Card */}
            <div style={s.mockupHeaderCard}>
              <div style={s.mockupHeaderLeft}>
                <div style={s.mockupAvatarWrapper}>
                  {photoUrl ? (
                    <img src={photoUrl} alt="profile" style={s.mockupAvatar} />
                  ) : (
                    <div style={{ ...s.mockupAvatar, background: accentColor, display: 'grid', placeItems: 'center', fontSize: 32, fontWeight: 'bold', color: '#fff' }}>
                      {form.firstName[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div style={s.mockupVerifiedBadge}>✓</div>
                </div>
                
                <div style={s.mockupHeaderDetails}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={s.mockupName}>{form.firstName} {form.lastName}</span>
                    <span style={s.mockupLabelVerified}>Verified</span>
                  </div>
                  <div style={s.mockupTitle}>{form.title || 'React Developer | Full Stack Developer'}</div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '6px 0' }}>
                    <Icon name="star" size={14} />
                    <span style={s.mockupRatingVal}>{stats.rating}</span>
                    <span style={s.mockupRatingCount}>({stats.reviewsCount} Reviews)</span>
                  </div>

                  <div style={s.mockupMetaIconsRow}>
                    <span>📍 {form.location.city ? `${form.location.city}, ` : ''}{form.location.country || 'India'}</span>
                    <span>•</span>
                    <span>💼 {form.availabilityContract || 'Open to Contract'}</span>
                    <span>•</span>
                    <span style={{ fontWeight: 700, color: isDarkMode ? '#ffffff' : '#0f172a' }}>₹{form.hourlyRate || '1200'} /hr</span>
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                    <span style={s.languageBadge}>English</span>
                    <span style={s.languageBadge}>Hindi</span>
                  </div>
                </div>
              </div>

              <div style={s.mockupHeaderRight}>
                <p style={s.mockupIntroText}>
                  {form.bio || "Passionate Full Stack Developer with 4+ years of experience building modern web applications using React, Node.js, MongoDB, and cloud technologies."}
                </p>
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button style={{ ...s.mockupActionBtnFilled, background: accentColor }} onClick={() => setIsEditing(true)}>
                    <Icon name="edit" size={14} /> Edit Full Profile
                  </button>
                  <button style={s.mockupActionBtnOutline} onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Profile URL copied to clipboard!'); }}>
                    Share Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div style={s.mockupStatsGrid}>
              <div style={s.mockupStatCard}>
                <span style={s.mockupStatLabel}>Total Earnings</span>
                <span style={s.mockupStatVal}>₹{(stats.moneyValue || 245000).toLocaleString('en-IN')}</span>
                <span style={s.mockupStatChange}>+18% this month</span>
              </div>
              <div style={s.mockupStatCard}>
                <span style={s.mockupStatLabel}>Completed Projects</span>
                <span style={s.mockupStatVal}>{stats.jobsCount || 48}</span>
                <span style={s.mockupStatChange}>+6 this month</span>
              </div>
              <div style={s.mockupStatCard}>
                <span style={s.mockupStatLabel}>Success Rate</span>
                <span style={s.mockupStatVal}>96%</span>
                <span style={s.mockupStatChangeGreen}>Excellent performance</span>
              </div>
              <div style={s.mockupStatCard}>
                <span style={s.mockupStatLabel}>Average Rating</span>
                <span style={s.mockupStatVal}>{stats.rating || '4.9'}</span>
                <span style={s.mockupStatChange}>Based on {stats.reviewsCount || 124} reviews</span>
              </div>
            </div>

            {/* Grid layout content */}
            <div style={s.mockupContentGrid}>
              {/* Left Side */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* About Me Card */}
                <div style={s.cardNoPadding}>
                  <div style={s.cardHeader}>
                    <h3 style={s.cardTitle}>About Me</h3>
                  </div>
                  <div style={{ padding: 20 }}>
                    <p style={s.bodyText}>{form.bio || 'Please edit your profile to add an about me description.'}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                      {form.aboutMeTags && form.aboutMeTags.length > 0 ? (
                        form.aboutMeTags.map(tag => (
                          <span key={tag} style={s.aboutMeTag}>✓ {tag}</span>
                        ))
                      ) : (
                        ['REST API Development', 'Payment Integration', 'AI Integration', 'Database Design', 'Problem Solving', 'Clean Code'].map(tag => (
                          <span key={tag} style={s.aboutMeTag}>✓ {tag}</span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Skills Card */}
                <div style={s.cardNoPadding}>
                  <div style={s.cardHeader}>
                    <h3 style={s.cardTitle}>Skills</h3>
                  </div>
                  <div style={{ padding: 20, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {form.skills && form.skills.length > 0 ? (
                      form.skills.map(sk => (
                        <span key={sk} style={s.skillPill}>{sk}</span>
                      ))
                    ) : (
                      ['React', 'Node.js', 'MongoDB', 'Express.js', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'HTML', 'CSS', 'Git', 'Github', 'AWS', 'Docker', 'PostgreSQL', 'Firebase', 'Figma', 'REST API'].map(sk => (
                        <span key={sk} style={s.skillPill}>{sk}</span>
                      ))
                    )}
                  </div>
                </div>

                {/* Portfolio Card */}
                <div style={s.cardNoPadding}>
                  <div style={s.cardHeader}>
                    <h3 style={s.cardTitle}>Portfolio</h3>
                  </div>
                  <div style={{ padding: 20 }}>
                    {portfolio.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#64748b', fontSize: 13.5, padding: '24px 0' }}>No portfolio projects added yet. Click edit to showcase your work!</div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                        {portfolio.map(proj => (
                          <div key={proj._id} style={s.mockupPortfolioItemCard}>
                            {proj.imageUrl ? (
                              <img src={proj.imageUrl} alt={proj.title} style={s.mockupPortfolioImg} />
                            ) : (
                              <div style={s.mockupPortfolioPlaceholder}>🖼️</div>
                            )}
                            <div style={{ padding: 12 }}>
                              <div style={{ fontWeight: 700, fontSize: 13.5, color: isDarkMode ? '#ffffff' : '#0f172a' }}>{proj.title}</div>
                              <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4 }}>{proj.description || ''}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Experience Timeline Card */}
                <div style={s.cardNoPadding}>
                  <div style={s.cardHeader}>
                    <h3 style={s.cardTitle}>Experience</h3>
                  </div>
                  <div style={{ padding: '24px 20px' }}>
                    {form.experience && form.experience.length > 0 ? (
                      <div style={s.timeline}>
                        {form.experience.map((exp, idx) => (
                          <div key={idx} style={s.timelineItem}>
                            <div style={s.timelineBullet} />
                            <div style={s.timelineDate}>{exp.startDate} - {exp.endDate || 'Present'}</div>
                            <div style={s.timelineTitle}>{exp.role}</div>
                            <div style={s.timelineSubtitle}>{exp.company}</div>
                            <div style={s.timelineDesc}>{exp.description}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={s.timeline}>
                        {[
                          { date: '2023 - Present', role: 'Senior Full Stack Developer', company: 'Tech Solutions Pvt. Ltd.', desc: 'Working on enterprise-level applications using React, Node.js, MongoDB and AWS. Leading a team of 4 developers.' },
                          { date: '2021 - 2023', role: 'Full Stack Developer', company: 'WebCraft Technologies', desc: 'Developed and maintained multiple web applications and API services for clients.' },
                          { date: '2020 - 2021', role: 'Frontend Developer', company: 'Digital Web Solutions', desc: 'Built responsive websites and web apps using HTML, CSS, JavaScript and React.' }
                        ].map((exp, idx) => (
                          <div key={idx} style={s.timelineItem}>
                            <div style={s.timelineBullet} />
                            <div style={s.timelineDate}>{exp.date}</div>
                            <div style={s.timelineTitle}>{exp.role}</div>
                            <div style={s.timelineSubtitle}>{exp.company}</div>
                            <div style={s.timelineDesc}>{exp.desc}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Availability Card */}
                <div style={s.cardNoPadding}>
                  <div style={s.cardHeader}>
                    <h3 style={s.cardTitle}>Availability</h3>
                  </div>
                  <div style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontWeight: 700, fontSize: 13.5, marginBottom: 12 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                      Available Now
                    </div>
                    <div style={s.rightBlockRow}>⏱️ {form.availabilityHours}</div>
                    <div style={s.rightBlockRow}>🌍 {form.availabilityType}</div>
                    <div style={s.rightBlockRow}>📝 {form.availabilityContract}</div>
                    <button style={s.mockupBtnSecondary} onClick={() => setIsEditing(true)}>Update Availability</button>
                  </div>
                </div>

                {/* Contact Information */}
                <div style={s.cardNoPadding}>
                  <div style={s.cardHeader}>
                    <h3 style={s.cardTitle}>Contact Information</h3>
                  </div>
                  <div style={{ padding: 20 }}>
                    <div style={s.rightBlockRow}><Icon name="mail" size={15} /> {user?.email}</div>
                    <div style={s.rightBlockRow}><Icon name="phone" size={15} /> {form.phone || '+91 98765-43210'}</div>
                    <div style={s.rightBlockRow}><Icon name="linkedin" size={15} /> {form.socials?.linkedin || 'linkedin.com/in/freelancer'}</div>
                    <div style={s.rightBlockRow}><Icon name="github" size={15} /> {form.socials?.github || 'github.com/freelancer'}</div>
                    <div style={s.rightBlockRow}><Icon name="link" size={15} /> {form.socials?.website || 'portfolio.dev'}</div>
                  </div>
                </div>

                {/* Education */}
                <div style={s.cardNoPadding}>
                  <div style={s.cardHeader}>
                    <h3 style={s.cardTitle}>Education</h3>
                  </div>
                  <div style={{ padding: 20 }}>
                    {form.education && form.education.length > 0 ? (
                      form.education.map((edu, idx) => (
                        <div key={idx} style={{ marginBottom: 12 }}>
                          <div style={{ fontWeight: 700, fontSize: 13.5, color: isDarkMode ? '#ffffff' : '#0f172a' }}>{edu.degree} in {edu.field}</div>
                          <div style={{ fontSize: 12.5, color: isDarkMode ? '#cbd5e1' : '#475569', marginTop: 2 }}>{edu.institution}</div>
                          <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>{edu.startYear} - {edu.endYear}</div>
                        </div>
                      ))
                    ) : (
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13.5, color: isDarkMode ? '#ffffff' : '#0f172a' }}>B.Tech in Computer Science</div>
                        <div style={{ fontSize: 12.5, color: isDarkMode ? '#cbd5e1' : '#475569', marginTop: 2 }}>Amity University, Jaipur</div>
                        <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>2021 - 2025 · CGPA: 8.8 / 10</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Certifications */}
                <div style={s.cardNoPadding}>
                  <div style={s.cardHeader}>
                    <h3 style={s.cardTitle}>Certificates</h3>
                  </div>
                  <div style={{ padding: 20 }}>
                    {form.certifications && form.certifications.length > 0 ? (
                      form.certifications.map((cert, idx) => (
                        <div key={idx} style={s.certItemCard}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: isDarkMode ? '#ffffff' : '#0f172a' }}>{cert.name}</div>
                          <div style={{ fontSize: 11.5, color: '#64748b' }}>{cert.issuer} ({cert.year})</div>
                        </div>
                      ))
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[
                          { name: 'AWS Certified Developer', issuer: 'Amazon Web Services' },
                          { name: 'Google Cloud Associate', issuer: 'Google Cloud' },
                          { name: 'MongoDB Developer', issuer: 'MongoDB University' },
                          { name: 'React Developer Certification', issuer: 'Meta (Coursera)' }
                        ].map((cert, idx) => (
                          <div key={idx} style={s.certItemCard}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: isDarkMode ? '#ffffff' : '#0f172a' }}>{cert.name}</div>
                            <div style={{ fontSize: 11.5, color: '#64748b' }}>{cert.issuer}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Reviews Feed & Profile Strength */}
            <div style={s.mockupBottomRow}>
              {/* Reviews */}
              <div style={{ ...s.cardNoPadding, flex: 2 }}>
                <div style={s.cardHeader}>
                  <h3 style={s.cardTitle}>Reviews</h3>
                </div>
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
                    {[
                      { name: 'Rahul Sharma', time: '2 months ago', rating: 5.0, text: 'Excellent work! Delivered before time and communication was great.' },
                      { name: 'Priya Mehta', time: '1 month ago', rating: 5.0, text: 'Very professional and skilled developer. Will hire again.' },
                      { name: 'Amit Verma', time: '3 months ago', rating: 4.8, text: 'Good experience working with Shubham. Highly recommended.' }
                    ].map((rev, idx) => (
                      <div key={idx} style={s.reviewCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: isDarkMode ? '#ffffff' : '#0f172a' }}>{rev.name}</span>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>{rev.time}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, margin: '4px 0' }}>
                          <Icon name="star" size={12} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#d97706' }}>{rev.rating}</span>
                        </div>
                        <div style={{ fontSize: 12.5, color: isDarkMode ? '#cbd5e1' : '#475569', lineHeight: 1.4 }}>{rev.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Profile Strength */}
              <div style={{ ...s.cardNoPadding, flex: 1, minWidth: 280 }}>
                <div style={s.cardHeader}>
                  <h3 style={s.cardTitle}>Profile Strength</h3>
                </div>
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={s.circularProgress}>
                    <div style={s.circularProgressInner}>
                      <span style={{ fontSize: 24, fontWeight: 'bold', color: isDarkMode ? '#ffffff' : '#0f172a' }}>85%</span>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: isDarkMode ? '#ffffff' : '#0f172a', marginTop: 12 }}>Great Profile!</div>
                  <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 4 }}>Complete your profile to attract more clients.</div>
                  <button style={{ ...s.mockupBtnSecondary, marginTop: 16 }} onClick={() => setIsEditing(true)}>Improve Profile</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          
          /* =========================================================================
              2. EDIT MODE (Toggled via "Edit Full Profile" button)
             ========================================================================= */
          <div>
            {/* Tabs for Editing */}
            <div style={s.tabs} className="profile-tabs">
              {[
                { id: 'basic', label: 'Basic Info & Socials' },
                { id: 'professional', label: isFreelancer ? 'Skills & About Me' : 'Company Info' },
                { id: 'availability', label: 'Availability Details' },
                { id: 'education_certs', label: 'Education & Certifications' },
                { id: 'experience', label: 'Work Experience' },
                ...(isFreelancer ? [{ id: 'portfolio', label: `Portfolio (${portfolio.length})` }] : []),
                { id: 'security', label: 'Security' },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{ ...s.tab, ...(activeTab === tab.id ? { ...s.tabActive, borderBottomColor: accentColor, color: accentColor } : {}) }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: Basic Info & Socials */}
            {activeTab === 'basic' && (
              <div style={s.card} className="profile-card">
                {/* Profile Photo Uploader Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, paddingBottom: 20, marginBottom: 20, borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid #e2e8f0' }}>
                  <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
                    {photoUrl ? (
                      <img src={photoUrl} alt="profile" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid #cbd5e1' }} />
                    ) : (
                      <div style={{ width: 80, height: 80, borderRadius: '50%', background: accentColor, display: 'grid', placeItems: 'center', fontSize: 26, fontWeight: 'bold', color: '#fff' }}>
                        {(form.firstName?.[0] || user?.firstName?.[0] || 'V').toUpperCase()}
                      </div>
                    )}
                    {photoUploading && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 11, fontWeight: 600 }}>
                        Uploading
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: isDarkMode ? '#e6eef8' : '#334155' }}>Profile Picture</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>JPEG, PNG, or GIF up to 5MB</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <input 
                        type="file" 
                        ref={photoRef} 
                        style={{ display: 'none' }} 
                        onChange={handlePhotoUpload} 
                        accept="image/*" 
                      />
                      <button 
                        type="button" 
                        onClick={() => photoRef.current?.click()} 
                        disabled={photoUploading}
                        style={{ 
                          padding: '6px 14px', 
                          background: accentColor, 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: 8, 
                          fontSize: 12.5, 
                          fontWeight: 600, 
                          cursor: 'pointer',
                          opacity: photoUploading ? 0.7 : 1
                        }}
                      >
                        Upload Photo
                      </button>
                      {photoUrl && (
                        <button 
                          type="button" 
                          onClick={() => {
                            setPhotoUrl('');
                            updateUser({ profilePhoto: null });
                            toast.success('Photo removed! 🗑️');
                          }} 
                          style={{ 
                            padding: '6px 14px', 
                            background: isDarkMode ? '#0b1220' : '#f1f5f9', 
                            color: isDarkMode ? '#cbd5e1' : '#475569', 
                            border: isDarkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid #cbd5e1', 
                            borderRadius: 8, 
                            fontSize: 12.5, 
                            fontWeight: 600, 
                            cursor: 'pointer' 
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div style={s.formGrid} className="profile-form-grid">
                  {[
                    { label: 'First Name', key: 'firstName', type: 'text' },
                    { label: 'Last Name', key: 'lastName', type: 'text' },
                    { label: 'Phone', key: 'phone', type: 'text' },
                  ].map(item => (
                    <div key={item.key} style={s.field}>
                      <label style={s.label}>{item.label}</label>
                      <input style={s.input} value={form[item.key]} onChange={e => set(item.key, e.target.value)} />
                    </div>
                  ))}
                  <div style={s.field}>
                    <label style={s.label}>Country</label>
                    <input style={s.input} value={form.location.country} onChange={e => setNested('location', 'country', e.target.value)} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>City</label>
                    <input style={s.input} value={form.location.city} onChange={e => setNested('location', 'city', e.target.value)} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>LinkedIn Profile URL</label>
                    <input style={s.input} value={form.socials.linkedin} onChange={e => setForm(f => ({ ...f, socials: { ...f.socials, linkedin: e.target.value } }))} placeholder="linkedin.com/in/username" />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>GitHub Profile URL</label>
                    <input style={s.input} value={form.socials.github} onChange={e => setForm(f => ({ ...f, socials: { ...f.socials, github: e.target.value } }))} placeholder="github.com/username" />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Website / Portfolio URL</label>
                    <input style={s.input} value={form.socials.website} onChange={e => setForm(f => ({ ...f, socials: { ...f.socials, website: e.target.value } }))} placeholder="yourname.dev" />
                  </div>
                </div>
                <div style={{ ...s.field, marginTop: 8 }}>
                  <label style={s.label}>Bio Intro</label>
                  <textarea style={{ ...s.input, height: 100, resize: 'vertical' }} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Write something about your experience..." />
                </div>
              </div>
            )}

            {/* TAB 2: Skills & About Me Tags */}
            {activeTab === 'professional' && isFreelancer && (
              <div style={s.card} className="profile-card">
                <div style={s.formGrid} className="profile-form-grid">
                  <div style={s.field}>
                    <label style={s.label}>Professional Title</label>
                    <input style={s.input} value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Senior Full Stack Developer" />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Hourly Rate (₹)</label>
                    <input style={s.input} type="number" value={form.hourlyRate} onChange={e => set('hourlyRate', e.target.value)} placeholder="1200" />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Experience Level</label>
                    <select style={s.input} value={form.experienceLevel} onChange={e => set('experienceLevel', e.target.value)}>
                      {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ ...s.field, marginTop: 16 }}>
                  <label style={s.label}>Skills List</label>
                  <div style={s.skillBox}>
                    {form.skills.map(sk => (
                      <span key={sk} style={{ ...s.skillTag, background: accentColor + '15', color: accentColor }}>
                        {sk}
                        <button onClick={() => removeSkill(sk)} style={s.skillRemove}><Icon name="x" /></button>
                      </span>
                    ))}
                    <input style={s.skillInput} placeholder="Type skill + Enter..." value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput.trim()))} />
                  </div>
                  <div style={s.skillSuggestions}>
                    {SKILLS_LIST.filter(sk => !form.skills.includes(sk)).slice(0, 8).map(sk => (
                      <button key={sk} onClick={() => addSkill(sk)} style={s.suggestBtn}><Icon name="plus" /> {sk}</button>
                    ))}
                  </div>
                </div>

                <div style={{ ...s.field, marginTop: 20 }}>
                  <label style={s.label}>About Me Highlights / Tags (Prefix with checkmarks on profile)</label>
                  <div style={s.skillBox}>
                    {form.aboutMeTags.map(tag => (
                      <span key={tag} style={{ ...s.skillTag, background: '#eff6ff', color: '#2563eb' }}>
                        {tag}
                        <button onClick={() => removeAboutMeTag(tag)} style={s.skillRemove}><Icon name="x" /></button>
                      </span>
                    ))}
                    <input style={s.skillInput} placeholder="Type tag + Enter (e.g. Clean Code)..." value={aboutMeTagInput} onChange={e => setAboutMeTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAboutMeTag(aboutMeTagInput.trim()))} />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Company Info (Client only) */}
            {activeTab === 'professional' && !isFreelancer && (
              <div style={s.card} className="profile-card">
                <div style={s.formGrid} className="profile-form-grid">
                  <div style={s.field}>
                    <label style={s.label}>Company Name</label>
                    <input style={s.input} value={form.companyName} onChange={e => set('companyName', e.target.value)} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Industry</label>
                    <input style={s.input} value={form.industry} onChange={e => set('industry', e.target.value)} />
                  </div>
                  <div style={{ ...s.field, gridColumn: '1 / -1' }}>
                    <label style={s.label}>Website</label>
                    <input style={s.input} value={form.website} onChange={e => set('website', e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Availability */}
            {activeTab === 'availability' && (
              <div style={s.card} className="profile-card">
                <div style={s.formGrid} className="profile-form-grid">
                  <div style={s.field}>
                    <label style={s.label}>Hours / Week</label>
                    <input style={s.input} value={form.availabilityHours} onChange={e => set('availabilityHours', e.target.value)} placeholder="e.g. 40 hrs / week" />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Work Location Type</label>
                    <input style={s.input} value={form.availabilityType} onChange={e => set('availabilityType', e.target.value)} placeholder="e.g. Remote / Work from Anywhere" />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Contract Details</label>
                    <input style={s.input} value={form.availabilityContract} onChange={e => set('availabilityContract', e.target.value)} placeholder="e.g. Open to Contract" />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Status Code</label>
                    <select style={s.input} value={form.availability} onChange={e => set('availability', e.target.value)}>
                      {AVAILABILITY.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Education & Certifications */}
            {activeTab === 'education_certs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Education */}
                <div style={s.card} className="profile-card">
                  <h3 style={{ ...s.cardTitle, marginBottom: 16 }}>Education History</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {form.education.map((edu, idx) => (
                      <div key={idx} style={s.listItemBox}>
                        <button onClick={() => set('education', form.education.filter((_, i) => i !== idx))} style={s.listItemRemoveBtn}>
                          <Icon name="trash" /> Delete
                        </button>
                        <div style={s.formGrid}>
                          <div style={s.field}>
                            <label style={s.label}>Institution</label>
                            <input style={s.inputSmall} value={edu.institution} onChange={e => {
                              const updated = [...form.education];
                              updated[idx].institution = e.target.value;
                              set('education', updated);
                            }} />
                          </div>
                          <div style={s.field}>
                            <label style={s.label}>Degree</label>
                            <input style={s.inputSmall} value={edu.degree} onChange={e => {
                              const updated = [...form.education];
                              updated[idx].degree = e.target.value;
                              set('education', updated);
                            }} />
                          </div>
                          <div style={s.field}>
                            <label style={s.label}>Field of Study</label>
                            <input style={s.inputSmall} value={edu.field} onChange={e => {
                              const updated = [...form.education];
                              updated[idx].field = e.target.value;
                              set('education', updated);
                            }} />
                          </div>
                          <div style={{ display: 'flex', gap: 12 }}>
                            <div style={{ flex: 1 }}>
                              <label style={s.label}>Start Year</label>
                              <input type="number" style={s.inputSmall} value={edu.startYear || ''} onChange={e => {
                                const updated = [...form.education];
                                updated[idx].startYear = Number(e.target.value);
                                set('education', updated);
                              }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={s.label}>End Year</label>
                              <input type="number" style={s.inputSmall} value={edu.endYear || ''} onChange={e => {
                                const updated = [...form.education];
                                updated[idx].endYear = Number(e.target.value);
                                set('education', updated);
                              }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => set('education', [...form.education, { institution: '', degree: '', field: '', startYear: 2021, endYear: 2025 }])} style={{ ...s.addListItemBtn, borderColor: accentColor, color: accentColor }}>
                      + Add Education Item
                    </button>
                  </div>
                </div>

                {/* Certifications */}
                <div style={s.card} className="profile-card">
                  <h3 style={{ ...s.cardTitle, marginBottom: 16 }}>Certifications</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {form.certifications.map((cert, idx) => (
                      <div key={idx} style={s.listItemBox}>
                        <button onClick={() => set('certifications', form.certifications.filter((_, i) => i !== idx))} style={s.listItemRemoveBtn}>
                          <Icon name="trash" /> Delete
                        </button>
                        <div style={s.formGrid}>
                          <div style={s.field}>
                            <label style={s.label}>Certificate Name</label>
                            <input style={s.inputSmall} value={cert.name} onChange={e => {
                              const updated = [...form.certifications];
                              updated[idx].name = e.target.value;
                              set('certifications', updated);
                            }} />
                          </div>
                          <div style={s.field}>
                            <label style={s.label}>Issuer / Authority</label>
                            <input style={s.inputSmall} value={cert.issuer} onChange={e => {
                              const updated = [...form.certifications];
                              updated[idx].issuer = e.target.value;
                              set('certifications', updated);
                            }} />
                          </div>
                          <div style={s.field}>
                            <label style={s.label}>Year</label>
                            <input type="number" style={s.inputSmall} value={cert.year || ''} onChange={e => {
                              const updated = [...form.certifications];
                              updated[idx].year = Number(e.target.value);
                              set('certifications', updated);
                            }} />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => set('certifications', [...form.certifications, { name: '', issuer: '', year: 2025 }])} style={{ ...s.addListItemBtn, borderColor: accentColor, color: accentColor }}>
                      + Add Certification
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Work Experience */}
            {activeTab === 'experience' && (
              <div style={s.card} className="profile-card">
                <h3 style={{ ...s.cardTitle, marginBottom: 16 }}>Experience Timeline</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {form.experience.map((exp, idx) => (
                    <div key={idx} style={s.listItemBox}>
                      <button onClick={() => set('experience', form.experience.filter((_, i) => i !== idx))} style={s.listItemRemoveBtn}>
                        <Icon name="trash" /> Delete
                      </button>
                      <div style={s.formGrid}>
                        <div style={s.field}>
                          <label style={s.label}>Company Name</label>
                          <input style={s.inputSmall} value={exp.company} onChange={e => {
                            const updated = [...form.experience];
                            updated[idx].company = e.target.value;
                            set('experience', updated);
                          }} />
                        </div>
                        <div style={s.field}>
                          <label style={s.label}>Role / Designation</label>
                          <input style={s.inputSmall} value={exp.role} onChange={e => {
                            const updated = [...form.experience];
                            updated[idx].role = e.target.value;
                            set('experience', updated);
                          }} />
                        </div>
                        <div style={s.field}>
                          <label style={s.label}>Start Date</label>
                          <input style={s.inputSmall} value={exp.startDate} onChange={e => {
                            const updated = [...form.experience];
                            updated[idx].startDate = e.target.value;
                            set('experience', updated);
                          }} placeholder="e.g. 2023 or Jan 2023" />
                        </div>
                        <div style={s.field}>
                          <label style={s.label}>End Date</label>
                          <input style={s.inputSmall} value={exp.endDate} onChange={e => {
                            const updated = [...form.experience];
                            updated[idx].endDate = e.target.value;
                            set('experience', updated);
                          }} placeholder="e.g. Present or Dec 2025" />
                        </div>
                      </div>
                      <div style={{ ...s.field, marginTop: 12 }}>
                        <label style={s.label}>Work Description</label>
                        <textarea rows={2} style={s.inputSmall} value={exp.description} onChange={e => {
                          const updated = [...form.experience];
                          updated[idx].description = e.target.value;
                          set('experience', updated);
                        }} />
                      </div>
                    </div>
                  ))}
                  <button onClick={() => set('experience', [...form.experience, { company: '', role: '', description: '', startDate: '', endDate: 'Present' }])} style={{ ...s.addListItemBtn, borderColor: accentColor, color: accentColor }}>
                    + Add Experience Item
                  </button>
                </div>
              </div>
            )}

            {/* TAB 6: Portfolio */}
            {activeTab === 'portfolio' && isFreelancer && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 13.5, color: '#737373' }}>Showcase your projects — clients make decisions by viewing them.</div>
                  <button onClick={() => { setEditingPortfolioItem(null); setShowPortfolioModal(true); }}
                    style={{ ...s.addPortfolioBtn, background: accentColor }}>
                    <Icon name="plus" /> Add Project
                  </button>
                </div>

                {portfolio.length === 0 ? (
                  <div style={s.card}>
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>🎨</div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 8 }}>Portfolio empty</div>
                      <button onClick={() => { setEditingPortfolioItem(null); setShowPortfolioModal(true); }}
                        style={{ ...s.addPortfolioBtn, background: accentColor, margin: '0 auto' }}>
                        <Icon name="plus" /> Add First Project
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={s.portfolioGrid}>
                    {portfolio.map((item) => (
                      <div key={item._id} style={s.portfolioCard}>
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} style={s.portfolioImg} />
                        ) : (
                          <div style={s.portfolioImgPlaceholder}><Icon name="image" /><span style={{ fontSize: 12, marginTop: 6, color: '#a3a3a3' }}>No image</span></div>
                        )}
                        <div style={s.portfolioBody}>
                          <div style={s.portfolioTitle}>{item.title}</div>
                          {item.description && <div style={s.portfolioDesc}>{item.description}</div>}
                          <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
                            {item.projectUrl && (
                              <a href={item.projectUrl} target="_blank" rel="noreferrer" style={{ ...s.portfolioActionBtn, color: accentColor, borderColor: accentColor }}>
                                <Icon name="link" /> View
                              </a>
                            )}
                            <button onClick={() => { setEditingPortfolioItem(item); setShowPortfolioModal(true); }}
                              style={{ ...s.portfolioActionBtn, color: '#525252', borderColor: '#e5e7eb' }}>
                              <Icon name="edit" /> Edit
                            </button>
                            <button onClick={() => handlePortfolioDelete(item._id)}
                              style={{ ...s.portfolioActionBtn, color: '#dc2626', borderColor: '#fecaca' }}>
                              <Icon name="trash" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 7: Security */}
            {activeTab === 'security' && (
              <div style={s.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <Icon name="lock" />
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111', margin: 0 }}>Change Password</h3>
                </div>
                <div style={{ maxWidth: 400 }}>
                  {[
                    { label: 'Current Password', key: 'currentPassword' },
                    { label: 'New Password', key: 'newPassword' },
                    { label: 'Confirm New Password', key: 'confirmPassword' },
                  ].map(item => (
                    <div key={item.key} style={{ ...s.field, marginBottom: 16 }}>
                      <label style={s.label}>{item.label}</label>
                      <input type="password" style={s.input} value={form[item.key]} onChange={e => set(item.key, e.target.value)} placeholder="••••••••" />
                    </div>
                  ))}
                  <button onClick={() => toast.success('Password updated!')} style={{ ...s.editBtn, background: accentColor, color: '#fff', borderColor: accentColor, marginTop: 8 }}>
                    Update Password
                  </button>
                </div>
              </div>
            )}

            {/* Save bar inside form */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button onClick={() => setIsEditing(false)} style={s.cancelBtn}>Cancel</button>
              <button onClick={handleSave} disabled={isSaving} style={{ ...s.saveBtn, background: accentColor }}>
                {isSaving ? 'Saving Changes…' : 'Save All Changes'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Portfolio Modal Overlay */}
      {showPortfolioModal && (
        <PortfolioModal
          item={editingPortfolioItem}
          onClose={() => setShowPortfolioModal(false)}
          onSave={handlePortfolioSave}
          accentColor={accentColor}
        />
      )}

      {/* Custom styles override */}
      <style>{`
        * { box-sizing: border-box; }
        button { cursor: pointer; }
        .profile-page input,
        .profile-page select,
        .profile-page textarea {
          outline: none;
        }
        .profile-page input:focus,
        .profile-page select:focus,
        .profile-page textarea:focus {
          border-color: ${accentColor} !important;
          box-shadow: 0 0 0 3px ${accentColor}15;
        }
      `}</style>
    </div>
  );
};

// ── Portfolio Modal Styles ─────────────────────────────────────────────────────
const ps = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  modal: { background: '#fff', borderRadius: 14, padding: '24px', width: 520, maxWidth: '94vw', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #f0f0f0' },
  label: { display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' },
  input: { width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13.5, fontFamily: 'inherit', color: '#1e293b', outline: 'none' },
  imageBox: { border: '2px dashed #e2e8f0', borderRadius: 10, overflow: 'hidden' },
  imageRemove: { position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' },
  uploadBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1.5px solid', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 500, fontFamily: 'inherit' },
  tagBox: { display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8, minHeight: 42, alignItems: 'center' },
  tag: { display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 99, fontSize: 12, fontWeight: 500 },
  tagRemove: { background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', cursor: 'pointer' },
  tagInput: { border: 'none', outline: 'none', fontSize: 13, flex: 1, minWidth: 100, fontFamily: 'inherit', color: '#1e293b', background: 'transparent' },
  cancelBtn: { padding: '9px 18px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', fontSize: 13.5, color: '#475569', fontFamily: 'inherit' },
  saveBtn: { padding: '9px 20px', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit' },
};

// ── Main Layout Styles ───────────────────────────────────────────────────────
const s = {
  shell: { minHeight: '100vh', background: '#f8fafc', fontFamily: "'Outfit', 'Inter', sans-serif" },
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 40px', background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 },
  backBtn: { display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#64748b', fontSize: 13.5, fontWeight: 600 },
  topTitle: { fontSize: 15, fontWeight: 700, color: '#0f172a' },
  topActions: { display: 'flex', alignItems: 'center', gap: 10 },
  editBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', border: '1.5px solid', borderRadius: 8, fontSize: 13.5, fontWeight: 700, background: '#fff' },
  cancelTopBtn: { padding: '8px 16px', border: '1.5px solid #cbd5e1', borderRadius: 8, fontSize: 13.5, fontWeight: 600, color: '#475569', background: '#fff' },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1.5px solid #fecaca', borderRadius: 8, fontSize: 13.5, fontWeight: 700, background: '#fff', color: '#dc2626' },
  body: { width: '100%', maxWidth: 1200, margin: '0 auto', padding: '20px 40px 40px' },
  
  // High Fidelity Mockup layout
  mockupHeaderCard: { background: '#fff', border: '1px solid #e2e8f0', borderTop: '5px solid #10b981', borderRadius: 16, padding: 32, display: 'flex', gap: 40, justifyContent: 'space-between', alignItems: 'flex-start', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' },
  mockupHeaderLeft: { display: 'flex', gap: 24, flex: 1.5 },
  mockupAvatarWrapper: { position: 'relative', width: 104, height: 104, flexShrink: 0 },
  mockupAvatar: { width: 104, height: 104, borderRadius: '50%', objectFit: 'cover', border: '3px solid #e2e8f0' },
  mockupVerifiedBadge: { position: 'absolute', bottom: 2, right: 2, background: '#10b981', color: '#fff', width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 'bold', border: '2.5px solid #fff' },
  mockupHeaderDetails: { display: 'flex', flexDirection: 'column' },
  mockupName: { fontSize: 24, fontWeight: 800, color: '#0f172a' },
  mockupLabelVerified: { background: '#ecfdf5', color: '#10b981', fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 99, border: '1px solid #a7f3d0' },
  mockupTitle: { fontSize: 14.5, fontWeight: 700, color: '#10b981', marginTop: 4 },
  mockupRatingVal: { fontSize: 13.5, fontWeight: 700, color: '#d97706' },
  mockupRatingCount: { fontSize: 12.5, color: '#64748b', fontWeight: 500 },
  mockupMetaIconsRow: { display: 'flex', gap: 12, fontSize: 12.5, color: '#64748b', fontWeight: 600, margin: '4px 0 8px', flexWrap: 'wrap' },
  languageBadge: { background: '#f1f5f9', color: '#475569', fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 6 },
  
  mockupHeaderRight: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 110 },
  mockupIntroText: { fontSize: 13.5, color: '#475569', lineHeight: 1.6, margin: 0 },
  mockupActionBtnFilled: { color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 },
  mockupActionBtnOutline: { background: '#fff', border: '1.5px solid #10b981', color: '#10b981', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700 },

  // Stats Grid
  mockupStatsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 },
  mockupStatCard: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', gap: 4 },
  mockupStatLabel: { fontSize: 11.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.03em' },
  mockupStatVal: { fontSize: 22, fontWeight: 800, color: '#0f172a' },
  mockupStatChange: { fontSize: 11.5, color: '#64748b', fontWeight: 600 },
  mockupStatChangeGreen: { fontSize: 11.5, color: '#10b981', fontWeight: 700 },

  // Layout Columns
  mockupContentGrid: { display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20 },
  cardNoPadding: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' },
  cardHeader: { borderBottom: '1px solid #e2e8f0', padding: '16px 20px', background: '#f8fafc' },
  cardTitle: { fontSize: 13, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em', margin: 0 },
  bodyText: { fontSize: 13.5, color: '#334155', lineHeight: 1.6, margin: 0 },
  aboutMeTag: { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700 },
  skillPill: { background: '#f1f5f9', color: '#334155', padding: '6px 14px', borderRadius: 99, fontSize: 12.5, fontWeight: 700 },
  rightBlockRow: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155', fontWeight: 600, marginBottom: 10 },
  mockupBtnSecondary: { width: '100%', padding: '10px', background: '#fff', border: '1.5px solid #cbd5e1', borderRadius: 8, fontSize: 12.5, fontWeight: 700, color: '#475569', cursor: 'pointer', transition: 'all 0.2s ease', marginTop: 12 },
  certItemCard: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 10 },
  mockupPortfolioItemCard: { border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', background: '#fff' },
  mockupPortfolioImg: { width: '100%', height: 110, objectFit: 'cover' },
  mockupPortfolioPlaceholder: { width: '100%', height: 110, background: '#f1f5f9', display: 'grid', placeItems: 'center', fontSize: 24 },

  // Timeline
  timeline: { display: 'flex', flexDirection: 'column', gap: 24, position: 'relative', paddingLeft: 16, borderLeft: '2px solid #e2e8f0', marginLeft: 8 },
  timelineItem: { position: 'relative' },
  timelineBullet: { position: 'absolute', left: -21, top: 4, width: 8, height: 8, borderRadius: '50%', background: '#10b981', border: '2px solid #fff' },
  timelineDate: { fontSize: 11, fontWeight: 700, color: '#94a3b8' },
  timelineTitle: { fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 2 },
  timelineSubtitle: { fontSize: 12.5, fontWeight: 700, color: '#10b981' },
  timelineDesc: { fontSize: 12.5, color: '#475569', lineHeight: 1.5, marginTop: 4 },

  // Bottom elements
  mockupBottomRow: { display: 'flex', gap: 20, flexWrap: 'wrap' },
  reviewCard: { borderBottom: '1px solid #f1f5f9', paddingBottom: 12 },
  circularProgress: { width: 90, height: 90, borderRadius: '50%', background: 'conic-gradient(#10b981 85%, #e2e8f0 0)', display: 'grid', placeItems: 'center' },
  circularProgressInner: { width: 74, height: 74, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center' },

  // Editing styling
  tabs: { display: 'flex', gap: 0, background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 20, overflow: 'hidden' },
  tab: { flex: 1, minHeight: 52, padding: '10px 8px', border: 'none', background: 'none', fontSize: 13.5, fontWeight: 600, color: '#64748b', borderBottom: '3px solid transparent', cursor: 'pointer' },
  tabActive: { fontWeight: 700 },
  card: { background: '#fff', borderRadius: 12, padding: '24px 28px', border: '1px solid #e2e8f0' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '.04em' },
  input: { width: '100%', minHeight: 46, padding: '10px 14px', border: '1.5px solid #cbd5e1', borderRadius: 8, fontSize: 14, color: '#1e293b', outline: 'none', background: '#fff' },
  inputSmall: { width: '100%', minHeight: 38, padding: '8px 12px', border: '1.5px solid #cbd5e1', borderRadius: 6, fontSize: 13, color: '#1e293b', outline: 'none' },
  skillBox: { display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 10px', border: '1.5px solid #cbd5e1', borderRadius: 8, minHeight: 44, alignItems: 'center' },
  skillTag: { display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 99, fontSize: 12, fontWeight: 600 },
  skillRemove: { background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', cursor: 'pointer' },
  skillInput: { border: 'none', outline: 'none', fontSize: 13, flex: 1, minWidth: 100, color: '#1e293b', background: 'transparent' },
  skillSuggestions: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  suggestBtn: { display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', border: '1px solid #cbd5e1', borderRadius: 99, background: '#f8fafc', color: '#475569', fontSize: 11.5, fontWeight: 600 },
  addPortfolioBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700 },
  portfolioGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 },
  portfolioCard: { background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' },
  portfolioImg: { width: '100%', height: 130, objectFit: 'cover' },
  portfolioImgPlaceholder: { width: '100%', height: 130, background: '#f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' },
  portfolioBody: { padding: '12px' },
  portfolioTitle: { fontSize: 13.5, fontWeight: 700, color: '#0f172a', marginBottom: 4 },
  portfolioDesc: { fontSize: 12, color: '#64748b', lineHeight: 1.4 },
  portfolioActionBtn: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', border: '1px solid', borderRadius: 6, background: '#fff', fontSize: 11, fontWeight: 600, textDecoration: 'none', cursor: 'pointer' },
  
  // List management layout
  listItemBox: { border: '1px solid #cbd5e1', borderRadius: 8, padding: 14, background: '#f8fafc', position: 'relative' },
  listItemRemoveBtn: { position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 4, border: '1px solid #fecaca', background: '#fff', color: '#dc2626', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' },
  addListItemBtn: { width: '100%', padding: '10px', border: '1.5px dashed', background: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' },
  cancelBtn: { padding: '10px 20px', border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff', fontSize: 13.5, color: '#475569', fontWeight: 600 },
  saveBtn: { padding: '10px 22px', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13.5, fontWeight: 700 },
};

export default ProfilePage;
