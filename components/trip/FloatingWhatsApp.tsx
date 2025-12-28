"use client";

import { SiWhatsapp } from "react-icons/si";

export default function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.me/972502823333"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      aria-label="צור קשר בוואטסאפ"
    >
      <SiWhatsapp className="w-7 h-7 text-white" />
    </a>
  );
}
