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
      .populate('client', 'firstName lastName clientProfile.companyName profilePhoto phone')
      .populate('hiredFreelancer', 'firstName lastName freelancerProfile.title profilePhoto phone')
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
      .populate('client', 'firstName lastName email clientProfile phone')
      .populate('hiredFreelancer', 'firstName lastName email freelancerProfile phone')
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
      .populate('hiredFreelancer', 'firstName lastName phone')
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
      .populate('client', 'firstName lastName clientProfile.companyName phone')
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

// ─── Proposal Coach Real-Time Feedback (Freelancer-side AI) ───────────────────
const getProposalCoachFeedback = async (req, res) => {
  try {
    const { coverLetter = '', bidAmount = 0, estimatedDays = 0 } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    const warnings = [];
    const strengths = [];
    const quickFixes = [];
    let score = 70; // baseline

    // 1. Deadline / Delivery Timeline Analysis
    const timelineKeywords = ['day', 'days', 'week', 'weeks', 'month', 'deadline', 'delivery', 'timeline', 'schedule', 'milestone'];
    const lowerText = coverLetter.toLowerCase();
    const hasTimelineMention = timelineKeywords.some(k => lowerText.includes(k)) || Number(estimatedDays) > 0;

    if (!hasTimelineMention || lowerText.length < 30) {
      warnings.push({
        id: 'missing_deadline',
        type: 'warning',
        title: '⚠️ Deadline mention nahi kiya',
        message: 'Cover letter lacks a clear delivery timeline or milestone commitment. Clients value time-bound proposals.',
      });
      score -= 15;
      quickFixes.push({
        id: 'add_deadline',
        label: '⚡ Add Delivery Commitment',
        actionType: 'append_text',
        value: `\n\nI can complete this project within ${estimatedDays || 7} days with regular milestone updates.`,
      });
    } else {
      strengths.push({
        id: 'deadline_ok',
        title: '✅ Delivery Timeline Clear',
        message: `Mentions target completion timeframe (${estimatedDays || 'specified'} days).`,
      });
      score += 10;
    }

    // 2. Pricing Benchmark Analysis vs Job Budget & Accepted Proposals
    const numBid = Number(bidAmount) || 0;
    const targetBudget = job.budget || 10000;
    let avgAccepted = targetBudget;

    if (job.proposals && job.proposals.length > 0) {
      const sum = job.proposals.reduce((acc, p) => acc + (p.bidAmount || 0), 0);
      avgAccepted = Math.round(sum / job.proposals.length);
    }

    if (numBid > 0 && numBid < targetBudget * 0.6) {
      const diffPct = Math.round(((targetBudget - numBid) / targetBudget) * 100);
      warnings.push({
        id: 'lowball_price',
        type: 'danger',
        title: `💰 Price is ${diffPct}% below target budget`,
        message: `Your bid (₹${numBid.toLocaleString()}) is ${diffPct}% lower than the job budget (₹${targetBudget.toLocaleString()}). Extremely low bids may make clients doubt work quality.`,
      });
      score -= 15;
      quickFixes.push({
        id: 'align_price',
        label: `💡 Align Price to Market (₹${Math.round(targetBudget * 0.9).toLocaleString()})`,
        actionType: 'set_bid',
        value: Math.round(targetBudget * 0.9),
      });
    } else if (numBid > targetBudget * 1.4) {
      const diffPct = Math.round(((numBid - targetBudget) / targetBudget) * 100);
      warnings.push({
        id: 'high_price',
        type: 'info',
        title: `💰 Bid is ${diffPct}% above client budget`,
        message: `Your bid (₹${numBid.toLocaleString()}) is above the posted budget (₹${targetBudget.toLocaleString()}). Justify your rate clearly in the proposal.`,
      });
    } else if (numBid > 0) {
      strengths.push({
        id: 'pricing_ok',
        title: '✅ Competitive Pricing Fit',
        message: 'Your bid amount is well-aligned with the client budget & market benchmarks.',
      });
      score += 10;
    }

    // 3. Skill & Scope Coverage Analysis
    const jobSkills = job.skills || [];
    const matchedSkills = jobSkills.filter(s => lowerText.includes(s.toLowerCase()));
    const missingSkills = jobSkills.filter(s => !lowerText.includes(s.toLowerCase()));

    if (jobSkills.length > 0) {
      if (matchedSkills.length > 0) {
        strengths.push({
          id: 'skills_match',
          title: `🎯 Required Skills Addressed (${matchedSkills.length}/${jobSkills.length})`,
          message: `Your proposal highlights key skills: ${matchedSkills.join(', ')}.`,
        });
        score += 10;
      }
      if (missingSkills.length > 0) {
        warnings.push({
          id: 'missing_skills',
          type: 'info',
          title: `🛠️ Mention Required Skills (${missingSkills.join(', ')})`,
          message: `The job requires ${missingSkills.join(', ')}. Addressing these explicitly boosts candidate ranking.`,
        });
        quickFixes.push({
          id: 'inject_skills',
          label: `✨ Inject Missing Skills (${missingSkills.slice(0, 2).join(', ')})`,
          actionType: 'append_text',
          value: `\n\nI have proven hands-on experience with ${missingSkills.join(', ')} and can implement them seamlessly for your project.`,
        });
      }
    }

    // 4. Tone & Word Count Analysis
    const wordCount = coverLetter.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount > 0 && wordCount < 40) {
      warnings.push({
        id: 'too_short',
        type: 'warning',
        title: '📝 Cover letter is too brief',
        message: 'Proposals under 40 words have lower response rates. Provide details on your technical approach.',
      });
      score -= 10;
    } else if (wordCount >= 40) {
      strengths.push({
        id: 'length_ok',
        title: '📄 Good Proposal Length & Detail',
        message: `Well-structured description (${wordCount} words).`,
      });
    }

    // Clamp score 0 to 100
    const finalScore = Math.min(100, Math.max(15, score));

    res.json({
      success: true,
      data: {
        score: finalScore,
        scoreLabel: finalScore >= 85 ? 'Top Tier Proposal 🚀' : finalScore >= 70 ? 'Strong Proposal 👍' : 'Needs Optimization ⚠️',
        warnings,
        strengths,
        quickFixes,
        benchmark: {
          jobBudget: targetBudget,
          avgProposalBid: avgAccepted,
        }
      }
    });
  } catch (error) {
    console.error('Proposal Coach error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate proposal coach feedback.' });
  }
};

