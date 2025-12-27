"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Calendar, MapPin, Bed, ShoppingBag, Users, Play, Bus } from "lucide-react";

interface HeroSectionProps {
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string | null;
}

export default function HeroSection({
  heroTitle = "רק שעתיים מלונדון — לונדון שלא הכרתם",
  heroSubtitle = "הטיול שישדרג לכם את החופשה",
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
    { icon: MapPin, text: "הלוך-חזור מלונדון" },
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
  
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
            {heroTitle}
          </h1>

          {heroSubtitle && (
            <p className="text-xl sm:text-2xl lg:text-3xl text-white/95 mb-4 font-medium">
              {heroSubtitle}
            </p>
          )}

          <div className="text-base sm:text-lg lg:text-xl text-white/90 mb-5 max-w-3xl mx-auto leading-relaxed space-y-4">
            <p>
              מתכננים חופשה של 3-4 לילות בלונדון?
            </p>
            <p>
              למה שלא תחליפו לילה אחד יקר במלון בלונדון, בטיול בן יומיים עם לינה של לילה במלון כפרי? טיול שמתאים בדיוק לנו הישראלים!
            </p>
            <p>
              רק שעתיים נסיעה מלונדון, לנשום את הטבע עוצר הנשימה, לבקר בכפרים ציוריים שהזמן פסק מלכת, לטייל בין בתי אבן עתיקים ונופים ירוקים ללון במלון מפנק בכפרים
            </p>
            <p className="font-semibold text-heritage-300">
              ולמחרת יום קניות מרוכז באאוטלט עם כל המותגים במחירים שאין בלונדון. השילוב המנצח, חוויה וחיסכון.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-3 mb-5 inline-block">
            <p className="text-lg sm:text-xl text-white/95 font-medium">
              לפני שסוגרים כרטיס טיסה, שווה לוודא שהתאריכים האלו פתוחים
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-5 sm:mb-6">
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
                  <span className="text-white text-sm sm:text-base font-medium">{item.text}</span>
                </div>
              );
            })}
          </div>

          <div
            className={`transition-all duration-1000 delay-500 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <a
              href="#booking"
              className="inline-block bg-heritage-500 hover:bg-heritage-600 text-white font-bold px-8 py-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-heritage-500/30 text-center text-lg sm:text-xl"
            >
              שריינו מקום לטיול
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
