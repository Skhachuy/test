const { Sequelize } = require('sequelize');

// Initialize Sequelize instance
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'boarding_house_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Import models
const Bill = require('./bill')(sequelize);
const Payment = require('./payment')(sequelize);
const Room = require('./room')(sequelize);
const BoardingHouse = require('./boardingHouse')(sequelize);
const Tenant = require('./tenant')(sequelize);

// Define associations
Bill.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });
Bill.hasMany(Payment, { foreignKey: 'bill_id', as: 'payments' });

Payment.belongsTo(Bill, { foreignKey: 'bill_id', as: 'bill' });
Payment.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

Room.belongsTo(BoardingHouse, { foreignKey: 'boarding_house_id', as: 'boardingHouse' });
Room.hasMany(Bill, { foreignKey: 'room_id', as: 'bills' });

BoardingHouse.hasMany(Room, { foreignKey: 'boarding_house_id', as: 'rooms' });

Tenant.hasMany(Payment, { foreignKey: 'tenant_id', as: 'payments' });

module.exports = {
  sequelize,
  Bill,
  Payment,
  Room,
  BoardingHouse,
  Tenant
};
