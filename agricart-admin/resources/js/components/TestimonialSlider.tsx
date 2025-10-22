import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

interface Testimonial {
  id: number;
  text: string;
  name: string;
  role: string;
}

interface TestimonialSliderProps {
  testimonials: Testimonial[];
  parallaxImage: string;
  autoplayInterval?: number;
}

export function TestimonialSlider({ 
  testimonials, 
  parallaxImage, 
  autoplayInterval = 6000
}: TestimonialSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Handle empty testimonials array
  if (!testimonials || testimonials.length === 0) {
    return null;
  }
  
  // Parallax scroll effect
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

  // Auto-play functionality
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [isVisible, testimonials.length, autoplayInterval]);

  // Intersection Observer for parallax effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden"
    >
      {/* Shared Parallax Background */}
      <div className="absolute inset-0 will-change-transform overflow-hidden">
        <motion.div
          className="w-full h-[200%] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${parallaxImage})`,
            y,
          }}
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Testimonial Content */}
      <div className="relative z-10 h-screen min-h-[600px] flex items-center justify-center">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{
                duration: 0.6,
                ease: 'easeInOut',
              }}
              className="space-y-6 sm:space-y-8"
            >
              {/* Quote Icon */}
              <div className="flex justify-center mb-4 sm:mb-6">
                <svg
                  className="w-12 h-12 sm:w-16 sm:h-16 text-white/80"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
                </svg>
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light text-white leading-relaxed px-4 sm:px-8">
                "{currentTestimonial.text}"
              </blockquote>

              {/* Author Info */}
              <div className="space-y-1 sm:space-y-2">
                <h4 className="text-base sm:text-lg md:text-xl font-semibold text-white">
                  {currentTestimonial.name}
                </h4>
                <p className="text-xs sm:text-sm md:text-base text-white/80">
                  {currentTestimonial.role}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Pagination Dots */}
          <div className="flex justify-center space-x-2 sm:space-x-3 mt-8 sm:mt-12">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-white scale-125'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}

export default TestimonialSlider;
