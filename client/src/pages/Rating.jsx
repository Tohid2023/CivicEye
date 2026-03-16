import React, { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { createRating } from "../services/ratingService";
import { getMyBookings } from "../services/bookingService";

const Rating = () => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [review, setReview] = useState("");
  const [bookings, setBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchCompletedBookings = async () => {
    try {
      setLoading(true);
      const data = await getMyBookings();

      const completedBookings = (data.bookings || []).filter(
        (booking) => booking.status === "completed"
      );

      setBookings(completedBookings);

      if (completedBookings.length > 0) {
        setSelectedBookingId(completedBookings[0]._id);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to fetch completed bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedBookings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBookingId) {
      alert("No completed booking available for rating");
      return;
    }

    if (selectedRating === 0) {
      alert("Please select a rating");
      return;
    }

    try {
      setSubmitting(true);

      await createRating({
        bookingId: selectedBookingId,
        stars: selectedRating,
        review,
      });

      alert("Thank you for your feedback!");
      setSelectedRating(0);
      setReview("");

      await fetchCompletedBookings();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <section className="min-h-screen bg-slate-50 px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
                Rate Completed Service
              </h1>
              <p className="mt-2 text-slate-600">
                You can rate only after the helper completes the service
              </p>
            </div>

            {loading ? (
              <div className="mt-8 text-center text-slate-600">
                Loading completed bookings...
              </div>
            ) : bookings.length === 0 ? (
              <div className="mt-8 bg-yellow-50 border border-yellow-100 rounded-2xl p-5 text-center">
                <p className="text-lg font-semibold text-slate-800">
                  No completed bookings found
                </p>
                <p className="mt-2 text-slate-600">
                  Once a helper completes your service, you can rate them here.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Select Completed Booking
                  </label>
                  <select
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 outline-none focus:border-blue-500"
                  >
                    {bookings.map((booking) => (
                      <option key={booking._id} value={booking._id}>
                        {booking.helper?.fullName || "Helper"} —{" "}
                        {booking.issue?.category || "Service"} —{" "}
                        {booking.address}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Give Star Rating
                  </label>
                  <div className="flex items-center gap-3 text-3xl">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedRating(star)}
                        className={`transition ${
                          selectedRating >= star
                            ? "text-yellow-500"
                            : "text-slate-300"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Review
                  </label>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Write your experience..."
                    className="w-full h-32 rounded-2xl border border-slate-300 bg-white px-4 py-4 outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-green-600 text-white py-4 text-lg font-semibold"
                >
                  {submitting ? "Submitting..." : "Submit Rating"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Rating;