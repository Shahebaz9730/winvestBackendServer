const mongoose = require("mongoose");

const reportDownloaderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
    },
  },
  {
    // Yahan timestamps ko custom name de sakte hain:
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("ReportDownloader", reportDownloaderSchema);