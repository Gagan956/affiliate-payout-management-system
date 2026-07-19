const Payout = require('../models/Payout');
const User = require('../models/User');
const Sale = require('../models/Sale');
const Withdrawal = require('../models/Withdrawal');
const { processAdvancePayouts } = require('../services/advancePayout.service');
const logger = require('../config/logger');

const getPayoutsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    // Trim whitespace 
    const cleanUserId = userId.trim();
    
    // Check if user exists
    const userExists = await User.findOne({ userId: cleanUserId });
    if (!userExists) {
      // Get all users 
      const allUsers = await User.find({}).select('userId name');
      const userList = allUsers.map(u => u.userId);
      
      return res.status(404).json({
        success: false,
        error: `User "${cleanUserId}" not found`,
        suggestion: 'Create a user first or check the userId',
        availableUsers: userList.length > 0 ? userList : ['No users found in database'],
        tip: 'Use one of these userIds from the list above'
      });
    }

    const payouts = await Payout.find({ userId: cleanUserId })
      .sort({ createdAt: -1 });

    const populatedPayouts = await Promise.all(payouts.map(async (payout) => {
      try {
        const sales = await Sale.find({ _id: { $in: payout.saleIds } })
          .select('earning status advanceAmount');
        
        const user = await User.findOne({ userId: payout.userId })
          .select('name email withdrawableBalance');
        
        let withdrawal = null;
        if (payout.withdrawalId) {
          withdrawal = await Withdrawal.findById(payout.withdrawalId)
            .select('status amount');
        }

        return {
          ...payout.toObject(),
          sales: sales || [],
          user: user || null,
          withdrawal: withdrawal || null
        };
      } catch (err) {
        logger.error(`Error populating payout ${payout._id}:`, err);
        return {
          ...payout.toObject(),
          sales: [],
          user: null,
          withdrawal: null,
          _populateError: err.message
        };
      }
    }));

    return res.status(200).json({
      success: true,
      count: payouts.length,
      payouts: populatedPayouts,
      userInfo: {
        userId: userExists.userId,
        name: userExists.name,
        email: userExists.email,
        withdrawableBalance: userExists.withdrawableBalance
      }
    });

  } catch (error) {
    logger.error('Error fetching payouts:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      payouts: []
    });
  }
};

//  Process Advance Payouts Controller
const processAdvanceController = async (req, res) => {
  try {
    const { userId } = req.body;
    const result = await processAdvancePayouts(userId);
    
    return res.status(200).json({
      success: true,
      message: 'Advance payouts processed',
      ...result
    });

  } catch (error) {
    logger.error('Error processing advance payouts:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Debug endpoint to check all data
const debugDatabase = async (req, res) => {
  try {
    const users = await User.find({}).select('userId name email');
    const sales = await Sale.find({}).select('userId earning status advancePaid');
    const payouts = await Payout.find({}).select('userId amount type status');
    const withdrawals = await Withdrawal.find({}).select('userId amount status');

    return res.status(200).json({
      success: true,
      data: {
        users: {
          count: users.length,
          list: users
        },
        sales: {
          count: sales.length,
          list: sales
        },
        payouts: {
          count: payouts.length,
          list: payouts
        },
        withdrawals: {
          count: withdrawals.length,
          list: withdrawals
        }
      },
      summary: {
        totalUsers: users.length,
        totalSales: sales.length,
        totalPayouts: payouts.length,
        totalWithdrawals: withdrawals.length
      },
      tips: {
        userNotFound: 'If you get "User not found", check the userId is correct',
        createUserFirst: 'Always create a user before creating sales',
        userIds: users.map(u => u.userId)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getPayoutsByUser,
  debugDatabase,
  processAdvanceController 
};