const Analysis = require('../models/analysis.model');
const { getInMemoryMode } = require('../config/database');
const { getResumeById } = require('./resume.service');
const { getJdById } = require('./jd.service');
const { runMatching } = require('./matching.service');
const { runAtsAnalysis } = require('./ats.service');
const { evaluateSkillGaps } = require('./skillGap.service');
const { generateTruthfulImprovements } = require('./improvement.service');
const { generateRecommendations } = require('./recommendation.service');
const { generateStructuredAnalysis } = require('./ai.service');

const inMemoryAnalyses = new Map();

const createAnalysis = async (userId, { resumeId, jobDescriptionId }) => {
  const resume = await getResumeById(resumeId, userId);
  if (!resume) throw new Error('Resume not found or not owned by user.');

  const jd = await getJdById(jobDescriptionId, userId);
  if (!jd) throw new Error('Job Description not found or not owned by user.');

  // Run deterministic pipeline
  const matchingResults = runMatching(resume.parsedData, jd.parsedData);
  const atsAnalysis = runAtsAnalysis(resume, jd, matchingResults);
  const skillGaps = evaluateSkillGaps(matchingResults);
  const improvements = generateTruthfulImprovements(resume, matchingResults);
  const recommendations = await generateRecommendations(skillGaps.missingSkills);

  const finalResult = await generateStructuredAnalysis({
    resume,
    jobDescription: jd,
    matchingResults,
    atsAnalysis,
    skillGaps,
    improvements,
    recommendations
  });

  if (getInMemoryMode()) {
    const analysis = {
      _id: 'an_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      userId: userId.toString(),
      resumeId: resumeId.toString(),
      jobDescriptionId: jobDescriptionId.toString(),
      status: 'completed',
      progress: 100,
      scores: finalResult.scores,
      matchedSkills: finalResult.matchedSkills,
      partialSkills: finalResult.partialSkills,
      missingSkills: finalResult.missingSkills,
      weakAreas: finalResult.weakAreas,
      atsAnalysis: finalResult.atsAnalysis,
      improvements: finalResult.improvements,
      recommendations: finalResult.recommendations,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryAnalyses.set(analysis._id, analysis);
    return analysis;
  }

  return await Analysis.create({
    userId,
    resumeId,
    jobDescriptionId,
    status: 'completed',
    progress: 100,
    scores: finalResult.scores,
    matchedSkills: finalResult.matchedSkills,
    partialSkills: finalResult.partialSkills,
    missingSkills: finalResult.missingSkills,
    weakAreas: finalResult.weakAreas,
    atsAnalysis: finalResult.atsAnalysis,
    improvements: finalResult.improvements,
    recommendations: finalResult.recommendations
  });
};

const getAnalysesByUserId = async (userId) => {
  if (getInMemoryMode()) {
    return Array.from(inMemoryAnalyses.values())
      .filter(a => a.userId === userId.toString())
      .sort((a, b) => b.createdAt - a.createdAt);
  }
  return await Analysis.find({ userId }).sort({ createdAt: -1 });
};

const getAnalysisById = async (id, userId) => {
  if (getInMemoryMode()) {
    const a = inMemoryAnalyses.get(id.toString());
    if (a && a.userId === userId.toString()) {
      return a;
    }
    return null;
  }
  return await Analysis.findOne({ _id: id, userId });
};

const deleteAnalysis = async (id, userId) => {
  if (getInMemoryMode()) {
    if (inMemoryAnalyses.has(id.toString()) && inMemoryAnalyses.get(id.toString()).userId === userId.toString()) {
      inMemoryAnalyses.delete(id.toString());
      return true;
    }
    return false;
  }
  const res = await Analysis.deleteOne({ _id: id, userId });
  return res.deletedCount > 0;
};

module.exports = {
  createAnalysis,
  getAnalysesByUserId,
  getAnalysisById,
  deleteAnalysis
};
