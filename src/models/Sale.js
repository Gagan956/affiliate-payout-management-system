const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    index: true 
  },
  brand: { 
    type: String, 
    required: true,
    enum: ['brand_1', 'brand_2', 'brand_3']
  },
  earning: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending' 
  },
  advancePaid: { 
    type: Boolean, 
    default: false 
  },
  advanceAmount: { 
    type: Number, 
    default: 0 
  },
  advancePayoutId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Payout',
    default: null 
  },
  reconciledAt: { 
    type: Date, 
    default: null 
  },
  reconciledBy: { 
    type: String, 
    default: null 
  }
}, {
  timestamps: true
});

// Indexes 
saleSchema.index({ userId: 1, status: 1 });
saleSchema.index({ userId: 1, advancePaid: 1 });
saleSchema.index({ status: 1, advancePaid: 1, createdAt: 1 });

const Sale = mongoose.model('Sale', saleSchema);
module.exports = Sale;