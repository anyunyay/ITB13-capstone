import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

interface Testimonial {
  id: number;
  text: string;
  name: string;
  role: string;
}

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
  backgroundImage?: string;
}

interface TestimonialSliderProps {
  testimonials: Testimonial[];
  parallaxImage: string;
  autoplayInterval?: number;
  featureCards?: FeatureCard[];
}

export function TestimonialSlider({ 
  testimonials, 
  parallaxImage, 
  autoplayInterval = 6000,
  featureCards = []
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

      {/* Feature Cards Section - Integrated with same background */}
      {featureCards && featureCards.length > 0 && (
        <div className="relative z-10 w-full py-16">
          <div className="w-full px-8 max-w-none">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              {featureCards.map((card, index) => (
                <div 
                  key={index} 
                  className="group bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/20 p-10 shadow-lg transition-all duration-500 ease-in-out relative min-h-[280px] flex flex-col justify-center hover:shadow-2xl hover:-translate-y-1 overflow-hidden hover:bg-white/20"
                >
                  {/* Background image with zoom effect */}
                  {card.backgroundImage && (
                    <div 
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 ease-in-out group-hover:scale-110"
                      style={{
                        backgroundImage: `url(${card.backgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    />
                  )}
                  
                  {/* Enhanced gradient overlay for better text contrast */}
                  <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent rounded-2xl z-0 transition-all duration-500 ease-in-out group-hover:from-black/80 group-hover:via-black/50"></div>
                  
                  <div className="flex items-start gap-6 relative z-10">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ease-in-out group-hover:bg-white group-hover:shadow-xl">
                        <span className="text-3xl transition-all duration-500 ease-in-out group-hover:scale-110">{card.icon}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold mb-4 text-white transition-all duration-500 ease-in-out group-hover:text-white drop-shadow-lg">
                        {card.title}
                      </h3>
                      <p className="text-gray-100 leading-relaxed text-base transition-all duration-500 ease-in-out group-hover:text-white drop-shadow-md">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default TestimonialSlider;
