const analysisService = require('../services/analysis.service');
const { sendSuccess, sendError } = require('../utils/response');

const createAnalysis = async (req, res, next) => {
  try {
    const { resumeId, jobDescriptionId } = req.body;
    if (!resumeId || !jobDescriptionId) {
      return sendError(res, 'Both resumeId and jobDescriptionId are required', 400, 'VALIDATION_ERROR');
    }

    const analysis = await analysisService.createAnalysis(req.user._id, {
      resumeId,
      jobDescriptionId
    });

    return sendSuccess(res, {
      analysis: {
        id: analysis._id,
        status: analysis.status,
        progress: analysis.progress,
        scores: analysis.scores,
        createdAt: analysis.createdAt
      }
    }, 'Analysis completed successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getAnalyses = async (req, res, next) => {
  try {
    const analyses = await analysisService.getAnalysesByUserId(req.user._id);
    return sendSuccess(res, {
      items: analyses.map(a => ({
        id: a._id,
        resumeId: a.resumeId,
        jobDescriptionId: a.jobDescriptionId,
        status: a.status,
        overallMatch: a.scores ? a.scores.overallMatch : 0,
        atsCompatibility: a.scores ? a.scores.atsCompatibility : 0,
        createdAt: a.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

const getAnalysisById = async (req, res, next) => {
  try {
    const analysis = await analysisService.getAnalysisById(req.params.id, req.user._id);
    if (!analysis) {
      return sendError(res, 'Analysis not found', 404, 'ANALYSIS_NOT_FOUND');
    }
    return sendSuccess(res, { analysis });
  } catch (error) {
    next(error);
  }
};

const getAnalysisStatus = async (req, res, next) => {
  try {
    const analysis = await analysisService.getAnalysisById(req.params.id, req.user._id);
    if (!analysis) {
      return sendError(res, 'Analysis not found', 404, 'ANALYSIS_NOT_FOUND');
    }
    return sendSuccess(res, {
      id: analysis._id,
      status: analysis.status,
      progress: analysis.progress
    });
  } catch (error) {
    next(error);
  }
};

const deleteAnalysis = async (req, res, next) => {
  try {
    const success = await analysisService.deleteAnalysis(req.params.id, req.user._id);
    if (!success) {
      return sendError(res, 'Analysis not found or could not be deleted', 404, 'ANALYSIS_NOT_FOUND');
    }
    return sendSuccess(res, null, 'Analysis deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAnalysis,
  getAnalyses,
  getAnalysisById,
  getAnalysisStatus,
  deleteAnalysis
};
