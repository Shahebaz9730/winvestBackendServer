const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Stock name is required'],
      unique: true,
      trim: true
    },
    symbol: {
      type: String,
      required: [true, 'Stock symbol is required'],
      trim: true,
      uppercase: true
    },
    exchange: {
      type: String,
      enum: ['NSE', 'BSE'],
      default: 'NSE'
    },
    sector: {
      type: String,
      trim: true,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'stocks'
  }
);

stockSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;
