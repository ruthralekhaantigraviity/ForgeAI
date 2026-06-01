const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['Admin', 'Business User'],
      default: 'Business User',
    },
    subscription: {
      type: String,
      enum: ['Free', 'Pro', 'Enterprise'],
      default: 'Free',
    },
    credits: {
      type: Number,
      default: 10, // Default free credits
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
