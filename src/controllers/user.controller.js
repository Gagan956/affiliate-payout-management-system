const User = require('../models/User');
const { generateUniqueUserId } = require('../utils/helpers');
const logger = require('../config/logger');

const createUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists',
        user: {
          userId: existingUser.userId,
          name: existingUser.name,
          email: existingUser.email
        }
      });
    }

    const userId = await generateUniqueUserId(name, User);

    const user = new User({
      userId,
      name,
      email,
      withdrawableBalance: 0,
      totalEarnings: 0,
      totalAdvanceReceived: 0,
      totalAdjustments: 0
    });

    await user.save();

    logger.info(`User created: ${userId} (${name})`);

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      user
    });

  } catch (error) {
    logger.error('Error creating user:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getUser = async (req, res) => {
  try {
    const { userId, email } = req.query;
    
    let query = {};
    if (userId) query.userId = userId;
    if (email) query.email = email;

    if (!userId && !email) {
      return res.status(400).json({
        success: false,
        error: 'Either userId or email is required'
      });
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    logger.error('Error fetching user:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .sort({ createdAt: -1 })
      .select('userId name email withdrawableBalance totalEarnings totalAdvanceReceived totalAdjustments createdAt');

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    logger.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  createUser,
  getUser,
  getAllUsers
};