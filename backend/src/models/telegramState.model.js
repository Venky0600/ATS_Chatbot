const mongoose = require('mongoose');

const telegramStateSchema = new mongoose.Schema({
  telegramUserId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    default: ''
  },
  firstName: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    enum: ['WAITING_FOR_RESUME', 'WAITING_FOR_JD', 'ANALYSIS_READY', 'CHAT'],
    default: 'WAITING_FOR_RESUME'
  },
  currentResumeId: {
    type: String,
    default: ''
  },
  currentJobDescriptionId: {
    type: String,
    default: ''
  },
  currentAnalysisId: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TelegramState', telegramStateSchema);
