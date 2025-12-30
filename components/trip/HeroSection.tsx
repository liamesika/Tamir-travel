"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Calendar, MapPin, Bed, ShoppingBag, Users, Play, Bus } from "lucide-react";

// Video fit mode: "cover" crops to fill (default), "contain" shows full frame with letterboxing
const HERO_VIDEO_FIT_MODE: "cover" | "contain" = "cover";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const playAttemptRef = useRef(0);
  const hasUserInteractedRef = useRef(false);

  // Robust autoplay with multiple retry strategies for iOS/Android/Desktop
  const attemptAutoplay = useCallback(async () => {
    const video = videoRef.current;
    if (!video || prefersReducedMotion || videoFailed) return;

    playAttemptRef.current += 1;
    const currentAttempt = playAttemptRef.current;

    // Ensure all autoplay-required attributes are set
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.volume = 0;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    // For iOS Safari low-power mode
    video.setAttribute("x-webkit-airplay", "deny");
    video.disableRemotePlayback = true;

    const tryPlay = async (): Promise<boolean> => {
      try {
        // Reset video position for clean start
        if (video.currentTime > 0) {
          video.currentTime = 0;
        }

        const playPromise = video.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
        return true;
      } catch {
        return false;
      }
    };

    // Strategy 1: Direct play attempt
    if (await tryPlay()) {
      setIsPlaying(true);
      setAutoplayBlocked(false);
      return;
    }

    // Strategy 2: Wait for canplaythrough then try
    if (video.readyState < 4) {
      await new Promise<void>((resolve) => {
        const onReady = () => {
          video.removeEventListener('canplaythrough', onReady);
          resolve();
        };
        video.addEventListener('canplaythrough', onReady, { once: true });
        // Timeout fallback
        setTimeout(resolve, 3000);
      });

      if (currentAttempt !== playAttemptRef.current) return;

      if (await tryPlay()) {
        setIsPlaying(true);
        setAutoplayBlocked(false);
        return;
      }
    }

    // Strategy 3: Small delay and retry (helps on some Android devices)
    await new Promise(resolve => setTimeout(resolve, 200));
    if (currentAttempt !== playAttemptRef.current) return;

    if (await tryPlay()) {
      setIsPlaying(true);
      setAutoplayBlocked(false);
      return;
    }

    // Strategy 4: Reload and try (last resort for stubborn browsers)
    video.load();
    await new Promise(resolve => setTimeout(resolve, 300));
    if (currentAttempt !== playAttemptRef.current) return;

    if (await tryPlay()) {
      setIsPlaying(true);
      setAutoplayBlocked(false);
      return;
    }

    // Autoplay truly blocked - show play button
    setAutoplayBlocked(true);
  }, [prefersReducedMotion, videoFailed]);

  // Manual play handler with user gesture context
  const handleManualPlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    hasUserInteractedRef.current = true;
    video.muted = true;
    video.volume = 0;

    try {
      await video.play();
      setIsPlaying(true);
      setAutoplayBlocked(false);
    } catch {
      // If still fails, try with load first
      video.load();
      try {
        await video.play();
        setIsPlaying(true);
        setAutoplayBlocked(false);
      } catch {
        // Complete failure - hide video, show poster only
        setVideoFailed(true);
      }
    }
  }, []);

  // Listen for any user interaction to retry autoplay
  useEffect(() => {
    if (!autoplayBlocked || hasUserInteractedRef.current) return;

    const handleInteraction = () => {
      hasUserInteractedRef.current = true;
      attemptAutoplay();
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('scroll', handleInteraction);
    };

    document.addEventListener('touchstart', handleInteraction, { once: true, passive: true });
    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('scroll', handleInteraction, { once: true, passive: true });

    return () => {
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('scroll', handleInteraction);
    };
  }, [autoplayBlocked, attemptAutoplay]);

  useEffect(() => {
    setIsLoaded(true);

    // Check reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Initial autoplay attempt after mount
  useEffect(() => {
    if (!prefersReducedMotion && !videoFailed) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(attemptAutoplay, 100);
      return () => clearTimeout(timer);
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
      className="relative flex items-center justify-center"
    >
      {/* Video Layer - uses CSS classes from globals.css */}
      {showVideo && (
        <div className="hero-video-layer pointer-events-none">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            disablePictureInPicture
            preload="metadata"
            poster={posterImage}
            style={{ objectFit: HERO_VIDEO_FIT_MODE }}
            onError={() => setVideoFailed(true)}
            onLoadedData={() => {
              // Attempt play as soon as data is loaded
              if (videoRef.current && !isPlaying && !autoplayBlocked) {
                videoRef.current.play().catch(() => {});
              }
            }}
            onCanPlayThrough={() => {
              // Retry play when fully buffered
              if (videoRef.current && !isPlaying && !autoplayBlocked) {
                videoRef.current.play().catch(() => {});
              }
            }}
            onPlaying={() => {
              setIsPlaying(true);
              setAutoplayBlocked(false);
            }}
            onWaiting={() => {
              // Video stalled - don't mark as not playing yet
            }}
            onPause={() => {
              // Only mark as not playing if video truly ended
              if (videoRef.current && videoRef.current.ended) {
                setIsPlaying(false);
              }
            }}
            onStalled={() => {
              // Try to recover from stall
              if (videoRef.current && !videoRef.current.paused) {
                videoRef.current.play().catch(() => {});
              }
            }}
          >
            <source src="/videos/hero-video.mp4" type="video/mp4; codecs=avc1.42E01E" />
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

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 sm:mb-8 leading-tight lg:leading-snug">
            {heroTitle}
          </h1>

          {heroSubtitle && (
            <p className="text-xl sm:text-2xl lg:text-3xl text-white/95 mb-4 sm:mb-6 font-medium leading-relaxed">
              {heroSubtitle}
            </p>
          )}

          <p className="text-base sm:text-lg text-heritage-300 mb-6 sm:mb-8 font-medium">
            החופשה שתישמר בליבכם לעד
          </p>

          <div className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed sm:leading-loose">
            <p>
              רק שעתיים נסיעה מלונדון, ננשום את הטבע עוצר הנשימה, נבקר בכפרים ציוריים שהזמן פסק מלכת, נטייל בין בתי אבן עתיקים, נחלים זורמים ונופים ירוקים, נלון במלון מפנק בכפרים ולמחרת יום קניות מרוכז באאוטלט עם כל המותגים במחירים שאין בלונדון.
            </p>
            <p className="mt-4 sm:mt-5 font-semibold text-heritage-300">
              השילוב המנצח, חוויה וחיסכון.
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
            className={`transition-all duration-1000 delay-500 pb-[10px] ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <a
              href="#booking"
              className="inline-block bg-heritage-500 hover:bg-heritage-600 text-white font-bold px-8 py-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-heritage-500/30 text-center text-lg sm:text-xl"
            >
              שריינו מקום לטיול
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
