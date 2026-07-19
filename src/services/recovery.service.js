const User = require('../models/User');
const Payout = require('../models/Payout');
const Withdrawal = require('../models/Withdrawal');
const logger = require('../config/logger');
const { formatCurrency } = require('../utils/helpers');



// recoverFailedPayout
const recoverFailedPayout = async (withdrawalId, reason) => {
  try {
    logger.info(`Starting recovery for withdrawal #${withdrawalId}`, { reason });

    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      throw new Error('Withdrawal not found');
    }

    if (withdrawal.status === 'completed') {
      throw new Error('Cannot recover a completed withdrawal');
    }

    if (withdrawal.status === 'failed') {
      throw new Error('Withdrawal already failed');
    }

    withdrawal.status = 'failed';
    withdrawal.failureReason = reason;
    await withdrawal.save();

    const payout = await Payout.findById(withdrawal.payoutId);
    if (payout) {
      payout.status = 'failed';
      payout.failureReason = reason;
      await payout.save();
    }

    const user = await User.findOne({ userId: withdrawal.userId });
    if (!user) {
      throw new Error('User not found');
    }

    const recoveredAmount = withdrawal.amount;
    user.withdrawableBalance += recoveredAmount;
    await user.save();

    const recoveryPayout = new Payout({
      userId: withdrawal.userId,
      amount: recoveredAmount,
      type: 'recovered',
      status: 'success',
      saleIds: [],
      withdrawalId: withdrawal._id,
      description: `Recovered ${formatCurrency(recoveredAmount)} from failed withdrawal #${withdrawalId}`,
      processedAt: new Date()
    });
    await recoveryPayout.save();

    logger.info(`Recovery complete for withdrawal #${withdrawalId}`, {
      recoveredAmount: formatCurrency(recoveredAmount),
      newBalance: formatCurrency(user.withdrawableBalance)
    });

    return {
      success: true,
      message: 'Payout recovered successfully',
      withdrawalId: withdrawal._id,
      recoveredAmount,
      newBalance: user.withdrawableBalance,
      recoveryPayoutId: recoveryPayout._id
    };

  } catch (error) {
    logger.error('Error in recoverFailedPayout:', error);
    throw new Error(`Failed to recover payout: ${error.message}`);
  }
};


// recoverMultiplePayouts
const recoverMultiplePayouts = async (withdrawalIds, reason = 'Bulk recovery') => {
  try {
    logger.info(`Starting bulk recovery for ${withdrawalIds.length} withdrawals`);

    const results = [];
    const errors = [];

    for (const withdrawalId of withdrawalIds) {
      try {
        const result = await recoverFailedPayout(withdrawalId, reason);
        results.push(result);
      } catch (error) {
        errors.push({
          withdrawalId,
          error: error.message
        });
      }
    }

    return {
      success: errors.length === 0,
      totalProcessed: results.length,
      totalErrors: errors.length,
      results,
      errors
    };

  } catch (error) {
    logger.error('Error in bulk recovery:', error);
    throw new Error(`Failed to bulk recover payouts: ${error.message}`);
  }
};

module.exports = {
  recoverFailedPayout,
  recoverMultiplePayouts
};