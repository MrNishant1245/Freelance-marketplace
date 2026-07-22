const Job = require('../models/Job.model');
const User = require('../models/User.model');
const { sendEmail } = require('../utils/sendEmail');

// ─── Create a new job (Client only) ──────────────────────────────────────────
const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      skills,
      budgetType,
      budget,
      currency,
      experienceLevel,
      duration,
    } = req.body;

    const job = await Job.create({
      title,
      description,
      category,
      skills,
      budgetType,
      budget,
      currency,
      experienceLevel,
      duration,
      client: req.user.id,
    });

    res.status(201).json({ success: true, data: job });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create job.' });
  }
};

// ─── Get all jobs (with filters, for Find Jobs page) ─────────────────────────
const getJobs = async (req, res) => {
  try {
    const { search, category, minBudget, maxBudget, status, skills, experienceLevel, budgetType } = req.query;
    const filter = {};

    if (status) {
      if (status !== 'all') {
        filter.status = status;
      }
    } else {
      filter.status = 'active';
    }

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    if (category) filter.category = category;
    if (skills) filter.skills = { $in: skills.split(',') };
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (budgetType) filter.budgetType = budgetType;
    if (minBudget || maxBudget) {
      filter.budget = {};
      if (minBudget) filter.budget.$gte = Number(minBudget);
      if (maxBudget) filter.budget.$lte = Number(maxBudget);
    }

    const jobs = await Job.find(filter)
      .populate('client', 'firstName lastName clientProfile.companyName profilePhoto')
      .populate('hiredFreelancer', 'firstName lastName freelancerProfile.title profilePhoto')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch jobs.' });
  }
};

// ─── Get single job by id ─────────────────────────────────────────────────────
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('client', 'firstName lastName email clientProfile')
      .populate('hiredFreelancer', 'firstName lastName email freelancerProfile')
      .populate('proposals.freelancer', 'firstName lastName freelancerProfile.rating freelancerProfile.skills');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch job.' });
  }
};

// ─── Get jobs posted by the logged-in client ─────────────────────────────────
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ client: req.user.id })
      .populate('hiredFreelancer', 'firstName lastName')
      .populate('proposals.freelancer', 'firstName lastName email freelancerProfile')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch your jobs.' });
  }
};

// ─── Get jobs the logged-in freelancer has been hired for ────────────────────
const getMyAssignedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ hiredFreelancer: req.user.id })
      .populate('client', 'firstName lastName clientProfile.companyName')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch assigned jobs.' });
  }
};

// ─── Update a job (Client, owner only) ───────────────────────────────────────
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    if (job.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this job.' });
    }

    const allowedFields = ['title', 'description', 'category', 'skills', 'budget', 'budgetType', 'experienceLevel', 'duration', 'status'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) job[field] = req.body[field];
    });

    await job.save();
    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update job.' });
  }
};

// ─── Delete / remove a job (Client owner or Admin) ───────────────────────────
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    const isOwner = job.client.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this job.' });
    }

    await job.deleteOne();
    res.json({ success: true, message: 'Job removed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete job.' });
  }
};

// ─── Submit a proposal (Freelancer) ──────────────────────────────────────────
const submitProposal = async (req, res) => {
  try {
    const { coverLetter, bidAmount, estimatedDays, attachments } = req.body;
    const job = await Job.findById(req.params.id).populate('client', 'firstName lastName email');

    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
    if (job.status !== 'active') {
      return res.status(400).json({ success: false, message: 'This job is no longer accepting proposals.' });
    }

    const alreadyApplied = job.proposals.some(
      (p) => p.freelancer.toString() === req.user.id
    );
    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: 'You have already applied to this job.' });
    }

    console.log("========== SUBMIT PROPOSAL ==========");
    console.log(req.body);
    console.log("Attachments:", attachments);
    console.log("Type:", typeof attachments);

    if (Array.isArray(attachments)) {
      attachments.forEach((item, index) => {
        console.log(`Attachment ${index}:`, item);
      });
    }

    job.proposals.push({
      freelancer: req.user.id,
      coverLetter,
      bidAmount,
      estimatedDays,
      attachments: Array.isArray(attachments)
        ? attachments.map((file) => {
          if (typeof file === "string") {
            return {
              url: file,
              name: file.split("/").pop(),
              fileType: "",
            };
          }

          return {
            url: file.url,
            name: file.name || file.url.split("/").pop(),
            fileType: file.fileType || "",
          };
        })
        : [],
    });

    await job.save();

    // ── Notify client by email (fire-and-forget) ──
    if (job.client?.email) {
      User.findById(req.user.id)
        .select('firstName lastName')
        .then((freelancer) => {
          const freelancerName = freelancer
            ? `${freelancer.firstName} ${freelancer.lastName}`
            : 'A freelancer';
          sendEmail({
            to: job.client.email,
            subject: `New proposal on "${job.title}"`,
            html: `
              <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;">
                <h2 style="color:#2563eb;">New Proposal Received 📋</h2>
                <p>Hi ${job.client.firstName},</p>
                <p><strong>${freelancerName}</strong> has submitted a proposal for your job:</p>
                <p style="background:#f0f9ff;padding:12px 16px;border-radius:8px;font-weight:600;">${job.title}</p>
                <p>Bid amount: <strong>₹${bidAmount}</strong> · Estimated: <strong>${estimatedDays} days</strong></p>
                <p>Log in to your dashboard to review the full proposal.</p>
                <p style="color:#a3a3a3;font-size:12px;margin-top:24px;">FreelanceMarket — automated notification</p>
              </div>
            `,
          });
        })
        .catch((err) => console.error('Notify-client error:', err.message));
    }

    res.status(201).json({ success: true, message: 'Proposal submitted successfully.', data: job });
  } catch (error) {
    console.error('Submit proposal error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit proposal.' });
  }
};

