const cloudinary = require('cloudinary').v2;
const User = require('../models/User.model');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Get profile (public) ─────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).lean();
    if (!user || !user.isActive) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }
    // Strip private fields for public view
    const { password, refreshTokens, emailVerificationToken, passwordResetToken, ...publicUser } = user;
    return res.json({ success: true, data: { user: publicUser } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, location, timezone, role, profilePhoto } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { firstName, lastName, phone, location, timezone, ...(role !== undefined && { role }), ...(profilePhoto !== undefined && { profilePhoto }) } },
      { new: true, runValidators: true }
    );

    checkProfileComplete(user);
    await user.save();

    return res.json({ success: true, message: 'Profile updated.', data: { user: user.toPublicJSON() } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

// ─── Update freelancer profile ────────────────────────────────────────────────
const updateFreelancerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'freelancer') {
      return res.status(403).json({ success: false, message: 'Access denied. Freelancer only.' });
    }

    const {
      title, bio, skills, hourlyRate, experienceLevel,
      education, certifications, languages, availability,
      experience, aboutMeTags, socials, availabilityHours,
      availabilityType, availabilityContract,
    } = req.body;

    user.freelancerProfile = {
      ...user.freelancerProfile,
      ...(title !== undefined && { title }),
      ...(bio !== undefined && { bio }),
      ...(skills !== undefined && { skills }),
      ...(hourlyRate !== undefined && { hourlyRate }),
      ...(experienceLevel !== undefined && { experienceLevel }),
      ...(education !== undefined && { education }),
      ...(certifications !== undefined && { certifications }),
      ...(languages !== undefined && { languages }),
      ...(availability !== undefined && { availability }),
      ...(experience !== undefined && { experience }),
      ...(aboutMeTags !== undefined && { aboutMeTags }),
      ...(socials !== undefined && { socials }),
      ...(availabilityHours !== undefined && { availabilityHours }),
      ...(availabilityType !== undefined && { availabilityType }),
      ...(availabilityContract !== undefined && { availabilityContract }),
      // Preserve computed fields
      totalEarnings: user.freelancerProfile?.totalEarnings || 0,
      completedJobs: user.freelancerProfile?.completedJobs || 0,
      rating: user.freelancerProfile?.rating || 0,
      reviewCount: user.freelancerProfile?.reviewCount || 0,
      portfolio: user.freelancerProfile?.portfolio || [],
    };

    checkProfileComplete(user);
    await user.save();

    return res.json({ success: true, message: 'Freelancer profile updated.', data: { user: user.toPublicJSON() } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update freelancer profile.' });
  }
};

// ─── Update client profile ────────────────────────────────────────────────────
const updateClientProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'client') {
      return res.status(403).json({ success: false, message: 'Access denied. Client only.' });
    }

    const { companyName, companySize, industry, website, bio } = req.body;

    user.clientProfile = {
      ...user.clientProfile,
      ...(companyName !== undefined && { companyName }),
      ...(companySize !== undefined && { companySize }),
      ...(industry !== undefined && { industry }),
      ...(website !== undefined && { website }),
      ...(bio !== undefined && { bio }),
      totalSpent: user.clientProfile?.totalSpent || 0,
      postedJobs: user.clientProfile?.postedJobs || 0,
      hiredFreelancers: user.clientProfile?.hiredFreelancers || 0,
      rating: user.clientProfile?.rating || 0,
      reviewCount: user.clientProfile?.reviewCount || 0,
    };

    checkProfileComplete(user);
    await user.save();

    return res.json({ success: true, message: 'Client profile updated.', data: { user: user.toPublicJSON() } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update client profile.' });
  }
};

