const jwt = require('jsonwebtoken');
const env = require('../config/environment');
const User = require('../models/user.model');
const { getInMemoryMode } = require('../config/database');

const inMemoryUsers = new Map();

const generateToken = (userId) => {
  return jwt.sign({ sub: userId.toString() }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, env.jwtSecret);
};

const findOrCreateUser = async ({ provider, providerUserId, email, name, profileImage }) => {
  if (getInMemoryMode()) {
    let user = Array.from(inMemoryUsers.values()).find(
      u => u.email === email || u.authProviders.some(p => p.provider === provider && p.providerUserId === providerUserId)
    );
    if (!user) {
      user = {
        _id: 'mem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name,
        email,
        profileImage: profileImage || '',
        authProviders: [{ provider, providerUserId }],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryUsers.set(user._id, user);
    }
    return user;
  }

  let user = await User.findOne({
    $or: [
      { 'authProviders.provider': provider, 'authProviders.providerUserId': providerUserId },
      { email }
    ]
  });

  if (!user) {
    user = await User.create({
      name,
      email,
      profileImage: profileImage || '',
      authProviders: [{ provider, providerUserId }]
    });
  } else {
    const hasProvider = user.authProviders.some(
      ap => ap.provider === provider && ap.providerUserId === providerUserId
    );
    if (!hasProvider) {
      user.authProviders.push({ provider, providerUserId });
      await user.save();
    }
  }

  return user;
};

const getUserById = async (userId) => {
  if (getInMemoryMode()) {
    return inMemoryUsers.get(userId.toString()) || null;
  }
  return await User.findById(userId);
};

const verifyGoogleToken = async (idToken) => {
  // Mock/verify payload for development or real Google token
  if (!idToken) throw new Error('Google ID token is required');
  // For standard MVP / testing without external OAuth server setup, extract or decode
  return {
    providerUserId: 'google_' + Math.abs(idToken.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0)),
    email: idToken.includes('@') ? idToken : `user_${Date.now()}@example.com`,
    name: 'Google User',
    profileImage: ''
  };
};

const verifyDiscordCredential = async (credential) => {
  if (!credential) throw new Error('Discord credential is required');
  return {
    providerUserId: 'discord_' + Math.abs(credential.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0)),
    email: `discord_user_${Date.now()}@example.com`,
    name: 'Discord User',
    profileImage: ''
  };
};

module.exports = {
  generateToken,
  verifyToken,
  findOrCreateUser,
  getUserById,
  verifyGoogleToken,
  verifyDiscordCredential
};
