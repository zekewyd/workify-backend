const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { verifyToken} = require("../middlewares/auth");
const { allowRoles } = require("../middlewares/roles");

router.post("/", verifyToken, allowRoles("admin"), paymentController.createSalaryPayment);
router.get("/", verifyToken, paymentController.getSalaries);
router.put("/:id", verifyToken, allowRoles("admin"), paymentController.updateSalaryAmount);

module.exports = router;
