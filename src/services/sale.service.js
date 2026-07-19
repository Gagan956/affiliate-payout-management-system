const Sale = require('../models/Sale');
const User = require('../models/User');
const { processSaleAdvance } = require('./advancePayout.service');
const logger = require('../config/logger');


// createSale
const createSale = async (userId, brand, earning) => {
  let user = null;
  
  try {
    logger.info(`Creating sale for user ${userId}`);

    user = await User.findOne({ userId });
    if (!user) {
      user = new User({
        userId,
        name: userId,
        email: `${userId}@example.com`,
        withdrawableBalance: 0,
        totalEarnings: 0,
        totalAdvanceReceived: 0,
        totalAdjustments: 0
      });
      await user.save();
      logger.info(`Created new user: ${userId}`);
    }

    const sale = new Sale({
      userId,
      brand,
      earning,
      status: 'pending',
      advancePaid: false,
      advanceAmount: 0
    });
    await sale.save();

    logger.info(`Sale created: ${sale._id} for ${userId}`);

    let advanceResult = null;
    try {
      advanceResult = await processSaleAdvance(sale);
      if (advanceResult && advanceResult.success) {
        logger.info(`Advance paid immediately for sale ${sale._id}`);
      } else {
        logger.warn(`Advance payout returned no result for sale ${sale._id}`);
      }
    } catch (advanceError) {
      logger.error(`Auto advance failed for sale ${sale._id}:`, advanceError.message);
    }

    const updatedSale = await Sale.findById(sale._id)
      .populate('advancePayoutId', 'amount status type');

    const updatedUser = await User.findOne({ userId: user.userId });

    return {
      success: true,
      message: advanceResult && advanceResult.success ? '✅ Sale created with advance payout' : '⚠️ Sale created, but advance payout failed',
      sale: updatedSale,
      advance: advanceResult || null,
      user: {
        userId: updatedUser.userId,
        name: updatedUser.name,
        withdrawableBalance: updatedUser.withdrawableBalance
      }
    };

  } catch (error) {
    logger.error('Error creating sale:', error);
    throw new Error(`Failed to create sale: ${error.message}`);
  }
};

const getSales = async (filters = {}) => {
  try {
    const query = {};
    if (filters.userId) query.userId = filters.userId;
    if (filters.status) query.status = filters.status;

    const sales = await Sale.find(query)
      .sort({ createdAt: -1 })
      .populate('advancePayoutId', 'amount status type');

    const salesWithUser = await Promise.all(sales.map(async (sale) => {
      const user = await User.findOne({ userId: sale.userId })
        .select('name email withdrawableBalance');
      
      const saleObj = sale.toObject();
      
      return {
        ...saleObj,
        user: user ? {
          _id: user._id,
          name: user.name,
          email: user.email,
          withdrawableBalance: user.withdrawableBalance
        } : null
      };
    }));

    return {
      success: true,
      count: sales.length,
      sales: salesWithUser
    };

  } catch (error) {
    logger.error('Error fetching sales:', error);
    throw new Error(`Failed to fetch sales: ${error.message}`);
  }
};

const getSaleById = async (saleId) => {
  try {
    const sale = await Sale.findById(saleId)
      .populate('advancePayoutId', 'amount status type');

    if (!sale) {
      throw new Error('Sale not found');
    }

    const user = await User.findOne({ userId: sale.userId })
      .select('name email withdrawableBalance');

    return {
      success: true,
      sale: {
        ...sale.toObject(),
        user
      }
    };

  } catch (error) {
    logger.error(`Error fetching sale ${saleId}:`, error);
    throw new Error(`Failed to fetch sale: ${error.message}`);
  }
};

module.exports = {
  createSale,
  getSales,
  getSaleById
};