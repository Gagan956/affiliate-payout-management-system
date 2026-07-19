const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    index: true 
  },
  amount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  payoutId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Payout', 
    default: null 
  },
  failureReason: { 
    type: String, 
    default: null 
  },
  completedAt: { 
    type: Date, 
    default: null 
  },
  requestedAt: { 
    type: Date, 
    default: Date.now 
  },
  retryCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes 
withdrawalSchema.index({ userId: 1, status: 1 });
withdrawalSchema.index({ userId: 1, requestedAt: -1 });
withdrawalSchema.index({ status: 1, requestedAt: 1 });

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);
module.exports = Withdrawal;