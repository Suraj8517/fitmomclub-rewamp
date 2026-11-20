import React from "react";

function BookingButton({ children = "Make Appointment", onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative mt-4 inline-flex items-center overflow-hidden rounded-full border border-teal-400/70 px-6 py-2 text-sm font-bold uppercase tracking-wide text-teal-300 transition-colors duration-500 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black motion-reduce:transition-none ${className}`}
    >
      {/* teal fill wipes in from the left on hover, like a light sweep */}
      <span
        aria-hidden="true"
        className="absolute inset-0 origin-left scale-x-0 bg-teal-400 transition-transform duration-500 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none"
      />
      <span className="relative">{children}</span>
    </button>
  );
}

export default BookingButton;