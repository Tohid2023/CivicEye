const express = require("express");
const {
  getAllHelpers,
  getHelperById,
  updateHelperAvailability,
  updateHelperProfile,
  getMyHelperProfile,
} = require("../controllers/helperController");

const { protect, isHelper } = require("../middleware/authMiddleware");

const router = express.Router();

// Helper self-management routes
router.get("/profile/me", protect, isHelper, getMyHelperProfile);
router.put("/profile/update", protect, isHelper, updateHelperProfile);
router.put("/availability/update", protect, isHelper, updateHelperAvailability);

// Read routes
router.get("/", protect, getAllHelpers);
router.get("/:id", protect, getHelperById);

module.exports = router;