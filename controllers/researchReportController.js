const ResearchReport = require("../models/ResearchReport");
const fs = require("fs");
const path = require("path");

// 1. Upload or Replace PDF Report (Only 1 Active Allowed)
exports.uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload a PDF file" });
    }

    // Pehle se majood purani report check karo
    const existingReport = await ResearchReport.findOne();

    if (existingReport) {
      // Disk memory se purani PDF file delete karo
      const oldFilePath = path.join(__dirname, "..", existingReport.pdfUrl);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
      // Purana DB record delete karo
      await ResearchReport.findByIdAndDelete(existingReport._id);
    }

    // Nayi PDF create karo
    const relativePath = `/uploads/reports/${req.file.filename}`;
    const newReport = await ResearchReport.create({
      title: req.body.title || "Latest Research Report",
      pdfUrl: relativePath,
      originalName: req.file.originalname,
    });

    res.status(201).json({
      success: true,
      message: "Research report uploaded successfully",
      data: newReport,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get Active PDF Report
exports.getActiveReport = async (req, res) => {
  try {
    const report = await ResearchReport.findOne();
    if (!report) {
      return res.status(404).json({ success: false, message: "No active report found" });
    }

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Delete Active PDF Report
exports.deleteReport = async (req, res) => {
  try {
    const report = await ResearchReport.findOne();
    if (!report) {
      return res.status(404).json({ success: false, message: "No report to delete" });
    }

    // File server storage se delete karo
    const filePath = path.join(__dirname, "..", report.pdfUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await ResearchReport.findByIdAndDelete(report._id);

    res.status(200).json({ success: true, message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};