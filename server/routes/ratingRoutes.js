const express = require("express");
const {
  createRating,
  getHelperRatings,
  getMyRatings,
} = require("../controllers/ratingController");

const { protect, isUser } = require("../middleware/authMiddleware");

const router = express.Router();

// User submits rating
router.post("/create", protect, isUser, createRating);

// User sees own submitted ratings
router.get("/my-ratings", protect, isUser, getMyRatings);

// Get ratings of a helper
router.get("/helper/:helperId", protect, getHelperRatings);

module.exports = router;