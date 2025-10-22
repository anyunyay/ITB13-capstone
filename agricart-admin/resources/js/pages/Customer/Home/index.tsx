import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { SharedData } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { TestimonialSlider } from '@/components/TestimonialSlider';
import Footer from '@/components/Footer';
import Autoplay from 'embla-carousel-autoplay';

interface PageProps {
  flash: {
    message?: string;
  };
  products: Array<{
    id: number;
    name: string;
    price_kilo: number | null;
    price_pc: number | null;
    price_tali: number | null;
    description: string | null;
    image: string;
    image_url: string;
    produce_type: string | null;
  }>;
  [key: string]: unknown;
}

export default function CustomerHome({ products }: PageProps) {
  const [showLoginConfirm, setShowLoginConfirm] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleRequireLogin = () => setShowLoginConfirm(true);

  // Handle scroll detection for header transformation
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      // Update the header's scroll state by dispatching a custom event
      window.dispatchEvent(new CustomEvent('scroll-snap', { 
        detail: { scrollTop } 
      }));
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  // Get featured products (first 6 products for the carousel)
  const featuredProducts = products.slice(0, 6);

  // Helper function to get the best price for display
  const getDisplayPrice = (product: any) => {
    if (product.price_kilo) return `₱${product.price_kilo}/kg`;
    if (product.price_pc) return `₱${product.price_pc}/pc`;
    if (product.price_tali) return `₱${product.price_tali}/tali`;
    return 'Price not available';
  };

  // Handle carousel API to track current slide
  const handleCarouselApi = (api: any) => {
    if (api) {
      api.on('select', () => {
        setCurrentSlide(api.selectedScrollSnap());
      });
    }
  };

  // Feature cards data
  const featureCardsData = [
    {
      icon: '🌿',
      title: 'Tended with Care',
      description: 'Our produce is carefully tended by experienced farmers using sustainable methods, ensuring the highest quality and natural growth.'
    },
    {
      icon: '🌱',
      title: 'Locally Produced',
      description: 'Proudly grown in Cabuyao by local farmers who understand the land and climate, supporting our community.'
    },
    {
      icon: '🛍️',
      title: 'Freshly Picked',
      description: 'Harvested at peak ripeness and carefully selected to ensure you receive only the freshest, most flavorful produce.'
    }
  ];

  // Testimonial data
  const testimonialData = [
    {
      id: 1,
      text: "SMMC Cooperative has transformed our farming community. The fresh produce and support from the cooperative have been outstanding. We're proud to be part of this sustainable agriculture movement.",
      name: "Maria Santos",
      role: "Local Farmer & Cooperative Member"
    },
    {
      id: 2,
      text: "The quality and freshness of the produce from SMMC Cooperative is unmatched. Every purchase supports local farmers and sustainable practices. It's wonderful to be part of this community-driven initiative.",
      name: "Juan Dela Cruz",
      role: "Long-time Customer"
    },
    {
      id: 3,
      text: "Working with SMMC Cooperative has given our family farm new opportunities. The cooperative's commitment to fair trade and sustainable farming practices makes all the difference.",
      name: "Ana Rodriguez",
      role: "Farm Owner & Community Leader"
    },
    {
      id: 4,
      text: "As a chef, I rely on SMMC Cooperative for the freshest ingredients. Their commitment to quality and supporting local farmers aligns perfectly with our restaurant's values and our customers love the taste.",
      name: "Chef Miguel Torres",
      role: "Head Chef, Farm-to-Table Restaurant"
    }
  ];

  return (
    <AppHeaderLayout>
      <Head title="Home - Cooperatives of Farmers" />

      {/* Scroll container with snap behavior */}
      <div ref={scrollContainerRef} className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth" style={{ scrollBehavior: 'smooth', scrollSnapType: 'y mandatory' }}>
        {/* Hero Section with Farm Image */}
        <section className="relative z-0 w-full snap-start snap-always snap-stop h-screen flex items-center" style={{ scrollSnapAlign: 'start' }}>
        <AspectRatio ratio={18 / 9}>
          <div className="absolute top-0 left-0 w-full h-full">
            {/* Background image with gradient overlay */}
            <div className="w-full h-full relative">
              <img
                src="/images/frontpage/pexels-pixabay-265216.jpg"
                alt="Farm landscape"
                className="w-full h-full object-cover object-center absolute top-0 left-0 z-0 [transform:translateZ(0px)] [will-change:transform]"
                loading="eager"
                onError={(e) => {
                  // Fallback handling if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              {/* Gradient overlay for better text readability using Tailwind */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-10"></div>
              {/* Text overlay - positioned above gradient */}
              <div className="absolute inset-0 flex items-end justify-start text-white z-30 pl-30 pb-30">
                <motion.div
                  className="text-left"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                >
                  <motion.h2
                    className="text-7xl font-light"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                  >
                    Grown Here,
                  </motion.h2>
                  <motion.h1
                    className="text-[164px] leading-none font-bold text-primary"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                  >
                    For You.
                  </motion.h1>
                </motion.div>
              </div>
            </div>
          </div>
        </AspectRatio>
      </section>

        {/* Split Layout Section - Cooperatives of Farmers */}
        <section id="explore" className="py-40 px-4 bg-gray-50 relative z-10 snap-start snap-always snap-stop h-screen flex items-center">
        <div className="max-w-[90vw] mx-auto">
          <div className="grid grid-cols-1 gap-12 items-center lg:grid-cols-2">
            {/* Left Side - Content */}
            <motion.div
              className="flex flex-col gap-6"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <motion.h2
                className="text-6xl text-primary font-extrabold mb-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                SMMC Cooperative
              </motion.h2>
              <motion.h3
                className="text-4xl text-foreground font-semibold mb-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                Empowering Local Communities Through Sustainable Agriculture
              </motion.h3>
              <motion.p
                className="text-2xl text-muted-foreground mb-4 space-y-4 leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                Our network of farmer cooperatives represents the heart of sustainable agriculture in our region.
                We bring together dedicated farmers who share a commitment to quality, environmental stewardship,
                and community development. Through collective effort, we ensure that fresh, nutritious produce
                reaches your table while supporting the livelihoods of local farming families.
              </motion.p>

              {/* Stats */}
              <motion.div
                className="grid grid-cols-3 gap-6 pt-6 border-t border-border"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
                  viewport={{ once: true }}
                >
                  <div className="text-2xl font-bold text-primary mb-1 md:text-3xl">00</div>
                  <div className="text-sm text-primary font-medium md:text-base">Years Experience</div>
                </motion.div>
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
                  viewport={{ once: true }}
                >
                  <div className="text-2xl font-bold text-primary mb-1 md:text-3xl">00</div>
                  <div className="text-sm text-primary font-medium md:text-base">Active Farmers</div>
                </motion.div>
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.7, ease: "easeOut" }}
                  viewport={{ once: true }}
                >
                  <div className="text-2xl font-bold text-primary mb-1 md:text-3xl">00</div>
                  <div className="text-sm text-primary font-medium md:text-base">Cooperatives</div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Side - Image with AspectRatio */}
            <motion.div
              className="w-full"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <AspectRatio ratio={4 / 3} className="rounded-xl overflow-hidden shadow-lg">
                {/* Stock image placeholder - replace with actual cooperative/farm image */}
                <div className="w-full h-full bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center">
                  <div className="text-white text-center p-8">
                    <div className="text-2xl font-semibold mb-2">SMMC Letters Pic</div>
                  </div>
                </div>
              </AspectRatio>
            </motion.div>
          </div>
        </div>
      </section>

        {/* Product Carousel Section */}
        <section id="produce" className="py-18 bg-white overflow-hidden relative z-10 snap-start snap-always snap-stop h-screen flex items-center">
        <div className="container mx-auto my-10 p-20">
          <motion.h2
            className="text-6xl font-bold text-center text-primary mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            Featured Products
          </motion.h2>
          <motion.div
            className="relative overflow-visible"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <Carousel
              opts={{
                align: "center",
                loop: true,
                skipSnaps: false,
                dragFree: false,
              }}
              plugins={[
                Autoplay({
                  delay: 3000,
                }),
              ]}
              setApi={handleCarouselApi}
              className="w-full max-w-6xl mx-auto"
            >
              <CarouselContent className={`[&>*]:transition-all [&>*]:duration-500 [&>*]:ease-out -ml-4 [perspective:1000px] overflow-visible mx-0 -mx-8 p-20`}>
                {featuredProducts.map((product, index) => {
                  const isActive = index === currentSlide;
                  const isLeft = index < currentSlide;
                  const isRight = index > currentSlide;

                  return (
                    <CarouselItem key={product.id} className="basis-1/3 pl-4">
                      <div className="relative [transform-style:preserve-3d]">
                        <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-500 ease-out relative [transform-style:preserve-3d] ${isActive
                          ? `scale-150 shadow-2xl z-30 translate-y-0 blur-none opacity-100 [transform:translateZ(0px)_rotateY(0deg)]`
                          : isLeft
                            ? `scale-80 opacity-20 z-10 translate-x-12 -translate-y-6 blur-sm [transform:translateZ(-100px)_rotateY(25deg)]`
                            : isRight
                              ? `scale-80 opacity-20 z-10 -translate-x-12 -translate-y-6 blur-sm [transform:translateZ(-100px)_rotateY(-25deg)]`
                              : 'scale-80 opacity-20 z-10 blur-md'
                          }`}>
                          <div className="h-48 bg-white flex items-center justify-center overflow-hidden">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img
                                src="/storage/products/default-product.jpg"
                                alt="Default product"
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="p-4 flex items-center justify-between">
                            <h3 className="font-semibold text-lg text-primary">{product.name}</h3>
                            <p className="text-primary font-bold ml-4 whitespace-nowrap">
                              {getDisplayPrice(product)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="bg-transparent text-primary hover:bg-primary hover:text-white border-transparent hover:border-primary transition-all duration-300 ease-in-out" />
              <CarouselNext className="bg-transparent text-primary hover:bg-primary hover:text-white border-transparent hover:border-primary transition-all duration-300 ease-in-out" />
            </Carousel>
          </motion.div>
          <motion.div
            className="text-center mb-8 mt-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <button
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
              onClick={() => router.visit('/customer/produce')}
            >
              Show All Produce
            </button>
          </motion.div>

          <div className="container mx-auto sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
              {featureCardsData.map((card, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                  viewport={{ once: true }}
                  className="group relative"
                >
                  {/* Main card */}
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm rounded-2xl border-2 border-primary/20 px-8 py-6 shadow-lg transition-all duration-500 ease-in-out hover:shadow-2xl hover:-translate-y-2 hover:border-primary/40 hover:from-primary/20 hover:to-primary/10 min-w-fit">
                    <div className="flex items-center gap-4">
                      {/* Icon container with gradient background */}
                      <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:shadow-xl">
                        <span className="text-2xl">{card.icon}</span>
                      </div>
                      
                      {/* Title */}
                      <div className="flex flex-col">
                        <h3 className="text-xl font-bold text-primary transition-all duration-500 ease-in-out group-hover:text-primary/90 whitespace-nowrap">
                          {card.title}
                        </h3>
                        <div className="w-full h-1 bg-gradient-to-r from-primary to-transparent rounded-full mt-1 transition-all duration-500 ease-in-out group-hover:from-primary/80"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out"></div>
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-primary/30 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

        {/* Testimonial Section with Parallax */}
        <section className="snap-start snap-always snap-stop h-screen flex items-center">
          <TestimonialSlider
            testimonials={testimonialData}
            parallaxImage="/images/frontpage/pexels-pixabay-265216.jpg"
            autoplayInterval={6500}
          />
        </section>

      {/* Login Confirmation Dialog */}
      <Dialog open={showLoginConfirm} onOpenChange={setShowLoginConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You must be logged in to add products to your cart.
            </DialogDescription>
            <div className="flex gap-4 mt-4">
              <Button className="w-full" onClick={() => router.visit('/login')}>Go to Login</Button>
              <Button variant="secondary" className="w-full" onClick={() => setShowLoginConfirm(false)}>Cancel</Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>

        {/* Footer */}
        <div className="relative z-20 w-full snap-start snap-always snap-stop">
          <Footer
            companyName="SMMC Cooperative"
            facebookUrl="https://facebook.com/smmccooperative"
            emailAddress="contact@smmccooperative.com"
            physicalAddress="Cabuyao, Laguna, Philippines"
            navigationLinks={[
              { title: "Privacy Policy", href: "/privacy" },
              { title: "Terms of Service", href: "/terms" }
            ]}
          />
        </div>
      </div>
    </AppHeaderLayout>
  );
}
