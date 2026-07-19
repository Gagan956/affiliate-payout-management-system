const Sale = require('../models/Sale');
const User = require('../models/User');
const Payout = require('../models/Payout');
const logger = require('../config/logger');
const { formatCurrency, calculatePercentage } = require('../utils/helpers');

const ADVANCE_PAYOUT_PERCENTAGE = parseInt(process.env.ADVANCE_PAYOUT_PERCENTAGE) || 10;


// processSaleAdvance
const processSaleAdvance = async (sale) => {
  try {
    if (!sale) {
      logger.error('Sale object is null or undefined');
      return null;
    }

    if (sale.status !== 'pending') {
      logger.info(`Sale ${sale._id} not pending (status: ${sale.status}), skipping advance`);
      return null;
    }

    if (sale.advancePaid) {
      logger.info(`Sale ${sale._id} already has advance paid, skipping`);
      return null;
    }

    if (sale.earning <= 0) {
      logger.info(`Sale ${sale._id} has zero earning, skipping advance`);
      return null;
    }

    logger.info(`Processing advance payout for sale ${sale._id}`);

    let user = await User.findOne({ userId: sale.userId });
    
    if (!user) {
      logger.info(`User ${sale.userId} not found, creating...`);
      user = new User({
        userId: sale.userId,
        name: sale.userId || 'Unknown User',
        email: `${sale.userId}@example.com`,
        withdrawableBalance: 0,
        totalEarnings: 0,
        totalAdvanceReceived: 0,
        totalAdjustments: 0
      });
      await user.save();
      logger.info(`Created user ${sale.userId} during advance processing`);
    }

    const advanceAmount = calculatePercentage(sale.earning, ADVANCE_PAYOUT_PERCENTAGE);
    
    logger.info(`Advance amount for sale ${sale._id}: ${formatCurrency(advanceAmount)}`);

    if (advanceAmount <= 0) {
      logger.info(`Sale ${sale._id} advance amount is 0, skipping`);
      return null;
    }

    const existingSale = await Sale.findById(sale._id);
    if (existingSale.advancePaid) {
      logger.info(`Sale ${sale._id} was already processed, skipping`);
      return null;
    }

    const idempotencyKey = `advance_${sale._id}_${Date.now()}`;
    const payout = new Payout({
      userId: sale.userId,
      amount: advanceAmount,
      type: 'advance',
      status: 'success',
      saleIds: [sale._id],
      description: `Advance payout (${ADVANCE_PAYOUT_PERCENTAGE}%) for sale ${sale._id}`,
      processedAt: new Date(),
      idempotencyKey
    });
    await payout.save();

    sale.advancePaid = true;
    sale.advanceAmount = advanceAmount;
    sale.advancePayoutId = payout._id;
    await sale.save();

    user.withdrawableBalance = (user.withdrawableBalance || 0) + advanceAmount;
    user.totalAdvanceReceived = (user.totalAdvanceReceived || 0) + advanceAmount;
    await user.save();

    logger.info(`Advance paid for sale ${sale._id}: ${formatCurrency(advanceAmount)}`);
    logger.info(`User ${sale.userId} new balance: ${formatCurrency(user.withdrawableBalance)}`);

    return {
      success: true,
      saleId: sale._id,
      advanceAmount,
      payoutId: payout._id,
      newBalance: user.withdrawableBalance
    };

  } catch (error) {
    logger.error(`Failed to process advance for sale ${sale._id}:`, error);
    return { 
      success: false, 
      saleId: sale._id,
      error: error.message 
    };
  }
};


// processAdvancePayouts
const processAdvancePayouts = async (userId = null) => {
  try {
    logger.info(` Processing advance payouts${userId ? ` for user ${userId}` : ''}`);

    const query = { 
      status: 'pending', 
      advancePaid: false,
      earning: { $gt: 0 }
    };
    
    if (userId) {
      query.userId = userId;
    }

    const sales = await Sale.find(query).sort({ createdAt: 1 });
    
    if (sales.length === 0) {
      return {
        processed: 0,
        totalAmount: 0,
        results: []
      };
    }

    logger.info(`Found ${sales.length} eligible sales for advance payout`);

    const results = [];
    let totalAmount = 0;
    let processedCount = 0;

    for (const sale of sales) {
      try {
        const freshSale = await Sale.findById(sale._id);
        if (!freshSale || freshSale.advancePaid) {
          logger.info(`Sale ${sale._id} already processed, skipping`);
          continue;
        }
        
        const result = await processSaleAdvance(freshSale);
        if (result && result.success) {
          results.push(result);
          totalAmount += result.advanceAmount;
          processedCount++;
        } else {
          logger.warn(`Sale ${sale._id} returned no result`);
          results.push({
            saleId: sale._id,
            success: false,
            error: result?.error || 'No result returned'
          });
        }
      } catch (error) {
        logger.error(`Failed to process sale ${sale._id}:`, error);
        results.push({
          saleId: sale._id,
          success: false,
          error: error.message
        });
      }
    }

    return {
      processed: processedCount,
      totalAmount,
      results
    };

  } catch (error) {
    logger.error('Error processing advance payouts:', error);
    throw new Error(`Failed to process advance payouts: ${error.message}`);
  }
};

module.exports = { 
  processSaleAdvance, 
  processAdvancePayouts 
};