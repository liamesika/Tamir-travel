"use client";

import { useState, useEffect } from "react";
import { X, Info } from "lucide-react";

const BANNER_DISMISSED_KEY = "seasonal-banner-dismissed";
const DISMISS_DURATION_DAYS = 30;

export default function SeasonalBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissedAt = localStorage.getItem(BANNER_DISMISSED_KEY);
    if (dismissedAt) {
      const dismissedDate = new Date(parseInt(dismissedAt, 10));
      const now = new Date();
      const daysSinceDismissed = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceDismissed < DISMISS_DURATION_DAYS) {
        return; // Still within dismiss period
      }
    }
    setIsVisible(true);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(BANNER_DISMISSED_KEY, Date.now().toString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-xl p-4 sm:p-5 mb-6 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-3 left-3 text-sky-500 hover:text-sky-700 transition-colors p-1 rounded-full hover:bg-sky-100"
        aria-label="סגור"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-3 pr-1">
        <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
          <Info className="w-5 h-5 text-sky-600" />
        </div>
        <div className="flex-1 pl-6">
          <p className="text-lg sm:text-xl font-semibold text-sky-900 leading-relaxed">
            שימו לב: בחורף המחירים לרוב זולים יותר מהקיץ עקב תנאי מזג אוויר וזמינות.
          </p>
        </div>
      </div>
    </div>
  );
}
