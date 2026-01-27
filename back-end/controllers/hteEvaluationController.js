const HTEEvaluation = require('../models/HTEEvaluation');
const Intern = require('../models/interns');
const User = require('../models/user');

exports.createHTEEvaluation = async (req, res) => {
  try {
    // 1️⃣ Get intern
    const intern = await Intern.findOne({
      where: { user_id: req.user.id },
    });

    if (!intern) {
      return res.status(404).json({ message: 'Intern record not found' });
    }

    if (!intern.company_id) {
      return res.status(400).json({ message: 'Intern has no assigned company' });
    }

    // 2️⃣ Get student (user)
    const student = await User.findByPk(req.user.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // 3️⃣ Create evaluation (ALL REQUIRED FIELDS)
    const evaluation = await HTEEvaluation.create({
      intern_id: intern.id,
      company_id: intern.company_id,

      student_name: `${student.firstName} ${student.lastName}`,
      program: intern.program,

      school_term: req.body.school_term,
      academic_year: req.body.academic_year,
      evaluation_date: req.body.evaluation_date,

      ratings: req.body.ratings,
      remarks: req.body.remarks,

      strengths: req.body.strengths,
      improvements: req.body.improvements,
      recommendations: req.body.recommendations,

      submitted_by: `${student.firstName} ${student.lastName}`,
      noted_by: req.body.noted_by || null,
    });

    return res.status(201).json({
      message: 'HTE Evaluation submitted successfully',
      evaluation,
    });
  } catch (err) {
    console.error('HTE Evaluation Error:', err);
    return res.status(500).json({
      message: err.message,
    });
  }
};
