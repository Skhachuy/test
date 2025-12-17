const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Bill = sequelize.define('Bill', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    room_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'rooms',
        key: 'id'
      }
    },
    period: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Billing period (e.g., 2024-01)'
    },
    total_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('unpaid', 'partial', 'paid'),
      allowNull: false,
      defaultValue: 'unpaid'
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'bills',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Bill;
};
