const Vouch = require('../models/Vouch.model');
const User = require('../models/User.model');

// ─── Submit a Work Sample for Peer Skill Vouching ────────────────────────────
const requestSkillVouch = async (req, res) => {
  try {
    const { skill, workSampleUrl, description } = req.body;
    if (!skill || !workSampleUrl || !description) {
      return res.status(400).json({ success: false, message: 'Please provide skill name, work sample URL, and description.' });
    }

    // Find top-rated community peers in the platform to act as vouchers
    const peers = await User.find({
      _id: { $ne: req.user.id },
      role: 'freelancer',
    })
      .select('_id firstName lastName profilePhoto freelancerProfile.rating')
      .limit(3);

    const voucherEntries = peers.map(p => ({
      voucher: p._id,
      status: 'pending',
    }));

    const vouch = await Vouch.create({
      applicant: req.user.id,
      skill,
      workSampleUrl,
      description,
      vouchers: voucherEntries,
      requiredVouchesCount: 2,
    });

    res.status(201).json({
      success: true,
      message: `Skill Vouch Request for "${skill}" submitted to ${peers.length} top-rated community peers!`,
      data: vouch,
    });
  } catch (error) {
    console.error('Request skill vouch error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit skill vouch request.' });
  }
};

// ─── Get Pending Vouch Requests Assigned to the Current Peer User ────────────
const getPendingVouches = async (req, res) => {
  try {
    const vouches = await Vouch.find({
      'vouchers.voucher': req.user.id,
      status: 'pending',
    })
      .populate('applicant', 'firstName lastName email profilePhoto freelancerProfile')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: vouches.length, data: vouches });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch pending vouches.' });
  }
};

// ─── Respond to / Approve a Peer Work Sample Vouch ───────────────────────────
const respondSkillVouch = async (req, res) => {
  try {
    const { vouchId } = req.params;
    const { status, feedback } = req.body; // status: 'approved' | 'rejected'

    const vouch = await Vouch.findById(vouchId);
    if (!vouch) return res.status(404).json({ success: false, message: 'Vouch request not found.' });

    const entry = vouch.vouchers.find(v => v.voucher.toString() === req.user.id);
    if (!entry) return res.status(403).json({ success: false, message: 'You are not assigned as a voucher for this request.' });

    entry.status = status;
    entry.feedback = feedback || '';
    entry.vouchedAt = new Date();

    const approvedCount = vouch.vouchers.filter(v => v.status === 'approved').length;

    if (approvedCount >= vouch.requiredVouchesCount) {
      vouch.status = 'verified';

      // Update applicant's user profile to add the verified Peer-Vouched Skill Badge!
      const applicant = await User.findById(vouch.applicant);
      if (applicant) {
        if (!applicant.freelancerProfile) applicant.freelancerProfile = {};
        if (!applicant.freelancerProfile.vouchedSkills) applicant.freelancerProfile.vouchedSkills = [];

        const existing = applicant.freelancerProfile.vouchedSkills.find(vs => vs.skill.toLowerCase() === vouch.skill.toLowerCase());
        if (existing) {
          existing.count += 1;
          if (!existing.vouchedBy.includes(req.user.id)) existing.vouchedBy.push(req.user.id);
        } else {
          applicant.freelancerProfile.vouchedSkills.push({
            skill: vouch.skill,
            count: approvedCount,
            vouchedBy: [req.user.id],
            verifiedAt: new Date(),
          });
        }
        await applicant.save();
      }
    }

    await vouch.save();
    res.json({ success: true, message: `Skill vouch ${status} successfully!`, data: vouch });
  } catch (error) {
    console.error('Respond skill vouch error:', error);
    res.status(500).json({ success: false, message: 'Failed to respond to vouch request.' });
  }
};

// ─── Get Verified Vouches for a Specific User (Public Profile) ───────────────
const getUserVouches = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('firstName lastName freelancerProfile.vouchedSkills');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.json({
      success: true,
      data: user.freelancerProfile?.vouchedSkills || [],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user vouches.' });
  }
};

module.exports = {
  requestSkillVouch,
  getPendingVouches,
  respondSkillVouch,
  getUserVouches,
};
