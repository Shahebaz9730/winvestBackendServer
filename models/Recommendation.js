const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema(
  {
    stockName: {
      type: String,
      required: [true, 'Stock name is required'],
      trim: true
    },
    symbol: {
      type: String,
      required: [true, 'Stock symbol is required'],
      uppercase: true,
      trim: true
    },
    action: {
      type: String,
      required: [true, 'Recommendation action is required'],
      enum: {
        values: ['BUY', 'SELL', 'HOLD'],
        message: 'Action must be BUY, SELL, or HOLD'
      }
    },
    exchange: {
      type: String,
      enum: {
        values: ['NSE', 'BSE'],
        message: 'Exchange must be NSE or BSE'
      },
      default: 'NSE',
      uppercase: true,
      trim: true
    },
    entryPrice: {
      type: Number,
      required: [true, 'Entry price is required'],
      min: [0, 'Entry price must be a positive number']
    },
    targetPrice: {
      type: Number,
      required: [true, 'Target price is required'],
      min: [0, 'Target price must be a positive number']
    },
    stopLoss: {
      type: Number,
      required: [true, 'Stop loss is required'],
      min: [0, 'Stop loss must be a positive number']
    },
    currentPrice: {
      type: Number,
      min: [0, 'Current price must be a positive number']
    },
    recommendationDate: {
      type: Date,
      default: Date.now
    },
    validTill: {
      type: Date
    },
    status: {
      type: String,
      enum: {
        values: ['ACTIVE', 'NONACTIVE', 'HOLD'],
        message: 'Status must be ACTIVE, NONACTIVE, or HOLD'
      },
      default: 'ACTIVE'
    },
    /*
    researchReason: {
      type: String,
      trim: true
    }
    */

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user ID is required']
    }
  },
  {
    timestamps: true
  }
);

// Optimize search and filter queries with indexes
recommendationSchema.index({ symbol: 1, status: 1 });
recommendationSchema.index({ action: 1, status: 1 });
recommendationSchema.index({ createdAt: -1 });

// Clean JSON representation
recommendationSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const Recommendation = mongoose.model('Recommendation', recommendationSchema);

module.exports = Recommendation;
