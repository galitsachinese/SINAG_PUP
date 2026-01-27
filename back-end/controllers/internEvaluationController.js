const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const InternEvaluation = require('../models/InternEvaluation')(sequelize, DataTypes);
const InternEvaluationItem = require('../models/InternEvaluationItem')(sequelize, DataTypes);

// =========================
// RELATIONSHIPS
// =========================
InternEvaluation.hasMany(InternEvaluationItem, {
  foreignKey: 'evaluationId',
  onDelete: 'CASCADE',
});

InternEvaluationItem.belongsTo(InternEvaluation, {
  foreignKey: 'evaluationId',
});

// =========================
// CREATE INTERN EVALUATION
// =========================
exports.createEvaluation = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { intern_id, ratings, totalScore, ...evaluationData } = req.body;

    if (!intern_id) {
      await transaction.rollback();
      return res.status(400).json({
        message: 'Intern ID is required.',
      });
    }

    // 🔒 PREVENT DUPLICATE EVALUATION PER INTERN
    const existing = await InternEvaluation.findOne({
      where: { intern_id },
      transaction,
    });

    if (existing) {
      await transaction.rollback();
      return res.status(400).json({
        message: 'This intern has already been evaluated.',
      });
    }

    // 1️⃣ SAVE MAIN EVALUATION
    const evaluation = await InternEvaluation.create(
      {
        intern_id,
        ...evaluationData,
        totalScore,
      },
      { transaction },
    );

    // 2️⃣ SAVE ITEM RATINGS
    const rows = ratings.map((score, index) => ({
      evaluationId: evaluation.id,
      category: index < 5 ? 'CHARACTER' : 'COMPETENCE',
      itemText: `Indicator ${index + 1}`,
      maxScore: index < 5 ? 10 : 5,
      score: Number(score) || 0,
    }));

    await InternEvaluationItem.bulkCreate(rows, { transaction });

    // ✅ COMMIT TRANSACTION
    await transaction.commit();

    res.status(201).json({
      message: 'Evaluation saved successfully',
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Evaluation Error:', error);

    res.status(500).json({
      message: 'Failed to save evaluation',
    });
  }
};
