const mongoose = require('mongoose');

const generatedContentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contentType: {
      type: String,
      enum: ['Social Post', 'Banner', 'Ad Copy', 'Email', 'SEO Article'],
      required: true,
    },
    inputPrompt: {
      type: Object, // Can be a string or complex object with multiple fields
      required: true,
    },
    generatedOutput: {
      type: mongoose.Schema.Types.Mixed, // Can be string text or URL to image
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('GeneratedContent', generatedContentSchema);
