const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    planName: {
      type: String,
      enum: ['Free', 'Pro', 'Enterprise'],
      required: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
    },
    features: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
