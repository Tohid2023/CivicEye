const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Helper = require("../models/Helper");
const generateToken = require("../utils/generateToken");

// Register User
const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      email,
      password,
      address,
      village,
      latitude,
      longitude,
    } = req.body;

    if (!fullName || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, phone, and password are required",
      });
    }

    const cleanedPhone = phone.trim();
    const cleanedEmail = email ? email.trim().toLowerCase() : "";

    const existingUser = await User.findOne({
      $or: [{ phone: cleanedPhone }, { email: cleanedEmail }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this phone or email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName: fullName.trim(),
      phone: cleanedPhone,
      email: cleanedEmail,
      password: hashedPassword,
      address: address ? address.trim() : "",
      village: village ? village.trim() : "",
      location: {
        latitude: latitude || null,
        longitude: longitude || null,
      },
    });

    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        role: user.role,
        location: user.location,
      },
    });
  } catch (error) {
    console.error("Register User Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while registering user",
    });
  }
};

// Register Helper
const registerHelper = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      email,
      password,
      category,
      village,
      address,
      expertise,
      serviceCharge,
      latitude,
      longitude,
    } = req.body;

    if (!fullName || !phone || !password || !category || !village) {
      return res.status(400).json({
        success: false,
        message:
          "Full name, phone, password, category, and village are required",
      });
    }

    const cleanedPhone = phone.trim();
    const cleanedEmail = email ? email.trim().toLowerCase() : "";

    const existingHelper = await Helper.findOne({
      $or: [{ phone: cleanedPhone }, { email: cleanedEmail }],
    });

    if (existingHelper) {
      return res.status(400).json({
        success: false,
        message: "Helper already exists with this phone or email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const helper = await Helper.create({
      fullName: fullName.trim(),
      phone: cleanedPhone,
      email: cleanedEmail,
      password: hashedPassword,
      category,
      village: village.trim(),
      address: address ? address.trim() : "",
      expertise: expertise ? expertise.trim() : "",
      serviceCharge: serviceCharge || 0,
      location: {
        latitude: latitude || null,
        longitude: longitude || null,
      },
    });

    const token = generateToken(helper._id, helper.role);

    return res.status(201).json({
      success: true,
      message: "Helper registered successfully",
      token,
      helper: {
        id: helper._id,
        fullName: helper.fullName,
        phone: helper.phone,
        email: helper.email,
        category: helper.category,
        role: helper.role,
        location: helper.location,
        serviceCharge: helper.serviceCharge,
        averageRating: helper.averageRating,
        availability: helper.availability,
      },
    });
  } catch (error) {
    console.error("Register Helper Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while registering helper",
    });
  }
};

// Login User or Helper
const loginAccount = async (req, res) => {
  try {
    const { emailOrPhone, password, role } = req.body;

    if (!emailOrPhone || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Email/phone, password, and role are required",
      });
    }

    const loginValue = emailOrPhone.trim();
    const normalizedEmail = loginValue.toLowerCase();

    let account = null;

    if (role === "user") {
      if (loginValue.includes("@")) {
        account = await User.findOne({ email: normalizedEmail });
      } else {
        account = await User.findOne({ phone: loginValue });
      }
    } else if (role === "helper") {
      if (loginValue.includes("@")) {
        account = await Helper.findOne({ email: normalizedEmail });
      } else {
        account = await Helper.findOne({ phone: loginValue });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    const isMatch = await bcrypt.compare(password, account.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(account._id, account.role);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      account: {
        id: account._id,
        fullName: account.fullName,
        phone: account.phone,
        email: account.email,
        role: account.role,
        category: account.category || null,
        location: account.location || null,
        serviceCharge: account.serviceCharge || 0,
        averageRating: account.averageRating || 0,
        availability: account.availability || null,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while login",
    });
  }
};

module.exports = {
  registerUser,
  registerHelper,
  loginAccount,
};
