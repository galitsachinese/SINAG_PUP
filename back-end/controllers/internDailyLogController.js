'use strict';

const path = require('path');

// ✅ LAZY LOAD - Require models inside functions to avoid circular dependency
function getModels() {
  return require('../models');
}

exports.createDailyLog = async (req, res) => {
  try {
    const { InternDailyLog, Intern } = getModels();
    const { log_date, time_in, time_out, tasks_accomplished, skills_enhanced, learning_applied } = req.body;

    console.log('\n=== CREATE DAILY LOG ===');
    console.log('📥 Received body:', {
      log_date,
      time_in,
      time_out,
      tasks_accomplished: tasks_accomplished?.substring(0, 20) + '...',
    });
    console.log('📁 File info:', req.file ? `${req.file.filename} (${req.file.size} bytes)` : 'No file');

    /* =========================
       VALIDATION
    ========================= */
    if (!log_date || !time_in || !time_out || !tasks_accomplished) {
      console.error('❌ Missing required fields');
      return res.status(400).json({ message: 'Missing required fields' });
    }

    /* =========================
       RESOLVE INTERN (AUTHORITY)
    ========================= */
    const intern = await Intern.findOne({
      where: { user_id: req.user.id },
    });

    if (!intern) {
      console.error('❌ Intern not found for user_id:', req.user.id);
      return res.status(404).json({ message: 'Intern not found' });
    }

    console.log('✅ Intern found - ID:', intern.id);

    /* =========================
       AUTO DAY NUMBER
    ========================= */
    const day_no = (await InternDailyLog.count({ where: { intern_id: intern.id } })) + 1;
    console.log('📊 Day number auto-calculated:', day_no);

    /* =========================
       PREVENT DUPLICATE DATE
    ========================= */
    const exists = await InternDailyLog.findOne({
      where: {
        intern_id: intern.id,
        log_date,
      },
    });

    if (exists) {
      console.error('❌ Duplicate log found for date:', log_date);
      return res.status(409).json({ message: 'Daily log already exists for this date' });
    }

    /* =========================
       CALCULATE HOURS
    ========================= */
    const [inH, inM] = time_in.split(':').map(Number);
    const [outH, outM] = time_out.split(':').map(Number);

    let start = inH * 60 + inM;
    let end = outH * 60 + outM;

    // Handle overnight shifts
    if (end < start) end += 24 * 60;

    const total_hours = Number(((end - start) / 60).toFixed(2));
    console.log('⏱️ Calculated hours:', `${time_in} to ${time_out} = ${total_hours} hours`);

    /* =========================
       HANDLE PHOTO UPLOAD
    ========================= */
    let photo_path = null;

    if (req.file) {
      // ✅ Save ONLY filename (multer already saves to uploads/ folder)
      photo_path = req.file.filename;
      console.log('✅ Photo saved successfully');
      console.log('   Filename:', req.file.filename);
      console.log('   Size:', (req.file.size / 1024).toFixed(2), 'KB');
      console.log('   File path on disk:', path.join('uploads', req.file.filename));
      console.log('   URL to access:', `http://localhost:5000/uploads/${photo_path}`);
    } else {
      console.log('ℹ️ No photo attached (optional field)');
    }

    /* =========================
       CREATE LOG IN DATABASE
    ========================= */
    const log = await InternDailyLog.create({
      intern_id: intern.id,
      day_no,
      log_date,
      time_in,
      time_out,
      total_hours,
      tasks_accomplished,
      skills_enhanced: skills_enhanced || null,
      learning_applied: learning_applied || null,
      photo_path, // ✅ Save photo path to database
    });

    console.log('✅ Daily log created successfully');
    console.log('   ID:', log.id);
    console.log('   Day:', log.day_no);
    console.log('   Photo path:', log.photo_path);
    console.log('');

    return res.status(201).json(log);
  } catch (err) {
    console.error('❌ CREATE DAILY LOG ERROR:', err.message);
    console.error('Stack trace:', err.stack);
    return res.status(500).json({ message: 'Failed to create daily log' });
  }
};

exports.getDailyLogs = async (req, res) => {
  try {
    const { InternDailyLog, Intern } = getModels();

    console.log('\n=== GET DAILY LOGS (INTERN) ===');
    console.log('User ID:', req.user.id);

    const intern = await Intern.findOne({
      where: { user_id: req.user.id },
    });

    if (!intern) {
      console.error('❌ Intern not found');
      return res.status(404).json({ message: 'Intern not found' });
    }

    console.log('✅ Intern found - ID:', intern.id);

    const logs = await InternDailyLog.findAll({
      where: { intern_id: intern.id },
      order: [['log_date', 'DESC']],
    });

    // ✅ NORMALIZE photo paths (handle old 'uploads/filename' format)
    const normalizedLogs = logs.map((log) => {
      if (log.photo_path && log.photo_path.startsWith('uploads/')) {
        // Remove 'uploads/' prefix from old records
        log.photo_path = log.photo_path.replace('uploads/', '');
      }
      return log;
    });

    console.log('✅ Found', normalizedLogs.length, 'logs');
    console.log('');

    return res.json(normalizedLogs);
  } catch (err) {
    console.error('❌ GET DAILY LOGS ERROR:', err.message);
    return res.status(500).json({ message: 'Failed to fetch daily logs' });
  }
};

