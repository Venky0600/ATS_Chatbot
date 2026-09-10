const {
  verifyGoogleToken,
  verifyDiscordCredential,
  findOrCreateUser,
  generateToken
} = require('../services/auth.service');
const { sendSuccess, sendError } = require('../utils/response');

const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return sendError(res, 'Google idToken is required', 400, 'VALIDATION_ERROR');
    }

    const payload = await verifyGoogleToken(idToken);
    const user = await findOrCreateUser({
      provider: 'google',
      providerUserId: payload.providerUserId,
      email: payload.email,
      name: payload.name,
      profileImage: payload.profileImage
    });

    const accessToken = generateToken(user._id);

    return sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        authProviders: user.authProviders.map(ap => ap.provider)
      },
      accessToken,
      expiresIn: 604800
    }, 'Google authentication successful');
  } catch (error) {
    next(error);
  }
};

const discordLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return sendError(res, 'Discord credential is required', 400, 'VALIDATION_ERROR');
    }

    const payload = await verifyDiscordCredential(credential);
    const user = await findOrCreateUser({
      provider: 'discord',
      providerUserId: payload.providerUserId,
      email: payload.email,
      name: payload.name,
      profileImage: payload.profileImage
    });

    const accessToken = generateToken(user._id);

    return sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        authProviders: user.authProviders.map(ap => ap.provider)
      },
      accessToken,
      expiresIn: 604800
    }, 'Discord authentication successful');
  } catch (error) {
    next(error);
  }
};

const me = async (req, res) => {
  return sendSuccess(res, {
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      profileImage: req.user.profileImage,
      authProviders: req.user.authProviders ? req.user.authProviders.map(ap => ap.provider) : []
    }
  }, 'Current user profile');
};

const logout = async (req, res) => {
  return sendSuccess(res, null, 'Logged out successfully');
};

module.exports = {
  googleLogin,
  discordLogin,
  me,
  logout
};
