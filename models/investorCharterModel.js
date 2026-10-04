const mongoose = require('mongoose');

// Month Ending Schema (Single Record Update)
const monthEndingSchema = new mongoose.Schema({
  month: { type: String, required: true, default: 'January' },
  year: { type: String, required: true, default: '2026' }
}, { timestamps: true });

// Monthly Investor Charter Schema
const charterSchema = new mongoose.Schema({
  month: { type: String, required: true },
  carriedForward: { type: Number, default: 0 },
  received: { type: Number, default: 0 },
  resolved: { type: Number, default: 0 },
  totalPending: { type: Number, default: 0 }
}, { timestamps: true });

// Trend of Annual Disposal Schema
const trendSchema = new mongoose.Schema({
  year: { type: String, required: true }, // e.g. "2026-27"
  carriedForward: { type: Number, default: 0 },
  received: { type: Number, default: 0 },
  resolved: { type: Number, default: 0 },
  totalPending: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = {
  MonthEnding: mongoose.model('MonthEnding', monthEndingSchema),
  InvestorCharter: mongoose.model('InvestorCharter', charterSchema),
  Trend: mongoose.model('Trend', trendSchema)
};