const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Scan = sequelize.define('Scan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  scanId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  imageAnalysis: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  costBreakdown: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  location: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  deviceInfo: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
    defaultValue: 'pending'
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['scanId'] },
    { fields: ['status'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = Scan;