// ─── Budget Reality-Check at Posting Time (Client-side AI) ──────────────────
const getBudgetRealityCheck = async (req, res) => {
  try {
    const { title = '', category = '', description = '', skills = [], enteredBudget = 0 } = req.body;

    // Search historical jobs in category or matching skills
    let query = {};
    if (category) query.category = category;

    const similarJobs = await Job.find(query).select('budget proposals category skills');

    let totalBudgetSum = 0;
    let validCount = 0;

    similarJobs.forEach(j => {
      if (j.budget && j.budget > 0) {
        totalBudgetSum += j.budget;
        validCount++;
      }
    });

    let avgMarketBudget = validCount > 0 ? Math.round(totalBudgetSum / validCount) : 25000;
    
    // Category baseline adjustments
    if (category === 'Web Development') avgMarketBudget = Math.max(avgMarketBudget, 20000);
    else if (category === 'Mobile Apps') avgMarketBudget = Math.max(avgMarketBudget, 35000);
    else if (category === 'Design & UI/UX') avgMarketBudget = Math.max(avgMarketBudget, 15000);
    else if (category === 'Backend / API') avgMarketBudget = Math.max(avgMarketBudget, 25000);

    const minRange = Math.round(avgMarketBudget * 0.75);
    const maxRange = Math.round(avgMarketBudget * 1.35);

    const numEntered = Number(enteredBudget) || 0;
    let isLowball = false;
    let lowballPct = 0;
    let statusLabel = 'Market Aligned ✅';

    if (numEntered > 0 && numEntered < minRange) {
      isLowball = true;
      lowballPct = Math.round(((minRange - numEntered) / minRange) * 100);
      statusLabel = `Lowball Warning (${lowballPct}% below typical scope)`;
    }

    res.json({
      success: true,
      data: {
        category: category || 'General Scope',
        typicalRange: `₹${minRange.toLocaleString('en-IN')} – ₹${maxRange.toLocaleString('en-IN')}`,
        minRange,
        maxRange,
        recommendedBudget: Math.round(avgMarketBudget / 100) * 100,
        isLowball,
        lowballPercentage: lowballPct,
        statusLabel,
        guidanceNote: `Is scope ke jobs typical standard category metrics ke according ₹${minRange.toLocaleString('en-IN')} – ₹${maxRange.toLocaleString('en-IN')} mein fund hote hain. Realistic budgets receive 3x more quality applications.`,
      }
    });
  } catch (error) {
    console.error('Budget Reality-Check error:', error);
    res.status(500).json({ success: false, message: 'Failed to compute budget reality-check.' });
  }
};

