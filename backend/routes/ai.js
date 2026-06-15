const express = require('express');
const router = express.Router();
const {
  generateSocialPost,
  generateAdCopy,
  generateEmail,
  generateSEO,
  generateChat,
  generateBanner,
  editImage,
  uploadAndEditImage,
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// Optional auth — attaches req.user if valid token present, else continues as guest
const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    const token = req.headers.authorization.split(' ')[1];
    try {
      const jwt = require('jsonwebtoken');
      const User = require('../models/User');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch {}
  }
  next();
};

// All AI routes (history saves if user is logged in)
router.post('/social', optionalProtect, generateSocialPost);
router.post('/ad-copy', optionalProtect, generateAdCopy);
router.post('/email', optionalProtect, generateEmail);
router.post('/seo', optionalProtect, generateSEO);
router.post('/chat', optionalProtect, generateChat);
router.post('/banner', optionalProtect, generateBanner);
router.post('/edit-image', optionalProtect, editImage);
router.post('/upload-edit', optionalProtect, uploadAndEditImage);

module.exports = router;
