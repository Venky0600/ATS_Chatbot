const express = require('express');
const router = express.Router();
const telegramController = require('../controllers/telegram.controller');

router.post('/webhook', telegramController.handleWebhook);
router.post('/set-webhook', telegramController.setWebhook);
router.get('/info', telegramController.getTelegramInfo);

module.exports = router;
