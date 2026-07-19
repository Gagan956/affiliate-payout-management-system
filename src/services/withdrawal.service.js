const User = require('../models/User');
const Payout = require('../models/Payout');
const Withdrawal = require('../models/Withdrawal');
const { recoverFailedPayout } = require('./recovery.service');
const logger = require('../config/logger');
const { formatCurrency, isWithin24Hours, getHoursRemaining } = require('../utils/helpers');

const MIN_WITHDRAWAL = parseInt(process.env.MIN_WITHDRAWAL_AMOUNT) || 10;
const COOLDOWN_HOURS = parseInt(process.env.WITHDRAWAL_COOLDOWN_HOURS) || 24;


// validateWithdrawal
const validateWithdrawal = async (user, amount) => {
  if (user.lastWithdrawalAt && isWithin24Hours(user.lastWithdrawalAt)) {
    const hoursRemaining = getHoursRemaining(user.lastWithdrawalAt);
    throw new Error(`Withdrawal cooldown: Please wait ${hoursRemaining} hours before next withdrawal`);
  }

  if (user.withdrawableBalance < amount) {
    throw new Error(`Insufficient balance. Available: ${formatCurrency(user.withdrawableBalance)}`);
  }

  if (amount <= 0) {
    throw new Error('Withdrawal amount must be greater than 0');
  }

  if (amount < MIN_WITHDRAWAL) {
    throw new Error(`Minimum withdrawal amount is ${formatCurrency(MIN_WITHDRAWAL)}`);
  }
};

const requestWithdrawal = async (userId, amount) => {
  try {
    logger.info(`Withdrawal request for ${userId}: ${formatCurrency(amount)}`);

    const user = await User.findOne({ userId });
    if (!user) {
      throw new Error('User not found');
    }

    await validateWithdrawal(user, amount);

    user.withdrawableBalance -= amount;
    user.lastWithdrawalAt = new Date();
    await user.save();

    const withdrawal = new Withdrawal({
      userId,
      amount,
      status: 'pending'
    });
    await withdrawal.save();
    
    const payout = new Payout({
      userId,
      amount,
      type: 'final',
      status: 'pending',
      saleIds: [],
      withdrawalId: withdrawal._id,
      description: `Withdrawal request #${withdrawal._id}`
    });
    await payout.save();
    
    withdrawal.payoutId = payout._id;
    await withdrawal.save();

    logger.info(`Withdrawal created: #${withdrawal._id} for ${formatCurrency(amount)}`);

    const populatedWithdrawal = await Withdrawal.findById(withdrawal._id)
      .populate('payoutId', 'amount status type');
    const updatedUser = await User.findOne({ userId })
      .select('name email withdrawableBalance');

    return {
      success: true,
      message: 'Withdrawal request created successfully',
      withdrawalId: withdrawal._id,
      amount,
      balance: user.withdrawableBalance,
      status: 'pending',
      lastWithdrawalAt: user.lastWithdrawalAt,
      withdrawal: {
        ...populatedWithdrawal.toObject(),
        user: updatedUser
      }
    };

  } catch (error) {
    logger.error('Error in requestWithdrawal:', error);
    throw new Error(`Failed to process withdrawal: ${error.message}`);
  }
};


// completeWithdrawal
const completeWithdrawal = async (withdrawalId) => {
  try {
    logger.info(`Completing withdrawal #${withdrawalId}`);

    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      throw new Error('Withdrawal not found');
    }

    if (withdrawal.status === 'completed') {
      throw new Error('Withdrawal already completed');
    }

    if (withdrawal.status === 'failed') {
      throw new Error('Cannot complete a failed withdrawal');
    }

    withdrawal.status = 'completed';
    withdrawal.completedAt = new Date();
    await withdrawal.save();

    const payout = await Payout.findById(withdrawal.payoutId);
    if (payout) {
      payout.status = 'success';
      payout.processedAt = new Date();
      await payout.save();
    }

    logger.info(`Withdrawal #${withdrawalId} completed`);

    const updatedWithdrawal = await Withdrawal.findById(withdrawalId)
      .populate('payoutId', 'amount status type processedAt');
    const userData = await User.findOne({ userId: withdrawal.userId })
      .select('name email withdrawableBalance');

    return { 
      success: true, 
      message: 'Withdrawal completed successfully',
      withdrawalId,
      withdrawal: {
        ...updatedWithdrawal.toObject(),
        user: userData
      }
    };

  } catch (error) {
    logger.error('Error in completeWithdrawal:', error);
    throw new Error(`Failed to complete withdrawal: ${error.message}`);
  }
};

const failWithdrawal = async (withdrawalId, reason) => {
  try {
    logger.info(`Failing withdrawal #${withdrawalId}: ${reason}`);

    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      throw new Error('Withdrawal not found');
    }

    if (withdrawal.status === 'completed') {
      throw new Error('Cannot fail a completed withdrawal');
    }

    if (withdrawal.status === 'failed') {
      throw new Error('Withdrawal already failed');
    }

    const result = await recoverFailedPayout(withdrawalId, reason);
    
    return {
      success: true,
      message: 'Withdrawal failed, amount recovered',
      withdrawalId,
      recoveredAmount: result.recoveredAmount,
      newBalance: result.newBalance,
      status: 'failed'
    };

  } catch (error) {
    logger.error('Error in failWithdrawal:', error);
    throw new Error(`Failed to fail withdrawal: ${error.message}`);
  }
};

   // getWithdrawalsByUser
const getWithdrawalsByUser = async (userId) => {
  try {
    const withdrawals = await Withdrawal.find({ userId })
      .sort({ createdAt: -1 });

    const populatedWithdrawals = await Promise.all(withdrawals.map(async (withdrawal) => {
      const payout = await Payout.findById(withdrawal.payoutId)
        .select('amount status type failureReason');
      const user = await User.findOne({ userId: withdrawal.userId })
        .select('name email withdrawableBalance');

      return {
        ...withdrawal.toObject(),
        payout,
        user
      };
    }));

    return {
      success: true,
      count: withdrawals.length,
      withdrawals: populatedWithdrawals
    };

  } catch (error) {
    logger.error('Error fetching withdrawals:', error);
    throw new Error(`Failed to fetch withdrawals: ${error.message}`);
  }
};

module.exports = {
  requestWithdrawal,
  completeWithdrawal,
  failWithdrawal,
  getWithdrawalsByUser
};