// const express = require("express");
// const router = express.Router();
// const reportDownloaderController = require("../controllers/reportDownloaderController");
// const verifyLogin = require("../middleware/verifyLogin"); // Aapka auth middleware

// // Public route: User site par form submit karega PDF download karne ke liye
// router.post("/reportdownloader", reportDownloaderController.addDownloader);

// // Protected routes: Admin Dashboard Table me display aur delete ke liye
// router.use(verifyLogin);
// router.get("/reportdownloader", reportDownloaderController.getDownloaders);
// router.delete("/:id", reportDownloaderController.deleteDownloader);

// module.exports = router;

const express = require("express");
const router = express.Router();
const reportDownloaderController = require("../controllers/reportDownloaderController");
const verifyLogin = require("../middleware/verifyLogin"); // Aapka auth middleware

// 1. Send / Resend OTP Public Route
router.post("/send-otp", reportDownloaderController.sendOtp);

// 2. Verify OTP & Save Lead Public Route
router.post("/reportdownloader", reportDownloaderController.addDownloader);

// Protected routes: Admin Dashboard Table me display aur delete ke liye
router.use(verifyLogin);
router.get("/reportdownloader", reportDownloaderController.getDownloaders);
router.delete("/:id", reportDownloaderController.deleteDownloader);

module.exports = router;