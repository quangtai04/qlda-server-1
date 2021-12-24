const express = require("express");
const router = express.Router();
const administratorController = require("../controllers/administratorController");
const authUser = require("../middleware/userMiddleware");
const authAdmin = require("../middleware/userMiddleware");

//router
router.use(authUser);
router.use(authAdmin);
router.post("/getAllContentApprove", administratorController.getAllContentApprove);
router.post("/requestWithdrawalArray", administratorController.requestWithdrawalArray);
module.exports = router;
