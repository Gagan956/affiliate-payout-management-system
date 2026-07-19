const logger = require('../config/logger');

const formatCurrency = (amount) => {
  return `₹${Number(amount).toFixed(2)}`;
};

const calculatePercentage = (value, percentage) => {
  return (value * percentage) / 100;
};

const isWithin24Hours = (date) => {
  if (!date) return false;
  const hoursPassed = (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60);
  return hoursPassed < 24;
};

const getHoursRemaining = (date) => {
  if (!date) return 0;
  const hoursPassed = (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60);
  return Math.ceil(24 - hoursPassed);
};

const generateUserId = (name) => {
  if (!name || name.length < 2) {
    throw new Error('Name must be at least 2 characters long');
  }
  
  const prefix = name.substring(0, 2).toUpperCase();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const suffix = name.substring(name.length - 1).toUpperCase();
  
  return `${prefix}${randomNum}${suffix}`;
};

const generateUniqueUserId = async (name, UserModel) => {
  let userId;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;
  
  while (!isUnique && attempts < maxAttempts) {
    userId = generateUserId(name);
    const existingUser = await UserModel.findOne({ userId });
    if (!existingUser) {
      isUnique = true;
    }
    attempts++;
  }
  
  if (!isUnique) {
    const timestamp = Date.now().toString().slice(-4);
    userId = `${userId}${timestamp}`;
  }
  
  return userId;
};

module.exports = {
  formatCurrency,
  calculatePercentage,
  isWithin24Hours,
  getHoursRemaining,
  generateUniqueUserId
};