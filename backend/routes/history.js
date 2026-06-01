const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const GeneratedContent = require('../models/GeneratedContent');

// @desc    Get user's content history
// @route   GET /api/history
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const content = await GeneratedContent.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(content);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch history' });
  }
});

// @desc    Delete a history item
// @route   DELETE /api/history/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await GeneratedContent.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Content not found' });
    }
    if (String(item.user) !== String(req.user._id)) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await item.deleteOne();
    res.json({ message: 'Content deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete content' });
  }
});

module.exports = router;
