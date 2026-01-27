const { Intern, Company, User, InternDocuments } = require('../models');

/* =================================================
   INTERN – GET MY COMPANY
================================================= */
exports.getMyCompany = async (req, res) => {
  try {
    const userId = req.user.id;

    const intern = await Intern.findOne({
      where: { user_id: userId },
      include: {
        model: Company,
        attributes: ['id', 'name', 'address', 'natureOfBusiness'],
      },
    });

    if (!intern || !intern.Company) {
      return res.status(404).json({
        message: 'No company assigned to this intern',
      });
    }

    res.json(intern.Company);
  } catch (err) {
    console.error('❌ GET MY COMPANY ERROR:', err);
    res.status(500).json({ message: 'Failed to fetch company' });
  }
};

/* =================================================
   ADVISER / COORDINATOR – GET INTERNS FOR TABLE
================================================= */
exports.getInternsForAdviser = async (req, res) => {
  try {
    const interns = await Intern.findAll({
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['studentId', 'lastName', 'firstName', 'mi', 'email', 'program'],
        },
        {
          model: Company,
          as: 'company',
          attributes: { exclude: ['password'] }, // ✅ Include all fields including supervisorName
          required: false,
        },
        {
          model: InternDocuments,
          as: 'InternDocuments',
          required: false,
        },
      ],
      order: [[{ model: User, as: 'User' }, 'lastName', 'ASC']],
    });

    res.json(interns);
  } catch (err) {
    console.error('❌ GET INTERNS FOR ADVISER ERROR:', err);
    res.status(500).json({ message: 'Failed to fetch interns' });
  }
};
