const mongoose = require('mongoose');

const symbolSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: [true, 'Symbol code is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    stockName: {
      type: String,
      required: [true, 'Corresponding stock name is required'],
      trim: true
    },
    exchange: {
      type: String,
      enum: ['NSE', 'BSE'],
      default: 'NSE'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'symbols'
  }
);

symbolSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const SymbolModel = mongoose.model('Symbol', symbolSchema);

module.exports = SymbolModel;
