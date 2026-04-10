import React from "react";
import HelperCard from "./HelperCard";

const HelperList = ({
  helpers,
  bookings = [],
  selectedIssue = null,
  activeBookingForIssue = null,
  allowBooking = false,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {helpers.map((helper) => {
        const relatedBooking = bookings.find(
          (booking) =>
            (booking.helper?._id === helper._id ||
              booking.helper === helper._id) &&
            (!selectedIssue || booking.issue?._id === selectedIssue._id)
        );

        return (
          <HelperCard
            key={helper._id}
            helper={helper}
            bookingStatus={relatedBooking?.status || null}
            issueLocked={!!activeBookingForIssue}
            lockedHelperId={
              activeBookingForIssue?.helper?._id ||
              activeBookingForIssue?.helper ||
              null
            }
            allowBooking={allowBooking}
          />
        );
      })}
    </div>
  );
};

export default HelperList;