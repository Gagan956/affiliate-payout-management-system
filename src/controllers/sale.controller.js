const { createSale, getSales, getSaleById } = require('../services/sale.service');
const { processAdvancePayouts } = require('../services/advancePayout.service');
const { reconcileSale } = require('../services/reconciliation.service');
const Sale = require('../models/Sale');
const User = require('../models/User');
const { processSaleAdvance } = require('../services/advancePayout.service');
const logger = require('../config/logger');
const { validateSaleData, validateReconciliationData } = require('../utils/validators');



const createSaleController = async (req, res) => {
  try {
    const { userId, brand, earning } = req.body;

    const validation = validateSaleData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }

    const result = await createSale(userId, brand, earning);
    return res.status(201).json(result);

  } catch (error) {
    logger.error('Error creating sale:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getAllSalesController = async (req, res) => {
  try {
    const { userId, status } = req.query;
    const result = await getSales({ userId, status });
    return res.status(200).json(result);

  } catch (error) {
    logger.error('Error fetching sales:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getSaleByIdController = async (req, res) => {
  try {
    const result = await getSaleById(req.params.id);
    return res.status(200).json(result);

  } catch (error) {
    logger.error(`Error fetching sale ${req.params.id}:`, error);
    return res.status(404).json({
      success: false,
      error: error.message
    });
  }
};

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

const retryAdvanceController = async (req, res) => {
  try {
    const { saleId } = req.params;
    
    logger.info(` Retrying advance for sale ${saleId}`);
    
    const sale = await Sale.findById(saleId);
    if (!sale) {
      return res.status(404).json({
        success: false,
        error: 'Sale not found'
      });
    }

    if (sale.advancePaid) {
      return res.status(400).json({
        success: false,
        error: 'Advance already paid for this sale'
      });
    }

    if (sale.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Only pending sales can get advance payout'
      });
    }

    let user = await User.findOne({ userId: sale.userId });
    if (!user) {
      user = new User({
        userId: sale.userId,
        name: sale.userId,
        email: `${sale.userId}@example.com`,
        withdrawableBalance: 0,
        totalEarnings: 0,
        totalAdvanceReceived: 0,
        totalAdjustments: 0
      });
      await user.save();
      logger.info(`Created user ${sale.userId} during retry`);
    }

    const result = await processSaleAdvance(sale);
    
    if (result && result.success) {
      return res.status(200).json({
        success: true,
        message: 'Advance payout processed successfully',
        result
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to process advance payout',
        result
      });
    }

  } catch (error) {
    logger.error(`Error retrying advance for sale ${req.params.saleId}:`, error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const reconcileSaleController = async (req, res) => {
  try {
    const { status, reconciledBy } = req.body;

    const validation = validateReconciliationData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }

    const result = await reconcileSale(req.params.id, status, reconciledBy || 'admin');
    
    // Log the result for debugging
    logger.info('Reconciliation result:', {
      saleId: req.params.id,
      status,
      finalPayoutAmount: result.finalPayoutAmount,
      adjustmentAmount: result.adjustmentAmount
    });
    
    return res.status(200).json(result);

  } catch (error) {
    logger.error(`Error reconciling sale ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  createSaleController,
  getAllSalesController,
  getSaleByIdController,
  processAdvanceController,
  retryAdvanceController,
  reconcileSaleController
};