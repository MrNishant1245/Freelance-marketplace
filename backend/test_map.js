const mongoose = require('mongoose');
require('dotenv').config({ path: 'c:/Users/AVNI RAJPUT/OneDrive/Desktop/Freelance-marketplace-main/Freelance-marketplace-main/backend/.env' });

const User = require('c:/Users/AVNI RAJPUT/OneDrive/Desktop/Freelance-marketplace-main/Freelance-marketplace-main/backend/models/User.model');
const Job = require('c:/Users/AVNI RAJPUT/OneDrive/Desktop/Freelance-marketplace-main/Freelance-marketplace-main/backend/models/Job.model');
const Transaction = require('c:/Users/AVNI RAJPUT/OneDrive/Desktop/Freelance-marketplace-main/Freelance-marketplace-main/backend/models/Transaction.model');

async function testMap() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    // Fetch Nishant Rajput
    const user = await User.findOne({ email: 'client.nishant@example.com' });
    const userId = user._id.toString();

    // 1. Mock fetchFreelancers / getFreelancerList
    console.log("\nMocking fetchFreelancers...");
    const freelancers = await User.find({ role: 'freelancer', isActive: true })
      .select('firstName lastName email profilePhoto phone location freelancerProfile createdAt')
      .lean();
    
    const favoritesList = freelancers.map(u => {
      const p = u.freelancerProfile || {};
      const name = `${u.firstName} ${u.lastName}`;
      const firstInitial = u.firstName ? u.firstName.charAt(0) : 'F';
      const lastInitial = u.lastName ? u.lastName.charAt(0) : '';
      const initial = `${firstInitial}${lastInitial}`.toUpperCase();
      return {
        key: u._id.toString(),
        name,
        role: p.title || 'Freelance Specialist',
        exp: p.experienceLevel === 'expert' ? '5+ years' : p.experienceLevel === 'intermediate' ? '3+ years' : '1+ years',
        location: u.location ? `${u.location.city || ''}, ${u.location.country || ''}`.replace(/^, /, '') : 'India',
        status: p.availability === 'not-available' ? 'Away' : 'Available',
        statusTone: p.availability === 'not-available' ? '#f59e0b' : '#10b981',
        rate: p.hourlyRate ? `₹${(p.hourlyRate * 80).toLocaleString('en-IN')} / hr` : '₹1,500 / hr',
        rating: (p.rating || 4.5).toFixed(1),
        revs: `${p.reviewCount || 0} reviews`,
        bg: '#' + (Math.floor(Math.random()*16777215).toString(16) + '000000').slice(0, 6),
        initial,
        skills: p.skills || []
      };
    });
    console.log("favoritesList count:", favoritesList.length);

    // 2. Mock fetchInvoices
    console.log("\nMocking fetchInvoices...");
    const txs = await Transaction.find({ client: userId })
      .populate('client',     'firstName lastName email')
      .populate('freelancer', 'firstName lastName email')
      .populate('job',        'title');
    
    console.log(`Found ${txs.length} transactions for client.`);
    const invoicesList = txs.map(t => {
      const freelancerName = t.freelancer ? `${t.freelancer.firstName} ${t.freelancer.lastName}` : 'Unassigned';
      const projectTitle = t.job ? t.job.title : 'General Development';
      const statusLabel = t.status === 'released' ? 'PAID' : t.status === 'in_escrow' ? 'PENDING' : t.status === 'paid' ? 'PAID' : 'UNPAID';
      
      return {
        id: t._id ? `INV-2026-${String(t._id).slice(-4).toUpperCase()}` : 'INV-2026-TEMP',
        date: new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        project: projectTitle,
        amount: `₹${t.total.toLocaleString('en-IN')}`,
        status: statusLabel,
        freelancer: freelancerName,
        email: t.freelancer?.email || '',
        docBg: 'rgba(16,185,129,0.12)',
        docColor: '#10b981'
      };
    });
    console.log("invoicesList mapped successfully, count:", invoicesList.length);

    const expenses = txs.map((t, idx) => {
      const freelancerName = t.freelancer ? `${t.freelancer.firstName} ${t.freelancer.lastName}` : 'Unassigned';
      const projectTitle = t.job ? t.job.title : 'General Development';
      const firstInitial = t.freelancer?.firstName ? t.freelancer.firstName.charAt(0) : 'F';
      const lastInitial = t.freelancer?.lastName ? t.freelancer.lastName.charAt(0) : '';
      const initial = `${firstInitial}${lastInitial}`.toUpperCase();
      
      return {
        num: idx + 1,
        title: projectTitle,
        cat: t.job?.category || 'Development',
        name: freelancerName,
        bg: '#' + (Math.floor(Math.random()*16777215).toString(16) + '000000').slice(0, 6),
        initial,
        amt: `₹${t.total.toLocaleString('en-IN')}`,
        date: new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        pct: '10%'
      };
    });
    console.log("expenses mapped successfully, count:", expenses.length);

    // 3. Mock fetchContracts
    console.log("\nMocking fetchContracts...");
    const rawJobs = await Job.find({ client: userId })
      .populate('hiredFreelancer', 'firstName lastName')
      .populate('proposals.freelancer', 'firstName lastName email');
    
    console.log(`Found ${rawJobs.length} posted jobs.`);
    const hiredJobs = rawJobs.filter(j => j.hiredFreelancer);
    const contractsList = hiredJobs.map(j => {
      const freelancerName = `${j.hiredFreelancer.firstName || ''} ${j.hiredFreelancer.lastName || ''}`.trim() || 'Freelancer';
      const partnerText = `${user?.clientProfile?.companyName || 'Acme Corp'} / ${freelancerName}`;
      const firstInitial = j.hiredFreelancer.firstName ? j.hiredFreelancer.firstName.charAt(0) : 'F';
      
      return {
        title: j.title,
        id: j._id ? `CTR-2024-00${String(j._id).slice(-2).toUpperCase()}` : 'CTR-2024-TEMP',
        partner: partnerText,
        val: `₹${j.budget.toLocaleString('en-IN')}`,
        status: j.status === 'completed' ? 'COMPLETED' : j.status === 'in_progress' ? 'ACTIVE' : 'PENDING',
        color: j.status === 'completed' ? '#94a3b8' : j.status === 'in_progress' ? '#10b981' : '#f59e0b',
        bg: j.status === 'completed' ? '#1e293b' : j.status === 'in_progress' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
        start: new Date(j.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        end: j.completedAt ? new Date(j.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Ongoing',
        initial: firstInitial
      };
    });
    console.log("contracts mapped successfully, count:", contractsList.length);

    // 4. Mock fetchMilestones
    console.log("\nMocking fetchMilestones...");
    const milestones = [];
    const invoices = [];
    rawJobs.forEach(job => {
      (job.milestones || []).forEach(m => {
        const mIdStr = m._id ? String(m._id) : '';
        const jobCreatedAt = m.createdAt || job.createdAt || new Date();
        const validDate = new Date(jobCreatedAt);
        const dateStr = isNaN(validDate.getTime()) ? new Date().toISOString().slice(0, 10) : validDate.toISOString().slice(0, 10);

        milestones.push({
          id: m._id || Math.random().toString(),
          name: `${job.title} — ${m.title}`,
          amount: m.amount,
          status: m.status === 'paid' ? 'released' : m.status === 'approved' ? 'released' : m.status === 'in_progress' ? 'funded' : 'draft',
          jobId: job._id
        });

        invoices.push({
          id: mIdStr ? `INV-${mIdStr.slice(-4).toUpperCase()}` : 'INV-TEMP',
          date: dateStr,
          project: `${job.title} — ${m.title}`,
          amount: m.amount,
          status: m.status === 'paid' ? 'Paid' : m.status === 'approved' ? 'Paid' : 'Unpaid'
        });
      });
    });
    console.log("milestones mapped successfully, count:", milestones.length);

    console.log("\nALL MOCKS COMPLETED WITHOUT ERROR!");

  } catch (err) {
    console.error("\nMapping FAILED:", err);
  } finally {
    await mongoose.disconnect();
  }
}

testMap();
