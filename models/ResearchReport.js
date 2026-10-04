const mongoose = require("mongoose");
// its pdf upload file

const researchReportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "Latest Research Report",
    },
    pdfUrl: {
      type: String,
      required: [true, "PDF file path is required"],
    },
    originalName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("ResearchReport", researchReportSchema);