"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Calendar, MapPin, Bed, ShoppingBag, Users, Play, Bus } from "lucide-react";

// Video sources - MP4 format for maximum browser compatibility
const MOBILE_VIDEO_SRC = "/videos/mobile.mp4";
const DESKTOP_VIDEO_SRC = "/videos/hero-video.mp4";

interface HeroSectionProps {
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string | null;
}

export default function HeroSection({
  heroTitle = "מחוץ ללונדון",
  heroSubtitle = "טיול אל הכפרים הציוריים – יומיים עם לינה",
  heroImage = "/images/hero-poster.jpg",
}: HeroSectionProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);

  // Configure video element for autoplay (iOS/Android compatible)
  const configureVideoForAutoplay = useCallback((video: HTMLVideoElement) => {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.loop = true;
    video.volume = 0;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("x-webkit-airplay", "deny");
    video.disableRemotePlayback = true;
    (video as HTMLVideoElement & { playsInline: boolean }).playsInline = true;
  }, []);

  // Try to play video silently
  const tryPlay = useCallback(async (video: HTMLVideoElement | null) => {
    if (!video) return;
    configureVideoForAutoplay(video);
    try {
      await video.play();
      setIsPlaying(true);
      setAutoplayBlocked(false);
    } catch {
      // Silently ignore - will retry on interaction
    }
  }, [configureVideoForAutoplay]);

  // iOS Safari hardening - comprehensive autoplay strategy
  useEffect(() => {
    if (prefersReducedMotion || videoFailed) return;

    const mobileVideo = mobileVideoRef.current;
    const desktopVideo = videoRef.current;

    const tryPlayAll = () => {
      if (mobileVideo) tryPlay(mobileVideo);
      if (desktopVideo) tryPlay(desktopVideo);
    };

    // Visibility change handler (tab becomes visible)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        tryPlayAll();
      }
    };

    // Page show handler (bfcache restore)
    const handlePageShow = () => {
      tryPlayAll();
    };

    // User interaction unlock (one-time)
    const unlock = () => {
      tryPlayAll();
      document.removeEventListener("touchstart", unlock);
      document.removeEventListener("click", unlock);
    };

    // Initial play attempt with requestAnimationFrame
    requestAnimationFrame(() => {
      tryPlayAll();
    });

    // Additional delayed attempts
    setTimeout(tryPlayAll, 100);
    setTimeout(tryPlayAll, 500);
    setTimeout(() => {
      if (!isPlaying) {
        setAutoplayBlocked(true);
      }
    }, 2000);

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("touchstart", unlock, { passive: true });
    document.addEventListener("click", unlock);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("touchstart", unlock);
      document.removeEventListener("click", unlock);
    };
  }, [prefersReducedMotion, videoFailed, tryPlay, isPlaying]);

  // Initialize on mount
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

  // Manual play handler
  const handleManualPlay = useCallback(async () => {
    const mobileVideo = mobileVideoRef.current;
    const desktopVideo = videoRef.current;

    if (mobileVideo) {
      configureVideoForAutoplay(mobileVideo);
      try {
        await mobileVideo.play();
        setIsPlaying(true);
        setAutoplayBlocked(false);
        return;
      } catch {}
    }

    if (desktopVideo) {
      configureVideoForAutoplay(desktopVideo);
      try {
        await desktopVideo.play();
        setIsPlaying(true);
        setAutoplayBlocked(false);
        return;
      } catch {}
    }

    setVideoFailed(true);
  }, [configureVideoForAutoplay]);

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
  const showPoster = !showVideo || (!isPlaying && !videoReady);
  const posterImage = heroImage || "/images/hero-poster.jpg";

  return (
    <section
      id="hero"
      className="relative flex items-center justify-center"
    >
      {/* Mobile Video Layer - visible only on mobile (< md breakpoint) */}
      {showVideo && (
        <div className="hero-video-layer pointer-events-none block md:hidden">
          <video
            ref={mobileVideoRef}
            autoPlay
            muted
            loop
            playsInline
            disablePictureInPicture
            preload="auto"
            poster={posterImage}
            aria-hidden="true"
            className={`transition-opacity duration-500 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
            onError={() => setVideoFailed(true)}
            onCanPlay={() => setVideoReady(true)}
            onPlaying={() => {
              setIsPlaying(true);
              setAutoplayBlocked(false);
              setVideoReady(true);
            }}
          >
            <source src={MOBILE_VIDEO_SRC} type="video/mp4" />
          </video>
        </div>
      )}

      {/* Desktop Video Layer - hidden on mobile, visible from md and up */}
      {showVideo && (
        <div className="hero-video-layer pointer-events-none hidden md:block">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            disablePictureInPicture
            preload="auto"
            poster={posterImage}
            aria-hidden="true"
            className={`transition-opacity duration-500 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
            onError={() => setVideoFailed(true)}
            onCanPlay={() => setVideoReady(true)}
            onPlaying={() => {
              setIsPlaying(true);
              setAutoplayBlocked(false);
              setVideoReady(true);
            }}
          >
            <source src={DESKTOP_VIDEO_SRC} type="video/mp4" />
          </video>
        </div>
      )}

      {/* Poster Layer - fallback when video not playing */}
      {showPoster && (
        <div
          className="hero-poster-layer"
          style={{ backgroundImage: `url('${posterImage}')` }}
        />
      )}

      {/* Gradient overlay */}
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

      <div className="hero-content container mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20 sm:pt-24 lg:pt-28">
        <div
          className={`transition-all duration-1000 ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 sm:mb-10 leading-tight lg:leading-snug">
            {heroTitle}
          </h1>

          {heroSubtitle && (
            <p className="text-xl sm:text-2xl lg:text-3xl text-white/95 mb-6 sm:mb-8 font-medium leading-relaxed">
              {heroSubtitle}
            </p>
          )}

          <div className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed sm:leading-loose">
            <p className="text-heritage-300 font-medium mb-4">
              החופשה שתישמר בליבכם לעד ❤️
            </p>
            <p>
              רק שעתיים נסיעה מלונדון, ננשום את הטבע עוצר הנשימה, נבקר בכפרים ציוריים שהזמן פסק מלכת, נטייל בין בתי אבן עתיקים, נחלים זורמים ונופים ירוקים, נלון במלון מפנק בכפרים ולמחרת יום קניות מרוכז באאוטלט עם כל המותגים במחירים שאין בלונדון.
            </p>
            <p className="mt-4 sm:mt-5 font-semibold text-heritage-300">
              השילוב המנצח, חוויה וחיסכון,
            </p>
            <p className="font-semibold text-heritage-300">
              ובנוסף תחסכו לילה יקר במלון בלונדון
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
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
              className="inline-block bg-heritage-500 hover:bg-heritage-600 text-white font-bold px-8 py-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-heritage-500/30 text-center text-lg sm:text-xl"
            >
              שריינו מקום לטיול
            </a>

            {/* Info Banner */}
            <div className="mt-4 sm:mt-5">
              <div className="inline-block bg-white/10 backdrop-blur-sm px-4 sm:px-6 py-2.5 sm:py-3 rounded-full border border-white/20 max-w-[90vw] sm:max-w-xl">
                <p className="text-white/90 text-sm sm:text-base font-medium leading-snug">
                  שימו ❤️ בחורף המחירים נמוכים יותר, הודות לעלויות זולות יותר של מלונות ומיניבוסים
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
