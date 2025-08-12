const express = require("express");
const router = express.Router();
const progressController = require("../controllers/progressController");
const { verifyToken} = require("../middlewares/auth");
const { allowRoles } = require("../middlewares/roles");

router.post("/", verifyToken, allowRoles("employee"), progressController.logProgress);
router.get("/", verifyToken, progressController.getProgress);
router.put("/approve/:id", verifyToken, allowRoles("admin", "hr"), progressController.approveProgress);

module.exports = router;
