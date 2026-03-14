const express = require("express");
const { protect, isUser, isHelper } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authenticated account",
    data: req.user,
  });
});

router.get("/user-only", protect, isUser, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome user",
    data: req.user,
  });
});

router.get("/helper-only", protect, isHelper, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome helper",
    data: req.user,
  });
});

module.exports = router;