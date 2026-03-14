const Rating = require("../models/Rating");
const Booking = require("../models/Booking");
const Helper = require("../models/Helper");

// helper function to recalculate average rating
const updateHelperRatingStats = async (helperId) => {
  const ratings = await Rating.find({ helper: helperId });

  const totalReviews = ratings.length;

  const averageRating =
    totalReviews === 0
      ? 0
      : ratings.reduce((sum, item) => sum + item.stars, 0) / totalReviews;

  await Helper.findByIdAndUpdate(helperId, {
    averageRating: Number(averageRating.toFixed(1)),
    totalReviews,
  });
};

// Submit rating
const createRating = async (req, res) => {
  try {
    const { bookingId, stars, review } = req.body;

    if (!bookingId || !stars) {
      return res.status(400).json({
        success: false,
        message: "bookingId and stars are required",
      });
    }

    if (stars < 1 || stars > 5) {
      return res.status(400).json({
        success: false,
        message: "Stars must be between 1 and 5",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // only booking owner can rate
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only rate your own booking",
      });
    }

    // booking must be completed
    if (booking.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "You can rate only after service is completed",
      });
    }

    // prevent duplicate rating
    const existingRating = await Rating.findOne({
      booking: bookingId,
      user: req.user._id,
    });

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: "You have already rated this booking",
      });
    }

    const rating = await Rating.create({
      user: req.user._id,
      helper: booking.helper,
      booking: bookingId,
      stars,
      review: review || "",
    });

    await updateHelperRatingStats(booking.helper);

    return res.status(201).json({
      success: true,
      message: "Rating submitted successfully",
      rating,
    });
  } catch (error) {
    console.error("Create Rating Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while submitting rating",
    });
  }
};

// Get ratings for a helper
const getHelperRatings = async (req, res) => {
  try {
    const { helperId } = req.params;

    const ratings = await Rating.find({ helper: helperId })
      .populate("user", "fullName village")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: ratings.length,
      ratings,
    });
  } catch (error) {
    console.error("Get Helper Ratings Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching helper ratings",
    });
  }
};

// Get my submitted ratings
const getMyRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ user: req.user._id })
      .populate("helper", "fullName category village averageRating")
      .populate("booking", "status preferredDate preferredTime")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: ratings.length,
      ratings,
    });
  } catch (error) {
    console.error("Get My Ratings Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching your ratings",
    });
  }
};

module.exports = {
  createRating,
  getHelperRatings,
  getMyRatings,
};