// ─── Upload profile photo ─────────────────────────────────────────────────────
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }

    const user = await User.findById(req.user.id);

    // Delete old photo from Cloudinary
    if (user.profilePhotoPublicId) {
      await cloudinary.uploader.destroy(user.profilePhotoPublicId).catch(console.error);
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'freelance-marketplace/avatars',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    user.profilePhoto = result.secure_url;
    user.profilePhotoPublicId = result.public_id;
    await user.save();

    return res.json({
      success: true,
      message: 'Profile photo updated.',
      data: { profilePhoto: result.secure_url },
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload profile photo.' });
  }
};

// ─── Generic file upload (portfolio images, proposal attachments, job submission files) ──
// Accepts any single file under field name "file", uploads it to Cloudinary, and
// returns the secure URL + original filename + resource type. The frontend then
// stores this URL wherever it's needed (portfolio.imageUrl, proposal.attachments, etc).
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided.' });
    }

    const resourceType = req.file.mimetype?.startsWith('image/') ? 'image' : 'raw';
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'freelance-marketplace/uploads',
          resource_type: resourceType,
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    let secureUrl = result.secure_url;
    if (resourceType === 'raw' && secureUrl.includes('/image/upload/')) {
      secureUrl = secureUrl.replace('/image/upload/', '/raw/upload/');
    }

    return res.status(201).json({
      success: true,
      message: 'File uploaded successfully.',
      data: {
        url: secureUrl,
        publicId: result.public_id,
        originalName: req.file.originalname,
        fileType: req.file.mimetype,
        size: req.file.size,
        cloudinaryResourceType: resourceType,
      },
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload file.' });
  }
};

// ─── Portfolio management (freelancer) ───────────────────────────────────────
const addPortfolioItem = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'freelancer') {
      return res.status(403).json({ success: false, message: 'Freelancers only.' });
    }

    const { title, description, url, imageUrl, technologies } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Portfolio item title is required.' });

    user.freelancerProfile.portfolio.push({ title, description, url, imageUrl, technologies });
    await user.save();

    return res.status(201).json({
      success: true,
      message: 'Portfolio item added.',
      data: { portfolio: user.freelancerProfile.portfolio },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add portfolio item.' });
  }
};

const updatePortfolioItem = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'freelancer') {
      return res.status(403).json({ success: false, message: 'Freelancers only.' });
    }

    const item = user.freelancerProfile.portfolio.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Portfolio item not found.' });

    const { title, description, url, imageUrl, technologies } = req.body;
    if (title) item.title = title;
    if (description !== undefined) item.description = description;
    if (url !== undefined) item.url = url;
    if (imageUrl !== undefined) item.imageUrl = imageUrl;
    if (technologies !== undefined) item.technologies = technologies;

    await user.save();

    return res.json({
      success: true,
      message: 'Portfolio item updated.',
      data: { portfolio: user.freelancerProfile.portfolio },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update portfolio item.' });
  }
};

const deletePortfolioItem = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'freelancer') {
      return res.status(403).json({ success: false, message: 'Freelancers only.' });
    }

    user.freelancerProfile.portfolio = user.freelancerProfile.portfolio.filter(
      (item) => item._id.toString() !== req.params.itemId
    );
    await user.save();

    return res.json({
      success: true,
      message: 'Portfolio item removed.',
      data: { portfolio: user.freelancerProfile.portfolio },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete portfolio item.' });
  }
};

// ─── Helper: auto-check profile completeness ─────────────────────────────────
const checkProfileComplete = (user) => {
  let isComplete = false;
  if (user.role === 'freelancer') {
    const fp = user.freelancerProfile;
    isComplete = !!(
      user.firstName && user.lastName && user.profilePhoto &&
      fp?.title && fp?.bio && fp?.skills?.length > 0 && fp?.hourlyRate
    );
  } else if (user.role === 'client') {
    isComplete = !!(user.firstName && user.lastName && user.profilePhoto);
  }
  user.isProfileComplete = isComplete;
};

const getFreelancerList = async (req, res) => {
  try {
    const freelancers = await User.find({ role: 'freelancer', isActive: true })
      .select('firstName lastName email profilePhoto phone location freelancerProfile createdAt')
      .lean();
    
    const list = freelancers.map(u => {
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

    return res.json({ success: true, data: list });
  } catch (error) {
    console.error("Failed to list freelancers:", error);
    res.status(500).json({ success: false, message: 'Server error listing freelancers.' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateFreelancerProfile,
  updateClientProfile,
  uploadProfilePhoto,
  uploadFile,
  addPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  getFreelancerList
};


