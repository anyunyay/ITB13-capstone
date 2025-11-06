import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState, useCallback } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Leaf, Users, Truck, Shield, Globe } from 'lucide-react';
import Footer from '@/components/Footer';
import styles from './aboutUs.module.css';

interface PageProps {
  flash: {
    message?: string;
  };
  [key: string]: unknown;
}

export default function AboutUs({ }: PageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const valuesRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);

  // Throttled scroll handler for better performance
  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY);
  }, []);

  // Scroll listener for parallax effects with throttling
  useEffect(() => {
    let ticking = false;

    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [handleScroll]);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (valuesRef.current) observer.observe(valuesRef.current);
    if (missionRef.current) observer.observe(missionRef.current);
    if (servicesRef.current) observer.observe(servicesRef.current);

    return () => observer.disconnect();
  }, []);

  // Values data
  const values = [
    {
      icon: <Leaf className="w-8 h-8" />,
      title: "Sustainability",
      description: "We prioritize eco-friendly farming practices that protect the environment while maintaining soil health and biodiversity."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community",
      description: "We build strong relationships with farmers and customers, fostering a supportive network that benefits the whole community."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Quality",
      description: "Committed to delivering top-quality produce through careful selection, handling, and maintaining freshness."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Local Focus",
      description: "Supporting local farmers and reducing our carbon footprint by sourcing from nearby farms."
    }
  ];

  // What we do data
  const services = [
    {
      icon: <Truck className="w-12 h-12" />,
      title: "Fresh Produce Sourcing",
      description: "We work directly with local farmers to source the freshest, highest-quality produce.",
      image: "/images/frontpage/pexels-pixabay-265216.jpg",
      parallaxSpeed: 0.1
    },
    {
      icon: <Heart className="w-12 h-12" />,
      title: "Cooperative Support",
      description: "We provide comprehensive support to our farming cooperatives, including training and market access.",
      image: "/images/frontpage/pexels-pixabay-265216.jpg",
      parallaxSpeed: 0.1
    },
    {
      icon: <Shield className="w-12 h-12" />,
      title: "Quality Assurance",
      description: "We ensure all products meet the highest standards through rigorous quality control and testing.",
      image: "/images/frontpage/pexels-pixabay-265216.jpg",
      parallaxSpeed: 0.1
    }
  ];

  return (
    <AppHeaderLayout>
      <Head title="About Us - SMMC Cooperative" />

      {/* Hero Section - Fixed outside scroll container */}
      <section className="fixed top-0 left-0 w-full h-screen z-0">
        <AspectRatio ratio={18 / 9}>
          <div className="absolute top-0 left-0 w-full h-full">
            {/* Background image with gradient overlay */}
            <div className="w-full h-full relative">
              <img
                src="/images/frontpage/pexels-pixabay-265216.jpg"
                alt="About SMMC Cooperative"
                className="w-full h-full object-cover object-center absolute top-0 left-0 z-0 [transform:translateZ(0px)] [will-change:transform]"
                loading="eager"
                onError={(e) => {
                  // Fallback handling if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              {/* Gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-10"></div>

              {/* Text overlay - positioned above gradient - Responsive */}
              <div className="absolute inset-0 flex items-end justify-start text-white z-30 pl-4 pb-8 sm:pl-8 sm:pb-12 md:pl-16 md:pb-20 lg:pl-30 lg:pb-30">
                <motion.div
                  className="text-left"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                >
                  <motion.h2
                    className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-light"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                  >
                    Many Roots,
                  </motion.h2>
                  <motion.h1
                    className="text-4xl sm:text-6xl md:text-8xl lg:text-[164px] leading-none font-bold text-primary"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                  >
                    One Bloom.
                  </motion.h1>
                  <motion.p
                    className="text-sm sm:text-base md:text-lg lg:text-2xl font-light mb-6 sm:mb-10 lg:mb-15 max-w-xs sm:max-w-2xl lg:max-w-4xl leading-relaxed"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                  >
                    Empowering people through sustainable agriculture, fair trade, and fresh produce.
                  </motion.p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
                  className="absolute left-4 sm:left-8 md:left-16 lg:left-30 z-30"
                >
                  <Button
                    size="lg"
                    className={`${styles.buttonGradient} text-primary-foreground px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300`}
                    onClick={() => document.getElementById('who-we-are')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <span className="hidden sm:inline">Learn More About Us</span>
                    <span className="sm:hidden">Learn More</span>
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </AspectRatio>
      </section>

      {/* Scroll container with snap behavior - starts after Hero */}
      <div className="relative z-10 min-h-screen overflow-visible">
        {/* Spacer section to account for fixed Hero */}
        <section className="h-screen snap-start"></section>

        {/* Who We Are Section */}
        <section id="who-we-are" className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden snap-start py-8 sm:py-12 lg:py-0">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                viewport={{ once: true }}
                className="order-2 lg:order-1"
              >
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4 sm:mb-6">
                  Who We Are
                </h2>
                <div className="space-y-3 sm:space-y-4 lg:space-y-6 text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed">
                  <p>
                    SMMC Cooperative is a community-driven agricultural cooperative founded on the principles
                    of sustainability, fairness, and local empowerment. We bring together dedicated farmers,
                    passionate about growing the finest produce while protecting our environment.
                  </p>
                  <p>
                    Our story began with a simple vision: to create a direct connection between local farmers
                    and consumers, ensuring fair compensation for our agricultural partners while providing
                    fresh, nutritious food to our community.
                  </p>
                </div>
              </motion.div>

              {/* Image */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                viewport={{ once: true }}
                className="relative order-1 lg:order-2"
              >
                <AspectRatio ratio={4 / 3} className="rounded-2xl overflow-hidden shadow-2xl">
                  <div className="w-full h-full bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center">
                    <div className="text-white text-center p-4 sm:p-6 lg:p-8">
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-4">SMMC Cooperative</div>
                      <div className="text-sm sm:text-base lg:text-lg">Local Farmers Working Together</div>
                    </div>
                  </div>
                </AspectRatio>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Vision & Values Section */}
        <section ref={valuesRef} className="h-screen flex items-center justify-center bg-background relative overflow-hidden snap-start">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="text-center mb-8 sm:mb-12 lg:mb-16"
            >
              <motion.h2
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-3 sm:mb-4 lg:mb-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                Our Vision & Values
              </motion.h2>
              <motion.p
                className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                We build sustainable local agriculture that strengthens communities and delivers fresh, nutritious food.
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                  viewport={{ once: true }}
                >
                  <Card className={`h-full text-center ${styles.cardHover} ${styles.hoverLift}`}>
                    <CardHeader className="pb-4">
                      <div className={`w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary ${styles.iconBounce}`}>
                        {value.icon}
                      </div>
                      <CardTitle className="text-4xl font-bold text-primary">
                        {value.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl text-muted-foreground leading-relaxed">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Members Section */}
        <section ref={missionRef} className="h-screen flex items-center justify-center py-20 bg-background relative overflow-hidden snap-start">
          <div className="max-w-[90vw] mx-auto px-4 sm:px-6 lg:px-8">
            {/* New Image and Content Layout */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
            >
              {/* Left Side - Overlapping Images */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                {/* Bottom Image - Portrait/Square (Background) */}
                <motion.div
                  className="absolute -bottom-30 right-0 z-10 w-7/10"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                  viewport={{ once: true }}
                >
                  <AspectRatio ratio={4 / 5} className="rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src="/images/frontpage/pexels-pixabay-265216.jpg"
                      alt="Community farmers working together"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </AspectRatio>
                </motion.div>

                {/* Top Image - Landscape (Foreground) */}
                <motion.div
                  className="relative -bottom-50 right-5 z-20 w-9/10"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                  viewport={{ once: true }}
                >
                  <AspectRatio ratio={16 / 9} className="rounded-2xl overflow-hidden shadow-xl">
                    <img
                      src="/images/frontpage/pexels-pixabay-265216.jpg"
                      alt="Sustainable farming practices"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </AspectRatio>
                </motion.div>
              </motion.div>

              {/* Right Side - Content */}
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <motion.h2
                  className="text-6xl font-bold text-primary"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                  viewport={{ once: true }}
                >
                  Agriculture Excellence
                </motion.h2>
                <motion.p
                  className="text-2xl text-muted-foreground leading-relaxed"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
                  viewport={{ once: true }}
                >
                  We work directly with local farmers to source the freshest, highest-quality produce through sustainable farming practices that protect our environment and support our community.
                </motion.p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Services Section with Parallax - Outside scroll-snap container for free scrolling */}
        <section
          ref={servicesRef}
          className="h-[110vh] flex items-center justify-center bg-muted relative overflow-hidden snap-start"
          style={{
            backgroundImage: 'url(/images/frontpage/pexels-pixabay-265216.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}>
          {/* Background overlay for better content readability */}
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="max-w-[90vw] mx-auto relative z-10">
            <div className="space-y-4">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  viewport={{ once: true }}
                  className={`max-w-[90vw] max-h-[45vh] mx-auto grid grid-cols-1 bg-primary lg:grid-cols-2 gap-8 lg:gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                    }`}
                >
                  {/* Content */}
                  <div className={index % 2 === 1 ? 'lg:col-start-2 mx-20' : 'mx-20'}>
                    <div className="flex items-center gap-4 mb-2">
                      <div className={`w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-popover-foreground ${styles.iconBounce}`}>
                        {service.icon}
                      </div>
                      <h3 className="text-4xl font-bold text-popover-foreground">
                        {service.title}
                      </h3>
                    </div>
                    <p className="text-2xl text-popover-foreground mb-4 sm:mb-6 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Image/Visual with Parallax */}
                  <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                    <AspectRatio ratio={4 / 1} className="w-full overflow-hidden shadow-lg relative">
                      <motion.div
                        className="w-full h-full"
                        style={{
                          transform: `translate3d(0, ${(scrollY - (servicesRef.current?.offsetTop || 0)) * service.parallaxSpeed}px, 0)`,
                          willChange: 'transform'
                        }}
                      >
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        {/* Overlay for better text contrast if needed */}
                        <div className="absolute inset-0 bg-black/20"></div>
                      </motion.div>
                    </AspectRatio>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer - Outside scroll-snap container */}
        <div className="relative z-20 w-full">
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
