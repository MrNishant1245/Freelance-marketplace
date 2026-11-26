import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatAmount = (n) =>
  n != null ? `₹${Number(n).toLocaleString('en-IN')}` : '—';

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    bg: '#f5f5f5', color: '#737373', dot: '#a3a3a3' },
  paid:       { label: 'Paid',       bg: '#eff6ff', color: '#1d4ed8', dot: '#2563eb' },
  in_escrow:  { label: 'In Escrow',  bg: '#fefce8', color: '#854d0e', dot: '#d97706' },
  released:   { label: 'Released',   bg: '#f0fdf4', color: '#15803d', dot: '#16a34a' },
  refunded:   { label: 'Refunded',   bg: '#fef2f2', color: '#dc2626', dot: '#ef4444' },
  failed:     { label: 'Failed',     bg: '#fef2f2', color: '#dc2626', dot: '#ef4444' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 99,
      background: cfg.bg, color: cfg.color,
      fontSize: 12, fontWeight: 600,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot }} />
      {cfg.label}
    </span>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, color }) => (
  <div style={styles.statCard}>
    <div style={{ ...styles.statIcon, background: color + '18', color }}>{icon}</div>
    <div style={styles.statValue}>{value}</div>
    <div style={styles.statLabel}>{label}</div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const PaymentHistory = () => {
  const { user, isDarkMode } = useAuth();
  const navigate = useNavigate();

  const isFreelancer = user?.role === 'freelancer';
  const role         = isFreelancer ? 'freelancer' : 'client';

  const [transactions, setTransactions] = useState([]);
  const [stats, setStats]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected]         = useState(null); // detail modal

  const fetchHistory = async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/payment/history?role=${role}&page=${p}&limit=10`);
      const { transactions: txns, pagination, stats: s } = res.data.data;
      setTransactions(txns);
      setStats(s);
      setTotalPages(pagination.pages || 1);
      setPage(p);
    } catch (err) {
      setError('Payment history load nahi ho saki. Dobara try karo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(1); }, []);

  const filtered = statusFilter === 'all'
    ? transactions
    : transactions.filter((t) => t.status === statusFilter);

  const dashboardPath = isFreelancer ? '/freelancer/dashboard' : '/dashboard';
  const accentColor   = isFreelancer ? '#16a34a' : '#2563eb';

  const styles = {
    ...s,
    shell: { ...s.shell, background: isDarkMode ? '#071622' : s.shell.background },
    topBar: { ...s.topBar, background: isDarkMode ? '#071422' : s.topBar.background, borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.03)' : s.topBar.borderBottom },
    pageTitle: { ...s.pageTitle, color: isDarkMode ? '#e6eef8' : s.pageTitle.color },
    statCard: { ...s.statCard, background: isDarkMode ? '#071422' : s.statCard.background, border: isDarkMode ? '1px solid rgba(255,255,255,0.03)' : s.statCard.border },
    card: { ...s.card, background: isDarkMode ? '#071422' : s.card.background, border: isDarkMode ? '1px solid rgba(255,255,255,0.03)' : s.card.border },
    tableHeader: { ...s.tableHeader, background: isDarkMode ? '#071422' : s.tableHeader.background, borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.03)' : s.tableHeader.borderBottom, color: isDarkMode ? '#9aa3b3' : s.tableHeader.color },
    tableRow: { ...s.tableRow, borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.03)' : s.tableRow.borderBottom },
    filterBtn: { ...s.filterBtn, background: isDarkMode ? '#071422' : s.filterBtn.background, color: isDarkMode ? '#9aa3b3' : s.filterBtn.color, border: isDarkMode ? '1.5px solid rgba(255,255,255,0.03)' : s.filterBtn.border },
    pageBtn: { ...s.pageBtn, background: isDarkMode ? '#071422' : s.pageBtn.background, border: isDarkMode ? '1.5px solid rgba(255,255,255,0.03)' : s.pageBtn.border, color: isDarkMode ? '#9aa3b3' : s.pageBtn.color },
    modal: { ...s.modal, background: isDarkMode ? '#071422' : s.modal.background, border: isDarkMode ? '1px solid rgba(255,255,255,0.03)' : s.modal.border },
  };

  return (
    <div style={styles.shell}>

      {/* ── Header ── */}
      <div style={styles.topBar}>
        <button onClick={() => navigate(dashboardPath)} style={{ ...s.backBtn, color: accentColor }}>
          ← Back to Dashboard
        </button>
        <h1 style={styles.pageTitle}>Payment History</h1>
        <div style={{ width: 140 }} />
      </div>

      <div style={styles.body}>

        {/* ── Stats Row ── */}
        {stats && (
          <div style={styles.statsGrid}>
            {isFreelancer ? (
              <>
                <StatCard label="Total Earned"  value={formatAmount(stats.totalEarned)} icon="💰" color="#16a34a" />
                <StatCard label="In Escrow"     value={formatAmount(stats.inEscrow)}    icon="🔒" color="#d97706" />
                <StatCard label="Transactions"  value={stats.totalCount}                icon="📋" color="#2563eb" />
                <StatCard label="Avg per Job"   value={stats.totalCount > 0 ? formatAmount(Math.round(stats.totalEarned / stats.totalCount)) : '—'} icon="📈" color="#9333ea" />
              </>
            ) : (
              <>
                <StatCard label="Total Spent"   value={formatAmount(stats.totalSpent)}  icon="💳" color="#2563eb" />
                <StatCard label="In Escrow"     value={formatAmount(stats.inEscrow)}    icon="🔒" color="#d97706" />
                <StatCard label="Transactions"  value={stats.totalCount}                icon="📋" color="#16a34a" />
                <StatCard label="Avg per Job"   value={stats.totalCount > 0 ? formatAmount(Math.round(stats.totalSpent / stats.totalCount)) : '—'} icon="📈" color="#9333ea" />
              </>
            )}
          </div>
        )}

        {/* ── Filter Bar ── */}
        <div style={styles.filterBar}>
          <span style={styles.filterLabel}>Filter by status:</span>
          {['all', 'in_escrow', 'released', 'refunded', 'pending'].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              style={{
                ...s.filterBtn,
                ...(statusFilter === f ? { background: accentColor, color: '#fff', borderColor: accentColor } : {}),
              }}
            >
              {f === 'all' ? 'All' : STATUS_CONFIG[f]?.label || f}
            </button>
          ))}
        </div>

        {/* ── Table ── */}
        <div style={styles.card}>
          {loading ? (
            <div style={styles.center}>
              <div style={{ ...s.spinner, borderTopColor: accentColor }} />
              <span style={{ fontSize: 13, color: '#a3a3a3' }}>Loading...</span>
            </div>
          ) : error ? (
            <div style={styles.errorMsg}>{error}</div>
          ) : filtered.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>💳</div>
              <div style={{ fontWeight: 600, color: '#111', marginBottom: 4 }}>
                Koi transaction nahi mili
              </div>
              <div style={{ fontSize: 13, color: '#a3a3a3' }}>
                {statusFilter !== 'all' ? 'Is filter mein koi record nahi.' : 'Abhi tak koi payment nahi hui.'}
              </div>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div style={styles.tableHeader}>
                <span style={{ flex: 2 }}>Job</span>
                <span style={{ flex: 1.5 }}>{isFreelancer ? 'Client' : 'Freelancer'}</span>
                <span style={{ flex: 1 }}>Amount</span>
                <span style={{ flex: 1 }}>Gateway</span>
                <span style={{ flex: 1 }}>Status</span>
                <span style={{ flex: 1 }}>Date</span>
                <span style={{ flex: 0.5 }}></span>
              </div>

              {/* Rows */}
              {filtered.map((txn) => {
                const otherUser = isFreelancer ? txn.client : txn.freelancer;
                return (
                  <div key={txn._id} style={styles.tableRow}>
                    <span style={{ flex: 2, fontWeight: 500, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {txn.job?.title || '—'}
                    </span>
                    <span style={{ flex: 1.5, color: '#525252', fontSize: 13 }}>
                      {otherUser?.firstName} {otherUser?.lastName}
                    </span>
                    <span style={{ flex: 1, fontWeight: 600, color: '#111' }}>
                      {formatAmount(txn.total)}
                    </span>
                    <span style={{ flex: 1 }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 99,
                        background: txn.gateway === 'razorpay' ? '#fef3c7' : '#f5f3ff',
                        color:      txn.gateway === 'razorpay' ? '#d97706'  : '#7c3aed',
                        fontSize: 11.5, fontWeight: 600, textTransform: 'capitalize',
                      }}>
                        {txn.gateway}
                      </span>
                    </span>
                    <span style={{ flex: 1 }}>
                      <StatusBadge status={txn.status} />
                    </span>
                    <span style={{ flex: 1, fontSize: 12.5, color: '#737373' }}>
                      {formatDate(txn.createdAt)}
                    </span>
                    <span style={{ flex: 0.5 }}>
                      <button
                        onClick={() => setSelected(txn)}
                        style={{ background: 'none', border: 'none', color: accentColor, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
                      >
                        Details
                      </button>
                    </span>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              style={{ ...s.pageBtn, opacity: page <= 1 ? 0.4 : 1 }}
              disabled={page <= 1}
              onClick={() => fetchHistory(page - 1)}
            >
              ← Prev
            </button>
            <span style={{ fontSize: 13, color: '#737373' }}>
              Page {page} of {totalPages}
            </span>
            <button
              style={{ ...s.pageBtn, opacity: page >= totalPages ? 0.4 : 1 }}
              disabled={page >= totalPages}
              onClick={() => fetchHistory(page + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
        {selected && (
        <div style={styles.overlay} onClick={() => setSelected(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: 0 }}>Transaction Details</h2>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#737373' }}>×</button>
            </div>

            <div style={styles.detailGrid}>
              {[
                { label: 'Transaction ID', value: selected._id },
                { label: 'Job',            value: selected.job?.title || '—' },
                { label: 'Client',         value: `${selected.client?.firstName} ${selected.client?.lastName}` },
                { label: 'Freelancer',     value: `${selected.freelancer?.firstName} ${selected.freelancer?.lastName}` },
                { label: 'Project Amount', value: formatAmount(selected.amount) },
                { label: 'Platform Fee',   value: formatAmount(selected.platformFee) },
                { label: 'Total',          value: formatAmount(selected.total), bold: true },
                { label: 'Gateway',        value: selected.gateway?.toUpperCase() },
                { label: 'Order ID',       value: selected.gatewayOrderId || '—' },
                { label: 'Payment ID',     value: selected.gatewayPaymentId || '—' },
                { label: 'Status',         value: <StatusBadge status={selected.status} /> },
                { label: 'Created',        value: formatDate(selected.createdAt) },
                { label: 'Paid At',        value: formatDate(selected.paidAt) },
                { label: 'Released At',    value: formatDate(selected.releasedAt) },
                { label: 'Refunded At',    value: formatDate(selected.refundedAt) },
              ].map((row, i) => (
                <div key={i} style={s.detailRow}>
                  <span style={s.detailLabel}>{row.label}</span>
                  <span style={{ ...s.detailValue, fontWeight: row.bold ? 700 : 400 }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        button { cursor: pointer; font-family: inherit; }
      `}</style>
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  shell:      { minHeight: '100vh', background: '#f8faff', fontFamily: "'DM Sans', sans-serif" },
  topBar:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', background: '#fff', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, zIndex: 10 },
  backBtn:    { background: 'none', border: 'none', fontSize: 13.5, fontWeight: 600, padding: '6px 0' },
  pageTitle:  { fontSize: 16, fontWeight: 700, color: '#111', margin: 0 },
  body:       { maxWidth: 1100, margin: '0 auto', padding: '28px 24px' },

  statsGrid:  { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 },
  statCard:   { background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #f0f0f0' },
  statIcon:   { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, fontSize: 18 },
  statValue:  { fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 4 },
  statLabel:  { fontSize: 12.5, color: '#a3a3a3', fontWeight: 500 },

  filterBar:  { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  filterLabel:{ fontSize: 13, color: '#737373', fontWeight: 500 },
  filterBtn:  { padding: '6px 14px', border: '1.5px solid #e5e7eb', borderRadius: 99, background: '#fff', color: '#525252', fontSize: 12.5, fontWeight: 500, transition: 'all .15s' },

  card:       { background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', overflow: 'hidden', marginBottom: 16 },
  tableHeader:{ display: 'flex', alignItems: 'center', padding: '12px 20px', background: '#f8faff', borderBottom: '1px solid #f0f0f0', fontSize: 11.5, fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '.04em', gap: 8 },
  tableRow:   { display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #f5f5f5', gap: 8, fontSize: 13.5, transition: 'background .1s' },

  center:     { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  spinner:    { width: 20, height: 20, border: '2.5px solid #e5e7eb', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
  errorMsg:   { textAlign: 'center', padding: 32, color: '#dc2626', fontSize: 13 },
  emptyState: { textAlign: 'center', padding: '48px 0' },

  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 8 },
  pageBtn:    { padding: '8px 18px', border: '1.5px solid #e5e7eb', borderRadius: 8, background: '#fff', fontSize: 13.5, fontWeight: 500, color: '#525252' },

  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal:      { background: '#fff', borderRadius: 14, padding: 28, width: 520, maxWidth: '92vw', maxHeight: '88vh', overflowY: 'auto', border: '1px solid #f0f0f0' },
  detailGrid: { display: 'flex', flexDirection: 'column', gap: 0 },
  detailRow:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f5f5f5' },
  detailLabel:{ fontSize: 12.5, color: '#737373', fontWeight: 500 },
  detailValue:{ fontSize: 13.5, color: '#111', textAlign: 'right', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis' },
};

export default PaymentHistory;
