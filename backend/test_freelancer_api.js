const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config({ path: 'c:/Users/AVNI RAJPUT/OneDrive/Desktop/Freelance-marketplace-main/Freelance-marketplace-main/backend/.env' });

const User = require('c:/Users/AVNI RAJPUT/OneDrive/Desktop/Freelance-marketplace-main/Freelance-marketplace-main/backend/models/User.model');
const Job = require('c:/Users/AVNI RAJPUT/OneDrive/Desktop/Freelance-marketplace-main/Freelance-marketplace-main/backend/models/Job.model');

const formatBudget = (budget) => {
  if (!budget) return '—';
  if (typeof budget === 'number') return `₹${budget.toLocaleString('en-IN')}`;
  return budget.toString().startsWith('₹') ? budget : `₹${budget}`;
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  if (weeks > 0) return `${weeks}w ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'Just now';
};

async function testFreelancer() {
  try {
    // 1. Connect to DB and update Amit's password
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const user = await User.findOne({ email: 'amit.sharma@example.com' });
    if (!user) {
      console.error("User amit.sharma@example.com not found!");
      process.exit(1);
    }
    const myId = user._id.toString();

    user.password = 'Password@123';
    await user.save();
    console.log("Updated password for amit.sharma@example.com to 'Password@123'");

    // Disconnect so we don't block
    await mongoose.disconnect();

    // 2. Perform Login Request
    console.log("\nLogging in via API...");
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'amit.sharma@example.com',
      password: 'Password@123'
    });

    const { accessToken } = loginRes.data.data;
    console.log("Login successful! Token acquired.");

    const config = {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    };

    // 3. Test GET /api/jobs
    console.log("\nTesting GET /api/jobs...");
    const jobsRes = await axios.get('http://localhost:5000/api/jobs', config);
    console.log("Status:", jobsRes.status);
    const rawJobs = jobsRes.data.data || [];
    console.log("Jobs count:", rawJobs.length);

    // Mock FreelancerDashboard.jsx job listing logic
    const applied = new Set();
    rawJobs.forEach((job) => {
      if (job.proposals?.some((p) => p.freelancer === myId || p.freelancer?._id === myId)) {
        applied.add(job._id);
      }
    });
    console.log("Applied jobs set constructed successfully.");

    // 4. Mock fetchMyProposals
    console.log("\nMocking fetchMyProposals...");
    const proposals = [];
    rawJobs.forEach((job) => {
      if (job.proposals) {
        job.proposals.forEach((p) => {
          const fId = p.freelancer?._id || p.freelancer;
          if (fId === myId) {
            proposals.push({
              _id: p._id,
              jobId: job._id,
              job: job.title,
              client: job.client?.firstName ? `${job.client.firstName} ${job.client.lastName}` : 'Client',
              bid: formatBudget(p.bidAmount),
              status: p.status || 'pending',
              submitted: timeAgo(p.createdAt),
              attachments: p.attachments || [],
              createdAt: p.createdAt
            });
          }
        });
      }
    });
    console.log("Proposals mapped successfully, count:", proposals.length);

    // 5. Test GET /api/jobs/saved
    console.log("\nTesting GET /api/jobs/saved...");
    try {
      const savedRes = await axios.get('http://localhost:5000/api/jobs/saved', config);
      console.log("Status:", savedRes.status);
      const savedJobs = savedRes.data.data || [];
      console.log("Saved jobs count:", savedJobs.length);
    } catch (e) {
      console.error("GET /api/jobs/saved failed:", e.response?.data || e.message);
    }

    // 6. Test GET /api/jobs/my/assigned
    console.log("\nTesting GET /api/jobs/my/assigned...");
    try {
      const assignedRes = await axios.get('http://localhost:5000/api/jobs/my/assigned', config);
      console.log("Status:", assignedRes.status);
      const assignedJobs = assignedRes.data.data || [];
      console.log("Assigned jobs count:", assignedJobs.length);
    } catch (e) {
      console.error("GET /api/jobs/my/assigned failed:", e.response?.data || e.message);
    }

    // 7. Test GET /api/messages/unread
    console.log("\nTesting GET /api/messages/unread...");
    try {
      const unreadRes = await axios.get('http://localhost:5000/api/messages/unread', config);
      console.log("Status:", unreadRes.status);
      console.log("Unread count:", unreadRes.data.data?.unreadCount || unreadRes.data.unreadCount || 0);
    } catch (e) {
      console.error("GET /api/messages/unread failed:", e.response?.data || e.message);
    }

    console.log("\nALL FREELANCER MOCKS COMPLETED WITHOUT ERROR!");

  } catch (err) {
    console.error("Freelancer test failed:", err.message);
  }
}

testFreelancer();
