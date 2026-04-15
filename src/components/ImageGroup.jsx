import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const ImageGroup = ({ images = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(null);

  const closeModal = () => setCurrentIndex(null);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {images.map((url, idx) => (
          <img
            key={idx}
            src={url}
            alt={`thumb-${idx}`}
            onClick={() => setCurrentIndex(idx)}
            className="w-8 h-8 object-cover rounded cursor-pointer border border-gray-300 hover:scale-105 transition-transform"
          />
        ))}
      </div>

      <AnimatePresence>
        {currentIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            {/* Close button - screen top right */}
            <button
              className="absolute top-4 right-4 z-50 text-white bg-black/50 p-2 rounded-full hover:bg-black transition cursor-pointer"
              onClick={closeModal}
            >
              <X size={20} />
            </button>

            {/* Prev button - full left side */}
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white bg-black/50 hover:bg-black p-3 rounded-full transition cursor-pointer"
              >
                <ChevronLeft size={28} />
              </button>
            )}

            {/* Next button - full right side */}
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white bg-black/50 hover:bg-black p-3 rounded-full transition cursor-pointer"
              >
                <ChevronRight size={28} />
              </button>
            )}

            {/* Centered image */}
            <div
              className="w-full h-full flex items-center justify-center p-12"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                src={images[currentIndex]}
                alt={`full-${currentIndex}`}
                className="max-w-[90vw] max-h-[85vh] object-contain rounded shadow-lg"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageGroup;
