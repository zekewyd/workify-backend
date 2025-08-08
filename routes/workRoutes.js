const express = require("express");
const router = express.Router();
const {
  getAllEmployeeNames,
  getFilteredEmployeeWorkSheets,
  createEmployeeWorkSheet,
  getEmployeeWorkSheetsByEmail,
  updateEmployeeWorkSheet,
  deleteEmployeeWorkSheet
} = require("../controllers/employeeWorkSheetController");

const { verifyToken, verifyEmployees } = require("../middleware/authMiddleware");

// All employee names
router.get("/name", getAllEmployeeNames);

// Filter employee worksheets
router.get("/", getFilteredEmployeeWorkSheets);

// Create new worksheet (Employees only)
router.post("/", verifyToken, verifyEmployees, createEmployeeWorkSheet);

// Get all worksheets by email
router.get("/:email", getEmployeeWorkSheetsByEmail);

// Update worksheet (Employees only)
router.put("/:id", verifyToken, verifyEmployees, updateEmployeeWorkSheet);

// Delete worksheet (Employees only)
router.delete("/:id", verifyToken, verifyEmployees, deleteEmployeeWorkSheet);

module.exports = router;
