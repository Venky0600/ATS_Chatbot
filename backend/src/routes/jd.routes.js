const express = require('express');
const router = express.Router();
const jdController = require('../controllers/jd.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);

router.post('/', jdController.createJd);
router.get('/', jdController.getJds);
router.get('/:id', jdController.getJdById);
router.delete('/:id', jdController.deleteJd);

module.exports = router;
