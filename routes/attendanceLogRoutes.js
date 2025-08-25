const express = require("express");
const router = express.Router();
const attendanceLogController = require("../controllers/attendanceLogController");
const { verifyToken } = require("../middlewares/auth");
const { allowRoles } = require("../middlewares/roles");

router.post("/create", verifyToken, allowRoles("admin", "hr"), attendanceLogController.addLog);
router.put("/:id", verifyToken, allowRoles("admin", "hr"), attendanceLogController.updateLog);
router.get("/", verifyToken, attendanceLogController.getLogs);
router.delete("/:id", verifyToken, allowRoles("admin", "hr"), attendanceLogController.deleteLog);

module.exports = router;