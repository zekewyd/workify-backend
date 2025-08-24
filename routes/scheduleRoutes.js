const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");
const { verifyToken} = require("../middlewares/auth");
const { allowRoles } = require("../middlewares/roles");


router.post("/create", verifyToken, allowRoles("admin", "hr"), scheduleController.createSchedule);
router.get("/", verifyToken, allowRoles("admin", "hr"), scheduleController.getSchedules);

module.exports = router;
