/* eslint-env node */
const { fn, col, literal, Op } = require('sequelize');
const { Intern, Company, User } = require('../models');

/* =========================
   GET PROGRAM FILTERS
========================= */
exports.getAdviserPrograms = async (req, res, next) => {
  try {
    const advisers = await User.findAll({
      where: { role: 'adviser' }, // ✅ FIXED casing
      attributes: ['program'],
      raw: true,
    });

    const programs = [...new Set(advisers.map((a) => a.program).filter(Boolean))];
    res.json(programs);
  } catch (err) {
    console.error('❌ getAdviserPrograms:', err);
    next(err);
  }
};

/* =========================
   GET INTERNS PER PROGRAM
========================= */
exports.getPrograms = async (req, res, next) => {
  try {
    const advisers = await User.findAll({
      where: { role: 'adviser' }, // ✅ FIXED casing
      attributes: ['program'],
      raw: true,
    });

    const adviserPrograms = advisers.map((a) => a.program).filter(Boolean);

    let whereCondition = {
      status: { [Op.in]: ['Pending', 'Approved', 'Declined'] }, // ✅ FIXED
      program: { [Op.in]: adviserPrograms },
    };

    if (req.user.role === 'adviser') {
      if (!req.user.program) return res.json([]);
      whereCondition.program = req.user.program;
    }

    const results = await Intern.findAll({
      attributes: ['program', [fn('COUNT', col('Intern.id')), 'count']],
      where: whereCondition,
      group: ['program'],
      order: [[literal('count'), 'DESC']],
      raw: true,
    });

    res.json(
      results.map((r) => ({
        program: r.program,
        count: Number(r.count),
      })),
    );
  } catch (err) {
    console.error('❌ getPrograms:', err);
    next(err);
  }
};

/* =========================
   GET INTERNS PER COMPANY
========================= */
exports.getCompanies = async (req, res, next) => {
  try {
    let whereCondition = {
      status: { [Op.in]: ['Pending', 'Approved', 'Declined'] }, // ✅ FIXED
    };

    // Filter by program from query parameter
    if (req.query.program && req.query.program !== 'All') {
      whereCondition.program = req.query.program;
    }

    if (req.user.role === 'adviser') {
      if (!req.user.program) return res.json([]);
      whereCondition.program = req.user.program;
    }

    // Get all companies
    const allCompanies = await Company.findAll({
      attributes: ['id', 'name'],
      raw: true,
    });

    // Get intern counts per company
    const internCounts = await Intern.findAll({
      attributes: ['company_id', [fn('COUNT', col('Intern.id')), 'count']],
      where: whereCondition,
      group: ['company_id'],
      raw: true,
    });

    // Create a map of company_id to count
    const countMap = {};
    internCounts.forEach((item) => {
      countMap[item.company_id] = Number(item.count);
    });

    // Combine all companies with their counts (0 if no interns)
    const results = allCompanies.map((company) => ({
      company: company.name,
      count: countMap[company.id] || 0,
    }));

    // Sort by count descending
    results.sort((a, b) => b.count - a.count);

    res.json(results);
  } catch (err) {
    console.error('❌ getCompanies:', err);
    next(err);
  }
};

/* =========================
   KPI COUNTS
========================= */
exports.getKpis = async (req, res, next) => {
  try {
    let internWhere = {
      status: { [Op.in]: ['Pending', 'Approved', 'Declined'] }, // ✅ FIXED
    };

    if (req.user.role === 'adviser' && req.user.program) {
      internWhere.program = req.user.program;
    }

    const [activeInterns, activePrograms, partnerHTE] = await Promise.all([
      Intern.count({ where: internWhere }),
      User.count({
        where: {
          role: 'adviser',
          program: { [Op.ne]: null },
        },
        distinct: true,
        col: 'program',
      }),
      Company.count(),
    ]);

    res.json({ activeInterns, activePrograms, partnerHTE });
  } catch (err) {
    console.error('❌ getKpis:', err);
    next(err);
  }
};

/* =========================
   ADVISER KPI
========================= */
exports.getAdviserKpis = async (req, res, next) => {
  try {
    if (req.user.role !== 'adviser') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (!req.user.program) {
      return res.json({
        activeInterns: 0,
        activeProgram: null,
        partnerHTE: 0,
      });
    }

    const activeInterns = await Intern.count({
      where: {
        program: req.user.program,
        status: { [Op.in]: ['Pending', 'Approved', 'Declined'] }, // ✅ FIXED
      },
    });

    const partnerHTE = await Company.count();

    res.json({
      activeInterns,
      activeProgram: req.user.program,
      partnerHTE,
    });
  } catch (err) {
    console.error('❌ getAdviserKpis:', err);
    next(err);
  }
};
