const { Intern, User } = require('../models');
const { Op } = require('sequelize');

/* =================================================
   INTERN – GET ASSIGNED ADVISER
================================================= */
exports.getAdviserForStudent = async (req, res) => {
  try {
    // 1️⃣ Find intern record
    const intern = await Intern.findOne({
      where: { user_id: req.user.id },
    });

    if (!intern) {
      return res.status(404).json({
        message: 'Intern record not found',
      });
    }

    // 2️⃣ Find adviser by role + program
    const adviser = await User.findOne({
      where: {
        role: 'adviser', // ✅ normalized role
        program: intern.program,
      },
    });

    if (!adviser) {
      return res.status(404).json({
        message: 'No adviser found for this program',
      });
    }

    // 3️⃣ Return adviser
    return res.json({
      adviserName: `${adviser.firstName} ${adviser.lastName}`,
    });
  } catch (err) {
    console.error('❌ Adviser fetch error:', err);
    return res.status(500).json({
      message: 'Server error',
    });
  }
};

/* =================================================
   ADVISER / COORDINATOR – GET PROGRAMS
================================================= */
exports.getProgramsForAdviser = async (req, res) => {
  try {
    const { role, id } = req.user;

    // 🟢 COORDINATOR: see ALL programs
    if (role === 'coordinator') {
      const programs = await User.findAll({
        where: {
          role: 'adviser',
          program: { [Op.not]: null },
        },
        attributes: ['program'],
        group: ['program'],
        order: [['program', 'ASC']],
      });

      return res.json(programs.map((p) => p.program));
    }

    // 🟡 ADVISER: see OWN program only
    if (role === 'adviser') {
      const adviser = await User.findByPk(id, {
        attributes: ['program'],
      });

      if (!adviser || !adviser.program) {
        return res.json([]);
      }

      return res.json([adviser.program]);
    }

    // 🔴 Others: no access
    return res.status(403).json({ message: 'Not allowed' });
  } catch (err) {
    console.error('❌ Program fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
