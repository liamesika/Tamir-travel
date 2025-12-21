"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryImage {
  src: string;
  alt: string;
}

interface GallerySectionProps {
  galleryImages?: GalleryImage[];
}

const defaultImages: GalleryImage[] = [
  { src: "/images/trip/gallery-1.jpg", alt: "נופי טבע אנגליים" },
  { src: "/images/trip/gallery-2.jpg", alt: "כפר מורשת היסטורי" },
  { src: "/images/trip/gallery-3.jpg", alt: "גבעות ירוקות" },
  { src: "/images/trip/gallery-4.jpg", alt: "שביל בטבע" },
  { src: "/images/trip/gallery-5.jpg", alt: "נקודת תצפית" },
  { src: "/images/trip/gallery-6.jpg", alt: "אווירה כפרית" },
  { src: "/images/trip/gallery-7.jpg", alt: "בית אבן עתיק" },
  { src: "/images/trip/gallery-8.jpg", alt: "שקיעה בכפר" },
  { src: "/images/trip/gallery-9.jpg", alt: "טבע אנגלי" },
];

export default function GallerySection({ galleryImages }: GallerySectionProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const images = galleryImages && galleryImages.length > 0 ? galleryImages : defaultImages;

  const openLightbox = (index: number) => {
    setCurrentImage(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <section id="gallery" className="py-8 sm:py-10 bg-sage-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-5 sm:mb-6">
          <span className="inline-block text-nature-600 font-medium mb-1.5 text-xs">
            גלריה
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sage-900 mb-2">
            רגעים מהטיולים
            <span className="text-nature-600"> שלנו</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 sm:gap-3 max-w-5xl mx-auto">
          {images.map((image, index) => (
            <div
              key={index}
              onClick={() => openLightbox(index)}
              className={`group relative rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 ${
                index === 0 ? "md:col-span-2 md:row-span-2" : ""
              }`}
            >
              <div className={`${index === 0 ? "aspect-square" : "aspect-[4/3]"}`}>
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-nature-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-xs font-medium">{image.alt}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-4 text-center">
          <a
            href="#booking-form-section"
            className="inline-block bg-heritage-500 hover:bg-heritage-600 text-white font-bold px-6 py-2.5 rounded-full shadow-lg transition-all duration-300 hover:scale-105 text-sm"
          >
            מתרגשים? הצטרפו לטיול
          </a>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-nature-950/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 left-4 sm:top-8 sm:left-8 text-white hover:text-sage-300 transition-colors z-10"
          >
            <X size={32} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 text-white hover:text-sage-300 transition-colors z-10 bg-white/10 rounded-full p-2 hover:bg-white/20"
          >
            <ChevronRight size={32} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 text-white hover:text-sage-300 transition-colors z-10 bg-white/10 rounded-full p-2 hover:bg-white/20"
          >
            <ChevronLeft size={32} />
          </button>

          <div
            className="max-w-6xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[currentImage].src}
              alt={images[currentImage].alt}
              className="w-full h-full object-contain rounded-lg"
            />
            <p className="text-white text-center mt-4 text-lg">
              {images[currentImage].alt}
            </p>
          </div>

          <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 text-white/80 text-sm bg-white/10 px-4 py-2 rounded-full">
            {currentImage + 1} / {images.length}
          </div>
        </div>
      )}
    </section>
  );
}
