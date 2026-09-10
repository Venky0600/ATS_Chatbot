const { verifyToken, getUserById } = require('../services/auth.service');
const { sendError } = require('../utils/response');

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication token is required', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.sub) {
      return sendError(res, 'Invalid authentication token', 401, 'INVALID_TOKEN');
    }

    const user = await getUserById(decoded.sub);
    if (!user) {
      return sendError(res, 'User session expired or invalid', 401, 'USER_NOT_FOUND');
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 'Authentication failed: ' + error.message, 401, 'UNAUTHORIZED');
  }
};

module.exports = { requireAuth };
