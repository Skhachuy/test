const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Room = sequelize.define('Room', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    boarding_house_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'boarding_houses',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    floor: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    area: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Area in square meters'
    },
    price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('available', 'occupied', 'maintenance'),
      allowNull: false,
      defaultValue: 'available'
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
    tableName: 'rooms',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Room;
};
