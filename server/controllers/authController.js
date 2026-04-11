const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Helper = require("../models/Helper");
const generateToken = require("../utils/generateToken");
const { sendOtpEmail } = require("../utils/mailService");

const otpStore = new Map();
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const getOtpKey = ({ role, phone, email }) => {
  const target = (phone || email || "").trim();
  return `${role}:${target}`;
};

const storeOtp = (key, otp) => {
  const expiresAt = Date.now() + OTP_TTL_MS;
  otpStore.set(key, { otp, expiresAt, verified: false });
  setTimeout(() => {
    const entry = otpStore.get(key);
    if (entry && entry.expiresAt <= Date.now()) {
      otpStore.delete(key);
    }
  }, OTP_TTL_MS + 1000);
};

const verifyOtpEntry = (key, providedOtp) => {
  const entry = otpStore.get(key);
  if (!entry) return false;
  if (entry.expiresAt < Date.now()) {
    otpStore.delete(key);
    return false;
  }
  if (entry.otp !== providedOtp) return false;
  return true;
};

const consumeOtpEntry = (key) => {
  otpStore.delete(key);
};

const sendOtp = async (req, res) => {
  try {
    const { role, phone, email } = req.body;

    if (!role || !["user", "helper"].includes(role)) {
      return res.status(400).json({ success: false, message: "Role must be user or helper" });
    }

    if (!phone && !email) {
      return res.status(400).json({ success: false, message: "Phone or email is required" });
    }

    const target = phone ? phone.trim() : email.trim().toLowerCase();
    if (!target) {
      return res.status(400).json({ success: false, message: "Phone/email cannot be empty" });
    }

    const existing =
      role === "user"
        ? await User.findOne({
            $or: [
              { phone: phone ? phone.trim() : null },
              { email: email ? email.trim().toLowerCase() : null },
            ],
          })
        : await Helper.findOne({
            $or: [
              { phone: phone ? phone.trim() : null },
              { email: email ? email.trim().toLowerCase() : null },
            ],
          });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Account already exists with this phone/email",
      });
    }

    const otp = generateOtp();
    const key = getOtpKey({ role, phone, email });
    storeOtp(key, otp);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required to send OTP via email",
      });
    }

    try {
      await sendOtpEmail({ to: email.trim().toLowerCase(), otp, role });
    } catch (mailError) {
      console.error("OTP email send failed:", mailError.message);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Check SMTP config.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP email sent successfully",
      otpSentTo: target,
    });
  } catch (error) {
    console.error("Send OTP Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while sending OTP",
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { role, phone, email, otp } = req.body;

    if (!role || !["user", "helper"].includes(role)) {
      return res.status(400).json({ success: false, message: "Role must be user or helper" });
    }

    if (!otp || !/^[0-9]{6}$/.test(otp)) {
      return res.status(400).json({ success: false, message: "Valid 6-digit OTP is required" });
    }

    const key = getOtpKey({ role, phone, email });

    const entry = otpStore.get(key);
    if (!entry || !verifyOtpEntry(key, otp)) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    entry.verified = true;
    otpStore.set(key, entry);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while verifying OTP",
    });
  }
};

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
      otp,
    } = req.body;

    if (!fullName || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, phone, and password are required",
      });
    }

    if (!otp || !/^[0-9]{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "Valid 6-digit OTP is required",
      });
    }

    const otpKey = getOtpKey({ role: "user", phone, email });
    const otpEntry = otpStore.get(otpKey);

    if (
      !otpEntry ||
      !otpEntry.verified ||
      otpEntry.otp !== otp ||
      otpEntry.expiresAt < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    consumeOtpEntry(otpKey);

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
        address: user.address,
        village: user.village,
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
      otp,
    } = req.body;

    if (!fullName || !phone || !password || !category || !village) {
      return res.status(400).json({
        success: false,
        message:
          "Full name, phone, password, category, and village are required",
      });
    }

    if (!otp || !/^[0-9]{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "Valid 6-digit OTP is required",
      });
    }

    const otpKey = getOtpKey({ role: "helper", phone, email });
    const otpEntry = otpStore.get(otpKey);

    if (
      !otpEntry ||
      !otpEntry.verified ||
      otpEntry.otp !== otp ||
      otpEntry.expiresAt < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    consumeOtpEntry(otpKey);

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
        village: helper.village,
        address: helper.address,
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
      account = loginValue.includes("@")
        ? await User.findOne({ email: normalizedEmail })
        : await User.findOne({ phone: loginValue });
    } else if (role === "helper") {
      account = loginValue.includes("@")
        ? await Helper.findOne({ email: normalizedEmail })
        : await Helper.findOne({ phone: loginValue });
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
        village: account.village || "",
        address: account.address || "",
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
  sendOtp,
  verifyOtp,
  registerUser,
  registerHelper,
  loginAccount,
};