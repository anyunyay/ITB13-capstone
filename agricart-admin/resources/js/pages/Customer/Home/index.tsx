import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
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
import { SystemLockOverlay } from '@/components/system-lock-overlay';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { FeatureCards } from '@/components/FeatureCards';
import Footer from '@/components/Footer';
import Autoplay from 'embla-carousel-autoplay';
import styles from './index.module.css';

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

  const handleRequireLogin = () => setShowLoginConfirm(true);

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
      title: '100% Natural',
      description: 'Our produce is grown using only natural methods, free from harmful chemicals and pesticides.'
    },
    {
      icon: '🛍️',
      title: 'Freshly Picked',
      description: 'Harvested at peak ripeness and delivered fresh to your doorstep.'
    },
    {
      icon: '🌱',
      title: 'Cabuyao Grown',
      description: 'Proudly grown in Cabuyao by local farmers who understand the land and climate.'
    }
  ];

  return (
    <AppHeaderLayout>
      <Head title="Home - Cooperatives of Farmers" />
      <SystemLockOverlay />

      {/* Hero Section with Farm Image */}
      <section className={styles.heroSection}>
        <AspectRatio ratio={19/9}>
          <div className={styles.heroImage}>
            {/* Background image with gradient overlay */}
            <div className="w-full h-full relative">
              <div className="w-full h-full bg-gradient-to-b from-neutral-100 via-oklch-300 to-oklch-400">
                <img 
                  src="/images/frontpage/pexels-pixabay-265216.jpg" 
                  alt="Farm landscape" 
                  className="w-full h-full object-cover mix-blend-multiply"
                />
              </div>
              {/* Text overlay - no gradient applied */}
              <div className="absolute inset-0 flex items-end justify-start text-white z-30 pl-30 pb-50">
                <div className="text-left">
                  <h2 className="text-6xl font-light">Grown Here,</h2>
                  <h1 className="text-9xl font-bold text-green-600">For You.</h1>
                </div>
              </div>
              <div className="absolute left-10 right-10 bottom-10 flex gap-8 z-40">
                <Button size="lg" className="group relative border-0 rounded-none bg-transparent text-white text-3xl font-light w-full hover:bg-transparent hover:text-white pb-6" onClick={() => document.getElementById('produce')?.scrollIntoView({ behavior: 'smooth' })}>
                  VIEW PRODUCE
                  <div className="absolute bottom-0 left-0 w-full h-2 rounded bg-white transition-colors group-hover:bg-green-600"></div>
                </Button>
                <Button variant="outline" size="lg" className="group relative border-0 rounded-none bg-transparent text-white text-3xl font-light w-full hover:bg-transparent hover:text-white pb-6" onClick={() => document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' })}>
                  EXPLORE
                  <div className="absolute bottom-0 left-0 w-full h-2 rounded bg-white transition-colors group-hover:bg-green-600"></div>
                </Button>
              </div>
            </div>
          </div>
        </AspectRatio>
        <div className={styles.heroOverlay}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Cooperatives of Farmers
            </h1>
            <p className={styles.heroSubtitle}>
              Connecting communities with fresh, locally-sourced produce from trusted farmer cooperatives
            </p>
            <button
              className={styles.heroCta}
              onClick={() => router.visit('/customer/produce')}
            >
              Explore Our Products
            </button>
          </div>
        </div>
      </section>

      {/* Split Layout Section - Cooperatives of Farmers */}
      <section id="explore" className={styles.splitSection}>
        <div className={styles.splitContainer}>
          <div className={styles.splitContent}>
            {/* Left Side - Content */}
            <div className={styles.splitText}>
              <h2 className="text-6xl text-green-700 font-extrabold mb-4">
                SMMC Cooperative
              </h2>
              <p className="text-4xl text-gray-800 font-semibold mb-6">
                Empowering Local Communities Through Sustainable Agriculture
              </p>
              <p className="text-2xl text-gray-600 mb-4 space-y-4 leading-relaxed">
                Our network of farmer cooperatives represents the heart of sustainable agriculture in our region.
                We bring together dedicated farmers who share a commitment to quality, environmental stewardship,
                and community development. Through collective effort, we ensure that fresh, nutritious produce
                reaches your table while supporting the livelihoods of local farming families.
              </p>

              {/* Stats */}
              <div className={styles.splitStats}>
                <div className={styles.splitStat}>
                  <div className={styles.splitStatNumber}>00</div>
                  <div className={styles.splitStatLabel}>Years Experience</div>
                </div>
                <div className={styles.splitStat}>
                  <div className={styles.splitStatNumber}>00</div>
                  <div className={styles.splitStatLabel}>Active Farmers</div>
                </div>
                <div className={styles.splitStat}>
                  <div className={styles.splitStatNumber}>00</div>
                  <div className={styles.splitStatLabel}>Cooperatives</div>
                </div>
              </div>
            </div>

            {/* Right Side - Image with AspectRatio */}
            <div className={styles.splitImageContainer}>
              <AspectRatio ratio={4 / 3} className={styles.splitImage}>
                {/* Stock image placeholder - replace with actual cooperative/farm image */}
                <div className={styles.splitImagePlaceholder}>
                  <div className={styles.splitImageContent}>
                    <div className={styles.splitImageTitle}>SMMC Letters Pic</div>
                </div>
                </div>
                <div className={styles.splitImageOverlay}></div>
              </AspectRatio>
            </div>
          </div>
        </div>
      </section>

      {/* Product Carousel Section */}
      <section id="produce" className="py-18 bg-gray-50 overflow-hidden">
        <div className="container mx-auto my-10">
          <h3 className="text-6xl font-bold text-center text-green-700 mb-8">Featured Products</h3>
          <div className={`relative ${styles.carouselContainer}`}>
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
            <CarouselContent className={`[&>*]:transition-all [&>*]:duration-500 [&>*]:ease-out -ml-4 ${styles.perspective1000} ${styles.carouselContent}`}>
              {featuredProducts.map((product, index) => {
                const isActive = index === currentSlide;
                const isLeft = index < currentSlide;
                const isRight = index > currentSlide;
                
                return (
                  <CarouselItem key={product.id} className="basis-1/3 pl-4">
                    <div className={`relative ${styles.transformGpu}`}>
                      <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-500 ease-out relative ${styles.transformGpu} ${
                        isActive 
                          ? `scale-150 shadow-2xl z-30 transform translate-y-0 ${styles.translateZ0} ${styles.rotateY0} blur-none opacity-100` 
                          : isLeft
                          ? `scale-80 opacity-20 z-10 transform translate-x-12 -translate-y-6 ${styles.translateZNeg100} ${styles.rotateY25} blur-sm`
                          : isRight
                          ? `scale-80 opacity-20 z-10 transform -translate-x-12 -translate-y-6 ${styles.translateZNeg100} ${styles.rotateYNeg25} blur-sm`
                          : 'scale-80 opacity-20 z-10 blur-md'
                      }`}>
                      <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
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
                        <h3 className="font-semibold text-lg text-green-700">{product.name}</h3>
                        <p className="text-green-600 font-bold ml-4 whitespace-nowrap">
                          {getDisplayPrice(product)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="bg-transparent text-green-700 hover:bg-green-700 hover:text-white border-transparent hover:border-green-700 transition-all duration-300 ease-in-out" />
            <CarouselNext className="bg-transparent text-green-700 hover:bg-green-700 hover:text-white border-transparent hover:border-green-700 transition-all duration-300 ease-in-out" />
          </Carousel>
          </div>
        </div>
        <div className="text-center mb-8 mt-4">
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            onClick={() => router.visit('/customer/produce')}
          >
            Show All Produce
          </button>
        </div>
        <FeatureCards cards={featureCardsData} />
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
    </AppHeaderLayout>
  );
}