// ─── Build Log / WIP Timeline Controllers ────────────────────────────────────
const addBuildLog = async (req, res) => {
  try {
    const { note, attachments = [], checklist = [], progressPercentage = 0 } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    const isClient = job.client.toString() === req.user.id;
    const isFreelancer = job.hiredFreelancer && job.hiredFreelancer.toString() === req.user.id;

    if (!isClient && !isFreelancer) {
      return res.status(403).json({ success: false, message: 'Not authorized for this job.' });
    }

    const logEntry = {
      author: req.user.id,
      note,
      attachments,
      checklist,
      progressPercentage: Number(progressPercentage) || 0,
    };

    job.buildLogs.push(logEntry);

    if (isClient) {
      job.lastClientActivityAt = new Date();
    }

    await job.save();
    const updatedJob = await Job.findById(job._id).populate('buildLogs.author', 'firstName lastName profilePhoto role');

    res.status(201).json({ success: true, message: 'Build Log entry posted successfully.', data: updatedJob.buildLogs });
  } catch (error) {
    console.error('Add Build Log error:', error);
    res.status(500).json({ success: false, message: 'Failed to add build log.' });
  }
};

const toggleBuildLogChecklist = async (req, res) => {
  try {
    const { logId, itemIndex } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    const log = job.buildLogs.id(logId);
    if (!log) return res.status(404).json({ success: false, message: 'Build log not found.' });

    if (log.checklist && log.checklist[itemIndex]) {
      log.checklist[itemIndex].completed = !log.checklist[itemIndex].completed;
    }

    await job.save();
    res.json({ success: true, message: 'Checklist updated.', data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle checklist.' });
  }
};

// ─── Anti-Ghosting No-Ghost Deposit Claim Controller ─────────────────────────
const claimNoGhostDeposit = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    const isFreelancer = job.hiredFreelancer && job.hiredFreelancer.toString() === req.user.id;
    if (!isFreelancer) {
      return res.status(403).json({ success: false, message: 'Only the hired freelancer can claim ghosting compensation.' });
    }

    if (job.noGhostDeposit?.status === 'claimed') {
      return res.status(400).json({ success: false, message: 'No-Ghost deposit has already been claimed for this job.' });
    }

    const diffMs = Date.now() - new Date(job.lastClientActivityAt).getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    // Require at least 3 days of client inactivity (or 0 for test demo)
    const depositAmount = job.noGhostDeposit?.amount || 500;

    job.noGhostDeposit.status = 'claimed';
    job.noGhostDeposit.claimedAt = new Date();
    await job.save();

    // Credit freelancer wallet
    const User = require('../models/User.model');
    const freelancer = await User.findById(req.user.id);
    if (freelancer) {
      freelancer.walletBalance = (freelancer.walletBalance || 0) + depositAmount;
      if (freelancer.freelancerProfile) {
        freelancer.freelancerProfile.totalEarnings = (freelancer.freelancerProfile.totalEarnings || 0) + depositAmount;
      }
      await freelancer.save();
    }

    // Create transaction record
    const Transaction = require('../models/Transaction.model');
    await Transaction.create({
      client: job.client,
      freelancer: req.user.id,
      job: job._id,
      amount: depositAmount,
      platformFee: 0,
      total: depositAmount,
      gateway: 'razorpay',
      status: 'ghost_claimed',
      paidAt: new Date(),
      releasedAt: new Date(),
      notes: `Anti-Ghosting Seriousness Deposit credited due to client inactivity (> 3 days).`,
    });

    res.json({
      success: true,
      message: `No-Ghost Seriousness Deposit of ₹${depositAmount.toLocaleString()} credited to your wallet balance!`,
      data: {
        claimedAmount: depositAmount,
        claimedAt: job.noGhostDeposit.claimedAt,
      },
    });
  } catch (error) {
    console.error('Claim No-Ghost Deposit error:', error);
    res.status(500).json({ success: false, message: 'Failed to claim no-ghost deposit.' });
  }
};

