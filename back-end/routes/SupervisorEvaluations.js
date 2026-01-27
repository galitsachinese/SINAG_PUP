const express = require('express');
const router = express.Router();
const controller = require('../controllers/supervisorEvaluationController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, controller.submitEvaluation);

module.exports = router;
