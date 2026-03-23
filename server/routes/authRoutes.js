const express = require("express");
const {
  sendOtp,
  verifyOtp,
  registerUser,
  registerHelper,
  loginAccount,
} = require("../controllers/authController");

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/register-user", registerUser);
router.post("/register-helper", registerHelper);
router.post("/login", loginAccount);

module.exports = router;