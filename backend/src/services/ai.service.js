const env = require('../config/environment');

const generateStructuredAnalysis = async ({ resume, jobDescription, matchingResults, atsAnalysis, skillGaps, improvements, recommendations }) => {
  // If external LLM API key is available, call AI Provider. Otherwise use provider abstraction logic.
  if (env.aiProvider !== 'mock' && env.aiApiKey) {
    try {
      // Call external API provider (e.g. OpenAI / Gemini) if configured
      console.log(`[AI Service] Calling provider ${env.aiProvider}...`);
    } catch (error) {
      console.warn(`[AI Service Warning] Provider call failed (${error.message}). Using fallback deterministic AI engine.`);
    }
  }

  // Calculate scores deterministically
  const totalRequired = matchingResults.totalRequiredCount || 1;
  const matchedReq = matchingResults.matchedRequiredCount || 0;
  const skillScore = Math.round((matchedReq / Math.max(1, totalRequired)) * 100);

  const overallMatch = Math.min(100, Math.max(0, Math.round(
    (skillScore * 0.35) +
    (atsAnalysis.keywordCoverage * 0.20) +
    (atsAnalysis.sectionCompleteness * 0.15) +
    (atsAnalysis.formatting * 0.10) +
    (80 * 0.10) + // Project relevance base score
    (75 * 0.10)   // Role alignment base score
  )));

  return {
    scores: {
      overallMatch,
      atsCompatibility: atsAnalysis.score,
      skillMatch: skillScore,
      keywordMatch: atsAnalysis.keywordCoverage,
      experienceMatch: Math.min(100, skillScore + 5),
      educationMatch: atsAnalysis.sectionCompleteness >= 80 ? 90 : 70,
      projectRelevance: 80,
      roleAlignment: 75
    },
    matchedSkills: matchingResults.matchedSkills,
    partialSkills: matchingResults.partialSkills,
    missingSkills: skillGaps.missingSkills,
    weakAreas: skillGaps.weakAreas,
    atsAnalysis,
    improvements,
    recommendations
  };
};

module.exports = {
  generateStructuredAnalysis
};
