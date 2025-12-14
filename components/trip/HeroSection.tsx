"use client";

import { useEffect, useState } from "react";
import { Calendar, MapPin, Bed, Coffee, Users } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

export default function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const highlights = [
    { icon: Calendar, text: "יומיים" },
    { icon: MapPin, text: "איסוף מלונדון" },
    { icon: Bed, text: "לינה כלולה" },
    { icon: Coffee, text: "ארוחת בוקר" },
    { icon: Users, text: "מקומות מוגבלים" },
  ];

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/hero-video.mov" type="video/quicktime" />
        <source src="/videos/hero-video.mov" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-nature-950/60 via-nature-900/50 to-nature-950/70" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        <div
          className={`transition-all duration-1000 ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2 rounded-full border border-white/20 mb-8">
            <span className="w-2 h-2 bg-heritage-400 rounded-full animate-pulse" />
            <span className="text-white/90 text-sm font-medium">
              חוויה ייחודית שלא תמצאו במקום אחר
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            <span className="block">לונדון?</span>
            <span className="block text-heritage-300">לא זו שאתם מכירים.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-white/85 mb-6 max-w-3xl mx-auto leading-relaxed">
            טיול בן יומיים לצד הנסתר של לונדון —
            <span className="text-nature-300 font-medium"> טבע עוצר נשימה, כפרים היסטוריים, נופים ירוקים </span>
            ויום שופינג באאוטלטים במחירים שלא תמצאו בעיר
          </p>

          {/* Highlights */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
            {highlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className={`flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full border border-white/20 transition-all duration-500 ${
                    isLoaded
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-5"
                  }`}
                  style={{ transitionDelay: `${(index + 1) * 100}ms` }}
                >
                  <Icon className="w-4 h-4 text-heritage-400" />
                  <span className="text-white text-xs sm:text-sm font-medium">{item.text}</span>
                </div>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row gap-3 justify-center items-center transition-all duration-1000 delay-500 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <a
              href="#booking"
              className="w-full sm:w-auto bg-heritage-500 hover:bg-heritage-600 text-white font-bold px-8 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-heritage-500/30 text-center"
            >
              הבטחת מקום לטיול
            </a>
            <a
              href="https://wa.me/972501234567"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-bold px-8 py-3 rounded-full border-2 border-white/30 transition-all duration-300"
            >
              <SiWhatsapp className="w-5 h-5" />
              <span>שאלות? דברו איתי</span>
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-700 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-white/60 text-sm">גלו עוד</span>
            <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
              <div className="w-1.5 h-3 bg-white/60 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
