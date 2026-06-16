const express = require('express');
const router = express.Router();
const { registerUser, loginUser, resetPassword, updateProfile, updatePassword, toggleTwoFactor } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/reset-password', resetPassword);
router.put('/profile', protect, updateProfile);
router.put('/update-password', protect, updatePassword);
router.put('/two-factor', protect, toggleTwoFactor);

module.exports = router;
