const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const dashboardController = require('../controllers/dashboardController');
const internDashboardController = require('../controllers/internDashboardController');
const internController = require('../controllers/internController'); // ✅ ADD
const companyDashboardController = require('../controllers/companyDashboardController');

// 🔐 Protect ALL dashboard routes
router.use(authMiddleware(['superadmin', 'coordinator', 'adviser', 'intern', 'company']));

// 👨‍🎓 INTERN DASHBOARD
router.get('/intern', internDashboardController.getInternDashboard);

// 👨‍🏫 ADVISER – INTERN TABLE (🔥 THIS FIXES YOUR ERROR)
router.get('/adviser-interns', authMiddleware(['adviser', 'coordinator']), internController.getInternsForAdviser);

// 📊 SHARED DASHBOARD DATA
router.get('/programs', dashboardController.getPrograms);
router.get('/companies', dashboardController.getCompanies);
router.get('/kpis', dashboardController.getKpis);
router.get('/adviser-programs', dashboardController.getAdviserPrograms);

// 👨‍🏫 ADVISER KPI (cards)
router.get('/adviser-kpis', authMiddleware(['adviser']), dashboardController.getAdviserKpis);

// 🏢 COMPANY - DAILY ATTENDANCE REPORT
router.get('/daily-attendance', authMiddleware(['company']), companyDashboardController.generateDailyAttendance);

// 🏢 COMPANY - GENERAL RECORD
router.get('/general-record', authMiddleware(['company']), companyDashboardController.generateGeneralRecord);

module.exports = router;
