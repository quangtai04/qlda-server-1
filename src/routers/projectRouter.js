const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const authUser = require("../middleware/userMiddleware");
const authProj = require("../middleware/projectMiddleware");
//router
router.use(authUser);
router.post("/addProject", projectController.addProject);
router.get("/getProject", projectController.getProject);
router.get("/getAllProject", projectController.getAllProject);
router.post("/joinProject", projectController.joinProject);
// router.post("/getProjectJoined", projectController.getProjectJoined);
router.use(authProj);
router.post("/deleteProject", projectController.deleteProject);
router.post("/getProjectById", projectController.getProjectById);
router.post("/getUserJoin", projectController.getUserJoin);
router.post("/setAdmin", projectController.setAdmin);
router.post("/dropAdmin", projectController.dropAdmin);
router.post("/deleteMember", projectController.deleteMember);
module.exports = router;