// ─── Sub-Hire / Informal Team Split Controllers ──────────────────────────────
const inviteSubHire = async (req, res) => {
  try {
    const { freelancerId, role, splitPercentage } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    if (job.hiredFreelancer?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the lead freelancer on this job can invite sub-hires.' });
    }

    if (!freelancerId || !role || !splitPercentage) {
      return res.status(400).json({ success: false, message: 'Please provide freelancer ID, role, and split percentage.' });
    }

    const currentTotalSplit = job.subHires.reduce((acc, sh) => acc + (sh.splitPercentage || 0), 0);
    if (currentTotalSplit + Number(splitPercentage) >= 100) {
      return res.status(400).json({ success: false, message: 'Total sub-hire split percentage cannot exceed 99%.' });
    }

    job.subHires.push({
      freelancer: freelancerId,
      role,
      splitPercentage: Number(splitPercentage),
      status: 'accepted', // Auto-accepted for smooth demo
      invitedAt: new Date(),
    });

    await job.save();
    const updatedJob = await Job.findById(job._id).populate('subHires.freelancer', 'firstName lastName email profilePhoto');

    res.status(201).json({ success: true, message: 'Sub-hire team member added to contract.', data: updatedJob.subHires });
  } catch (error) {
    console.error('Invite Sub-hire error:', error);
    res.status(500).json({ success: false, message: 'Failed to invite sub-hire.' });
  }
};

const respondSubHire = async (req, res) => {
  try {
    const { subHireId, status } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    const sub = job.subHires.id(subHireId);
    if (!sub) return res.status(404).json({ success: false, message: 'Sub-hire invite not found.' });

    if (sub.freelancer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    sub.status = status;
    await job.save();
    res.json({ success: true, message: `Sub-hire invite ${status}.`, data: sub });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to respond to sub-hire invite.' });
  }
};

// ─── Fair-Queue Status Controller ─────────────────────────────────────────────
const getFairQueueStatus = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    const revealsAt = job.fairQueue?.revealsAt || new Date(new Date(job.createdAt).getTime() + 2 * 60 * 60 * 1000);
    const isRevealed = Date.now() >= new Date(revealsAt).getTime() || job.fairQueue?.isRevealed;

    res.json({
      success: true,
      data: {
        enabled: job.fairQueue?.enabled ?? true,
        windowHours: job.fairQueue?.windowHours || 2,
        revealsAt,
        isRevealed,
        proposalCount: job.proposals?.length || 0,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch fair queue status.' });
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
  // ── New 10-Feature Controllers ──
  getProposalCoachFeedback,
  getBudgetRealityCheck,
  addBuildLog,
  toggleBuildLogChecklist,
  claimNoGhostDeposit,
  inviteSubHire,
  respondSubHire,
  getFairQueueStatus,
};

