const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { verifyToken} = require("../middlewares/auth");
const { allowRoles } = require("../middlewares/roles");

router.post("/", verifyToken, allowRoles(["admin", "hr"]), taskController.createTask);
router.get("/", verifyToken, taskController.getTasks);
router.put("/:id", verifyToken, allowRoles(["admin", "hr"]), taskController.updateTask);
router.delete("/:id", verifyToken, allowRoles(["admin", "hr"]), taskController.deleteTask);

module.exports = router;
