const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resume.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.use(requireAuth);

router.post('/', upload.single('file'), resumeController.uploadResume);
router.get('/', resumeController.getResumes);
router.get('/:id', resumeController.getResumeById);
router.get('/:id/status', resumeController.getResumeStatus);
router.delete('/:id', resumeController.deleteResume);

module.exports = router;
