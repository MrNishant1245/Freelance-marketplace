const express = require('express');
const router = express.Router();
const {
  getProfile, updateProfile, updateFreelancerProfile, updateClientProfile,
  uploadProfilePhoto, uploadFile, addPortfolioItem, updatePortfolioItem, deletePortfolioItem,
  getFreelancerList
} = require('../controllers/profile.controller');
const { protect, requireEmailVerified } = require('../middlewares/auth.middleware');
const { validate, updateProfileRules, freelancerProfileRules } = require('../middlewares/validation.middleware');
const upload = require('../middlewares/upload.middleware');
const { uploadDoc } = require('../middlewares/upload.middleware');

// Public
router.get('/list/freelancers', getFreelancerList);
router.get('/:userId', getProfile);

// Protected
router.use(protect);
router.put('/', updateProfileRules, validate, updateProfile);
router.put('/freelancer', freelancerProfileRules, validate, updateFreelancerProfile);
router.put('/client', updateClientProfile);
router.post('/photo', upload.single('photo'), uploadProfilePhoto);

// Generic file upload — used by portfolio images, proposal attachments, job submission files
router.post('/upload-file', uploadDoc.single('file'), uploadFile);

// Portfolio
router.post('/portfolio', addPortfolioItem);
router.put('/portfolio/:itemId', updatePortfolioItem);
router.delete('/portfolio/:itemId', deletePortfolioItem);

module.exports = router;
