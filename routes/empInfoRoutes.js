const express = require("express");
const router = express.Router();
const empInfoController = require("../controllers/empInfoController");
const { verifyToken} = require("../middlewares/auth");
const { allowRoles } = require("../middlewares/roles");

router.post("/create", verifyToken, allowRoles("admin", "hr"), empInfoController.createEmpInfo); 
router.get("/all", verifyToken, allowRoles("admin", "hr"), empInfoController.getAllEmpInfo); 
router.get("/user/:userId", verifyToken, allowRoles("admin", "hr"), empInfoController.getEmpInfoByID);
router.get("/me", verifyToken, allowRoles("employee"), empInfoController.getMyInfo); 

// update (admin/hr only)
router.put("/personal/:pInfoID", verifyToken, allowRoles("admin", "hr"), empInfoController.updatePersonalInfo);
router.put("/parents/:pInfoID", verifyToken, allowRoles("admin", "hr"), empInfoController.updateParentsInfo);
router.put("/emergency/:pInfoID", verifyToken, allowRoles("admin", "hr"), empInfoController.updateEmergencyInfo);

module.exports = router;
