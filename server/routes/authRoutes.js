const express = require("express");
const {
  registerUser,
  registerHelper,
  loginAccount,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register-user", registerUser);
router.post("/register-helper", registerHelper);
router.post("/login", loginAccount);

module.exports = router;