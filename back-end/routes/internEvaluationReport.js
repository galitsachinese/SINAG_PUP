const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const { generateInternEvaluationReport } = require('../controllers/internEvaluationReportController');

router.post('/intern-evaluations', authMiddleware(), generateInternEvaluationReport);

module.exports = router;
