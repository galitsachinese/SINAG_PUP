/* eslint-env node */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { literal } = require('sequelize');

const { User, Intern, Company, InternDocuments } = require('../models');
const sendCredentialsEmail = require('../utils/sendCredentialsEmail');

const JWT_SECRET = process.env.JWT_SECRET;

/* =========================
   HELPER: SIGN JWT
========================= */
const signToken = (payload) => {
  return jwt.sign(
    {
      ...payload,
      role: payload.role.toLowerCase(),
    },
    JWT_SECRET,
    { expiresIn: '5m' },
  );
};

/* =========================
   SIGNUP (Coordinator)
========================= */
exports.signup = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await User.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existing) return res.status(409).json({ message: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      mi: '',
      email: email.toLowerCase(),
      password: passwordHash, // ✅ FIXED: Use 'password' not 'passwordHash'
      role: 'Coordinator',
    });

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      program: user.program,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    res.status(201).json({ token });
  } catch (err) {
    next(err);
  }
};

/* =========================
   LOGIN (User + Company)
========================= */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log('🔍 Login attempt:', { email });

    const user = await User.findOne({
      where: { email: email.toLowerCase() },
    });

    if (user) {
      console.log('✅ User found:', { id: user.id, email: user.email });

      // ✅ FIXED: Use 'password' not 'passwordHash'
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        console.error('❌ Password mismatch');
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      console.log('✅ Password matched');

      const token = signToken({
        id: user.id,
        email: user.email,
        role: user.role,
        program: user.program,
        firstName: user.firstName,
        lastName: user.lastName,
      });

      return res.json({ token });
    }

    console.log('🔍 User not found, checking Company...');

    // ✅ Check Company (HTE/Supervisor) login
    const company = await Company.findOne({
      where: { email: email.toLowerCase() },
    });

    if (company) {
      console.log('✅ Company found:', { id: company.id, name: company.name });

      const match = await bcrypt.compare(password, company.password);

      if (!match) {
        console.error('❌ Password mismatch for company');
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      console.log('✅ Company password matched');

      const token = signToken({
        id: company.id,
        email: company.email,
        role: 'Supervisor',
        name: company.name,
      });

      return res.json({ token });
    }

    console.error('❌ Email not found in users or companies');
    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (err) {
    console.error('❌ Login error:', err);
    next(err);
  }
};

