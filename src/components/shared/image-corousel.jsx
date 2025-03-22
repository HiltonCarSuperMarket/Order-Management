"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function ImageCarousel({
  images,
  interval = 4000,
  className = "",
  overlayTitle,
  overlayDescription,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  return (
    <div
      className={`relative h-[300px] sm:h-[400px] lg:h-[500px] rounded-lg overflow-hidden shadow-2xl ${className}`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <Image
            src={images[currentIndex] || "/placeholder.svg"}
            alt={`Slide ${currentIndex + 1}`}
            fill
            className="object-cover object-center"
            priority={currentIndex === 0}
          />
        </motion.div>
      </AnimatePresence>

      {/* Indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              currentIndex === index ? "bg-white w-4" : "bg-white/50"
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>

      {/* Overlay */}
      {(overlayTitle || overlayDescription) && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <div className="p-6 text-white">
            {overlayTitle && (
              <h3 className="text-2xl font-bold mb-2">{overlayTitle}</h3>
            )}
            {overlayDescription && <p className="mb-4">{overlayDescription}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
