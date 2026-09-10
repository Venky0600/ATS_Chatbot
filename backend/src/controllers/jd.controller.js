const jdService = require('../services/jd.service');
const { sendSuccess, sendError } = require('../utils/response');

const createJd = async (req, res, next) => {
  try {
    const { title, company, rawText, sourceUrl } = req.body;
    if (!title || !rawText) {
      return sendError(res, 'Job Description title and rawText are required', 400, 'VALIDATION_ERROR');
    }

    const jd = await jdService.createJobDescription(req.user._id, {
      title,
      company,
      rawText,
      sourceUrl
    });

    return sendSuccess(res, {
      jobDescription: {
        id: jd._id,
        title: jd.title,
        company: jd.company,
        status: jd.status,
        parsedData: jd.parsedData,
        createdAt: jd.createdAt
      }
    }, 'Job Description created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getJds = async (req, res, next) => {
  try {
    const jds = await jdService.getJdsByUserId(req.user._id);
    return sendSuccess(res, {
      items: jds.map(j => ({
        id: j._id,
        title: j.title,
        company: j.company,
        status: j.status,
        createdAt: j.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

const getJdById = async (req, res, next) => {
  try {
    const jd = await jdService.getJdById(req.params.id, req.user._id);
    if (!jd) {
      return sendError(res, 'Job Description not found', 404, 'JOB_DESCRIPTION_NOT_FOUND');
    }
    return sendSuccess(res, { jobDescription: jd });
  } catch (error) {
    next(error);
  }
};

const deleteJd = async (req, res, next) => {
  try {
    const success = await jdService.deleteJd(req.params.id, req.user._id);
    if (!success) {
      return sendError(res, 'Job Description not found or could not be deleted', 404, 'JOB_DESCRIPTION_NOT_FOUND');
    }
    return sendSuccess(res, null, 'Job Description deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJd,
  getJds,
  getJdById,
  deleteJd
};
