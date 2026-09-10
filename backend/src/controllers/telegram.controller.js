const telegramService = require('../services/telegram/telegram.service');
const { sendSuccess, sendError } = require('../utils/response');

const handleWebhook = async (req, res, next) => {
  try {
    const update = req.body;
    if (!update || Object.keys(update).length === 0) {
      return sendError(res, 'Invalid or empty Telegram update payload', 400, 'VALIDATION_ERROR');
    }

    // Process update
    await telegramService.processTelegramUpdate(update);

    // Return 200 OK immediately to Telegram Webhook Engine
    return res.status(200).send('OK');
  } catch (error) {
    console.error('[Telegram Webhook Error]:', error);
    // Return 200 OK to Telegram to acknowledge webhook delivery even if message processing had an error
    return res.status(200).send('OK');
  }
};

const setWebhook = async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) {
      return sendError(res, 'Webhook url is required', 400, 'VALIDATION_ERROR');
    }

    const result = await telegramService.setTelegramWebhook(url);
    return sendSuccess(res, { result }, 'Telegram webhook registered successfully');
  } catch (error) {
    next(error);
  }
};

const getTelegramInfo = async (req, res) => {
  return sendSuccess(res, {
    status: 'ACTIVE',
    webhookEndpoint: '/api/v1/telegram/webhook',
    supportedCommands: ['/start', '/new', '/history', '/help']
  }, 'Telegram Bot service status');
};

module.exports = {
  handleWebhook,
  setWebhook,
  getTelegramInfo
};
