const express = require("express");
const router = express.Router();
const { verifyToken} = require("../middlewares/auth");
const { allowRoles } = require("../middlewares/roles");
const { getAllUsers, createUser, getMe, updateUser, disableUser } = require("../controllers/userController");

router.get("/", verifyToken, allowRoles("admin", "hr"), getAllUsers);
router.post("/create", verifyToken, allowRoles("admin"), createUser);
router.get("/me", verifyToken, getMe);
router.put("/:id", verifyToken, updateUser);
router.patch("/:id/disable", verifyToken, allowRoles("admin", "hr"), disableUser);

module.exports = router;
