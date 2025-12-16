"use client";

import { Phone, Mail, MapPin } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

export default function ContactSection() {
  return (
    <section id="contact" className="bg-sage-900">
      {/* Contact Info */}
      <div className="py-8 sm:py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5">
              בואו נדבר
            </h2>
            <p className="text-xs text-sage-300 max-w-xl mx-auto">
              יש שאלות? רוצים לשמוע עוד? אשמח לדבר איתכם
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 max-w-4xl mx-auto">
            {/* WhatsApp - Primary */}
            <a
              href="https://wa.me/972501234567"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 rounded-lg p-3 text-white transition-all duration-300 hover:scale-105 text-center"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-1.5">
                <SiWhatsapp className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold mb-0.5">וואטסאפ</h3>
              <p className="text-white/80 text-xs">הדרך המהירה</p>
            </a>

            {/* Phone */}
            <a
              href="tel:0501234567"
              className="bg-sage-800 hover:bg-sage-700 rounded-lg p-3 text-white transition-all duration-300 hover:scale-105 text-center"
            >
              <div className="w-8 h-8 rounded-full bg-nature-500/20 flex items-center justify-center mx-auto mb-1.5">
                <Phone className="w-4 h-4 text-nature-400" />
              </div>
              <h3 className="text-xs font-bold mb-0.5">טלפון</h3>
              <p className="text-sage-300 text-xs">050-123-4567</p>
            </a>

            {/* Email */}
            <a
              href="mailto:info@london-trip.co.il"
              className="bg-sage-800 hover:bg-sage-700 rounded-lg p-3 text-white transition-all duration-300 hover:scale-105 text-center"
            >
              <div className="w-8 h-8 rounded-full bg-heritage-500/20 flex items-center justify-center mx-auto mb-1.5">
                <Mail className="w-4 h-4 text-heritage-400" />
              </div>
              <h3 className="text-xs font-bold mb-0.5">דוא"ל</h3>
              <p className="text-sage-300 text-xs hidden sm:block">info@london-trip.co.il</p>
              <p className="text-sage-300 text-xs sm:hidden">שלחו מייל</p>
            </a>

            {/* Meeting Point */}
            <div className="bg-sage-800 rounded-lg p-3 text-white text-center">
              <div className="w-8 h-8 rounded-full bg-earth-500/20 flex items-center justify-center mx-auto mb-1.5">
                <MapPin className="w-4 h-4 text-earth-400" />
              </div>
              <h3 className="text-xs font-bold mb-0.5">נקודת מפגש</h3>
              <p className="text-sage-300 text-xs">מרכז לונדון</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-sage-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            {/* Logo */}
            <div className="text-center md:text-right">
              <div className="text-base font-bold text-white mb-0.5">
                לונדון שלא הכרתם
              </div>
              <p className="text-sage-400 text-xs">
                טיול טבע ומורשת ייחודי באנגליה
              </p>
            </div>

            {/* Links */}
            <div className="flex gap-3 text-xs text-sage-400">
              <a href="#" className="hover:text-white transition-colors">
                תנאי שימוש
              </a>
              <span className="text-sage-700">•</span>
              <a href="#" className="hover:text-white transition-colors">
                מדיניות פרטיות
              </a>
              <span className="text-sage-700">•</span>
              <a href="#" className="hover:text-white transition-colors">
                נגישות
              </a>
            </div>

            {/* WhatsApp Button */}
            <a
              href="https://wa.me/972501234567"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300"
            >
              <SiWhatsapp className="w-3.5 h-3.5" />
              <span>דברו איתי</span>
            </a>
          </div>

          <div className="mt-3 pt-3 border-t border-sage-800 text-center">
            <p className="text-sage-500 text-xs">
              © {new Date().getFullYear()} לונדון שלא הכרתם | כל הזכויות שמורות
            </p>
            <p className="text-sage-600 text-xs mt-0.5 max-w-2xl mx-auto">
              האתר והתכנים בו הינם לצרכי מידע בלבד. התמונות באתר הן מטיולים אמיתיים.
            </p>
          </div>
        </div>
      </footer>
    </section>
  );
}
