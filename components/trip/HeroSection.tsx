"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Calendar, MapPin, Bed, Coffee, Users, Play } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

interface HeroSectionProps {
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string | null;
}

export default function HeroSection({
  heroTitle = "לונדון?\nלא זו שאתם מכירים.",
  heroSubtitle = "טיול בן יומיים לצד הנסתר של לונדון — טבע עוצר נשימה, כפרים היסטוריים, נופים ירוקים ויום שופינג באאוטלטים במחירים שלא תמצאו בעיר",
  heroImage = "/images/hero-poster.jpg",
}: HeroSectionProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Parse hero title for styling
  const titleLines = heroTitle.split('\n').filter(Boolean);

  // Attempt autoplay with all necessary workarounds
  const attemptAutoplay = useCallback(async () => {
    const video = videoRef.current;
    if (!video || prefersReducedMotion || videoFailed) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");

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
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

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
  const posterImage = heroImage || "/images/hero-poster.jpg";

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {showVideo && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={posterImage}
          onError={() => setVideoFailed(true)}
          onPlaying={() => {
            setIsPlaying(true);
            setAutoplayBlocked(false);
          }}
          onPause={() => {
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

      {showPoster && (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('${posterImage}')`,
            zIndex: 0
          }}
        />
      )}

      <div
        className="absolute inset-0 bg-gradient-to-b from-nature-950/60 via-nature-900/50 to-nature-950/70"
        style={{ zIndex: 10 }}
      />

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

      <div
        className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16 sm:pt-20"
        style={{ zIndex: 20 }}
      >
        <div
          className={`transition-all duration-1000 ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20 mb-4 sm:mb-5">
            <span className="w-2 h-2 bg-heritage-400 rounded-full animate-pulse" />
            <span className="text-white/90 text-xs sm:text-sm font-medium">
              חוויה ייחודית שלא תמצאו במקום אחר
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
            {titleLines.length > 1 ? (
              <>
                <span className="block">{titleLines[0]}</span>
                <span className="block text-heritage-300">{titleLines.slice(1).join(' ')}</span>
              </>
            ) : (
              <span>{heroTitle}</span>
            )}
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-white/85 mb-4 sm:mb-5 max-w-2xl mx-auto leading-relaxed">
            {heroSubtitle}
          </p>

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
