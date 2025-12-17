"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Calendar, MapPin, Bed, Coffee, Users, Play } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

export default function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Attempt autoplay with all necessary workarounds
  const attemptAutoplay = useCallback(async () => {
    const video = videoRef.current;
    if (!video || prefersReducedMotion || videoFailed) return;

    // Force muted properties (required for autoplay)
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      setTimeout(async () => {
        try {
          await video.play();
          setIsPlaying(true);
          setAutoplayBlocked(false);
        } catch (err) {
          console.warn("HERO VIDEO: Autoplay blocked", err);
          setAutoplayBlocked(true);
        }
      }, 0);
    });
  }, [prefersReducedMotion, videoFailed]);

  // Manual play handler for blocked autoplay
  const handleManualPlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.setAttribute("muted", "");

    try {
      await video.play();
      setIsPlaying(true);
      setAutoplayBlocked(false);
    } catch (err) {
      console.error("HERO VIDEO: Manual play failed", err);
    }
  }, []);

  useEffect(() => {
    setIsLoaded(true);

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Attempt autoplay on mount
  useEffect(() => {
    if (!prefersReducedMotion && !videoFailed) {
      attemptAutoplay();
    }
  }, [attemptAutoplay, prefersReducedMotion, videoFailed]);

  const highlights = [
    { icon: Calendar, text: "יומיים" },
    { icon: MapPin, text: "איסוף מלונדון" },
    { icon: Bed, text: "לינה כלולה" },
    { icon: Coffee, text: "ארוחת בוקר" },
    { icon: Users, text: "מקומות מוגבלים" },
  ];

  const showVideo = !prefersReducedMotion && !videoFailed;
  const showPlayButton = showVideo && autoplayBlocked && !isPlaying;
  const showPoster = !showVideo || !isPlaying;

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Video Background */}
      {showVideo && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/hero-poster.jpg"
          onError={(e) => {
            console.error("HERO VIDEO ERROR", e);
            setVideoFailed(true);
          }}
          onPlaying={() => {
            setIsPlaying(true);
            setAutoplayBlocked(false);
          }}
          onPause={() => {
            // Only mark as not playing if it wasn't intentional
            if (videoRef.current && videoRef.current.ended) {
              setIsPlaying(false);
            }
          }}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0 }}
        >
          <source src="/videos/hero-video.mp4" type="video/mp4" />
        </video>
      )}

      {/* Fallback Background Image */}
      {showPoster && (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/hero-poster.jpg')",
            zIndex: 0
          }}
        />
      )}

      {/* Overlay - semi-transparent */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-nature-950/60 via-nature-900/50 to-nature-950/70"
        style={{ zIndex: 10 }}
      />

      {/* Play Button (shows when autoplay blocked) */}
      {showPlayButton && (
        <button
          onClick={handleManualPlay}
          className="absolute bottom-24 right-6 sm:bottom-8 sm:right-8 flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-full border border-white/30 transition-all duration-300 hover:scale-105"
          style={{ zIndex: 25 }}
          aria-label="Play video"
        >
          <Play className="w-5 h-5 fill-white" />
          <span className="text-sm font-medium">Play</span>
        </button>
      )}

      {/* Content */}
      <div
        className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16 sm:pt-20"
        style={{ zIndex: 20 }}
      >
        <div
          className={`transition-all duration-1000 ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20 mb-4 sm:mb-5">
            <span className="w-2 h-2 bg-heritage-400 rounded-full animate-pulse" />
            <span className="text-white/90 text-xs sm:text-sm font-medium">
              חוויה ייחודית שלא תמצאו במקום אחר
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
            <span className="block">לונדון?</span>
            <span className="block text-heritage-300">לא זו שאתם מכירים.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-white/85 mb-4 sm:mb-5 max-w-2xl mx-auto leading-relaxed">
            טיול בן יומיים לצד הנסתר של לונדון —
            <span className="text-nature-300 font-medium"> טבע עוצר נשימה, כפרים היסטוריים, נופים ירוקים </span>
            ויום שופינג באאוטלטים במחירים שלא תמצאו בעיר
          </p>

          {/* Highlights */}
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-5">
            {highlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className={`flex items-center gap-1 bg-white/10 backdrop-blur-sm px-2.5 py-1.5 rounded-full border border-white/20 transition-all duration-500 ${
                    isLoaded
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-5"
                  }`}
                  style={{ transitionDelay: `${(index + 1) * 100}ms` }}
                >
                  <Icon className="w-3.5 h-3.5 text-heritage-400" />
                  <span className="text-white text-xs font-medium">{item.text}</span>
                </div>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row gap-2.5 justify-center items-center transition-all duration-1000 delay-500 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <a
              href="#booking"
              className="w-full sm:w-auto bg-heritage-500 hover:bg-heritage-600 text-white font-bold px-6 py-2.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-heritage-500/30 text-center text-sm sm:text-base"
            >
              הבטחת מקום לטיול
            </a>
            <a
              href="https://wa.me/972501234567"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-bold px-6 py-2.5 rounded-full border-2 border-white/30 transition-all duration-300 text-sm sm:text-base"
            >
              <SiWhatsapp className="w-4 h-4" />
              <span>שאלות? דברו איתי</span>
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div
          className={`absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-700 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-white/60 text-xs">גלו עוד</span>
            <div className="w-5 h-8 border-2 border-white/40 rounded-full flex justify-center pt-1.5">
              <div className="w-1 h-2 bg-white/60 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
