"use client";

import { Calendar } from "lucide-react";

export default function FloatingReserveButton() {
  const scrollToBooking = () => {
    const bookingSection = document.getElementById("booking-form-section");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <button
      onClick={scrollToBooking}
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
      aria-label="שריין מקום"
    >
      <Calendar className="w-5 h-5 group-hover:animate-pulse" />
      <span className="text-sm sm:text-base">שריין מקום</span>
    </button>
  );
}
