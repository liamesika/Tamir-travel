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
  const videoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const hasSetupListenersRef = useRef(false);

  // Configure video element for autoplay (iOS/Android compatible)
  const configureVideoForAutoplay = useCallback((video: HTMLVideoElement) => {
    // Set all required attributes programmatically
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.volume = 0;

    // Set attributes for iOS Safari
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    // Disable features that can block autoplay
    video.setAttribute("x-webkit-airplay", "deny");
    video.disableRemotePlayback = true;

    // Cast for playsInline property
    (video as HTMLVideoElement & { playsInline: boolean }).playsInline = true;
  }, []);

  // Force play with retry logic
  const forcePlay = useCallback(async (video: HTMLVideoElement): Promise<boolean> => {
    configureVideoForAutoplay(video);

    try {
      video.load();
      const playPromise = video.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
      return true;
    } catch {
      return false;
    }
  }, [configureVideoForAutoplay]);

  // Autoplay handler for a specific video element
  const attemptVideoAutoplay = useCallback(async (video: HTMLVideoElement | null) => {
    if (!video || prefersReducedMotion || videoFailed) return;

    configureVideoForAutoplay(video);

    // Strategy 1: Direct play
    try {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        await playPromise;
        setIsPlaying(true);
        setAutoplayBlocked(false);
        return;
      }
    } catch {
      // Continue to retry strategies
    }

    // Strategy 2: Retry after short delay
    setTimeout(async () => {
      try {
        await video.play();
        setIsPlaying(true);
        setAutoplayBlocked(false);
      } catch {
        // Strategy 3: Retry after longer delay
        setTimeout(async () => {
          try {
            await video.play();
            setIsPlaying(true);
            setAutoplayBlocked(false);
          } catch {
            // Autoplay blocked - set up user interaction fallback
            setAutoplayBlocked(true);
          }
        }, 1000);
      }
    }, 250);
  }, [configureVideoForAutoplay, prefersReducedMotion, videoFailed]);

  // User interaction fallback for autoplay
  useEffect(() => {
    if (hasSetupListenersRef.current) return;
    if (prefersReducedMotion || videoFailed) return;

    const tryPlayOnce = () => {
      const mobileVideo = mobileVideoRef.current;
      const desktopVideo = videoRef.current;

      if (mobileVideo) {
        forcePlay(mobileVideo).then((success) => {
          if (success) {
            setIsPlaying(true);
            setAutoplayBlocked(false);
          }
        });
      }

      if (desktopVideo) {
        forcePlay(desktopVideo).then((success) => {
          if (success) {
            setIsPlaying(true);
            setAutoplayBlocked(false);
          }
        });
      }
    };

    // Set up one-time listeners for user interaction fallback
    document.addEventListener("touchstart", tryPlayOnce, { once: true, passive: true });
    document.addEventListener("click", tryPlayOnce, { once: true });

    hasSetupListenersRef.current = true;

    return () => {
      document.removeEventListener("touchstart", tryPlayOnce);
      document.removeEventListener("click", tryPlayOnce);
    };
  }, [forcePlay, prefersReducedMotion, videoFailed]);

  // Initialize on mount
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

  // Mobile video autoplay on mount
  useEffect(() => {
    if (prefersReducedMotion || videoFailed) return;

    const mobileVideo = mobileVideoRef.current;
    if (mobileVideo) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        attemptVideoAutoplay(mobileVideo);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [attemptVideoAutoplay, prefersReducedMotion, videoFailed]);

  // Desktop video autoplay on mount
  useEffect(() => {
    if (prefersReducedMotion || videoFailed) return;

    const desktopVideo = videoRef.current;
    if (desktopVideo) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        attemptVideoAutoplay(desktopVideo);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [attemptVideoAutoplay, prefersReducedMotion, videoFailed]);

  // Manual play handler
  const handleManualPlay = useCallback(async () => {
    const mobileVideo = mobileVideoRef.current;
    const desktopVideo = videoRef.current;

    if (mobileVideo) {
      const success = await forcePlay(mobileVideo);
      if (success) {
        setIsPlaying(true);
        setAutoplayBlocked(false);
        return;
      }
    }

    if (desktopVideo) {
      const success = await forcePlay(desktopVideo);
      if (success) {
        setIsPlaying(true);
        setAutoplayBlocked(false);
        return;
      }
    }

    // Complete failure
    setVideoFailed(true);
  }, [forcePlay]);

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
            onError={() => setVideoFailed(true)}
            onPlaying={() => {
              setIsPlaying(true);
              setAutoplayBlocked(false);
            }}
            onLoadedData={() => {
              // Attempt play as soon as data is loaded
              const video = mobileVideoRef.current;
              if (video && !isPlaying) {
                configureVideoForAutoplay(video);
                video.play().catch(() => {});
              }
            }}
            onCanPlayThrough={() => {
              // Retry play when fully buffered
              const video = mobileVideoRef.current;
              if (video && !isPlaying) {
                video.play().catch(() => {});
              }
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
            onError={() => setVideoFailed(true)}
            onLoadedData={() => {
              // Attempt play as soon as data is loaded
              const video = videoRef.current;
              if (video && !isPlaying) {
                configureVideoForAutoplay(video);
                video.play().catch(() => {});
              }
            }}
            onCanPlayThrough={() => {
              // Retry play when fully buffered
              const video = videoRef.current;
              if (video && !isPlaying) {
                video.play().catch(() => {});
              }
            }}
            onPlaying={() => {
              setIsPlaying(true);
              setAutoplayBlocked(false);
            }}
            onPause={() => {
              // Only mark as not playing if video truly ended
              if (videoRef.current && videoRef.current.ended) {
                setIsPlaying(false);
              }
            }}
            onStalled={() => {
              // Try to recover from stall
              const video = videoRef.current;
              if (video && !video.paused) {
                video.play().catch(() => {});
              }
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

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 sm:mb-8 leading-tight lg:leading-snug">
            {heroTitle}
          </h1>

          {heroSubtitle && (
            <p className="text-xl sm:text-2xl lg:text-3xl text-white/95 mb-4 sm:mb-6 font-medium leading-relaxed">
              {heroSubtitle}
            </p>
          )}

          <p className="text-base sm:text-lg text-heritage-300 mb-2 sm:mb-3 font-medium">
            החופשה שתישמר בליבכם לעד ❤️
          </p>
          <p className="text-sm sm:text-base text-white/60 mb-6 sm:mb-8 font-light">
            -עם הלב-
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
