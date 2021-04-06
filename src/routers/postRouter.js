const express = require("express");
const router = express.Router();
const postController = require("../app/controllers/postController");
const authUser = require("../middleware/userMiddleware");

//router
router.use(authUser);
router.post("/addPost", postController.addPost);
router.post("/deletePost", postController.deletePost);
router.post("/updatePost", postController.updatePost);
router.post("/getComment", postController.getComments);

module.exports = router;
