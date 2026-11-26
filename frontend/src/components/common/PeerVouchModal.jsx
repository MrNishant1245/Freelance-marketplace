import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { vouchAPI } from '../../api';

const PeerVouchModal = ({ onClose, isDarkMode, onSuccess }) => {
  const [skill, setSkill] = useState('React');
  const [workSampleUrl, setWorkSampleUrl] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const SKILLS_LIST = ['React', 'Node.js', 'Python', 'MongoDB', 'PostgreSQL', 'Figma', 'Flutter', 'Swift', 'AWS', 'TypeScript', 'Next.js'];

  const handleSubmit = async () => {
    if (!skill || !workSampleUrl.trim() || !description.trim()) {
      toast.error('Please fill all fields to request a peer vouch!');
      return;
    }
    setSubmitting(true);
    try {
      await vouchAPI.requestSkillVouch({ skill, workSampleUrl, description });
      toast.success(`Peer Vouch request submitted for "${skill}"! Routed to 2 top-rated community peers.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit peer vouch request.');
    } finally {
      setSubmitting(false);
    }
  };

  const themeBg = isDarkMode ? '#0b1d30' : '#ffffff';
  const themeText = isDarkMode ? '#e2e8f0' : '#0f172a';
  const themeBorder = isDarkMode ? 'rgba(255,255,255,0.08)' : '#cbd5e1';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'grid', placeItems: 'center', zIndex: 999, padding: 16 }} onClick={onClose}>
      <div style={{ background: themeBg, borderRadius: 16, width: 480, maxWidth: '100%', padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', border: `1px solid ${themeBorder}` }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: themeText, display: 'flex', alignItems: 'center', gap: 8 }}>
            🛡️ Peer-Vouched Skill Badge Request
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, color: '#94a3b8', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ fontSize: 12.5, color: isDarkMode ? '#94a3b8' : '#64748b', marginBottom: 16, lineHeight: 1.5 }}>
          Instead of paid quizzes, submit a real code repository or portfolio work sample. 2 top-rated community peers will review your work to verify your <strong>Peer-Vouched Skill Badge</strong>!
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: isDarkMode ? '#cbd5e1' : '#475569', textTransform: 'uppercase', marginBottom: 4 }}>Target Skill</label>
          <select value={skill} onChange={e => setSkill(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: `1px solid ${themeBorder}`, borderRadius: 8, fontSize: 13.5, background: isDarkMode ? '#071622' : '#fff', color: themeText }}>
            {SKILLS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: isDarkMode ? '#cbd5e1' : '#475569', textTransform: 'uppercase', marginBottom: 4 }}>Work Sample / Code Repo URL</label>
          <input
            type="url"
            placeholder="e.g. https://github.com/username/react-dashboard-demo"
            value={workSampleUrl}
            onChange={e => setWorkSampleUrl(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', border: `1px solid ${themeBorder}`, borderRadius: 8, fontSize: 13, background: isDarkMode ? '#071622' : '#fff', color: themeText }}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: isDarkMode ? '#cbd5e1' : '#475569', textTransform: 'uppercase', marginBottom: 4 }}>Implementation Description & Context</label>
          <textarea
            rows={4}
            placeholder="Briefly explain what you built, architecture choices, and components to help peer reviewers evaluate your work..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', border: `1px solid ${themeBorder}`, borderRadius: 8, fontSize: 13, background: isDarkMode ? '#071622' : '#fff', color: themeText, resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ padding: '9px 18px', border: `1px solid ${themeBorder}`, borderRadius: 8, background: 'transparent', color: themeText, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} style={{ padding: '9px 20px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            {submitting ? 'Submitting...' : 'Request Peer Vouch'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PeerVouchModal;