exports.getInternDailyLogsForAdviser = async (req, res) => {
  try {
    const { InternDailyLog } = getModels();
    const { id } = req.params;

    console.log('\n=== GET DAILY LOGS (ADVISER) ===');
    console.log('Fetching logs for intern_id:', id);

    /* =========================
       FETCH LOGS FOR SPECIFIC INTERN
    ========================= */
    const logs = await InternDailyLog.findAll({
      where: { intern_id: id },
      order: [['log_date', 'DESC']],
    });

    console.log('✅ Found', logs.length, 'logs');

    // ✅ NORMALIZE photo paths (handle old 'uploads/filename' format)
    const normalizedLogs = logs.map((log) => {
      if (log.photo_path && log.photo_path.startsWith('uploads/')) {
        // Remove 'uploads/' prefix from old records
        log.photo_path = log.photo_path.replace('uploads/', '');
        console.log(`   Converted old path to: ${log.photo_path}`);
      }
      return log;
    });

    // Debug: Show photo paths
    normalizedLogs.forEach((log, idx) => {
      console.log(`   Log ${idx + 1}: photo_path = ${log.photo_path || '(none)'}`);
    });
    console.log('');

    return res.json(normalizedLogs);
  } catch (err) {
    console.error('❌ GET INTERN DAILY LOGS ERROR:', err.message);
    return res.status(500).json({ message: 'Failed to fetch daily logs' });
  }
};

exports.approveLogByAdviser = async (req, res) => {
  try {
    const { InternDailyLog } = getModels();
    const { reportId } = req.params;
    const { adviser_status, adviser_comment } = req.body;

    console.log('\n=== APPROVE LOG (ADVISER) ===');
    console.log('Report ID:', reportId);
    console.log('Status:', adviser_status);

    /* =========================
       VALIDATION
    ========================= */
    if (!adviser_status) {
      console.error('❌ adviser_status is required');
      return res.status(400).json({ message: 'adviser_status is required' });
    }

    /* =========================
       FIND AND UPDATE LOG
    ========================= */
    const log = await InternDailyLog.findByPk(reportId);

    if (!log) {
      console.error('❌ Daily log not found - ID:', reportId);
      return res.status(404).json({ message: 'Daily log not found' });
    }

    await log.update({
      adviser_status,
      adviser_comment: adviser_comment || null,
    });

    console.log('✅ Log approved successfully');
    console.log('   New status:', adviser_status);
    console.log('');

    return res.json({
      message: 'Log approved successfully',
      log,
    });
  } catch (err) {
    console.error('❌ APPROVE LOG ERROR:', err.message);
    return res.status(500).json({ message: 'Failed to approve log' });
  }
};

/* =========================
   GET COMPANY INTERN DAILY LOGS (SUPERVISOR)
========================= */
exports.getCompanyInternDailyLogs = async (req, res) => {
  try {
    const { InternDailyLog, Intern } = getModels();
    const { internId } = req.params;

    console.log('\n=== GET COMPANY INTERN DAILY LOGS ===');
    console.log('Intern ID:', internId);
    console.log('Company ID:', req.user.id);

    /* =========================
       VERIFY INTERN BELONGS TO COMPANY
    ========================= */
    const intern = await Intern.findOne({
      where: {
        id: internId,
        company_id: req.user.id,
      },
    });

    if (!intern) {
      console.error('❌ Intern not found or does not belong to this company');
      return res.status(403).json({ message: 'Unauthorized access to intern logs' });
    }

    /* =========================
       FETCH LOGS
    ========================= */
    const logs = await InternDailyLog.findAll({
      where: { intern_id: internId },
      order: [['log_date', 'DESC']],
    });

    console.log(`✅ Found ${logs.length} logs for intern`);

    // Normalize photo_path
    const normalizedLogs = logs.map((log) => ({
      ...log.toJSON(),
      photo_path: log.photo_path || null,
    }));

    return res.json(normalizedLogs);
  } catch (err) {
    console.error('❌ GET COMPANY INTERN DAILY LOGS ERROR:', err.message);
    return res.status(500).json({ message: 'Failed to fetch daily logs' });
  }
};

