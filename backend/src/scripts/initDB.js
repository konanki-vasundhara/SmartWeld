const { sequelize, connectDB } = require('../config/database');
const User = require('../models/User');
const Scan = require('../models/Scan');
const Booking = require('../models/Booking');

const initDatabase = async () => {
  try {
    await connectDB();

    // Define associations
    User.hasMany(Scan, { foreignKey: 'userId', as: 'scans' });
    Scan.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
    Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    Scan.hasMany(Booking, { foreignKey: 'scanId', as: 'bookings' });
    Booking.belongsTo(Scan, { foreignKey: 'scanId', as: 'scan' });

    // Sync database
    const force = process.argv.includes('--force');
    await sequelize.sync({ alter: true, force });
    
    console.log(`✅ Database synced successfully ${force ? '(FORCED)' : ''}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    process.exit(1);
  }
};

initDatabase();
