const TelegramBot = require('node-telegram-bot-api');
const env = require('../../config/environment');
const {
  handleStartCommand,
  handleNewCommand,
  handleHelpCommand,
  handleHistoryCommand,
  handleDocumentMessage,
  handleTextMessage,
  handleCallbackQuery
} = require('./telegram.handlers');

let botInstance = null;

const getTelegramBot = () => {
  if (!botInstance) {
    const token = env.telegramBotToken || 'mock_telegram_bot_token_sample';
    // Instantiate Telegram bot without automatic polling in webhook production mode
    botInstance = new TelegramBot(token, { polling: false });

    // Attach internal handlers for polling or direct update processing
    botInstance.on('message', async (msg) => {
      try {
        if (msg.text && msg.text.startsWith('/start')) {
          await handleStartCommand(botInstance, msg);
        } else if (msg.text && msg.text.startsWith('/new')) {
          await handleNewCommand(botInstance, msg);
        } else if (msg.text && msg.text.startsWith('/help')) {
          await handleHelpCommand(botInstance, msg);
        } else if (msg.text && msg.text.startsWith('/history')) {
          await handleHistoryCommand(botInstance, msg);
        } else if (msg.document) {
          await handleDocumentMessage(botInstance, msg);
        } else if (msg.text) {
          await handleTextMessage(botInstance, msg);
        }
      } catch (err) {
        console.error('[Telegram Service Message Handling Error]:', err);
      }
    });

    botInstance.on('callback_query', async (query) => {
      try {
        await handleCallbackQuery(botInstance, query);
      } catch (err) {
        console.error('[Telegram Service Callback Error]:', err);
      }
    });
  }
  return botInstance;
};

const processTelegramUpdate = async (update) => {
  const bot = getTelegramBot();
  return bot.processUpdate(update);
};

const setTelegramWebhook = async (webhookUrl) => {
  const bot = getTelegramBot();
  return await bot.setWebHook(webhookUrl);
};

module.exports = {
  getTelegramBot,
  processTelegramUpdate,
  setTelegramWebhook
};
