const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  withdrawableBalance: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  totalEarnings: { 
    type: Number, 
    default: 0 
  },
  totalAdvanceReceived: { 
    type: Number, 
    default: 0 
  },
  totalAdjustments: { 
    type: Number, 
    default: 0 
  },
  lastWithdrawalAt: { 
    type: Date, 
    default: null 
  }
}, {
  timestamps: true
});



const User = mongoose.model('User', userSchema);
module.exports = User;