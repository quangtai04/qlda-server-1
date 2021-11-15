const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const authUser = require("../middleware/userMiddleware");
const authProj = require("../middleware/projectMiddleware");
//router
router.use(authUser);
// router.post("/getAllTaskUser", taskController.getAllTaskUser);
router.use(authProj);
router.post("/addTask", taskController.addTask);
router.get("/getTasks", taskController.getTasks);
router.post("/updateTask", taskController.updateTask);
// router.post("/deleteTask", taskController.deleteTask);
// router.post("/analysis", taskController.analysis);
// router.post("/getTaskUser", taskController.getTaskUser);
module.exports = router;
