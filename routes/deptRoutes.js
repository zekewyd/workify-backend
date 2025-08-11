const express = require("express");
const router = express.Router();
const deptController = require("../controllers/deptController");
const { verifyToken} = require("../middlewares/auth");
const { allowRoles } = require("../middlewares/roles");

router.post("/create", (req, res, next) => {
  next();
}, verifyToken, allowRoles("admin"), deptController.createDepartment);

router.get("/", verifyToken, deptController.getDepartments);
router.put("/:id", verifyToken, allowRoles("admin"), deptController.updateDepartment);
router.delete("/:id", verifyToken, allowRoles("admin"), deptController.deleteDepartment);

module.exports = router;
