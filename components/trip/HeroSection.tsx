"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Calendar, MapPin, Bed, ShoppingBag, Users, Play, Bus } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

interface HeroSectionProps {
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string | null;
}

export default function HeroSection({
  heroTitle = "החוויה הזאת תיכנס לליבכם ותישאר שם",
  heroSubtitle = "",
  heroImage = "/images/hero-poster.jpg",
}: HeroSectionProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Attempt autoplay with all necessary workarounds for iOS
  const attemptAutoplay = useCallback(async () => {
    const video = videoRef.current;
    if (!video || prefersReducedMotion || videoFailed) return;

    // iOS requires these to be set before play attempt
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("muted", "true");
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");
    video.volume = 0;

    // Small delay for iOS to recognize the attributes
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Load the video first
      video.load();

      // Wait for video to be ready
      await new Promise<void>((resolve, reject) => {
        const onCanPlay = () => {
          video.removeEventListener('canplay', onCanPlay);
          video.removeEventListener('error', onError);
          resolve();
        };
        const onError = () => {
          video.removeEventListener('canplay', onCanPlay);
          video.removeEventListener('error', onError);
          reject(new Error('Video load error'));
        };

        if (video.readyState >= 3) {
          resolve();
        } else {
          video.addEventListener('canplay', onCanPlay);
          video.addEventListener('error', onError);
        }
      });

      await video.play();
      setIsPlaying(true);
      setAutoplayBlocked(false);
    } catch (err) {
      console.warn("HERO VIDEO: Autoplay blocked", err);
      setAutoplayBlocked(true);
    }
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
    { icon: Calendar, text: "יומיים חווייתיים" },
    { icon: MapPin, text: "איסוף מלונדון וחזרה ללונדון" },
    { icon: Bus, text: "מיניבוס ונהג צמוד" },
    { icon: Bed, text: "לינה באזור הכפרים" },
    { icon: ShoppingBag, text: "יום שופינג באאוטלט מותגים" },
    { icon: Users, text: "מס' המקומות מוגבל" },
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
          // @ts-ignore - webkit-playsinline is needed for older iOS
          webkit-playsinline="true"
          preload="auto"
          poster={posterImage}
          onError={() => setVideoFailed(true)}
          onCanPlayThrough={() => {
            // Try to play when video is ready
            if (videoRef.current && !isPlaying) {
              videoRef.current.play().catch(() => {});
            }
          }}
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
  
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            {heroTitle}
          </h1>

          <div className="text-sm sm:text-base lg:text-lg text-white/90 mb-4 max-w-3xl mx-auto leading-relaxed space-y-3">
            <p>
              מתכננים חופשה של 3-4 לילות בלונדון?
            </p>
            <p>
              למה שלא תחליפו לילה אחד יקר במלון בלונדון, בטיול בן יומיים עם לינה של לילה במלון כפרי? טיול שמתאים בדיוק לנו הישראלים!
            </p>
            <p>
              רק שעתיים נסיעה מלונדון, לנשום את הטבע עוצר הנשימה, לבקר בכפרים ציוריים שהזמן פסק מלכת, לטייל בין בתי אבן עתיקים ונופים ירוקים ללון במלון מפנק בכפרים
            </p>
            <p className="font-medium text-heritage-300">
              ולמחרת יום קניות מרוכז באאוטלט עם כל המותגים במחירים שאין בלונדון. השילוב המנצח, חוויה וחיסכון.
            </p>
          </div>

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
              שריינו מקום לטיול
            </a>
            <a
              href="https://wa.me/972502823333"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-bold px-6 py-2.5 rounded-full border-2 border-white/30 transition-all duration-300 text-sm sm:text-base"
            >
              <SiWhatsapp className="w-4 h-4" />
              <span>שאלות? דברו איתי</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
