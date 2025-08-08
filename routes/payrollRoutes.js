const express = require("express");
const router = express.Router();
const {
  getAllPayroll,
  markPayrollAsPaid,
  createPayroll
} = require("../controllers/payrollController");

const { verifyToken, verifyAdmin, verifyHr } = require("../middleware/authMiddleware");

// GET all payroll records
router.get("/", getAllPayroll);

// PATCH payroll record as paid (Admin only)
router.patch("/:id", verifyToken, verifyAdmin, markPayrollAsPaid);

// POST payroll record (HR only)
router.post("/", verifyToken, verifyHr, createPayroll);

module.exports = router;
