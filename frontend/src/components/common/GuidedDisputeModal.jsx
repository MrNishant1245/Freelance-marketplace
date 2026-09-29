import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { disputeAPI } from '../../api';

const GuidedDisputeModal = ({ job, onClose, isDarkMode, currentUser, onRefresh }) => {
  const [step, setStep] = useState(1);
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('Scope Disagreement / Milestone Quality');
  const [statementText, setStatementText] = useState('');
  const [desiredResolution, setDesiredResolution] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  useEffect(() => {
    fetchDispute();
  }, [job._id]);

  const fetchDispute = async () => {
    try {
      const res = await disputeAPI.getJobDispute(job._id);
      if (res.data?.data) {
        setDispute(res.data.data);
        if (res.data.data.status === 'ai_proposed') setStep(2);
        else if (res.data.data.status === 'settled_by_ai' || res.data.data.status === 'resolved_by_admin') setStep(3);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInitDispute = async () => {
    if (!statementText.trim()) {
      toast.error('Please enter your position statement!');
      return;
    }
    setSubmitting(true);
    try {
      const res = await disputeAPI.createDispute({
        jobId: job._id,
        reason,
        statementText: statementText.trim(),
        desiredResolution: desiredResolution.trim() || 'Fair 50/50 resolution',
      });
      setDispute(res.data.data);
      toast.success('Dispute position registered! Generating AI Neutral Proposal...');
      setStep(2);
      handleGenerateAI(res.data.data._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate dispute.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateAI = async (dId) => {
    const targetId = dId || dispute?._id;
    if (!targetId) return;
    setAiGenerating(true);
    try {
      const res = await disputeAPI.generateAIDisputeMediation(targetId);
      setDispute(res.data.data);
      toast.success('AI Neutral Settlement proposal generated!');
    } catch (err) {
      toast.error('Failed to generate AI mediation.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleAcceptAI = async () => {
    if (!dispute?._id) return;
    setSubmitting(true);
    try {
      const res = await disputeAPI.acceptAIDisputeSettlement(dispute._id);
      setDispute(res.data.data);
      toast.success('AI Settlement Accepted! Escrow funds disbursed according to agreed split.');
      setStep(3);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept settlement.');
    } finally {
      setSubmitting(false);
    }
  };

  const themeBg = isDarkMode ? '#0b1d30' : '#ffffff';
  const themeCardBg = isDarkMode ? '#071622' : '#f8fafc';
  const themeText = isDarkMode ? '#e2e8f0' : '#0f172a';
  const themeBorder = isDarkMode ? 'rgba(255,255,255,0.08)' : '#cbd5e1';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'grid', placeItems: 'center', zIndex: 999, padding: 16 }} onClick={onClose}>
      <div style={{ background: themeBg, borderRadius: 16, width: 560, maxWidth: '100%', padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', border: `1px solid ${themeBorder}`, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: themeText, display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚖️ Guided Dispute Mediation
              <span style={{ fontSize: 11, background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>3-Step Flow</span>
            </div>
            <div style={{ fontSize: 12, color: isDarkMode ? '#94a3b8' : '#64748b', marginTop: 2 }}>{job.title}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, color: '#94a3b8', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Stepper Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20, textAlign: 'center' }}>
          <div style={{ padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: step === 1 ? '#2563eb' : isDarkMode ? '#1e293b' : '#e2e8f0', color: step === 1 ? '#fff' : themeText }}>
            1. Positions & Evidence
          </div>
          <div style={{ padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: step === 2 ? '#2563eb' : isDarkMode ? '#1e293b' : '#e2e8f0', color: step === 2 ? '#fff' : themeText }}>
            2. AI Settlement Draft
          </div>
          <div style={{ padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: step === 3 ? '#10b981' : isDarkMode ? '#1e293b' : '#e2e8f0', color: step === 3 ? '#fff' : themeText }}>
            3. Final Resolution
          </div>
        </div>

        {/* STEP 1: Positions & Evidence */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: isDarkMode ? '#cbd5e1' : '#475569', textTransform: 'uppercase', marginBottom: 4 }}>Dispute Reason</label>
              <select value={reason} onChange={e => setReason(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: `1px solid ${themeBorder}`, borderRadius: 8, fontSize: 13, background: isDarkMode ? '#071622' : '#fff', color: themeText }}>
                <option value="Scope Disagreement / Milestone Quality">Scope Disagreement / Milestone Quality</option>
                <option value="Incomplete Deliverables">Incomplete Deliverables</option>
                <option value="Unresponsive Counterparty">Unresponsive Counterparty</option>
                <option value="Payment / Escrow Amount Dispute">Payment / Escrow Amount Dispute</option>
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: isDarkMode ? '#cbd5e1' : '#475569', textTransform: 'uppercase', marginBottom: 4 }}>Your Position Statement</label>
              <textarea
                rows={4}
                placeholder="State your side of the dispute clearly. Mention what was delivered, work completed, or gaps identified..."
                value={statementText}
                onChange={e => setStatementText(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: `1px solid ${themeBorder}`, borderRadius: 8, fontSize: 13, background: isDarkMode ? '#071622' : '#fff', color: themeText, resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: isDarkMode ? '#cbd5e1' : '#475569', textTransform: 'uppercase', marginBottom: 4 }}>Desired Resolution</label>
              <input
                type="text"
                placeholder="e.g. 70% payout for delivered API code, 30% refund for incomplete UI"
                value={desiredResolution}
                onChange={e => setDesiredResolution(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: `1px solid ${themeBorder}`, borderRadius: 8, fontSize: 13, background: isDarkMode ? '#071622' : '#fff', color: themeText }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={onClose} style={{ padding: '9px 18px', border: `1px solid ${themeBorder}`, borderRadius: 8, background: 'transparent', color: themeText, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleInitDispute} disabled={submitting} style={{ padding: '9px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                {submitting ? 'Submitting...' : 'Submit Statement & Proceed'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: AI Settlement Proposal */}
        {step === 2 && (
          <div>
            {aiGenerating ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: themeText, fontSize: 14 }}>
                🤖 Analyzing position statements, build logs, and contract milestones...
              </div>
            ) : dispute?.aiMediation ? (
              <div>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: 16, borderRadius: 12, marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1e40af', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    🤖 AI Neutral Settlement Proposal
                  </div>
                  <div style={{ fontSize: 13, color: '#1e3a8a', lineHeight: 1.5, marginBottom: 12 }}>
                    {dispute.aiMediation.neutralSummary}
                  </div>

                  {/* Payout vs Refund Split Bar */}
                  <div style={{ background: '#dbeafe', borderRadius: 8, padding: 12, marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 700, color: '#1e40af', marginBottom: 6 }}>
                      <span>Freelancer Payout: {dispute.aiMediation.recommendedPayoutPct}%</span>
                      <span>Client Refund: {dispute.aiMediation.recommendedRefundPct}%</span>
                    </div>
                    <div style={{ height: 10, background: '#cbd5e1', borderRadius: 99, overflow: 'hidden', display: 'flex' }}>
                      <div style={{ width: `${dispute.aiMediation.recommendedPayoutPct}%`, background: '#10b981' }} />
                      <div style={{ width: `${dispute.aiMediation.recommendedRefundPct}%`, background: '#f59e0b' }} />
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: '#475569', fontStyle: 'italic' }}>
                    {dispute.aiMediation.reasoning}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    onClick={handleAcceptAI}
                    disabled={submitting}
                    style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    🤝 Accept AI Settlement (1-Click Mutual Resolution)
                  </button>
                  <button
                    onClick={() => { setStep(3); toast.success('Dispute escalated to Admin Dashboard for final binding decision.'); }}
                    style={{ width: '100%', padding: '10px', background: 'transparent', border: `1px solid ${themeBorder}`, color: themeText, borderRadius: 8, fontSize: 12.5, cursor: 'pointer' }}
                  >
                    🏛️ Disagree & Escalate to Admin Review
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* STEP 3: Final Resolution */}
        {step === 3 && (
          <div>
            <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', padding: 20, borderRadius: 12, textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#047857', marginBottom: 4 }}>
                {dispute?.status === 'settled_by_ai' ? 'Dispute Settled via AI Mediation!' : 'Escalated to Admin Dashboard'}
              </div>
              <div style={{ fontSize: 13, color: '#065f46', lineHeight: 1.5 }}>
                {dispute?.status === 'settled_by_ai'
                  ? `Payout of ₹${(dispute.finalDecision?.payoutAmount || 0).toLocaleString()} released to Freelancer and ₹${(dispute.finalDecision?.refundAmount || 0).toLocaleString()} refunded to Client.`
                  : 'Your statements & build logs have been submitted to the Admin Resolution Panel. Final binding verdict will be issued within 24 hours.'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button onClick={onClose} style={{ padding: '9px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Close Modal</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuidedDisputeModal;
