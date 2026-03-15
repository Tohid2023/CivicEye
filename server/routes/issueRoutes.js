const express = require("express");
const {
  createIssue,
  getMyIssues,
  getAllIssues,
  updateIssueStatus,
  assignHelperToIssue,
} = require("../controllers/issueController");

const { protect, isUser } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// User routes
router.post("/create", protect, isUser, upload.single("image"), createIssue);
router.get("/my-issues", protect, isUser, getMyIssues);

// Protected routes for now
router.get("/all", protect, getAllIssues);
router.put("/status/:id", protect, updateIssueStatus);
router.put("/assign-helper", protect, assignHelperToIssue);

module.exports = router;