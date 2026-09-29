import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { jobAPI, profileAPI } from '../../api';

const SubHireModal = ({ job, onClose, isDarkMode, onSuccess }) => {
  const [freelancers, setFreelancers] = useState([]);
  const [selectedFreelancerId, setSelectedFreelancerId] = useState('');
  const [role, setRole] = useState('Sub-Collaborator / Developer');
  const [splitPercentage, setSplitPercentage] = useState(30);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFreelancers();
  }, []);

  const fetchFreelancers = async () => {
    try {
      const res = await profileAPI.getFreelancersList();
      const list = res.data?.data || res.data || [];
      setFreelancers(list);
      if (list.length > 0) setSelectedFreelancerId(list[0]._id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFreelancerId || !role.trim() || !splitPercentage) {
      toast.error('Please fill all fields!');
      return;
    }
    setSubmitting(true);
    try {
      await jobAPI.inviteSubHire(job._id, {
        freelancerId: selectedFreelancerId,
        role: role.trim(),
        splitPercentage: Number(splitPercentage),
      });
      toast.success('Sub-hire team member added! Escrow payment will auto-split upon release.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add sub-hire.');
    } finally {
      setSubmitting(false);
    }
  };

  const themeBg = isDarkMode ? '#0b1d30' : '#ffffff';
  const themeText = isDarkMode ? '#e2e8f0' : '#0f172a';
  const themeBorder = isDarkMode ? 'rgba(255,255,255,0.08)' : '#cbd5e1';

  const leadPct = 100 - Number(splitPercentage);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'grid', placeItems: 'center', zIndex: 999, padding: 16 }} onClick={onClose}>
      <div style={{ background: themeBg, borderRadius: 16, width: 480, maxWidth: '100%', padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', border: `1px solid ${themeBorder}` }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: themeText, display: 'flex', alignItems: 'center', gap: 8 }}>
            👥 Sub-Hire / Team Split Invite
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, color: '#94a3b8', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ fontSize: 12.5, color: isDarkMode ? '#94a3b8' : '#64748b', marginBottom: 16, lineHeight: 1.5 }}>
          Invite a co-freelancer to collaborate on <strong>{job.title}</strong> without an agency account. When escrow funds are released, platform automatically splits payout!
        </div>

        {/* Select Co-Freelancer */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: isDarkMode ? '#cbd5e1' : '#475569', textTransform: 'uppercase', marginBottom: 4 }}>Select Teammate / Freelancer</label>
          <select value={selectedFreelancerId} onChange={e => setSelectedFreelancerId(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: `1px solid ${themeBorder}`, borderRadius: 8, fontSize: 13, background: isDarkMode ? '#071622' : '#fff', color: themeText }}>
            {freelancers.map(f => (
              <option key={f._id} value={f._id}>
                {f.firstName} {f.lastName} ({f.freelancerProfile?.title || 'Freelancer'})
              </option>
            ))}
          </select>
        </div>

        {/* Assigned Role */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: isDarkMode ? '#cbd5e1' : '#475569', textTransform: 'uppercase', marginBottom: 4 }}>Assigned Role / Component</label>
          <input
            type="text"
            placeholder="e.g. Backend API Developer, UI Designer, QA Engineer"
            value={role}
            onChange={e => setRole(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', border: `1px solid ${themeBorder}`, borderRadius: 8, fontSize: 13, background: isDarkMode ? '#071622' : '#fff', color: themeText }}
          />
        </div>

        {/* Split Percentage Slider */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: themeText, marginBottom: 6 }}>
            <span>Teammate Split Payout: {splitPercentage}%</span>
            <span>Your Lead Share: {leadPct}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="70"
            value={splitPercentage}
            onChange={e => setSplitPercentage(e.target.value)}
            style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
          />
          <div style={{ background: isDarkMode ? '#071622' : '#f1f5f9', padding: 10, borderRadius: 8, fontSize: 12, color: themeText, marginTop: 8 }}>
            💡 On a ₹{job.budget?.toLocaleString() || '20,000'} milestone release: You receive <strong>₹{Math.round(((job.budget || 20000) * leadPct) / 100).toLocaleString()}</strong> and teammate receives <strong>₹{Math.round(((job.budget || 20000) * splitPercentage) / 100).toLocaleString()}</strong> automatically!
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ padding: '9px 18px', border: `1px solid ${themeBorder}`, borderRadius: 8, background: 'transparent', color: themeText, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} style={{ padding: '9px 20px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            {submitting ? 'Adding...' : 'Add Team Sub-Hire'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubHireModal;
