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
import { getActiveTrip, defaultTripData } from "@/lib/trip-data";

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function TripPage() {
  const trip = await getActiveTrip() || defaultTripData;

  return (
    <main className="min-h-screen bg-sage-50">
      <Header />
      <HeroSection
        heroTitle={trip.heroTitle}
        heroSubtitle={trip.heroSubtitle}
        heroImage={trip.heroImage}
      />
      <AboutSection />
      <ItinerarySection itinerarySteps={trip.itinerarySteps} />
      <IncludedSection
        includedItems={trip.includedItems}
        notIncludedItems={trip.notIncludedItems}
      />
      <GuideSection
        guideTitle={trip.guideTitle}
        guideContent={trip.guideContent}
        guideImage={trip.guideImage}
      />
      <GallerySection galleryImages={trip.galleryImages} />
      <ShoppingSection />
      <CtaSection />
      <BookingSection />
      <FaqSection faqItems={trip.faqItems} />
      <ContactSection />
      <FloatingWhatsApp />
    </main>
  );
}
