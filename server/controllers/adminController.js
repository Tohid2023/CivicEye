const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const User = require("../models/User");
const Helper = require("../models/Helper");
const Issue = require("../models/Issue");
const Booking = require("../models/Booking");
const Rating = require("../models/Rating");
const generateToken = require("../utils/generateToken");

// Create default admin manually when needed
const registerAdmin = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required",
      });
    }

    const cleanedEmail = email.trim().toLowerCase();

    const existingAdmin = await Admin.findOne({ email: cleanedEmail });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      fullName: fullName.trim(),
      email: cleanedEmail,
      password: hashedPassword,
    });

    const token = generateToken(admin._id, admin.role);

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      token,
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Register Admin Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while registering admin",
    });
  }
};

// Admin login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const cleanedEmail = email.trim().toLowerCase();

    const admin = await Admin.findOne({ email: cleanedEmail });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(admin._id, admin.role);

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin Login Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while admin login",
    });
  }
};

// Dashboard statistics
const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalHelpers = await Helper.countDocuments();
    const totalIssues = await Issue.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalRatings = await Rating.countDocuments();

    const recentIssues = await Issue.find()
      .populate("user", "fullName phone village")
      .populate("assignedHelper", "fullName category")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentBookings = await Booking.find()
      .populate("user", "fullName phone village")
      .populate("helper", "fullName category")
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalHelpers,
        totalIssues,
        totalBookings,
        totalRatings,
      },
      recentIssues,
      recentBookings,
    });
  } catch (error) {
    console.error("Get Admin Dashboard Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard",
    });
  }
};

// Get all users
const getAllUsersForAdmin = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching users",
    });
  }
};

// Get all helpers
const getAllHelpersForAdmin = async (req, res) => {
  try {
    const helpers = await Helper.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: helpers.length,
      helpers,
    });
  } catch (error) {
    console.error("Get All Helpers Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching helpers",
    });
  }
};

// Get all issues
const getAllIssuesForAdmin = async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate("user", "fullName phone village")
      .populate("assignedHelper", "fullName category")
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
      message: "Server error while fetching issues",
    });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getAdminDashboard,
  getAllUsersForAdmin,
  getAllHelpersForAdmin,
  getAllIssuesForAdmin,
};