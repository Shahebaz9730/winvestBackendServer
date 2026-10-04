const express = require("express");
const router = express.Router();
const researchReportController = require("../controllers/researchReportController");
const upload = require("../middleware/uploadMiddleware");
const verifyLogin = require("../middleware/verifyLogin");

// Public Route: Client-side PDF fetch karne ke liye
router.get("/active", researchReportController.getActiveReport);

// Protected Routes (Admin Dashboard)
router.use(verifyLogin);
router.post("/upload", upload.single("pdf"), researchReportController.uploadReport);
router.delete("/delete", researchReportController.deleteReport);

module.exports = router;