const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    bill_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'bills',
        key: 'id'
      }
    },
    tenant_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tenants',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    method: {
      type: DataTypes.ENUM('cash', 'bank_transfer', 'momo', 'zalopay', 'vnpay'),
      allowNull: false,
      defaultValue: 'cash'
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'URL of payment proof image'
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
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
    tableName: 'payments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Payment;
};