// ─── Update proposal status (Client) ─────────────────────────────────────────
const updateProposalStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
    if (job.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const proposal = job.proposals.id(req.params.proposalId);
    if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found.' });

    proposal.status = status;

    if (status === 'accepted') {
      job.hiredFreelancer = proposal.freelancer;
      job.status = 'in_progress';
      job.proposals.forEach((p) => {
        if (p._id.toString() !== proposal._id.toString() && p.status === 'pending') {
          p.status = 'rejected';
        }
      });
    }

    await job.save();

    // ── Notify freelancer by email (fire-and-forget) ──
    if (status === 'accepted' || status === 'rejected') {
      User.findById(proposal.freelancer)
        .select('firstName email')
        .then((freelancer) => {
          if (!freelancer?.email) return;
          const isAccepted = status === 'accepted';
          sendEmail({
            to: freelancer.email,
            subject: isAccepted
              ? `🎉 Your proposal was accepted — "${job.title}"`
              : `Update on your proposal — "${job.title}"`,
            html: `
              <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;">
                <h2 style="color:${isAccepted ? '#16a34a' : '#dc2626'};">
                  ${isAccepted ? 'Proposal Accepted! 🎉' : 'Proposal Not Selected'}
                </h2>
                <p>Hi ${freelancer.firstName},</p>
                <p>${isAccepted
                ? 'Great news — your proposal has been <strong>accepted</strong>. You can now start working on it.'
                : 'Your proposal was not selected this time. Keep applying!'
              }</p>
                <p style="background:${isAccepted ? '#f0fdf4' : '#fef2f2'};padding:12px 16px;border-radius:8px;font-weight:600;">${job.title}</p>
                <p>Log in to your dashboard for more details.</p>
                <p style="color:#a3a3a3;font-size:12px;margin-top:24px;">FreelanceMarket — automated notification</p>
              </div>
            `,
          });
        })
        .catch((err) => console.error('Notify-freelancer error:', err.message));
    }

    res.json({ success: true, message: `Proposal ${status}.`, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update proposal.' });
  }
};

// ─── Mark job as submitted (Freelancer) ──────────────────────────────────────
const markJobSubmitted = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    if (!job.hiredFreelancer || job.hiredFreelancer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const { submissionFiles, submissionNote } = req.body;
    if (Array.isArray(submissionFiles) && submissionFiles.length > 0) job.submissionFiles = submissionFiles;
    if (submissionNote !== undefined) job.submissionNote = submissionNote;

    job.status = 'submitted';
    await job.save();

    res.json({ success: true, message: 'Job marked as submitted. Awaiting client approval.', data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update job status.' });
  }
};

// ─── Mark job as completed (Client) ──────────────────────────────────────────
const markJobCompleted = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    if (job.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    job.status = 'completed';
    job.completedAt = new Date();
    await job.save();

    res.json({ success: true, message: 'Job marked as completed.', data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to complete job.' });
  }
};

// ─── Toggle save/unsave a job (Freelancer) ───────────────────────────────────
const toggleSaveJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    const user = await User.findById(req.user.id);
    const alreadySaved = user.savedJobs.some((id) => id.toString() === jobId);

    if (alreadySaved) {
      user.savedJobs = user.savedJobs.filter((id) => id.toString() !== jobId);
      await user.save();
      return res.json({ success: true, saved: false, message: 'Job removed from saved list.' });
    }

    user.savedJobs.push(jobId);
    await user.save();
    return res.json({ success: true, saved: true, message: 'Job saved successfully.' });
  } catch (error) {
    console.error('Toggle save job error:', error);
    res.status(500).json({ success: false, message: 'Failed to update saved job.' });
  }
};

// ─── Get all saved jobs (Freelancer) ─────────────────────────────────────────
const getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedJobs',
      populate: { path: 'client', select: 'firstName lastName clientProfile.companyName' },
    });

    res.json({ success: true, count: user.savedJobs.length, data: user.savedJobs });
  } catch (error) {
    console.error('Get saved jobs error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch saved jobs.' });
  }
};

