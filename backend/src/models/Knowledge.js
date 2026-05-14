const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Knowledge = sequelize.define('Knowledge', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('article', 'video', 'guide'),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  thumbnailUrl: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  contentUrl: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: true // For videos
  },
  difficulty: {
    type: DataTypes.ENUM('Beginner', 'Intermediate', 'Pro', 'Advanced'),
    defaultValue: 'Beginner'
  },
  author: {
    type: DataTypes.STRING,
    defaultValue: 'Smart Weld Expert'
  }
}, {
  timestamps: true
});

module.exports = Knowledge;
