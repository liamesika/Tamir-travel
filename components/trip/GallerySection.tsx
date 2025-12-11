"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function GallerySection() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const images = [
    { src: "/images/trip/gallery-1.jpg", alt: "נוף הרים מרהיב" },
    { src: "/images/trip/gallery-2.jpg", alt: "קבוצת המטיילים" },
    { src: "/images/trip/gallery-3.jpg", alt: "שביל ביער" },
    { src: "/images/trip/gallery-4.jpg", alt: "שקיעה במדבר" },
    { src: "/images/trip/gallery-5.jpg", alt: "מפל מים" },
    { src: "/images/trip/gallery-6.jpg", alt: "פריחה באביב" },
    { src: "/images/trip/gallery-7.jpg", alt: "טיפוס לפסגה" },
    { src: "/images/trip/gallery-8.jpg", alt: "חניית לילה" },
    { src: "/images/trip/gallery-9.jpg", alt: "ארוחה משותפת" },
  ];

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
    <section id="gallery" className="py-16 sm:py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            גלריית תמונות
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            תמונות מהטיולים הקודמים שלנו
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {images.map((image, index) => (
            <div
              key={index}
              onClick={() => openLightbox(index)}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
            </div>
          ))}
        </div>
      </div>

      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button
            onClick={closeLightbox}
            className="absolute top-4 left-4 sm:top-8 sm:left-8 text-white hover:text-gray-300 transition-colors z-10"
          >
            <X size={32} />
          </button>

          <button
            onClick={prevImage}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-white/10 rounded-full p-2"
          >
            <ChevronRight size={32} />
          </button>

          <button
            onClick={nextImage}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-white/10 rounded-full p-2"
          >
            <ChevronLeft size={32} />
          </button>

          <div className="max-w-6xl max-h-[90vh] w-full">
            <img
              src={images[currentImage].src}
              alt={images[currentImage].alt}
              className="w-full h-full object-contain"
            />
            <p className="text-white text-center mt-4 text-lg">
              {images[currentImage].alt}
            </p>
          </div>

          <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 text-white text-sm">
            {currentImage + 1} / {images.length}
          </div>
        </div>
      )}
    </section>
  );
}
