const mongoose = require('mongoose');

const authProviderSchema = new mongoose.Schema({
  provider: {
    type: String,
    enum: ['google', 'discord', 'telegram'],
    required: true
  },
  providerUserId: {
    type: String,
    required: true
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  profileImage: {
    type: String,
    default: ''
  },
  authProviders: [authProviderSchema]
}, {
  timestamps: true
});

userSchema.index({ 'authProviders.provider': 1, 'authProviders.providerUserId': 1 });

module.exports = mongoose.model('User', userSchema);
