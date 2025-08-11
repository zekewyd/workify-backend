const express = require("express");
const router = express.Router();
const { verifyToken} = require("../middlewares/auth");
const { allowRoles } = require("../middlewares/roles");
const userDeptController = require("../controllers/userDeptController");

router.put("/assign", verifyToken, allowRoles("admin", "hr"), userDeptController.assignDepartment);
router.get("/", verifyToken, allowRoles("admin", "hr"), userDeptController.getUserDepartments);
router.put("/update", verifyToken, allowRoles("admin", "hr"), userDeptController.updateUserDepartment);
router.put("/remove", verifyToken, allowRoles("admin", "hr"), userDeptController.removeUserDepartment);

module.exports = router;
