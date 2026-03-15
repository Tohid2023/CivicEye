const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Helper = require("../models/Helper");
const Admin = require("../models/Admin");

const protect = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === "user") {
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      req.user = user;
    } else if (decoded.role === "helper") {
      const helper = await Helper.findById(decoded.id).select("-password");

      if (!helper) {
        return res.status(401).json({
          success: false,
          message: "Helper not found",
        });
      }

      req.user = helper;
    } else if (decoded.role === "admin") {
      const admin = await Admin.findById(decoded.id).select("-password");

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: "Admin not found",
        });
      }

      req.user = admin;
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid token role",
      });
    }

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Not authorized, invalid token",
    });
  }
};

const isUser = (req, res, next) => {
  if (req.user && req.user.role === "user") {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Access denied: user only",
  });
};

const isHelper = (req, res, next) => {
  if (req.user && req.user.role === "helper") {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Access denied: helper only",
  });
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Access denied: admin only",
  });
};

module.exports = {
  protect,
  isUser,
  isHelper,
  isAdmin,
};