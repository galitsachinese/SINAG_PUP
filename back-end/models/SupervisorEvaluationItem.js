module.exports = (sequelize, DataTypes) => {
  return sequelize.define('SupervisorEvaluationItem', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    evaluationId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    section: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    indicator: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    remark: {
      type: DataTypes.TEXT,
    },
  });
};
