const { SupervisorEvaluation, SupervisorEvaluationItem } = require('../models');

exports.submitEvaluation = async (req, res) => {
  try {
    const { intern_id, company_id, academic_year, semester, comment, items } = req.body;

    console.log('📝 Received supervisor evaluation:', {
      intern_id,
      company_id,
      academic_year,
      semester,
      supervisor_id: req.user?.id,
      itemsCount: items?.length,
    });

    // From auth middleware (JWT)
    const supervisor_id = req.user.id;

    if (!supervisor_id) {
      return res.status(401).json({ message: 'Unauthorized - no user ID' });
    }

    // 1️⃣ Create main evaluation
    const evaluation = await SupervisorEvaluation.create({
      intern_id,
      supervisor_id,
      company_id,
      academic_year,
      semester,
      comment,
    });

    console.log('✅ Evaluation created:', evaluation.id);

    // 2️⃣ Map evaluation items
    const mappedItems = items.map((item) => ({
      evaluation_id: evaluation.id,
      section: item.section,
      indicator: item.indicator,
      rating: item.rating,
      remark: item.remark,
    }));

    // 3️⃣ Bulk insert items
    await SupervisorEvaluationItem.bulkCreate(mappedItems);

    console.log('✅ Items created:', mappedItems.length);

    return res.status(201).json({
      message: 'Supervisor evaluation submitted successfully',
    });
  } catch (error) {
    console.error('❌ Supervisor Evaluation Error:', error.message);
    console.error('Stack:', error.stack);
    return res.status(500).json({
      message: error.message || 'Submission failed',
    });
  }
};
