const express = require("express");
const router = express.Router();
const videoController = require("../controllers/videoController.js");
const authUser = require("../middleware/userMiddleware");
//router
router.use(authUser);
router.post("/addVideo", videoController.addVideo);
module.exports = router;
