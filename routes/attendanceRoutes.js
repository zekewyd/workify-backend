const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const { upload } = require("../middlewares/upload");
const { verifyToken } = require("../middlewares/auth"); 

// either send multipart form with "photo" OR JSON with "base64Image"
router.post("/clock-in", verifyToken, upload.single("photo"), attendanceController.clockIn);
router.post("/clock-out", verifyToken, upload.single("photo"), attendanceController.clockOut);
router.get("/me", verifyToken, attendanceController.myAttendance);
router.get("/today", verifyToken, attendanceController.todayAttendance);

module.exports = router;
