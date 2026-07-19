const Sale = require('../models/Sale');
const User = require('../models/User');
const Payout = require('../models/Payout');
const logger = require('../config/logger');
const { formatCurrency } = require('../utils/helpers');



const reconcileSale = async (saleId, newStatus, reconciledBy = 'admin') => {
  try {
    logger.info(`Reconciling sale ${saleId} to ${newStatus}`, { reconciledBy });

    const sale = await Sale.findById(saleId);

    if (!sale) {
      throw new Error('Sale not found');
    }

    if (sale.status !== 'pending') {
      throw new Error(`Sale already ${sale.status}. Cannot reconcile again.`);
    }

    if (sale.reconciledAt) {
      throw new Error('Sale already reconciled');
    }

    // Update sale status
    sale.status = newStatus;
    sale.reconciledAt = new Date();
    sale.reconciledBy = reconciledBy;
    await sale.save();

    const user = await User.findOne({ userId: sale.userId });
    if (!user) {
      throw new Error('User not found');
    }

    let finalPayoutAmount = 0;
    let adjustmentAmount = 0;

    if (newStatus === 'approved') {
      // Case 1: Approved - Pay remaining amount (POSITIVE)
      const remainingAmount = sale.earning - (sale.advanceAmount || 0);
      finalPayoutAmount = remainingAmount;

      if (remainingAmount > 0) {
        const payout = new Payout({
          userId: sale.userId,
          amount: remainingAmount,
          type: 'final',
          status: 'success',
          saleIds: [sale._id],
          description: `Final payout for approved sale ${sale._id}`,
          processedAt: new Date()
        });
        await payout.save();

        user.withdrawableBalance += remainingAmount;
      }

      user.totalEarnings = (user.totalEarnings || 0) + sale.earning;
      await user.save();

      logger.info(`Sale ${saleId} approved`, {
        earning: formatCurrency(sale.earning),
        advancePaid: formatCurrency(sale.advanceAmount || 0),
        remaining: formatCurrency(remainingAmount)
      });

    } else if (newStatus === 'rejected') {
      // Case 2: Rejected - Recover advance amount (NEGATIVE)
      if (sale.advancePaid && sale.advanceAmount > 0) {
        const advanceAmount = sale.advanceAmount;
        
        // Store the original balance for logging
        const originalBalance = user.withdrawableBalance;
        
        // Create adjustment payout record
        const adjustment = new Payout({
          userId: sale.userId,
          amount: advanceAmount,  // Positive amount in DB
          type: 'adjustment',
          status: 'success',
          saleIds: [sale._id],
          description: `Adjustment for rejected sale ${sale._id}`,
          processedAt: new Date()
        });
        await adjustment.save();

        // Deduct from balance
        if (user.withdrawableBalance >= advanceAmount) {
          user.withdrawableBalance -= advanceAmount;
          adjustmentAmount = -advanceAmount;  
        } else {
         
          const recoveredAmount = user.withdrawableBalance;
          user.withdrawableBalance = 0;
          adjustmentAmount = -recoveredAmount;  
        }

        user.totalAdjustments = (user.totalAdjustments || 0) + advanceAmount;
        await user.save();

        logger.info(`Sale ${saleId} rejected - recovered ${formatCurrency(advanceAmount)}`, {
          originalBalance: formatCurrency(originalBalance),
          advanceAmount: formatCurrency(advanceAmount),
          newBalance: formatCurrency(user.withdrawableBalance),
          adjustmentAmount: formatCurrency(adjustmentAmount)
        });
      } else {
        logger.info(`Sale ${saleId} rejected - No advance to recover`);
        adjustmentAmount = 0;
      }
    }

    // Fetch updated data
    const updatedSale = await Sale.findById(saleId)
      .populate('advancePayoutId', 'amount status type');

    const userData = await User.findOne({ userId: sale.userId })
      .select('name email withdrawableBalance totalEarnings totalAdvanceReceived totalAdjustments');

    
    logger.info(`Reconciliation complete for ${saleId}`, {
      status: newStatus,
      finalPayoutAmount: formatCurrency(finalPayoutAmount),
      adjustmentAmount: formatCurrency(adjustmentAmount),
      userBalance: formatCurrency(userData.withdrawableBalance)
    });

    return {
      success: true,
      message: `Sale ${saleId} reconciled as ${newStatus}`,
      sale: {
        ...updatedSale.toObject(),
        user: userData
      },
      finalPayoutAmount,
      adjustmentAmount,  // negative reject sale
    
    };

  } catch (error) {
    logger.error('Error in reconcileSale:', error);
    throw new Error(`Failed to reconcile sale: ${error.message}`);
  }
};


  // reconcileSales
const reconcileSalesBulk = async (salesData, reconciledBy = 'admin') => {
  try {
    logger.info(`Starting bulk reconciliation for ${salesData.length} sales`);
    
    const results = [];
    const errors = [];

    for (const data of salesData) {
      try {
        const result = await reconcileSale(data.saleId, data.status, reconciledBy);
        results.push(result);
      } catch (error) {
        errors.push({
          saleId: data.saleId,
          error: error.message
        });
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors,
      totalProcessed: results.length,
      totalErrors: errors.length
    };

  } catch (error) {
    logger.error('Error in reconcileSalesBulk:', error);
    throw new Error(`Failed to reconcile sales in bulk: ${error.message}`);
  }
};

module.exports = { reconcileSale, reconcileSalesBulk };