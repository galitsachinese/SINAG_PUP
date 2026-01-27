const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const adviserController = require('../controllers/adviserController');

/* =========================
   ROUTES
========================= */

// INTERN – get assigned adviser
router.get('/my-adviser', authMiddleware(['intern']), adviserController.getAdviserForStudent);

// ADVISER – get handled programs
router.get('/my-programs', authMiddleware(['adviser']), adviserController.getProgramsForAdviser);

module.exports = router;
