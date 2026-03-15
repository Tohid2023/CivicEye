const Helper = require("../models/Helper");
const calculateDistanceInKm = require("../utils/distanceCalculator");

// Get all helpers with optional matching by location and radius
const getAllHelpers = async (req, res) => {
  try {
    const { category, availability, village, latitude, longitude, radius } =
      req.query;

    let filter = {};

    if (category) {
      filter.category = category;
    }

    if (availability) {
      filter.availability = availability;
    }

    if (village) {
      filter.village = { $regex: village, $options: "i" };
    }

    const helpers = await Helper.find(filter).select("-password");

    let result = helpers.map((helper) => {
      let distance = null;

      const helperLat = helper.location?.latitude;
      const helperLng = helper.location?.longitude;

      if (
        latitude &&
        longitude &&
        helperLat !== null &&
        helperLng !== null &&
        helperLat !== undefined &&
        helperLng !== undefined
      ) {
        distance = calculateDistanceInKm(
          Number(latitude),
          Number(longitude),
          Number(helperLat),
          Number(helperLng)
        );
      }

      return {
        ...helper.toObject(),
        distance: distance !== null ? Number(distance.toFixed(2)) : null,
      };
    });

    if (radius) {
      result = result.filter(
        (helper) => helper.distance !== null && helper.distance <= Number(radius)
      );
    }

    result.sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

    return res.status(200).json({
      success: true,
      count: result.length,
      helpers: result,
    });
  } catch (error) {
    console.error("Get All Helpers Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching helpers",
    });
  }
};

// Get helper by ID
const getHelperById = async (req, res) => {
  try {
    const { id } = req.params;

    const helper = await Helper.findById(id).select("-password");

    if (!helper) {
      return res.status(404).json({
        success: false,
        message: "Helper not found",
      });
    }

    return res.status(200).json({
      success: true,
      helper,
    });
  } catch (error) {
    console.error("Get Helper By ID Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching helper",
    });
  }
};

// Update helper availability
const updateHelperAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    const allowedAvailability = ["available", "busy", "offline"];

    if (!allowedAvailability.includes(availability)) {
      return res.status(400).json({
        success: false,
        message: "Invalid availability value",
      });
    }

    const helper = await Helper.findById(req.user._id);

    if (!helper) {
      return res.status(404).json({
        success: false,
        message: "Helper not found",
      });
    }

    helper.availability = availability;
    await helper.save();

    return res.status(200).json({
      success: true,
      message: "Helper availability updated successfully",
      helper,
    });
  } catch (error) {
    console.error("Update Helper Availability Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while updating helper availability",
    });
  }
};

// Update helper profile
const updateHelperProfile = async (req, res) => {
  try {
    const {
      fullName,
      email,
      village,
      address,
      expertise,
      serviceCharge,
      availability,
      latitude,
      longitude,
    } = req.body;

    const helper = await Helper.findById(req.user._id);

    if (!helper) {
      return res.status(404).json({
        success: false,
        message: "Helper not found",
      });
    }

    if (fullName !== undefined) helper.fullName = fullName;
    if (email !== undefined) helper.email = email;
    if (village !== undefined) helper.village = village;
    if (address !== undefined) helper.address = address;
    if (expertise !== undefined) helper.expertise = expertise;
    if (serviceCharge !== undefined) helper.serviceCharge = serviceCharge;
    if (availability !== undefined) helper.availability = availability;

    if (latitude !== undefined) helper.location.latitude = latitude;
    if (longitude !== undefined) helper.location.longitude = longitude;

    await helper.save();

    return res.status(200).json({
      success: true,
      message: "Helper profile updated successfully",
      helper,
    });
  } catch (error) {
    console.error("Update Helper Profile Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while updating helper profile",
    });
  }
};

// Get current logged-in helper profile
const getMyHelperProfile = async (req, res) => {
  try {
    const helper = await Helper.findById(req.user._id).select("-password");

    if (!helper) {
      return res.status(404).json({
        success: false,
        message: "Helper profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      helper,
    });
  } catch (error) {
    console.error("Get My Helper Profile Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching helper profile",
    });
  }
};

module.exports = {
  getAllHelpers,
  getHelperById,
  updateHelperAvailability,
  updateHelperProfile,
  getMyHelperProfile,
};