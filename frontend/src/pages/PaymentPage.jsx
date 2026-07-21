import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = ({ name }) => {
  const icons = {
    back:    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>,
    lock:    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    check:   <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
    rupee:   <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    shield:  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    card:    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    globe:   <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  };
  return icons[name] || null;
};

const ESCROW_STEPS = [
  { icon: '💳', title: 'Client Pays', desc: 'Amount held securely in escrow' },
  { icon: '🔒', title: 'Work in Progress', desc: 'Freelancer completes the job' },
  { icon: '✅', title: 'Job Approved', desc: 'Client reviews and approves' },
  { icon: '💸', title: 'Payment Released', desc: 'Freelancer receives payment' },
];

const PaymentPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useAuth();
  const [gateway, setGateway] = useState('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  const styles = {
    ...s,
    shell: { ...s.shell, background: isDarkMode ? '#071622' : s.shell.background },
    topBar: { ...s.topBar, background: isDarkMode ? '#071422' : s.topBar.background, borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.03)' : s.topBar.borderBottom },
    body: { ...s.body, color: isDarkMode ? '#e6eef8' : undefined },
    card: { ...s.card, background: isDarkMode ? '#071422' : s.card.background, border: isDarkMode ? '1px solid rgba(255,255,255,0.03)' : s.card.border },
    escrowBanner: { ...s.escrowBanner, background: isDarkMode ? '#0b2b21' : s.escrowBanner.background, border: isDarkMode ? '1px solid rgba(255,255,255,0.03)' : s.escrowBanner.border },
    grid: { ...s.grid },
    summary: { ...s.summary, background: isDarkMode ? '#071422' : s.summary?.background },
    payBtn: { ...s.payBtn, background: isDarkMode ? '#10b981' : s.payBtn?.background },
  };

  // Mock job data — in production, comes from props/API
  const job = {
    title: 'React Dashboard UI',
    freelancer: 'Arjun Sharma',
    amount: 15000,
    platformFee: 1500, // 10%
    total: 16500,
  };

  const handleRazorpay = async () => {
    setIsProcessing(true);
    try {
      // 1. Create order from backend
      // const { data } = await api.post('/payment/razorpay/order', { amount: job.total, jobId: '...', freelancerId: '...' });

      // Mock Razorpay flow
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_xxxx',
        amount: job.total * 100,
        currency: 'INR',
        name: 'FreelanceMarket',
        description: `Payment for: ${job.title}`,
        // order_id: data.data.orderId,
        handler: (response) => {
          // Verify payment
          toast.success('Payment successful! Amount held in escrow.');
          setPaymentDone(true);
        },
        prefill: { name: 'Client Name', email: 'client@email.com' },
        theme: { color: '#2563eb' },
      };

      // In production: const rzp = new window.Razorpay(options); rzp.open();
      // Demo ke liye:
      await new Promise(r => setTimeout(r, 1500));
      toast.success('Payment of ₹' + job.total.toLocaleString() + ' held in escrow!');
      setPaymentDone(true);
    } catch {
      toast.error('Payment failed. Try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStripe = async () => {
    setIsProcessing(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      toast.success('Payment of $' + (job.total / 83).toFixed(0) + ' held in escrow!');
      setPaymentDone(true);
    } catch {
      toast.error('Payment failed. Try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePay = () => {
    if (gateway === 'razorpay') handleRazorpay();
    else handleStripe();
  };

  if (paymentDone) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8faff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: 48, textAlign: 'center', border: '1px solid #f0f0f0', maxWidth: 480, width: '100%' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 36 }}>✅</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 8 }}>Payment Successful!</h2>
          <p style={{ fontSize: 14, color: '#737373', marginBottom: 24 }}>
            ₹{job.total.toLocaleString()} is safely held in escrow.<br/>
            Freelancer will be paid once you approve the work.
          </p>
          <div style={{ background: '#f0fdf4', borderRadius: 10, padding: 16, marginBottom: 24, textAlign: 'left' }}>
            <div style={{ fontSize: 12.5, color: '#15803d', fontWeight: 600, marginBottom: 8 }}>ESCROW STATUS</div>
            <div style={{ fontSize: 13.5, color: '#111' }}>🔒 Amount locked: ₹{job.total.toLocaleString()}</div>
            <div style={{ fontSize: 13, color: '#737373', marginTop: 4 }}>Will be released when you approve the job</div>
          </div>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 28px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.shell}>
      {/* Top Bar */}
      <div style={styles.topBar}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}><Icon name="back" /> Back</button>
        <span style={styles.topTitle}>Secure Payment</span>
        <div style={styles.secureTag}><Icon name="lock" /> SSL Secured</div>
      </div>

      <div style={styles.body}>
        <div style={styles.grid}>

          {/* Left: Payment Form */}
          <div>
            {/* Escrow Explanation */}
            <div style={styles.escrowBanner}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Icon name="shield" />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#15803d' }}>Protected by Escrow</span>
              </div>
              <div style={styles.escrowSteps}>
                {ESCROW_STEPS.map((step, i) => (
                  <div key={i} style={styles.escrowStep}>
                    <div style={styles.escrowIcon}>{step.icon}</div>
                    <div style={styles.escrowStepTitle}>{step.title}</div>
                    <div style={styles.escrowStepDesc}>{step.desc}</div>
                    {i < ESCROW_STEPS.length - 1 && <div style={styles.escrowArrow}>→</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Gateway Selection */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Choose Payment Method</h3>
              <div style={styles.gatewayGrid}>
                <button
                  onClick={() => setGateway('razorpay')}
                  style={{ ...s.gatewayBtn, ...(gateway === 'razorpay' ? s.gatewayActive : {}) }}
                >
                  <div style={styles.gatewayIcon}>₹</div>
                  <div>
                    <div style={styles.gatewayName}>Razorpay</div>
                    <div style={styles.gatewaySub}>UPI, Cards, NetBanking</div>
                  </div>
                  {gateway === 'razorpay' && <span style={styles.selectedDot} />}
                </button>

                <button
                  onClick={() => setGateway('stripe')}
                  style={{ ...styles.gatewayBtn, ...(gateway === 'stripe' ? styles.gatewayActive : {}) }}
                >
                  <div style={{ ...styles.gatewayIcon, background: '#635bff15', color: '#635bff' }}>$</div>
                  <div>
                    <div style={styles.gatewayName}>Stripe</div>
                    <div style={styles.gatewaySub}>International Cards</div>
                  </div>
                  {gateway === 'stripe' && <span style={styles.selectedDot} />}
                </button>
              </div>

              {/* Razorpay Form */}
              {gateway === 'razorpay' && (
                <div style={styles.formSection}>
                  <div style={styles.methodTabs}>
                    {['UPI', 'Card', 'NetBanking', 'Wallet'].map(m => (
                      <button key={m} style={styles.methodTab}>{m}</button>
                    ))}
                  </div>
                  <div style={styles.upiBox}>
                    <input style={styles.upiInput} placeholder="Enter UPI ID (e.g. name@upi)" />
                    <button style={styles.verifyBtn}>Verify</button>
                  </div>
                  <p style={{ fontSize: 12, color: isDarkMode ? '#9aa3b3' : '#a3a3a3', marginTop: 8 }}>Or pay via Card / NetBanking after clicking Pay</p>
                </div>
              )}

              {/* Stripe Form */}
              {gateway === 'stripe' && (
                <div style={styles.formSection}>
                  <div style={styles.field}>
                    <label style={styles.label}>Card Number</label>
                    <div style={styles.cardInput}>
                      <input style={{ ...styles.input, flex: 1 }} placeholder="4242 4242 4242 4242" />
                      <Icon name="card" />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={styles.field}>
                      <label style={styles.label}>Expiry</label>
                      <input style={styles.input} placeholder="MM / YY" />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>CVV</label>
                      <input style={styles.input} placeholder="•••" type="password" />
                    </div>
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Name on Card</label>
                    <input style={styles.input} placeholder="John Doe" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div>
            <div style={styles.summary}>
              <h3 style={styles.cardTitle}>Order Summary</h3>

              <div style={styles.jobCard}>
                <div style={styles.jobTitle}>{job.title}</div>
                <div style={styles.jobFreelancer}>👨‍💻 {job.freelancer}</div>
              </div>

              <div style={styles.summaryRows}>
                <div style={styles.summaryRow}>
                  <span>Project Amount</span>
                  <span>₹{job.amount.toLocaleString()}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span>Platform Fee (10%)</span>
                  <span>₹{job.platformFee.toLocaleString()}</span>
                </div>
                <div style={{ ...styles.summaryRow, ...styles.totalRow }}>
                  <span>Total</span>
                  <span>₹{job.total.toLocaleString()}</span>
                </div>
                {gateway === 'stripe' && (
                  <div style={{ ...s.summaryRow, color: '#737373', fontSize: 12 }}>
                    <span>≈ USD</span>
                    <span>${(job.total / 83).toFixed(0)}</span>
                  </div>
                )}
              </div>

              <div style={styles.escrowNote}>
                🔒 Your payment is held in escrow until you approve the completed work.
              </div>

              <button
                onClick={handlePay}
                disabled={isProcessing}
                style={{ ...styles.payBtn, opacity: isProcessing ? 0.8 : 1 }}
              >
                {isProcessing ? '⏳ Processing…' : `Pay ₹${job.total.toLocaleString()} Securely`}
              </button>

              <div style={styles.trustRow}>
                <span style={styles.trustItem}><Icon name="shield" /> Escrow Protected</span>
                <span style={styles.trustItem}><Icon name="lock" /> SSL Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`* { box-sizing: border-box; } button { cursor: pointer; }`}</style>
    </div>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = {
  shell:       { minHeight: '100vh', background: '#f8faff', fontFamily: "'DM Sans', sans-serif" },
  topBar:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', background: '#fff', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, zIndex: 10 },
  backBtn:     { display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#737373', fontSize: 13.5, fontWeight: 500 },
  topTitle:    { fontSize: 15, fontWeight: 600, color: '#111' },
  secureTag:   { display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#15803d', fontWeight: 500 },
  body:        { maxWidth: 960, margin: '0 auto', padding: '28px 16px' },
  grid:        { display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 },

  escrowBanner:{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '16px 20px', marginBottom: 16 },
  escrowSteps: { display: 'flex', alignItems: 'flex-start', gap: 4, position: 'relative' },
  escrowStep:  { flex: 1, textAlign: 'center', position: 'relative' },
  escrowIcon:  { fontSize: 20, marginBottom: 4 },
  escrowStepTitle: { fontSize: 11.5, fontWeight: 600, color: '#15803d', marginBottom: 2 },
  escrowStepDesc:  { fontSize: 10.5, color: '#737373', lineHeight: 1.3 },
  escrowArrow: { position: 'absolute', right: -8, top: 8, fontSize: 14, color: '#16a34a' },

  card:        { background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #f0f0f0', marginBottom: 16 },
  cardTitle:   { fontSize: 15, fontWeight: 600, color: '#111', margin: '0 0 16px' },

  gatewayGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 },
  gatewayBtn:  { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: '1.5px solid #e5e7eb', borderRadius: 10, background: '#fff', textAlign: 'left', position: 'relative' },
  gatewayActive:{ borderColor: '#2563eb', background: '#f8faff' },
  gatewayIcon: { width: 36, height: 36, borderRadius: 8, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0 },
  gatewayName: { fontSize: 13.5, fontWeight: 600, color: '#111', marginBottom: 2 },
  gatewaySub:  { fontSize: 11.5, color: '#a3a3a3' },
  selectedDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: '50%', background: '#2563eb' },

  formSection: { borderTop: '1px solid #f0f0f0', paddingTop: 16 },
  methodTabs:  { display: 'flex', gap: 8, marginBottom: 16 },
  methodTab:   { padding: '6px 14px', border: '1px solid #e5e7eb', borderRadius: 99, background: '#fff', fontSize: 12.5, fontWeight: 500, color: '#525252' },
  upiBox:      { display: 'flex', gap: 8 },
  upiInput:    { flex: 1, padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit' },
  verifyBtn:   { padding: '10px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600 },
  field:       { marginBottom: 14 },
  label:       { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' },
  input:       { width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, color: '#111', outline: 'none', fontFamily: 'inherit' },
  cardInput:   { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8 },

  summary:     { background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #f0f0f0', position: 'sticky', top: 80 },
  jobCard:     { background: '#f8faff', borderRadius: 8, padding: '12px 14px', marginBottom: 16 },
  jobTitle:    { fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 4 },
  jobFreelancer:{ fontSize: 13, color: '#737373' },
  summaryRows: { marginBottom: 16 },
  summaryRow:  { display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: '#525252', padding: '8px 0', borderBottom: '1px solid #f5f5f5' },
  totalRow:    { fontWeight: 700, color: '#111', fontSize: 15, borderBottom: 'none', paddingTop: 12 },
  escrowNote:  { background: '#fefce8', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 12px', fontSize: 12.5, color: '#854d0e', marginBottom: 16, lineHeight: 1.5 },
  payBtn:      { width: '100%', padding: '14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, marginBottom: 14 },
  trustRow:    { display: 'flex', justifyContent: 'center', gap: 16 },
  trustItem:   { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#a3a3a3' },
};

export default PaymentPage;
