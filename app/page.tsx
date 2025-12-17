import Header from "@/components/trip/Header";
import HeroSection from "@/components/trip/HeroSection";
import AboutSection from "@/components/trip/AboutSection";
import ItinerarySection from "@/components/trip/ItinerarySection";
import IncludedSection from "@/components/trip/IncludedSection";
import GuideSection from "@/components/trip/GuideSection";
import GallerySection from "@/components/trip/GallerySection";
import ShoppingSection from "@/components/trip/ShoppingSection";
import CtaSection from "@/components/trip/CtaSection";
import BookingSection from "@/components/trip/BookingSection";
import FaqSection from "@/components/trip/FaqSection";
import ContactSection from "@/components/trip/ContactSection";
import FloatingWhatsApp from "@/components/trip/FloatingWhatsApp";

export default function TripPage() {
  return (
    <main className="min-h-screen bg-sage-50">
      <Header />
      <HeroSection />
      <AboutSection />
      <ItinerarySection />
      <IncludedSection />
      <GuideSection />
      <GallerySection />
      <ShoppingSection />
      <CtaSection />
      <BookingSection />
      <FaqSection />
      <ContactSection />
      <FloatingWhatsApp />
    </main>
  );
}
