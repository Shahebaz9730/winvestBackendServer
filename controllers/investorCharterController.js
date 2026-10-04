  const { MonthEnding, InvestorCharter, Trend } = require('../models/investorCharterModel');

// ==================== 1. DATA OF MONTH ENDING ====================
exports.updateMonthEnding = async (req, res) => {
  try {
    const { month, year } = req.body;
    // Upsert: Single document update karega ya pehli baar create karega
    const data = await MonthEnding.findOneAndUpdate(
      {}, 
      { month, year }, 
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, message: "Month ending updated successfully", data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMonthEnding = async (req, res) => {
  try {
    const data = await MonthEnding.findOne();
    res.status(200).json({ success: true, data: data || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== 2. INVESTOR CHARTER (MONTHLY) ====================
exports.addCharter = async (req, res) => {
  try {
    const { month, carriedForward, received, resolved, totalPending } = req.body;
    const newCharter = new InvestorCharter({ month, carriedForward, received, resolved, totalPending });
    await newCharter.save();
    res.status(201).json({ success: true, message: "Charter record added", data: newCharter });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCharter = async (req, res) => {
  try {
    const data = await InvestorCharter.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCharter = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await InvestorCharter.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ success: true, message: "Charter updated", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCharter = async (req, res) => {
  try {
    const { id } = req.params;
    await InvestorCharter.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Charter record deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== 3. TREND OF ANNUAL DISPOSAL ====================
exports.addTrend = async (req, res) => {
  try {
    const { year, carriedForward, received, resolved, totalPending } = req.body;
    const newTrend = new Trend({ year, carriedForward, received, resolved, totalPending });
    await newTrend.save();
    res.status(201).json({ success: true, message: "Trend record added", data: newTrend });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTrend = async (req, res) => {
  try {
    const data = await Trend.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTrend = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Trend.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ success: true, message: "Trend updated", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTrend = async (req, res) => {
  try {
    const { id } = req.params;
    await Trend.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Trend record deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};