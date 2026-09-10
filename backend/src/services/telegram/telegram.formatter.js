const formatStartMessage = (name) => {
  return `👋 *Welcome to ResumeMatch AI*, ${name || 'there'}!

I am your AI-powered Resume & Job Description Analysis assistant.

*How to use me:*
1️⃣ Send your resume as a document (*PDF*, *DOCX*, or *TXT*).
2️⃣ Send the Job Description as a plain text message.

I will analyze both documents and provide:
• *Overall Match Score* (%)
• *ATS Compatibility Score* (%)
• *Matched & Missing Skills*
• *Weak Areas & Resume Improvements*
• *Personalized Learning Recommendations*`;
};

const formatHelpMessage = () => {
  return `ℹ️ *ResumeMatch AI — Help & Commands*

/start — Start or restart the bot
/new — Start a new Resume ↔ JD analysis
/history — View your recent analysis reports
/help — View this help menu

*Tips:*
• Upload your resume first as a PDF, DOCX, or TXT document.
• Then paste or send the target Job Description text.
• Use the interactive buttons to ask follow-up questions!`;
};

const formatAnalysisResult = (analysis) => {
  const scores = analysis.scores || {};
  const overall = scores.overallMatch || 0;
  const ats = scores.atsCompatibility || 0;

  const matched = (analysis.matchedSkills || []).map(m => `• ${m.skill}`).join('\n');
  const missing = (analysis.missingSkills || []).map(m => `• ${m.skill}`).join('\n');
  const weak = (analysis.weakAreas || []).map(w => `• ${w.area}: ${w.reason}`).join('\n');

  return `📊 *RESUME ↔ JOB MATCH ANALYSIS*

🎯 *Overall Match:* \`${overall}%\`
🛡️ *ATS Score:* \`${ats}%\`

━━━━━━━━━━━━━━━━━━━

✅ *MATCHED SKILLS*
${matched || '• None detected'}

❌ *MISSING SKILLS*
${missing || '• None missing!'}

⚠️ *WEAK AREAS*
${weak || '• None identified'}`;
};

const formatHistoryList = (analyses) => {
  if (!analyses || analyses.length === 0) {
    return `📚 *Your Analysis History*\n\nNo previous analysis reports found. Send /new to create one!`;
  }

  let text = `📚 *Your Recent Analyses*\n\n`;
  analyses.forEach((a, i) => {
    const overall = a.scores ? a.scores.overallMatch : (a.overallMatch || 0);
    const ats = a.scores ? a.scores.atsCompatibility : (a.atsCompatibility || 0);
    const date = new Date(a.createdAt).toLocaleDateString();
    text += `${i + 1}. *Analysis #${a._id.toString().slice(-4)}* — *Match: ${overall}%* (ATS: ${ats}%)\n   📅 ${date}\n\n`;
  });

  return text;
};

const getAnalysisActionButtons = (analysisId) => {
  return {
    inline_keyboard: [
      [
        { text: '❓ Why is my score low?', callback_data: `WHY_LOW_${analysisId}` },
        { text: '❌ Missing Skills', callback_data: `MISSING_${analysisId}` }
      ],
      [
        { text: '📝 Improve Resume', callback_data: `IMPROVE_${analysisId}` },
        { text: '📚 Learning Path', callback_data: `PATH_${analysisId}` }
      ],
      [
        { text: '💬 Ask AI Question', callback_data: `ASK_AI_${analysisId}` }
      ]
    ]
  };
};

module.exports = {
  formatStartMessage,
  formatHelpMessage,
  formatAnalysisResult,
  formatHistoryList,
  getAnalysisActionButtons
};
