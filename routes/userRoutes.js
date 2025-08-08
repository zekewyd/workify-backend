const express = require("express");
const router = express.Router();
const {
  createUser,
  getUserByEmail,
  getLoggedInUserRole,
  getVerifiedEmployees,
  makeEmployeeHR,
  adjustSalary,
  getAllEmployees,
  toggleEmployeeVerification,
  getEmployeeDetails
} = require("../controllers/userController");

const { verifyToken, verifyAdmin, verifyHr } = require("../middleware/authMiddleware");

// User CRUD
router.post("/:email", createUser);
router.get("/:email", getUserByEmail);

// Logged in user role
router.get("/role/:email", getLoggedInUserRole);

// Verified employees
router.get("/verified-employees", getVerifiedEmployees);
router.patch("/verified-employees/:email", verifyToken, verifyAdmin, makeEmployeeHR);

// Salary adjustment
router.patch("/salary-adjustment/:email", verifyToken, verifyAdmin, adjustSalary);

// Employees list & verification toggle
router.get("/employees", getAllEmployees);
router.patch("/employeesVerified/:id", verifyToken, verifyHr, toggleEmployeeVerification);

// Employee details
router.get("/employeesDetails/:email", getEmployeeDetails);

// Disable user (Admin only)
router.post("/disable", verifyToken, verifyAdmin, disableUser);

// Get all disabled users
router.get("/disabled", getDisabledUsers);

// Mark an existing user as disabled
router.patch("/disable/:email", verifyToken, verifyAdmin, markUserAsDisabled);

module.exports = router;
