const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  ipAddress: { type: String },
  userAgent: { type: String },
  visitedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Visitor', visitorSchema);