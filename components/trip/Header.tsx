"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { href: "#about", label: "על החוויה" },
    { href: "#itinerary", label: "מסלול" },
    { href: "#included", label: "מה כלול" },
    { href: "#guide", label: "מי אני" },
    { href: "#gallery", label: "גלריה" },
    { href: "#contact", label: "צור קשר" },
  ];

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen
          ? "bg-white/95 backdrop-blur-md shadow-lg py-2"
          : "bg-transparent py-3"
      }`}
    >
      <div className="container mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="#hero"
            className={`text-lg sm:text-xl font-bold transition-colors ${
              isScrolled || isMobileMenuOpen ? "text-nature-800" : "text-white"
            }`}
          >
            <span className="block leading-tight">מחוץ</span>
            <span className={`text-xs font-normal ${isScrolled || isMobileMenuOpen ? "text-sage-600" : "text-white/80"}`}>
              ללונדון
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isScrolled
                    ? "text-sage-700 hover:text-nature-600"
                    : "text-white/90 hover:text-white"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* WhatsApp Button - Desktop */}
          <div className="hidden lg:flex items-center">
            <a
              href="https://wa.me/972502823333"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors text-sm ${
                isScrolled
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30"
              }`}
            >
              <SiWhatsapp className="w-4 h-4" />
              <span>דברו איתי</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              isScrolled || isMobileMenuOpen ? "text-sage-800" : "text-white"
            }`}
            aria-label={isMobileMenuOpen ? "סגור תפריט" : "פתח תפריט"}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Full Screen Overlay */}
      <div
        className={`lg:hidden fixed inset-0 top-[56px] bg-white transition-all duration-300 ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        style={{ height: "calc(100vh - 56px)", zIndex: 40 }}
      >
        <nav className="h-full overflow-y-auto py-4 px-4">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-medium text-sage-800 hover:text-nature-600 hover:bg-sage-50 py-3 px-4 rounded-xl transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="border-t border-sage-200 my-3" />
            <a
              href="https://wa.me/972502823333"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-green-500 text-white rounded-xl font-medium"
            >
              <SiWhatsapp className="w-5 h-5" />
              <span>דברו איתי בוואטסאפ</span>
            </a>
            <a
              href="#booking-form-section"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center py-3 px-4 bg-heritage-500 text-white rounded-xl font-bold mt-2"
            >
              הרשמה לטיול
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
