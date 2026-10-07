const Recommendation = require('../models/Recommendation');
const Complaint = require('../models/Complaint');
const ContactInquiry = require('../models/ContactInquiry');
const ReportDownloader = require('../models/ReportDownloader');
const Visitor = require('../models/Visitor'); // Visitor model import karein
const { sendSuccess } = require('../utils/responseHandler');

const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalComplaints,
      contactInquiries,
      totalReportDownloaders,
      totalVisitors, // Visitor count fetch karein
      activeRecommendations,
      totalRecommendations
    ] = await Promise.all([
      Complaint.countDocuments(),
      ContactInquiry.countDocuments(),
      ReportDownloader.countDocuments(),
      Visitor.countDocuments(), // Real database count
      Recommendation.countDocuments({ status: 'ACTIVE' }),
      Recommendation.countDocuments()
    ]);

    const stats = {
      totalVisitors: totalVisitors.toLocaleString(), // Real count yahan aayega
      contactInquiries: contactInquiries.toLocaleString(),
      researchReportsDownloader: totalReportDownloaders.toLocaleString(),
      totalComplaints: totalComplaints.toLocaleString(),
      activeRecommendations,
      totalRecommendations
    };

    return sendSuccess(res, 200, 'Dashboard statistics fetched successfully', { stats });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };