const express = require("express");
const router = express.Router();
const {
  addPaymentHistory,
  getPaymentHistoryByEmail,
  getPaymentHistoryCount,
  getPaymentHistoryForBarChart
} = require("../controllers/paymentController");

const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

// POST (Admin only)
router.post("/", verifyToken, verifyAdmin, addPaymentHistory);

// GET paginated payment history by user email
router.get("/:email", getPaymentHistoryByEmail);

// GET total payment history count for user
router.get("/count/:email", getPaymentHistoryCount);

// GET payment history for chart
router.get("/chart/:email", getPaymentHistoryForBarChart);

module.exports = router;
