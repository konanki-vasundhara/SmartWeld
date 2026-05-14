const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Pricing = sequelize.define('Pricing', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  category: {
    type: DataTypes.STRING, // 'material', 'labor', 'service', 'emergency_issue'
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  unitPrice: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING,
    defaultValue: 'Unit'
  },
  metadata: {
    type: DataTypes.JSONB, // For extra info like line items for emergency issues
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Pricing;
