const express = require('express');
const router = express.Router();
const {
  generateSocialPost,
  generateAdCopy,
  generateEmail,
  generateSEO,
  generateChat,
  generateBanner,
} = require('../controllers/aiController');

// All AI routes
router.post('/social', generateSocialPost);
router.post('/ad-copy', generateAdCopy);
router.post('/email', generateEmail);
router.post('/seo', generateSEO);
router.post('/chat', generateChat);
router.post('/banner', generateBanner);

module.exports = router;