/* =========================
   APPROVE LOG BY SUPERVISOR
========================= */
exports.approveLogBySupervisor = async (req, res) => {
  try {
    const { InternDailyLog, Intern } = getModels();
    const { reportId } = req.params;
    const { supervisor_status, supervisor_comment } = req.body;

    console.log('\n=== APPROVE LOG (SUPERVISOR) ===');
    console.log('Report ID:', reportId);
    console.log('Status:', supervisor_status);

    /* =========================
       VALIDATION
    ========================= */
    if (!supervisor_status) {
      console.error('❌ supervisor_status is required');
      return res.status(400).json({ message: 'supervisor_status is required' });
    }

    /* =========================
       FIND LOG AND VERIFY OWNERSHIP
    ========================= */
    const log = await InternDailyLog.findByPk(reportId, {
      include: [
        {
          model: Intern,
          as: 'Intern',
          attributes: ['company_id'],
        },
      ],
    });

    if (!log) {
      console.error('❌ Daily log not found - ID:', reportId);
      return res.status(404).json({ message: 'Daily log not found' });
    }

    if (log.Intern.company_id !== req.user.id) {
      console.error('❌ Unauthorized - log does not belong to company');
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    /* =========================
       UPDATE LOG
    ========================= */
    await log.update({
      supervisor_status,
      supervisor_comment: supervisor_comment || null,
    });

    console.log('✅ Log approved successfully by supervisor');
    console.log('   New status:', supervisor_status);

    return res.json({
      message: 'Log approved successfully',
      log,
    });
  } catch (err) {
    console.error('❌ APPROVE LOG BY SUPERVISOR ERROR:', err.message);
    return res.status(500).json({ message: 'Failed to approve log' });
  }
};

/* =========================
   UPDATE DAILY LOG
========================= */
exports.updateDailyLog = async (req, res) => {
  try {
    const { InternDailyLog, Intern } = getModels();
    const { id } = req.params;
    const { log_date, time_in, time_out, tasks_accomplished, skills_enhanced, learning_applied } = req.body;

    console.log('\n=== UPDATE DAILY LOG ===');
    console.log('📝 Log ID:', id);

    // Find intern
    const intern = await Intern.findOne({
      where: { user_id: req.user.id },
    });

    if (!intern) {
      return res.status(404).json({ message: 'Intern not found' });
    }

    // Find log
    const log = await InternDailyLog.findOne({
      where: { id, intern_id: intern.id },
    });

    if (!log) {
      return res.status(404).json({ message: 'Daily log not found' });
    }

    // Update fields
    if (log_date) log.log_date = log_date;
    if (time_in) log.time_in = time_in;
    if (time_out) log.time_out = time_out;
    if (tasks_accomplished) log.tasks_accomplished = tasks_accomplished;
    if (skills_enhanced) log.skills_enhanced = skills_enhanced;
    if (learning_applied) log.learning_applied = learning_applied;

    // Handle photo update
    if (req.file) {
      // Delete old photo if exists
      if (log.photo_url) {
        const oldPhotoPath = path.join(__dirname, '../uploads', log.photo_url);
        const fs = require('fs');
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      log.photo_url = req.file.filename;
    }

    await log.save();

    console.log('✅ Log updated successfully');
    return res.json({
      message: 'Daily log updated successfully',
      log,
    });
  } catch (err) {
    console.error('❌ UPDATE DAILY LOG ERROR:', err.message);
    return res.status(500).json({ message: 'Failed to update daily log' });
  }
};

/* =========================
   DELETE DAILY LOG
========================= */
exports.deleteDailyLog = async (req, res) => {
  try {
    const { InternDailyLog, Intern } = getModels();
    const { id } = req.params;

    console.log('\n=== DELETE DAILY LOG ===');
    console.log('🗑️ Log ID:', id);

    // Find intern
    const intern = await Intern.findOne({
      where: { user_id: req.user.id },
    });

    if (!intern) {
      return res.status(404).json({ message: 'Intern not found' });
    }

    // Find log
    const log = await InternDailyLog.findOne({
      where: { id, intern_id: intern.id },
    });

    if (!log) {
      return res.status(404).json({ message: 'Daily log not found' });
    }

    // Delete photo file if exists
    if (log.photo_url) {
      const photoPath = path.join(__dirname, '../uploads', log.photo_url);
      const fs = require('fs');
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
        console.log('🗑️ Deleted photo:', log.photo_url);
      }
    }

    await log.destroy();

    console.log('✅ Log deleted successfully');
    return res.json({
      message: 'Daily log deleted successfully',
    });
  } catch (err) {
    console.error('❌ DELETE DAILY LOG ERROR:', err.message);
    return res.status(500).json({ message: 'Failed to delete daily log' });
  }
};
