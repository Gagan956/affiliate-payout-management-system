const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    index: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  type: {
    type: String,
    required: true,
    enum: ['advance', 'final', 'adjustment', 'recovered'],
    default: 'final'
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  },
  saleIds: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Sale' 
  }],
  withdrawalId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Withdrawal',
    default: null 
  },
  description: { 
    type: String, 
    default: '' 
  },
  failureReason: { 
    type: String, 
    default: null 
  },
  processedAt: { 
    type: Date, 
    default: null 
  },
  idempotencyKey: { 
    type: String, 
    unique: true,
    sparse: true 
  }
}, {
  timestamps: true
});

// Indexes 
payoutSchema.index({ userId: 1, type: 1, status: 1 });
payoutSchema.index({ userId: 1, createdAt: -1 });
payoutSchema.index({ status: 1, processedAt: 1 });

const Payout = mongoose.model('Payout', payoutSchema);
module.exports = Payout;