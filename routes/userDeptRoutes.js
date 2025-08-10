const express = require("express");
const router = express.Router();
const { verifyToken} = require("../middlewares/auth");
const { allowRoles } = require("../middlewares/roles");
const userDeptController = require("../controllers/userDeptController");

router.put("/assign", verifyToken, allowRoles(["admin", "hr"]), userDeptController.assignDepartment);

module.exports = router;
