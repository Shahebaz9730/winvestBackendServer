// const ReportDownloader = require("../models/ReportDownloader");
// const axios = require('axios');

// // Temporary in-memory storage for OTPs
// const otpStore = {}; 

// // 1. Send / Resend OTP via 2Factor SMS
// exports.sendOtp = async (req, res) => {
//   try {
//     const { mobileNumber } = req.body;

//     if (!mobileNumber || mobileNumber.length !== 10) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Valid 10-digit mobile number is required" 
//       });
//     }

//     // Generate 6-Digit Random OTP
//     const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

//     // Save OTP & Expiry Time in Memory
//     otpStore[mobileNumber] = {
//       otp: generatedOtp,
//       expiresAt: Date.now() + 5 * 60 * 1000, // 5 Minutes Validity
//     };

//     const apiKey = process.env.TWOFACTOR_API_KEY;
//     const templateName = process.env.TWOFACTOR_TEMPLATE_NAME;

//     // 2Factor URL with voice fallback disabled (?chk_voice=0)
//     const twoFactorUrl = `https://2factor.in/API/V1/${apiKey}/SMS/${mobileNumber}/${generatedOtp}/${templateName}?chk_voice=0`;
//     // /SMS/ ko change karke /SMS30/ kar dein:

//     // Send SMS via 2Factor
//     const response = await axios.get(twoFactorUrl);

//     if (response.data && response.data.Status === "Success") {
//       console.log(`[2Factor SMS Success] Sent to ${mobileNumber}`);
//       return res.status(200).json({
//         success: true,
//         message: "OTP sent successfully on mobile number",
//       });
//     } else {
//       console.error("[2Factor Error Response]", response.data);
//       return res.status(500).json({
//         success: false,
//         message: "Failed to dispatch OTP SMS",
//       });
//     }
//   } catch (error) {
//     console.error("[2Factor SMS Error]", error.message);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while sending OTP",
//     });
//   }
// };

// // 2. Verify OTP & Add new downloader lead
// exports.addDownloader = async (req, res) => {
//   try {
//     const { name, mobileNumber, otpCode } = req.body;

//     if (!name || !mobileNumber || !otpCode) {
//       return res.status(400).json({
//         success: false,
//         message: "Name, Mobile Number, and OTP are required",
//       });
//     }

//     // Memory se OTP Record Nikalein
//     const record = otpStore[mobileNumber];

//     // Check 1: Agar OTP generate hi nahi hua ya expire ho gaya
//     if (!record) {
//       return res.status(400).json({
//         success: false,
//         message: "OTP not found. Please request a new OTP.",
//       });
//     }

//     // Check 2: Expiry Check (5 Mins)
//     if (Date.now() > record.expiresAt) {
//       delete otpStore[mobileNumber];
//       return res.status(400).json({
//         success: false,
//         message: "OTP has expired. Please request a new OTP.",
//       });
//     }

//     // Check 3: OTP Code Match Check
//     if (record.otp !== otpCode.toString().trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid OTP entered.",
//       });
//     }

//     // Verification Successful -> Save Lead to MongoDB Database
//     const newDownloader = await ReportDownloader.create({
//       name,
//       mobileNumber,
//     });

//     // Clean Memory
//     delete otpStore[mobileNumber];

//     res.status(201).json({
//       success: true,
//       message: "OTP Verified & Lead saved successfully",
//       data: newDownloader,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

// // 3. Get all downloaders (Admin Dashboard Table Display)
// exports.getDownloaders = async (req, res) => {
//   try {
//     const downloaders = await ReportDownloader.find().sort({ created_at: -1 });

//     res.status(200).json({
//       success: true,
//       count: downloaders.length,
//       data: downloaders,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch downloaders",
//       error: error.message,
//     });
//   }
// };

// // 4. Delete a downloader record (Admin Table Action)
// exports.deleteDownloader = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deleted = await ReportDownloader.findByIdAndDelete(id);

//     if (!deleted) {
//       return res.status(404).json({
//         success: false,
//         message: "Record not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Record deleted successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Error deleting record",
//       error: error.message,
//     });
//   }
// };

const ReportDownloader = require("../models/ReportDownloader");
const axios = require("axios");

// 1. Send / Resend OTP via 2Factor AUTOGEN (SMS Only)
exports.sendOtp = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    if (!mobileNumber || mobileNumber.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Valid 10-digit mobile number is required",
      });
    }

    const apiKey = process.env.TWOFACTOR_API_KEY;
    const templateName = process.env.TWOFACTOR_TEMPLATE_NAME;

    // +91 format handle karna
    const formattedMobile = mobileNumber.startsWith("+91") ? mobileNumber : `+91${mobileNumber}`;

    // AUTOGEN Endpoint: 2Factor khud OTP generate karke SMS bhejta hai
    const twoFactorUrl = `https://2factor.in/API/V1/${apiKey}/SMS/${formattedMobile}/AUTOGEN/${templateName}`;

    const response = await axios.get(twoFactorUrl);

    if (response.data && response.data.Status === "Success") {
      console.log(`[2Factor AUTOGEN SMS Success] Sent to ${formattedMobile}`);
      
      // 2Factor ek Session ID deta hai (response.data.Details)
      return res.status(200).json({
        success: true,
        message: "OTP sent successfully via SMS",
        sessionId: response.data.Details, // Session ID verification me kaam aati hai
      });
    } else {
      console.error("[2Factor Error Response]", response.data);
      return res.status(500).json({
        success: false,
        message: "Failed to dispatch OTP SMS",
      });
    }
  } catch (error) {
    console.error("[2Factor SMS Error]", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while sending OTP",
    });
  }
};

// 2. Verify OTP via 2Factor & Save Lead
exports.addDownloader = async (req, res) => {
  try {
    const { name, mobileNumber, otpCode, sessionId } = req.body;

    if (!name || !mobileNumber || !otpCode) {
      return res.status(400).json({
        success: false,
        message: "Name, Mobile Number, and OTP are required",
      });
    }

    const apiKey = process.env.TWOFACTOR_API_KEY;

    // Direct 2Factor Verification API (Session ID ke sath ya Direct OTP check)
    // Format: https://2factor.in/API/V1/{API_KEY}/SMS/VERIFY/{SESSION_ID}/{OTP_INPUT}
    let isOtpValid = false;

    if (sessionId) {
      const verifyUrl = `https://2factor.in/API/V1/${apiKey}/SMS/VERIFY/${sessionId}/${otpCode}`;
      const verifyRes = await axios.get(verifyUrl);

      if (verifyRes.data && verifyRes.data.Status === "Success" && verifyRes.data.Details === "OTP Matched") {
        isOtpValid = true;
      }
    }

    if (!isOtpValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or Expired OTP",
      });
    }

    // Lead ko Database me Save karein
    const newDownloader = await ReportDownloader.create({
      name,
      mobileNumber,
    });

    res.status(201).json({
      success: true,
      message: "OTP Verified & Lead saved successfully",
      data: newDownloader,
    });
  } catch (error) {
    console.error("[OTP Verification Error]", error.message);
    res.status(500).json({
      success: false,
      message: "Invalid OTP or Server Error",
    });
  }
};

// 3. Get all downloaders (Admin Dashboard)
exports.getDownloaders = async (req, res) => {
  try {
    const downloaders = await ReportDownloader.find().sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      count: downloaders.length,
      data: downloaders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch downloaders",
      error: error.message,
    });
  }
};

// 4. Delete a downloader record (Admin Table Action)
exports.deleteDownloader = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ReportDownloader.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting record",
      error: error.message,
    });
  }
};