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

  const navLinks = [
    { href: "#about", label: "על החוויה" },
    { href: "#itinerary", label: "מסלול הטיול" },
    { href: "#included", label: "מה כלול" },
    { href: "#guide", label: "מי אני" },
    { href: "#gallery", label: "גלריה" },
    { href: "#contact", label: "צור קשר" },
  ];

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo - Right side for RTL */}
          <a
            href="#hero"
            className={`text-xl sm:text-2xl font-bold transition-all duration-300 ${
              isScrolled ? "text-nature-800" : "text-white"
            }`}
          >
            <span className="block leading-tight">לונדון</span>
            <span className={`text-sm font-normal ${isScrolled ? "text-sage-600" : "text-white/80"}`}>
              שלא הכרתם
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-all duration-300 hover:scale-105 ${
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
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="https://wa.me/972501234567"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 hover:scale-105 ${
                isScrolled
                  ? "bg-green-500 text-white hover:bg-green-600 shadow-md"
                  : "bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30"
              }`}
            >
              <SiWhatsapp className="w-5 h-5" />
              <span>דברו איתי</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              isScrolled ? "text-sage-800" : "text-white"
            }`}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            isMobileMenuOpen ? "max-h-96 mt-4" : "max-h-0"
          }`}
        >
          <nav
            className={`py-4 px-2 rounded-2xl ${
              isScrolled ? "bg-sage-50" : "bg-white/10 backdrop-blur-md"
            }`}
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-base font-medium transition-colors py-3 px-4 rounded-xl ${
                    isScrolled
                      ? "text-sage-700 hover:bg-sage-100"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="https://wa.me/972501234567"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 mt-3 py-3 px-4 bg-green-500 text-white rounded-xl font-medium"
              >
                <SiWhatsapp className="w-5 h-5" />
                <span>דברו איתי בוואטסאפ</span>
              </a>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
