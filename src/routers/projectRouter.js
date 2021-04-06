const express = require("express");
const router = express.Router();
const projectController = require("../app/controllers/projectController");
const authUser = require("../middleware/userMiddleware");

//router
router.use(authUser);
router.post("/addProject", projectController.addProject);
router.post("/deleteProject", projectController.deleteProject);
router.post("/getPosts", projectController.getPosts);

module.exports = router;
