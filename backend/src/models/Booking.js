const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  bookingId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  scanId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  issue: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  assignedTechnician: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  schedule: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  pricing: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  payment: {
    type: DataTypes.JSONB,
    defaultValue: {
      method: 'GPay',
      status: 'pending',
      transactionId: null,
      paidAt: null
    }
  },
  status: {
    type: DataTypes.ENUM('draft', 'confirmed', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'draft'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'emergency'),
    defaultValue: 'medium'
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['bookingId'] },
    { fields: ['status'] },
    { fields: ['priority'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = Booking;
