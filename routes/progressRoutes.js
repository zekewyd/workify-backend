const express = require("express");
const router = express.Router();
const progressController = require("../controllers/progressController");
const { verifyToken} = require("../middlewares/auth");
const { allowRoles } = require("../middlewares/roles");

router.post("/log", verifyToken, allowRoles("employee"), progressController.logProgress);
router.get("/", verifyToken, progressController.getProgress);

module.exports = router;