// ─── Update / Define Milestones on Job (Client) ──────────────────────────────
const updateMilestones = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    if (job.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const { milestones } = req.body;
    if (!Array.isArray(milestones)) {
      return res.status(400).json({ success: false, message: 'Milestones must be an array.' });
    }

    // Replace the milestones list
    job.milestones = milestones.map(m => ({
      title: m.title,
      amount: Number(m.amount),
      dueDate: m.dueDate ? new Date(m.dueDate) : undefined,
      status: m.status || 'pending'
    }));

    await job.save();
    res.json({ success: true, message: 'Milestones updated successfully.', data: job });
  } catch (error) {
    console.error('Update milestones error:', error);
    res.status(500).json({ success: false, message: 'Failed to update milestones.' });
  }
};

// ─── Fund Escrow for Milestone (Client) ──────────────────────────────────────
const fundMilestone = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    if (job.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const milestone = job.milestones.id(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found.' });

    milestone.status = 'in_progress';
    
    // update top-level payment details
    job.payment.status = 'escrow_held';
    job.payment.escrowAmount = (job.payment.escrowAmount || 0) + milestone.amount;
    job.payment.fundedAt = new Date();

    await job.save();
    res.json({ success: true, message: 'Milestone funded successfully.', data: job });
  } catch (error) {
    console.error('Fund milestone error:', error);
    res.status(500).json({ success: false, message: 'Failed to fund milestone.' });
  }
};

// ─── Release Escrow for Milestone (Client) ────────────────────────────────────
const releaseMilestone = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    if (job.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const milestone = job.milestones.id(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found.' });

    milestone.status = 'paid';
    
    // adjust escrow balances
    job.payment.escrowAmount = Math.max(0, (job.payment.escrowAmount || 0) - milestone.amount);
    job.payment.releasedAmount = (job.payment.releasedAmount || 0) + milestone.amount;
    job.payment.releasedAt = new Date();

    // If all milestones are paid, we can automatically mark the job as completed
    const allPaid = job.milestones.every(m => m.status === 'paid');
    if (allPaid) {
      job.status = 'completed';
      job.completedAt = new Date();
      job.payment.status = 'released';
    } else {
      job.payment.status = 'partially_released';
    }

    await job.save();
    res.json({ success: true, message: 'Milestone escrow released successfully.', data: job });
  } catch (error) {
    console.error('Release milestone error:', error);
    res.status(500).json({ success: false, message: 'Failed to release milestone.' });
  }
};

// ─── Raise Dispute for Milestone (Client or Freelancer) ────────────────────────
const raiseMilestoneDispute = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    // Client or hired freelancer can raise dispute
    const isClient = job.client.toString() === req.user.id;
    const isFreelancer = job.hiredFreelancer && job.hiredFreelancer.toString() === req.user.id;

    if (!isClient && !isFreelancer) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const milestone = job.milestones.id(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found.' });

    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, message: 'Dispute reason is required.' });
    }

    milestone.status = 'disputed';
    milestone.disputeReason = reason;
    milestone.disputedAt = new Date();

    await job.save();
    res.json({ success: true, message: 'Dispute raised successfully. Support team notified.', data: job });
  } catch (error) {
    console.error('Raise dispute error:', error);
    res.status(500).json({ success: false, message: 'Failed to raise dispute.' });
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  getMyJobs,
  getMyAssignedJobs,
  updateJob,
  deleteJob,
  submitProposal,
  updateProposalStatus,
  markJobSubmitted,
  markJobCompleted,
  toggleSaveJob,
  getSavedJobs,
  updateMilestones,
  fundMilestone,
  releaseMilestone,
  raiseMilestoneDispute,
};
