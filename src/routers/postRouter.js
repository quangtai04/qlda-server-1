const express = require("express");
const router = express.Router();
const postController = require("../app/controllers/postController");
const authUser = require("../middleware/userMiddleware");
const authProj = require("../middleware/projectMiddleware");
const authPost = require("../middleware/postMiddleware");
//router
router.use(authUser);
router.use(authPost);
router.post("/addPost", postController.addPost);
router.post("/deletePost", postController.deletePost);
router.post("/updatePost", postController.updatePost);
router.post("/getComment", postController.getComments);

module.exports = router;
