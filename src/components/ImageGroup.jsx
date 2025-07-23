import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const ImageGroup = ({ images = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(null);

  const closeModal = () => setCurrentIndex(null);
  const nextImage = () =>
    setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {images.map((url, idx) => (
          <img
            key={idx}
            src={url}
            alt={`thumb-${idx}`}
            onClick={() => setCurrentIndex(idx)}
            className="w-12 h-12 object-cover rounded cursor-pointer border border-gray-300 hover:scale-105 transition-transform"
          />
        ))}
      </div>


      <AnimatePresence>
        {currentIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 text-white bg-black/50 p-2 rounded-full hover:bg-black"
                onClick={closeModal}
              >
                <X size={20} />
              </button>

              <button
                onClick={prevImage}
                className="absolute left-2 text-white bg-black/50 hover:bg-black p-2 rounded-full"
              >
                <ChevronLeft size={28} />
              </button>

              <button
                onClick={nextImage}
                className="absolute right-2 text-white bg-black/50 hover:bg-black p-2 rounded-full"
              >
                <ChevronRight size={28} />
              </button>

              <img
                src={images[currentIndex]}
                alt={`full-${currentIndex}`}
                className="max-w-full max-h-screen rounded shadow-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageGroup;