/* =========================
   ADD COORDINATOR
========================= */
exports.addCoordinator = async (req, res, next) => {
  try {
    const { firstName, lastName, mi, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await User.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existing) return res.status(409).json({ message: 'Email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);

    const coordinator = await User.create({
      firstName,
      lastName,
      mi: mi || '',
      email: email.toLowerCase(),
      password: passwordHash, // ✅ FIXED: Use 'password' not 'passwordHash'
      role: 'Coordinator',
    });

    res.status(201).json({
      message: 'Coordinator added successfully',
      coordinator,
    });
  } catch (err) {
    next(err);
  }
};

/* =========================
   ADVISERS
========================= */
exports.getAdvisers = async (req, res, next) => {
  try {
    const advisers = await User.findAll({
      where: { role: 'Adviser' },
      attributes: [
        'id',
        'firstName',
        'lastName',
        'mi',
        'email',
        'program',
        [
          literal(`(
            SELECT COUNT(*)
            FROM users AS u
            WHERE u.role = 'Intern'
            AND u.program = User.program
          )`),
          'interns',
        ],
      ],
      order: [['lastName', 'ASC']],
    });

    res.json(advisers);
  } catch (err) {
    next(err);
  }
};

exports.addAdviser = async (req, res, next) => {
  try {
    const { firstName, lastName, mi, email, program } = req.body;

    if (!firstName || !lastName || !email || !program) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await User.findOne({
      where: { email: email.toLowerCase() },
    });
    if (existing) return res.status(409).json({ message: 'Email already exists' });

    // 🔑 TEMP PASSWORD
    const year = new Date().getFullYear();
    const tempPassword = `${lastName}_${year}`;

    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const adviser = await User.create({
      firstName,
      lastName,
      mi: mi || '',
      email: email.toLowerCase(),
      password: passwordHash, // ✅ FIXED: Use 'password' not 'passwordHash'
      role: 'Adviser',
      program,
      forcePasswordChange: true,
    });

    // 📧 SEND EMAIL
    await sendCredentialsEmail({
      email: adviser.email,
      password: tempPassword,
      role: 'Adviser',
    });

    res.status(201).json({
      message: 'Adviser added and credentials sent',
      adviser,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateAdviser = async (req, res, next) => {
  try {
    const adviser = await User.findByPk(req.params.id);
    if (!adviser || adviser.role !== 'Adviser') {
      return res.status(404).json({ message: 'Adviser not found' });
    }

    await adviser.update(req.body);
    res.json(adviser);
  } catch (err) {
    next(err);
  }
};

exports.deleteAdviser = async (req, res, next) => {
  try {
    const adviser = await User.findByPk(req.params.id);
    if (!adviser || adviser.role !== 'Adviser') {
      return res.status(404).json({ message: 'Adviser not found' });
    }

    await adviser.destroy();
    res.json({ message: 'Adviser deleted successfully' });
  } catch (err) {
    next(err);
  }
};

/* =========================
   INTERNS
========================= */
exports.addIntern = async (req, res, next) => {
  try {
    const { firstName, lastName, mi, email, studentId, program } = req.body;

    if (!firstName || !lastName || !email || !studentId || !program) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingUser = await User.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // 🔑 TEMP PASSWORD
    const year = new Date().getFullYear();
    const tempPassword = `${lastName}_${year}`;

    // 🔐 HASH PASSWORD
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // 👤 CREATE USER
    const user = await User.create({
      firstName,
      lastName,
      mi: mi || '',
      email: email.toLowerCase(),
      password: passwordHash, // ✅ FIXED: Use 'password' not 'passwordHash'
      role: 'Intern',
      studentId,
      program,
      forcePasswordChange: true,
    });

    // 📄 CREATE INTERN RECORD
    await Intern.create({
      user_id: user.id,
      program,
      status: 'Pending',
    });

    // 📧 SEND EMAIL
    await sendCredentialsEmail({
      email: user.email,
      password: tempPassword,
      role: 'Intern',
    });

    res.status(201).json({
      message: 'Intern added and credentials sent',
    });
  } catch (err) {
    next(err);
  }
};

/* =========================
   UPDATE INTERN (✅ FIXED)
========================= */
exports.updateIntern = async (req, res, next) => {
  try {
    const intern = await Intern.findByPk(req.params.id, {
      include: {
        model: User,
        as: 'User',
      },
    });
    if (!intern) return res.status(404).json({ message: 'Intern not found' });

    const { firstName, lastName, mi, email, studentId, program } = req.body;

    // ✅ Update USER fields
    await intern.User.update({
      firstName,
      lastName,
      mi,
      email: email?.toLowerCase(),
      studentId,
      program,
    });

    // ✅ Update INTERN fields if needed
    await intern.update({ program });

    res.json({
      message: 'Intern updated successfully',
      intern,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteIntern = async (req, res, next) => {
  try {
    const intern = await Intern.findByPk(req.params.id);
    if (!intern) return res.status(404).json({ message: 'Intern not found' });

    await InternDocuments.destroy({
      where: { intern_id: intern.id },
    });

    await intern.destroy();
    await User.destroy({ where: { id: intern.user_id } });

    res.json({ message: 'Intern deleted successfully' });
  } catch (err) {
    next(err);
  }
};

exports.getInterns = async (req, res) => {
  try {
    const interns = await Intern.findAll({
      include: [
        {
          model: User,
          as: 'User',
          attributes: { exclude: ['password'] },
        },
        {
          model: InternDocuments,
          as: 'InternDocuments',
          required: false,
        },
        {
          model: Company,
          as: 'company',
          required: false,
          attributes: { exclude: ['password'] }, // ✅ Same as HTE endpoint
        },
      ],
    });

    console.log('✅ Fetched interns:', interns.length);
    if (interns.length > 0) {
      console.log('📦 Sample company data:', JSON.stringify(interns[0].company, null, 2));
    }
    return res.status(200).json(interns);
  } catch (err) {
    console.error('❌ getInterns ERROR:', err);
    return res.status(500).json({
      message: 'Failed to fetch interns',
      error: err.message,
    });
  }
};

/* =========================
   UPDATE INTERN STATUS
========================= */
exports.updateInternStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    const allowedStatus = ['Pending', 'Approved', 'Declined'];

    const intern = await Intern.findByPk(req.params.id);
    if (!intern) {
      return res.status(404).json({ message: 'Intern not found' });
    }

    if (typeof status !== 'undefined') {
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
      intern.status = status;
    }

    if (typeof remarks !== 'undefined') {
      intern.remarks = remarks;
    }

    await intern.save();

    return res.json({
      id: intern.id,
      status: intern.status,
      remarks: intern.remarks,
    });
  } catch (err) {
    console.error('updateInternStatus error:', err);
    next(err);
  }
};

/* =========================
   ASSIGN HTE TO INTERN
========================= */
exports.assignHTE = async (req, res, next) => {
  try {
    const { companyId, position } = req.body;

    if (!companyId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const intern = await Intern.findByPk(req.params.id);
    if (!intern) {
      return res.status(404).json({ message: 'Intern not found' });
    }

    intern.company_id = companyId;
    if (position) {
      intern.position = position;
    }
    intern.status = 'Approved';

    await intern.save();

    res.json({
      message: 'HTE assigned successfully',
      intern,
    });
  } catch (err) {
    next(err);
  }
};

/* =========================
   COMPANY / HTE
========================= */
exports.addCompany = async (req, res, next) => {
  try {
    const { name, email, address, natureOfBusiness, supervisorName, moaStart, moaEnd } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // 🔑 TEMP PASSWORD
    const year = new Date().getFullYear();
    const tempPassword = `${name.replace(/\s+/g, '')}_${year}`;

    // 🔐 HASH PASSWORD
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // 🏢 CREATE COMPANY
    const company = await Company.create({
      name,
      email: email.toLowerCase(),
      address,
      natureOfBusiness,
      supervisorName,
      moaStart,
      moaEnd,
      moaFile: req.file?.filename || null,
      password: passwordHash,
      forcePasswordChange: true,
    });

    // 📧 SEND EMAIL
    await sendCredentialsEmail({
      email: company.email,
      password: tempPassword,
      role: 'Supervisor',
    });

    res.status(201).json({
      message: 'Company added and credentials sent',
      company,
    });
  } catch (err) {
    next(err);
  }
};

exports.getHTE = async (req, res, next) => {
  try {
    const companies = await Company.findAll({
      attributes: { exclude: ['password'] },
    });
    res.json(companies);
  } catch (err) {
    next(err);
  }
};

exports.updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ message: 'HTE not found' });

    await company.update({
      ...req.body,
      email: req.body.email?.toLowerCase() || company.email,
      moaFile: req.file ? req.file.filename : company.moaFile,
    });

    res.json(company);
  } catch (err) {
    next(err);
  }
};

exports.deleteHTE = async (req, res, next) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ message: 'HTE not found' });

    await company.destroy();
    res.json({ message: 'HTE deleted successfully' });
  } catch (err) {
    next(err);
  }
};

/* =========================
   USER PROFILE
========================= */
exports.me = async (req, res, next) => {
  try {
    /* =========================
       COMPANY / SUPERVISOR
    ========================= */
    if (req.user.role === 'supervisor' || req.user.role === 'company') {
      const company = await Company.findByPk(req.user.id, {
        attributes: { exclude: ['password'] },
      });

      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      return res.json({
        id: company.id,
        email: company.email,
        role: 'company',
        name: company.name,
        supervisorName: company.supervisorName,
        address: company.address,
        natureOfBusiness: company.natureOfBusiness,
        moaStart: company.moaStart,
        moaEnd: company.moaEnd,
        moaFile: company.moaFile,
        forcePasswordChange: company.forcePasswordChange || false,
        company: company,
      });
    }

    /* =========================
       NORMAL USER
    ========================= */
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }, // ✅ FIXED: Use 'password' not 'passwordHash'
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const normalizedUser = {
      id: user.id,
      email: user.email,
      role: user.role.toLowerCase(),
      program: user.program,
      firstName: user.firstName,
      lastName: user.lastName,
      mi: user.mi || '',
      studentId: user.studentId || '',
      guardian: user.guardian || '',
      forcePasswordChange: user.forcePasswordChange || false,
    };

    return res.json({
      ...normalizedUser,
      user: normalizedUser,
    });
  } catch (err) {
    console.error('❌ ME ERROR:', err);
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    await User.update(req.body, { where: { id: req.user.id } });
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);

    // ✅ FIXED: Use 'password' not 'passwordHash'
    const match = await bcrypt.compare(currentPassword, user.password);

    if (!match) return res.status(401).json({ message: 'Wrong current password' });

    // ✅ FIXED: Use 'password' not 'passwordHash'
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};
