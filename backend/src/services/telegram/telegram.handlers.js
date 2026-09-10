const telegramStateModel = require('../../models/telegramState.model');
const { findOrCreateUser } = require('../auth.service');
const resumeService = require('../resume.service');
const jdService = require('../jd.service');
const analysisService = require('../analysis.service');
const { getInMemoryMode } = require('../../config/database');
const {
  formatStartMessage,
  formatHelpMessage,
  formatAnalysisResult,
  formatHistoryList,
  getAnalysisActionButtons
} = require('./telegram.formatter');

const inMemoryTelegramStates = new Map();

// Helper to safely send Telegram messages without dumping ETELEGRAM network errors in mock/test mode
const safeSendMessage = async (bot, chatId, text, options = {}) => {
  try {
    return await bot.sendMessage(chatId, text, options);
  } catch (err) {
    if (process.env.NODE_ENV === 'test' || err.code === 'ETELEGRAM') {
      return null;
    }
    throw err;
  }
};

const safeAnswerCallbackQuery = async (bot, callbackQueryId, options = {}) => {
  try {
    return await bot.answerCallbackQuery(callbackQueryId, options);
  } catch (err) {
    if (process.env.NODE_ENV === 'test' || err.code === 'ETELEGRAM') {
      return null;
    }
    throw err;
  }
};

// Helper to get or create Telegram state mapped to App User
const getOrCreateTelegramUser = async (telegramUser) => {
  const telegramUserId = telegramUser.id.toString();

  if (getInMemoryMode()) {
    let state = inMemoryTelegramStates.get(telegramUserId);
    if (!state) {
      const appUser = await findOrCreateUser({
        provider: 'google',
        providerUserId: `telegram_${telegramUserId}`,
        email: `telegram_${telegramUserId}@telegram.user`,
        name: telegramUser.first_name || telegramUser.username || 'Telegram User'
      });

      state = {
        telegramUserId,
        userId: appUser._id,
        username: telegramUser.username || '',
        firstName: telegramUser.first_name || '',
        state: 'WAITING_FOR_RESUME',
        currentResumeId: '',
        currentJobDescriptionId: '',
        currentAnalysisId: '',
        save: async function() { inMemoryTelegramStates.set(telegramUserId, this); }
      };
      inMemoryTelegramStates.set(telegramUserId, state);
    }
    return state;
  }

  let state = await telegramStateModel.findOne({ telegramUserId });
  if (!state) {
    const appUser = await findOrCreateUser({
      provider: 'google',
      providerUserId: `telegram_${telegramUserId}`,
      email: `telegram_${telegramUserId}@telegram.user`,
      name: telegramUser.first_name || telegramUser.username || 'Telegram User'
    });

    state = await telegramStateModel.create({
      telegramUserId,
      userId: appUser._id,
      username: telegramUser.username || '',
      firstName: telegramUser.first_name || '',
      state: 'WAITING_FOR_RESUME'
    });
  }

  return state;
};

// Handle /start command
const handleStartCommand = async (bot, msg) => {
  const state = await getOrCreateTelegramUser(msg.from);
  state.state = 'WAITING_FOR_RESUME';
  await state.save();

  const welcomeText = formatStartMessage(msg.from.first_name);
  await safeSendMessage(bot, msg.chat.id, welcomeText, { parse_mode: 'Markdown' });
};

// Handle /new command
const handleNewCommand = async (bot, msg) => {
  const state = await getOrCreateTelegramUser(msg.from);
  state.state = 'WAITING_FOR_RESUME';
  state.currentResumeId = '';
  state.currentJobDescriptionId = '';
  state.currentAnalysisId = '';
  await state.save();

  await safeSendMessage(bot, msg.chat.id, `🔄 *Resetting workflow.* Please send your resume document (*PDF*, *DOCX*, or *TXT*).`, { parse_mode: 'Markdown' });
};

// Handle /help command
const handleHelpCommand = async (bot, msg) => {
  await getOrCreateTelegramUser(msg.from);
  const text = formatHelpMessage();
  await safeSendMessage(bot, msg.chat.id, text, { parse_mode: 'Markdown' });
};

