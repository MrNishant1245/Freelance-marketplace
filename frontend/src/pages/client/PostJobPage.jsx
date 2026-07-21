import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { jobAPI } from '../../api';

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = ({ name }) => {
  const icons = {
    arrow_left:  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>,
    arrow_right: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>,
    check:       <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
    x:           <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    plus:        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    briefcase:   <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
    dollar:      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    tag:         <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  };
  return icons[name] || null;
};

const CATEGORIES = ['Web Development', 'Mobile Apps', 'Design & UI/UX', 'Backend / API', 'Data Science', 'Marketing & SEO', 'Content Writing', 'Video & Animation', 'DevOps & Cloud', 'Other'];
const SKILLS_LIST = ['React', 'Node.js', 'Python', 'MongoDB', 'PostgreSQL', 'Figma', 'Vue.js', 'Angular', 'PHP', 'Laravel', 'Django', 'Flutter', 'Swift', 'Kotlin', 'AWS', 'Docker', 'GraphQL', 'TypeScript', 'Next.js', 'WordPress'];

// Maps the display labels shown in the UI to the enum values the backend Job model expects
const EXPERIENCE_MAP = {
  'Entry Level': 'entry',
  'Intermediate': 'intermediate',
  'Expert': 'expert',
};
const DURATION_MAP = {
  'Less than 1 week': 'less-than-1-week',
  '1-2 weeks': '1-4-weeks',
  '1 month': '1-4-weeks',
  '2-3 months': '1-3-months',
  '3-6 months': '3-6-months',
  'More than 6 months': '6-months-plus',
};

const EXPERIENCE = Object.keys(EXPERIENCE_MAP);
const DURATIONS = Object.keys(DURATION_MAP);

const steps = [
  { id: 1, label: 'Job Details',  icon: 'briefcase' },
  { id: 2, label: 'Skills & Budget', icon: 'dollar' },
  { id: 3, label: 'Review & Post', icon: 'tag' },
];

const PostJobPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [skillInput, setSkillInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const templateData = location.state?.templateData || {};

  const [form, setForm] = useState({
    title: templateData.title || '',
    category: templateData.category || '',
    description: templateData.description || '',
    experienceLevel: templateData.category ? 'Intermediate' : '',
    duration: templateData.category ? '1 month' : '',
    skills: templateData.skills || (templateData.category === 'Web Development' ? ['React'] : templateData.category === 'Mobile Apps' ? ['Flutter'] : templateData.category === 'Backend Dev' ? ['Node.js'] : []),
    budgetType: 'fixed',
    budgetMin: '',
    budgetMax: templateData.budget || '',
    deadline: '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const addSkill = (skill) => {
    if (skill && !form.skills.includes(skill)) {
      set('skills', [...form.skills, skill]);
    }
    setSkillInput('');
  };

  const removeSkill = (skill) => set('skills', form.skills.filter(s => s !== skill));

  const canNext = () => {
    if (step === 1) return form.title && form.category && form.description && form.experienceLevel && form.duration;
    if (step === 2) return form.skills.length > 0 && (form.budgetType === 'fixed' ? form.budgetMax : form.budgetMin && form.budgetMax);
    return true;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        skills: form.skills,
        budgetType: form.budgetType,
        // backend stores a single budget number; for hourly we send the max rate
        budget: Number(form.budgetType === 'fixed' ? form.budgetMax : form.budgetMax),
        currency: 'INR',
        experienceLevel: EXPERIENCE_MAP[form.experienceLevel] || 'intermediate',
        duration: DURATION_MAP[form.duration] || undefined,
      };

      await jobAPI.createJob(payload);
      toast.success('Job posted successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={s.shell}>
      {/* Header */}
      <div style={s.topBar}>
        <button onClick={() => navigate('/dashboard')} style={s.backBtn}>
          <Icon name="arrow_left" /> Back to Dashboard
        </button>
        <span style={s.topTitle}>Post a New Job</span>
        <div style={{ width: 140 }} />
      </div>

      <div style={s.body}>
        {/* Stepper */}
        <div style={s.stepper}>
          {steps.map((st, i) => (
            <React.Fragment key={st.id}>
              <div style={s.stepItem}>
                <div style={{
                  ...s.stepCircle,
                  background: step > st.id ? '#2563eb' : step === st.id ? '#2563eb' : '#e5e7eb',
                  color: step >= st.id ? '#fff' : '#9ca3af',
                }}>
                  {step > st.id ? <Icon name="check" /> : st.id}
                </div>
                <div style={{ ...s.stepLabel, color: step >= st.id ? '#111' : '#9ca3af' }}>{st.label}</div>
              </div>
              {i < steps.length - 1 && (
                <div style={{ ...s.stepLine, background: step > st.id ? '#2563eb' : '#e5e7eb' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div style={s.card}>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div>
              <h2 style={s.stepTitle}>Tell us about your job</h2>
              <p style={s.stepSub}>Be specific so freelancers know exactly what you need.</p>

              <div style={s.field}>
                <label style={s.label}>Job Title <span style={s.req}>*</span></label>
                <input
                  style={s.input}
                  placeholder="e.g. Build a React Dashboard with Charts"
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                />
              </div>

              <div style={s.field}>
                <label style={s.label}>Category <span style={s.req}>*</span></label>
                <select style={s.input} value={form.category} onChange={e => set('category', e.target.value)}>
                  <option value="">Select a category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={s.field}>
                <label style={s.label}>Job Description <span style={s.req}>*</span></label>
                <textarea
                  style={{ ...s.input, height: 150, resize: 'vertical' }}
                  placeholder="Describe what you need, deliverables, and any specific requirements..."
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                />
                <div style={s.hint}>{form.description.length}/2000 characters</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={s.field}>
                  <label style={s.label}>Experience Level <span style={s.req}>*</span></label>
                  <select style={s.input} value={form.experienceLevel} onChange={e => set('experienceLevel', e.target.value)}>
                    <option value="">Select level</option>
                    {EXPERIENCE.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Project Duration <span style={s.req}>*</span></label>
                  <select style={s.input} value={form.duration} onChange={e => set('duration', e.target.value)}>
                    <option value="">Select duration</option>
                    {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div>
              <h2 style={s.stepTitle}>Skills & Budget</h2>
              <p style={s.stepSub}>Add required skills and set your budget.</p>

              <div style={s.field}>
                <label style={s.label}>Required Skills <span style={s.req}>*</span></label>
                <div style={s.skillBox}>
                  {form.skills.map(sk => (
                    <span key={sk} style={s.skillTag}>
                      {sk}
                      <button onClick={() => removeSkill(sk)} style={s.skillRemove}><Icon name="x" /></button>
                    </span>
                  ))}
                  <input
                    style={s.skillInput}
                    placeholder="Type a skill and press Enter..."
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addSkill(skillInput.trim())}
                  />
                </div>
                <div style={s.skillSuggestions}>
                  {SKILLS_LIST.filter(sk => !form.skills.includes(sk) && sk.toLowerCase().includes(skillInput.toLowerCase())).slice(0, 8).map(sk => (
                    <button key={sk} onClick={() => addSkill(sk)} style={s.suggestBtn}>
                      <Icon name="plus" /> {sk}
                    </button>
                  ))}
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Budget Type <span style={s.req}>*</span></label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {['fixed', 'hourly'].map(type => (
                    <button
                      key={type}
                      onClick={() => set('budgetType', type)}
                      style={{
                        ...s.typeBtn,
                        ...(form.budgetType === type ? s.typeBtnActive : {}),
                      }}
                    >
                      {type === 'fixed' ? '💰 Fixed Price' : '⏱ Hourly Rate'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {form.budgetType === 'fixed' ? (
                  <div style={{ ...s.field, gridColumn: '1 / -1' }}>
                    <label style={s.label}>Budget Amount (₹) <span style={s.req}>*</span></label>
                    <input style={s.input} type="number" placeholder="e.g. 15000" value={form.budgetMax} onChange={e => set('budgetMax', e.target.value)} />
                  </div>
                ) : (
                  <>
                    <div style={s.field}>
                      <label style={s.label}>Min Rate (₹/hr) <span style={s.req}>*</span></label>
                      <input style={s.input} type="number" placeholder="e.g. 500" value={form.budgetMin} onChange={e => set('budgetMin', e.target.value)} />
                    </div>
                    <div style={s.field}>
                      <label style={s.label}>Max Rate (₹/hr) <span style={s.req}>*</span></label>
                      <input style={s.input} type="number" placeholder="e.g. 1500" value={form.budgetMax} onChange={e => set('budgetMax', e.target.value)} />
                    </div>
                  </>
                )}
              </div>

              <div style={s.field}>
                <label style={s.label}>Application Deadline</label>
                <input style={s.input} type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} min={new Date().toISOString().split('T')[0]} />
              </div>
            </div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <div>
              <h2 style={s.stepTitle}>Review & Post</h2>
              <p style={s.stepSub}>Check everything before posting your job.</p>

              <div style={s.reviewCard}>
                <div style={s.reviewRow}><span style={s.reviewLabel}>Title</span><span style={s.reviewVal}>{form.title}</span></div>
                <div style={s.reviewRow}><span style={s.reviewLabel}>Category</span><span style={s.reviewVal}>{form.category}</span></div>
                <div style={s.reviewRow}><span style={s.reviewLabel}>Experience</span><span style={s.reviewVal}>{form.experienceLevel}</span></div>
                <div style={s.reviewRow}><span style={s.reviewLabel}>Duration</span><span style={s.reviewVal}>{form.duration}</span></div>
                <div style={s.reviewRow}>
                  <span style={s.reviewLabel}>Budget</span>
                  <span style={s.reviewVal}>
                    {form.budgetType === 'fixed'
                      ? `₹${Number(form.budgetMax).toLocaleString()} (Fixed)`
                      : `₹${form.budgetMin}–₹${form.budgetMax}/hr`}
                  </span>
                </div>
                {form.deadline && <div style={s.reviewRow}><span style={s.reviewLabel}>Deadline</span><span style={s.reviewVal}>{new Date(form.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>}
                <div style={{ ...s.reviewRow, flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                  <span style={s.reviewLabel}>Skills Required</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {form.skills.map(sk => <span key={sk} style={s.skillTag}>{sk}</span>)}
                  </div>
                </div>
                <div style={{ ...s.reviewRow, flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
                  <span style={s.reviewLabel}>Description</span>
                  <p style={{ fontSize: 13.5, color: '#525252', lineHeight: 1.6, margin: 0 }}>{form.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={s.navRow}>
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} style={s.prevBtn}>
                <Icon name="arrow_left" /> Previous
              </button>
            )}
            <div style={{ flex: 1 }} />
            {step < 3 ? (
              <button onClick={() => canNext() && setStep(s => s + 1)} style={{ ...s.nextBtn, opacity: canNext() ? 1 : 0.5 }}>
                Next <Icon name="arrow_right" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={isSubmitting} style={s.submitBtn}>
                {isSubmitting ? 'Posting…' : '🚀 Post Job'}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`* { box-sizing: border-box; } button { cursor: pointer; }`}</style>
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  shell:      { minHeight: '100vh', background: '#f8faff', fontFamily: "'DM Sans', sans-serif" },
  topBar:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', background: '#fff', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, zIndex: 10 },
  backBtn:    { display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#737373', fontSize: 13.5, fontWeight: 500 },
  topTitle:   { fontSize: 15, fontWeight: 600, color: '#111' },
  body:       { maxWidth: 720, margin: '0 auto', padding: '32px 16px' },

  stepper:    { display: 'flex', alignItems: 'center', marginBottom: 32 },
  stepItem:   { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  stepCircle: { width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, transition: 'all .3s' },
  stepLabel:  { fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', transition: 'color .3s' },
  stepLine:   { flex: 1, height: 2, margin: '0 8px', marginBottom: 22, transition: 'background .3s' },

  card:       { background: '#fff', borderRadius: 16, padding: 32, border: '1px solid #f0f0f0', boxShadow: '0 1px 3px rgba(0,0,0,.04)' },
  stepTitle:  { fontSize: 20, fontWeight: 600, color: '#111', margin: '0 0 6px' },
  stepSub:    { fontSize: 13.5, color: '#a3a3a3', margin: '0 0 28px' },

  field:      { marginBottom: 20 },
  label:      { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 },
  req:        { color: '#ef4444' },
  input:      { width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, color: '#111', outline: 'none', background: '#fff', fontFamily: 'inherit' },
  hint:       { fontSize: 11.5, color: '#a3a3a3', marginTop: 4, textAlign: 'right' },

  skillBox:   { display: 'flex', flexWrap: 'wrap', gap: 8, padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, minHeight: 48, alignItems: 'center' },
  skillTag:   { display: 'flex', alignItems: 'center', gap: 4, background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: 99, fontSize: 12.5, fontWeight: 500 },
  skillRemove:{ background: 'none', border: 'none', color: '#2563eb', padding: 0, display: 'flex', alignItems: 'center' },
  skillInput: { border: 'none', outline: 'none', fontSize: 13.5, flex: 1, minWidth: 120, color: '#111', fontFamily: 'inherit' },
  skillSuggestions: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  suggestBtn: { display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', border: '1px solid #e5e7eb', borderRadius: 99, background: '#fafafa', color: '#525252', fontSize: 12, fontWeight: 500 },

  typeBtn:      { flex: 1, padding: '12px', border: '1.5px solid #e5e7eb', borderRadius: 8, background: '#fff', fontSize: 14, fontWeight: 500, color: '#525252' },
  typeBtnActive:{ border: '1.5px solid #2563eb', background: '#eff6ff', color: '#2563eb' },

  reviewCard: { background: '#fafafa', borderRadius: 12, border: '1px solid #f0f0f0', overflow: 'hidden' },
  reviewRow:  { display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', borderBottom: '1px solid #f0f0f0' },
  reviewLabel:{ fontSize: 12.5, color: '#a3a3a3', fontWeight: 600, minWidth: 100, textTransform: 'uppercase', letterSpacing: '.04em' },
  reviewVal:  { fontSize: 14, color: '#111', fontWeight: 500 },

  navRow:   { display: 'flex', alignItems: 'center', marginTop: 28, paddingTop: 20, borderTop: '1px solid #f0f0f0' },
  prevBtn:  { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', border: '1.5px solid #e5e7eb', borderRadius: 8, background: '#fff', color: '#525252', fontSize: 14, fontWeight: 500 },
  nextBtn:  { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600 },
  submitBtn:{ padding: '10px 28px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600 },
};

export default PostJobPage;
