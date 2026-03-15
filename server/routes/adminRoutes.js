const express = require("express");
const {
  registerAdmin,
  loginAdmin,
  getAdminDashboard,
  getAllUsersForAdmin,
  getAllHelpersForAdmin,
  getAllIssuesForAdmin,
} = require("../controllers/adminController");

const { protect, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Auth
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// Dashboard and management
router.get("/dashboard", protect, isAdmin, getAdminDashboard);
router.get("/users", protect, isAdmin, getAllUsersForAdmin);
router.get("/helpers", protect, isAdmin, getAllHelpersForAdmin);
router.get("/issues", protect, isAdmin, getAllIssuesForAdmin);

module.exports = router;