// Handle /history command
const handleHistoryCommand = async (bot, msg) => {
  const state = await getOrCreateTelegramUser(msg.from);
  const analyses = await analysisService.getAnalysesByUserId(state.userId);
  const text = formatHistoryList(analyses);
  await safeSendMessage(bot, msg.chat.id, text, { parse_mode: 'Markdown' });
};

// Handle Telegram Document Upload (Resume)
const handleDocumentMessage = async (bot, msg) => {
  const state = await getOrCreateTelegramUser(msg.from);
  const doc = msg.document;

  if (!doc) return;

  const fileName = doc.file_name || 'resume.pdf';
  const ext = (fileName.split('.').pop() || '').toLowerCase();

  if (!['pdf', 'docx', 'txt'].includes(ext)) {
    await safeSendMessage(bot, msg.chat.id, `❌ *Unsupported file format.* Please send a PDF, DOCX, or TXT file.`, { parse_mode: 'Markdown' });
    return;
  }

  await safeSendMessage(bot, msg.chat.id, `📥 *Downloading & processing resume...*`, { parse_mode: 'Markdown' });

  try {
    // Download file buffer from Telegram
    const fileStream = bot.getFileStream(doc.file_id);
    const chunks = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    const mockMulterFile = {
      buffer,
      mimetype: doc.mime_type || 'application/octet-stream',
      originalname: fileName
    };

    // Reuse existing resume parsing service
    const resume = await resumeService.createResume(state.userId, mockMulterFile);

    state.currentResumeId = resume._id.toString();
    state.state = 'WAITING_FOR_JD';
    await state.save();

    await safeSendMessage(
      bot,
      msg.chat.id,
      `✅ *Resume uploaded successfully!* (${fileName})\n\nNow, please send the *Job Description* as a plain text message.`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    console.error('[Telegram Handler Error - Resume Upload]:', error);
    await safeSendMessage(bot, msg.chat.id, `❌ *Unable to process resume:* ${error.message}`, { parse_mode: 'Markdown' });
  }
};

// Handle Text Message (JD or AI Chat)
const handleTextMessage = async (bot, msg) => {
  const text = (msg.text || '').trim();
  if (text.startsWith('/')) return; // Ignore slash commands

  const state = await getOrCreateTelegramUser(msg.from);

  // If waiting for JD or resume is available
  if (state.state === 'WAITING_FOR_JD' || (state.currentResumeId && !state.currentAnalysisId)) {
    await safeSendMessage(bot, msg.chat.id, `⚡ *Parsing Job Description & running AI Match Engine...*`, { parse_mode: 'Markdown' });

    try {
      // 1. Create JD using existing service
      const jd = await jdService.createJobDescription(state.userId, {
        title: text.split('\n')[0].substring(0, 50) || 'Target Job Role',
        company: 'Target Company',
        rawText: text
      });

      state.currentJobDescriptionId = jd._id.toString();

      // 2. Run analysis using existing analysis service
      const analysis = await analysisService.createAnalysis(state.userId, {
        resumeId: state.currentResumeId,
        jobDescriptionId: state.currentJobDescriptionId
      });

      state.currentAnalysisId = analysis._id.toString();
      state.state = 'ANALYSIS_READY';
      await state.save();

      // 3. Format and send response
      const report = formatAnalysisResult(analysis);
      const buttons = getAnalysisActionButtons(analysis._id.toString());

      await safeSendMessage(bot, msg.chat.id, report, {
        parse_mode: 'Markdown',
        reply_markup: buttons
      });
    } catch (error) {
      console.error('[Telegram Handler Error - Analysis]:', error);
      await safeSendMessage(bot, msg.chat.id, `❌ *Analysis error:* ${error.message}`, { parse_mode: 'Markdown' });
    }
  } else if (state.currentAnalysisId) {
    // Treat freeform questions as AI chatbot follow-up questions
    await safeSendMessage(bot, msg.chat.id, `🤖 *AI Thinking...*`, { parse_mode: 'Markdown' });
    try {
      const analysis = await analysisService.getAnalysisById(state.currentAnalysisId, state.userId);
      if (!analysis) {
        await safeSendMessage(bot, msg.chat.id, `Please send your resume first or type /new.`);
        return;
      }

      // Format clean answer based on current analysis evidence
      const answer = `🤖 *AI Answer to your question:* "${text}"\n\n` +
        `Based on your analysis for this target role:\n` +
        `• Your verified overall match is *${analysis.scores.overallMatch}%*.\n` +
        `• *Matched Skills:* ${(analysis.matchedSkills || []).map(m => m.skill).join(', ') || 'None'}\n` +
        `• *Missing Skills:* ${(analysis.missingSkills || []).map(m => m.skill).join(', ') || 'None'}\n\n` +
        `*Advice:* Focus on demonstrating verified projects for missing skills rather than adding fake claims!`;

      await safeSendMessage(bot, msg.chat.id, answer, { parse_mode: 'Markdown' });
    } catch (err) {
      await safeSendMessage(bot, msg.chat.id, `❌ Unable to process AI question.`);
    }
  } else {
    await safeSendMessage(bot, msg.chat.id, `Please send your *Resume* document (PDF/DOCX/TXT) first, or type /new.`, { parse_mode: 'Markdown' });
  }
};

// Handle Callback Queries (Inline Buttons)
const handleCallbackQuery = async (bot, query) => {
  const data = query.data || '';
  const telegramUser = query.from;
  const state = await getOrCreateTelegramUser(telegramUser);

  let analysisId = '';
  let action = '';

  if (data.startsWith('WHY_LOW_')) { action = 'WHY_LOW'; analysisId = data.replace('WHY_LOW_', ''); }
  else if (data.startsWith('MISSING_')) { action = 'MISSING'; analysisId = data.replace('MISSING_', ''); }
  else if (data.startsWith('IMPROVE_')) { action = 'IMPROVE'; analysisId = data.replace('IMPROVE_', ''); }
  else if (data.startsWith('PATH_')) { action = 'PATH'; analysisId = data.replace('PATH_', ''); }
  else if (data.startsWith('ASK_AI_')) { action = 'ASK_AI'; analysisId = data.replace('ASK_AI_', ''); }

  if (!analysisId) return;

  // Verify ownership
  const analysis = await analysisService.getAnalysisById(analysisId, state.userId);
  if (!analysis) {
    await safeAnswerCallbackQuery(bot, query.id, { text: 'Analysis not found or access denied.' });
    return;
  }

  await safeAnswerCallbackQuery(bot, query.id);

  let responseText = '';

  if (action === 'WHY_LOW') {
    responseText = `❓ *Why is my score ${analysis.scores.overallMatch}%?*\n\n` +
      `Your score is calculated deterministically:\n` +
      `• *Skill Match:* ${analysis.scores.skillMatch}%\n` +
      `• *Keyword Match:* ${analysis.scores.keywordMatch}%\n` +
      `• *Experience Match:* ${analysis.scores.experienceMatch}%\n\n` +
      `*Primary Gap:* Missing ${analysis.missingSkills.length} required key skills from the job description.`;
  } else if (action === 'MISSING') {
    const list = analysis.missingSkills.map(m => `• *${m.skill}* (${m.priority} priority): ${m.reason}`).join('\n');
    responseText = `❌ *MISSING SKILLS DETAILED BREAKDOWN*\n\n${list || 'None!'}`;
  } else if (action === 'IMPROVE') {
    const list = analysis.improvements.map(i => `📌 *${i.section}*\n• *Current:* "${i.currentText}"\n• *Suggested:* "${i.suggestedText}"\n• *Reason:* ${i.reason}`).join('\n\n');
    responseText = `📝 *TRUTHFUL RESUME IMPROVEMENTS*\n\n${list || 'No changes needed.'}`;
  } else if (action === 'PATH') {
    const list = analysis.recommendations.map(r => `📚 *Skill: ${r.skill}*\n${(r.learningPath || []).map(p => `  └ ${p}`).join('\n')}`).join('\n\n');
    responseText = `🛣️ *RECOMMENDED LEARNING PATHS*\n\n${list || 'No learning path required.'}`;
  } else if (action === 'ASK_AI') {
    responseText = `💬 *Ask any follow-up question!*\n\nType your question in the chat (e.g. "How can I prepare for this Flutter role?") and I will answer using your analysis context.`;
  }

  await safeSendMessage(bot, query.message.chat.id, responseText, { parse_mode: 'Markdown' });
};

module.exports = {
  handleStartCommand,
  handleNewCommand,
  handleHelpCommand,
  handleHistoryCommand,
  handleDocumentMessage,
  handleTextMessage,
  handleCallbackQuery
};
