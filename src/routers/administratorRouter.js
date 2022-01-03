const express = require("express");
const router = express.Router();
const administratorController = require("../controllers/administratorController");
const authUser = require("../middleware/userMiddleware");
const authAdmin = require("../middleware/userMiddleware");

//router
router.use(authUser);
router.use(authAdmin);
router.get("/getAllBlog", administratorController.getAllBlog);
router.post("/requestWithdrawal", administratorController.requestWithdrawal);
router.get("/getAllUser", administratorController.getAllUser);
router.post("/changeIsActive", administratorController.changeIsActive);
router.post("/handleStatus", administratorController.handleStatus);
router.get(
  "/getRequestWithdrawal",
  administratorController.getRequestWithdrawal
);
router.post("/changeStatusBlog", administratorController.changeStatusBlog);
module.exports = router;
