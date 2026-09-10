const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysis.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);

router.post('/', analysisController.createAnalysis);
router.get('/', analysisController.getAnalyses);
router.get('/:id', analysisController.getAnalysisById);
router.get('/:id/status', analysisController.getAnalysisStatus);
router.delete('/:id', analysisController.deleteAnalysis);

module.exports = router;
