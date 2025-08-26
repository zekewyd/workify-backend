const express = require("express");
const router = express.Router();
const inquiryController = require("../controllers/inquiryController");
const { verifyToken } = require("../middlewares/auth");
const { allowRoles } = require("../middlewares/roles");

router.post("/create", verifyToken, allowRoles("employee"), inquiryController.createInquiry);
router.get("/", verifyToken, inquiryController.getInquiries);
router.patch("/:id/approve", verifyToken, allowRoles("admin", "hr"), inquiryController.approveInquiry);
router.patch("/:id/decline", verifyToken, allowRoles("admin", "hr"), inquiryController.declineInquiry);

module.exports = router;