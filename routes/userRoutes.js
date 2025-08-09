const express = require("express");
const router = express.Router();
const { verifyToken} = require("../middlewares/auth");
const { allowRoles } = require("../middlewares/roles");
const { getAllUsers, getMe, updateUser, disableUser } = require("../controllers/userController");

router.get("/", verifyToken, allowRoles("admin"), getAllUsers);
router.get("/me", verifyToken, getMe);
router.put("/:id", verifyToken, updateUser);
router.patch("/:id/disable", verifyToken, allowRoles("admin", "hr"), disableUser);

module.exports = router;
