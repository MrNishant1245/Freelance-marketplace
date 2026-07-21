const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, toggleSuspendUser, deleteUser } = require('../controllers/user.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/', getAllUsers);
router.get('/:userId', getUserById);
router.patch('/:userId/suspend', toggleSuspendUser);
router.delete('/:userId', deleteUser);

module.exports = router;
