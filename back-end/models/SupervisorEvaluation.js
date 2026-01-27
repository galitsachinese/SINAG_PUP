module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'SupervisorEvaluation',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      intern_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'interns', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      supervisor_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      company_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'companies', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      academic_year: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      semester: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      comment: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: 'supervisor_evaluations',
      indexes: [
        // One evaluation per intern-supervisor per term
        {
          unique: true,
          fields: ['intern_id', 'supervisor_id', 'academic_year', 'semester'],
          name: 'uniq_supervisor_eval',
        },
      ],
    },
  );
};
