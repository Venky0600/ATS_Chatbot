const resumeService = require('../services/resume.service');
const { sendSuccess, sendError } = require('../utils/response');

const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'No file uploaded. Please attach a PDF, DOCX, or TXT file under key "file".', 400, 'VALIDATION_ERROR');
    }

    const resume = await resumeService.createResume(req.user._id, req.file);

    return sendSuccess(res, {
      resume: {
        id: resume._id,
        fileName: resume.fileName,
        fileType: resume.fileType,
        status: resume.status,
        parsedData: resume.parsedData,
        createdAt: resume.createdAt
      }
    }, 'Resume uploaded and processed successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getResumes = async (req, res, next) => {
  try {
    const resumes = await resumeService.getResumesByUserId(req.user._id);
    return sendSuccess(res, {
      items: resumes.map(r => ({
        id: r._id,
        fileName: r.fileName,
        fileType: r.fileType,
        status: r.status,
        createdAt: r.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

const getResumeById = async (req, res, next) => {
  try {
    const resume = await resumeService.getResumeById(req.params.id, req.user._id);
    if (!resume) {
      return sendError(res, 'Resume not found', 404, 'RESUME_NOT_FOUND');
    }
    return sendSuccess(res, { resume });
  } catch (error) {
    next(error);
  }
};

const getResumeStatus = async (req, res, next) => {
  try {
    const resume = await resumeService.getResumeById(req.params.id, req.user._id);
    if (!resume) {
      return sendError(res, 'Resume not found', 404, 'RESUME_NOT_FOUND');
    }
    return sendSuccess(res, {
      id: resume._id,
      status: resume.status,
      progress: resume.status === 'processed' ? 100 : 50
    });
  } catch (error) {
    next(error);
  }
};

const deleteResume = async (req, res, next) => {
  try {
    const success = await resumeService.deleteResume(req.params.id, req.user._id);
    if (!success) {
      return sendError(res, 'Resume not found or could not be deleted', 404, 'RESUME_NOT_FOUND');
    }
    return sendSuccess(res, null, 'Resume deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadResume,
  getResumes,
  getResumeById,
  getResumeStatus,
  deleteResume
};
