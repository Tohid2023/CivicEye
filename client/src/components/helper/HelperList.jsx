import React from "react";
import HelperCard from "./HelperCard";

const HelperList = ({
  helpers,
  bookings,
  selectedIssue,
  activeBookingForIssue,
  allowBooking,
}) => {
  if (!helpers || helpers.length === 0) {
    return (
      <div className="py-10 text-center text-slate-500">
        No helpers found nearby
      </div>
    );
  }

  if (helpers.length === 1) {
    const helper = helpers[0];
    const bookingForHelper = bookings.find(
      (booking) => booking.helper?._id === helper._id
    );

    return (
      <div className="mt-6 flex justify-center">
        <HelperCard
          helper={helper}
          bookingStatus={bookingForHelper?.status || null}
          issueLocked={!!activeBookingForIssue}
          lockedHelperId={activeBookingForIssue?.helper?._id}
          allowBooking={allowBooking}
          selectedIssue={selectedIssue}
        />
      </div>
    );
  }

  return (
    <div className="mt-6 flex justify-center">
      <div className="grid w-full max-w-6xl grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 justify-items-center">
        {helpers.map((helper) => {
          const bookingForHelper = bookings.find(
            (booking) => booking.helper?._id === helper._id
          );

          return (
            <HelperCard
              key={helper._id}
              helper={helper}
              bookingStatus={bookingForHelper?.status || null}
              issueLocked={!!activeBookingForIssue}
              lockedHelperId={activeBookingForIssue?.helper?._id}
              allowBooking={allowBooking}
              selectedIssue={selectedIssue}
            />
          );
        })}
      </div>
    </div>
  );
};

export default HelperList;