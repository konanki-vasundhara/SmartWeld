const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  displayName: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  profileImage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true 
  },
  workshopName: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  specialization: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'technician'
  },
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {
      notifications: true,
      language: 'en',
      currency: 'INR',
      theme: 'dark'
    }
  },
  stats: {
    type: DataTypes.JSONB,
    defaultValue: {
      totalScans: 0,
      totalBookings: 0,
      totalSpent: 0,
      accuracyRate: 0
    }
  },
  location: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['phoneNumber'] },
    { fields: ['email'] },
    { fields: ['createdAt'] }
  ]
});

// Hash password before saving
User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.prototype.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
