const express = require("express");
const {
  createIssue,
  getMyIssues,
  getAllIssues,
  updateIssueStatus,
  assignHelperToIssue,
} = require("../controllers/issueController");

const { protect, isUser } = require("../middleware/authMiddleware");

const router = express.Router();

// User routes
router.post("/create", protect, isUser, createIssue);
router.get("/my-issues", protect, isUser, getMyIssues);

// Protected routes for now
router.get("/all", protect, getAllIssues);
router.put("/status/:id", protect, updateIssueStatus);
router.put("/assign-helper", protect, assignHelperToIssue);

module.exports = router;