import Header from "@/components/trip/Header";
import HeroSection from "@/components/trip/HeroSection";
import GuideSection from "@/components/trip/GuideSection";
import ItinerarySection from "@/components/trip/ItinerarySection";
import IncludedSection from "@/components/trip/IncludedSection";
import GallerySection from "@/components/trip/GallerySection";
import VideoSection from "@/components/trip/VideoSection";
import ReviewsSection from "@/components/trip/ReviewsSection";
import FaqSection from "@/components/trip/FaqSection";
import CtaSection from "@/components/trip/CtaSection";
import BookingSection from "@/components/trip/BookingSection";
import ContactSection from "@/components/trip/ContactSection";

export default function TripPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <HeroSection />
      <GuideSection />
      <ItinerarySection />
      <IncludedSection />
      <GallerySection />
      <VideoSection />
      <ReviewsSection />
      <FaqSection />
      <CtaSection />
      <BookingSection />
      <ContactSection />
    </main>
  );
}
