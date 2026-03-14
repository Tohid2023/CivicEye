const Issue = require("../models/Issue");
const Helper = require("../models/Helper");

// Create Issue
const createIssue = async (req, res) => {
  try {
    const { category, description, image, address, latitude, longitude } = req.body;

    if (!category || !description) {
      return res.status(400).json({
        success: false,
        message: "Category and description are required",
      });
    }

    const issue = await Issue.create({
      user: req.user._id,
      category,
      description,
      image: image || "",
      address: address || "",
      location: {
        latitude: latitude || null,
        longitude: longitude || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Issue created successfully",
      issue,
    });
  } catch (error) {
    console.error("Create Issue Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while creating issue",
    });
  }
};

// Get logged-in user's issues
const getMyIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ user: req.user._id })
      .populate("assignedHelper", "fullName phone category village")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: issues.length,
      issues,
    });
  } catch (error) {
    console.error("Get My Issues Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching user issues",
    });
  }
};

// Get all issues
const getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate("user", "fullName phone village")
      .populate("assignedHelper", "fullName phone category village")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: issues.length,
      issues,
    });
  } catch (error) {
    console.error("Get All Issues Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching all issues",
    });
  }
};

// Update issue status
const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "matched",
      "booked",
      "in-progress",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    issue.status = status;
    await issue.save();

    return res.status(200).json({
      success: true,
      message: "Issue status updated successfully",
      issue,
    });
  } catch (error) {
    console.error("Update Issue Status Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while updating issue status",
    });
  }
};

// Assign helper to issue
const assignHelperToIssue = async (req, res) => {
  try {
    const { issueId, helperId } = req.body;

    if (!issueId || !helperId) {
      return res.status(400).json({
        success: false,
        message: "Issue ID and Helper ID are required",
      });
    }

    const issue = await Issue.findById(issueId);
    const helper = await Helper.findById(helperId);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    if (!helper) {
      return res.status(404).json({
        success: false,
        message: "Helper not found",
      });
    }

    issue.assignedHelper = helper._id;
    issue.status = "matched";

    if (!issue.matchedHelpers.includes(helper._id)) {
      issue.matchedHelpers.push(helper._id);
    }

    await issue.save();

    return res.status(200).json({
      success: true,
      message: "Helper assigned successfully",
      issue,
    });
  } catch (error) {
    console.error("Assign Helper Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while assigning helper",
    });
  }
};

module.exports = {
  createIssue,
  getMyIssues,
  getAllIssues,
  updateIssueStatus,
  assignHelperToIssue,
};