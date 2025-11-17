import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Leaf, Users, Truck, Shield, Globe } from 'lucide-react';
import Footer from '@/components/shared/layout/Footer';
import styles from './aboutUs.module.css';

interface PageProps {
  flash: {
    message?: string;
  };
  [key: string]: unknown;
}

export default function AboutUs({ }: PageProps) {
  const t = useTranslation();
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
      title: t('customer.sustainability'),
      description: t('customer.sustainability_desc')
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: t('customer.community'),
      description: t('customer.community_desc')
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: t('customer.quality'),
      description: t('customer.quality_desc')
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: t('customer.local_focus'),
      description: t('customer.local_focus_desc')
    }
  ];

  // What we do data
  const services = [
    {
      icon: <Truck className="w-12 h-12" />,
      title: t('customer.fresh_produce_sourcing'),
      description: t('customer.fresh_produce_sourcing_desc'),
      image: "/images/frontpage/pexels-pixabay-265216.jpg",
      parallaxSpeed: 0.1
    },
    {
      icon: <Heart className="w-12 h-12" />,
      title: t('customer.cooperative_support'),
      description: t('customer.cooperative_support_desc'),
      image: "/images/frontpage/pexels-pixabay-265216.jpg",
      parallaxSpeed: 0.1
    },
    {
      icon: <Shield className="w-12 h-12" />,
      title: t('customer.quality_assurance'),
      description: t('customer.quality_assurance_desc'),
      image: "/images/frontpage/pexels-pixabay-265216.jpg",
      parallaxSpeed: 0.1
    }
  ];

  return (
    <AppHeaderLayout>
      <Head title="About Us - SMMC Cooperative" />

      {/* Hero Section - Fixed outside scroll container */}
      <section className="fixed top-0 left-0 w-full h-screen z-0">
        {/* Background image layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/frontpage/pexels-pixabay-265216.jpg)',
            willChange: 'transform',
            transform: 'translateZ(0)'
          }}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-10" />
        
        {/* Content overlay - Mobile: centered, Desktop: bottom-left */}
        <div className="absolute inset-0 flex items-center justify-center lg:items-end lg:justify-start text-white z-20 px-4 lg:pl-30 lg:pb-30">
          <motion.div
            className="text-center lg:text-left"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.h2
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              {t('customer.many_roots')}
            </motion.h2>
            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl leading-none font-bold text-primary"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              {t('customer.one_bloom')}
            </motion.h1>
            <motion.p
              className="text-base md:text-xl lg:text-xl xl:text-2xl font-light mb-2 max-w-xs sm:max-w-2xl lg:max-w-4xl leading-relaxed mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            >
              {t('customer.about_us_tagline')}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            >
              <Button
                size="lg"
                className={`${styles.buttonGradient} text-primary-foreground px-4 sm:px-6 lg:px-7 xl:px-8 py-2 sm:py-3 lg:py-3.5 xl:py-4 text-base md:text-base lg:text-base xl:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300`}
                onClick={() => document.getElementById('who-we-are')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <span className="hidden sm:inline">{t('customer.learn_more_about_us')}</span>
                <span className="sm:hidden">{t('customer.learn_more')}</span>
              </Button>
            </motion.div>
          </motion.div>
        </div>
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
                <h2 className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-primary mb-4 sm:mb-6">
                  {t('customer.who_we_are')}
                </h2>
                <div className="space-y-3 sm:space-y-4 lg:space-y-5 xl:space-y-6 text-base md:text-xl lg:text-xl xl:text-2xl text-muted-foreground leading-relaxed">
                  <p>
                    {t('customer.who_we_are_desc_1')}
                  </p>
                  <p>
                    {t('customer.who_we_are_desc_2')}
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
                <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[400px] rounded-2xl overflow-hidden shadow-2xl">
                  <div className="w-full h-full bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center">
                    <div className="text-white text-center p-4 sm:p-6 lg:p-8">
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-4">SMMC Cooperative</div>
                      <div className="text-sm sm:text-base lg:text-lg">Local Farmers Working Together</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Vision & Values Section */}
        <section ref={valuesRef} className="h-screen flex items-center justify-center bg-background relative overflow-hidden snap-start py-6 sm:py-8 lg:py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="text-center mb-6 sm:mb-8 lg:mb-10"
            >
              <motion.h2
                className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-primary mb-3 sm:mb-4 lg:mb-4.5 xl:mb-5"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                {t('customer.our_vision_values')}
              </motion.h2>
              <motion.p
                className="text-base md:text-xl lg:text-xl xl:text-2xl text-muted-foreground max-w-3xl mx-auto leading-snug px-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                {t('customer.vision_values_desc')}
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-4">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                  viewport={{ once: true }}
                >
                  <Card className={`h-full text-center ${styles.cardHover} ${styles.hoverLift}`}>
                    <CardHeader className="pb-2 pt-3 sm:pt-4 lg:pt-4">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-11 xl:w-12 lg:h-11 xl:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 text-primary ${styles.iconBounce}`}>
                        {value.icon}
                      </div>
                      <CardTitle className="text-2xl md:text-3xl lg:text-3xl xl:text-4xl font-bold text-primary">
                        {value.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3 sm:pb-4 lg:pb-4 px-2 sm:px-1">
                      <p className="text-sm md:text-base lg:text-xl xl:text-2xl text-muted-foreground leading-relaxed">
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
        <section ref={missionRef} className="h-screen flex items-center justify-center py-12 sm:py-16 lg:py-20 bg-background relative overflow-hidden snap-start">
          <div className="max-w-[90vw] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            {/* New Image and Content Layout */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center w-full"
            >
              {/* Left Side - Overlapping Images */}
              <motion.div
                className="relative h-80 sm:h-96 md:h-[450px] lg:h-[650px]"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                {/* Bottom Image - Portrait (Background) - Hidden on mobile/tablet */}
                <motion.div
                  className="hidden lg:block absolute bottom-0 right-0 z-10 w-7/10 h-[450px]"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                  viewport={{ once: true }}
                >
                  <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src="/images/frontpage/pexels-pixabay-265216.jpg"
                      alt="Community farmers working together"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                </motion.div>

                {/* Top Image - Landscape (Foreground) - Full width on mobile/tablet */}
                <motion.div
                  className="relative lg:absolute top-0 left-0 z-20 w-full lg:w-9/10 h-full lg:h-80"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                  viewport={{ once: true }}
                >
                  <div className="w-full h-full rounded-2xl overflow-hidden shadow-xl">
                    <img
                      src="/images/frontpage/pexels-pixabay-265216.jpg"
                      alt="Sustainable farming practices"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                </motion.div>
              </motion.div>

              {/* Right Side - Content */}
              <motion.div
                className="space-y-6 sm:space-y-8 lg:space-y-10"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <motion.h2
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-primary"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                  viewport={{ once: true }}
                >
                  {t('customer.agriculture_excellence')}
                </motion.h2>
                <motion.p
                  className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl text-muted-foreground leading-relaxed"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
                  viewport={{ once: true }}
                >
                  {t('customer.agriculture_excellence_desc')}
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
            <div className="space-y-4 sm:space-y-6">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  viewport={{ once: true }}
                  className={`max-w-[90vw] max-h-[45vh] mx-auto grid grid-cols-1 bg-primary lg:grid-cols-2 gap-4 sm:gap-8 lg:gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                    }`}
                >
                  {/* Image/Visual with Parallax */}
                  <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                    <div className="w-full h-24 sm:h-40 md:h-48 lg:h-56 overflow-hidden shadow-lg relative">
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
                    </div>
                  </div>

                  {/* Content */}
                  <div className={index % 2 === 1 ? 'lg:col-start-1 mx-3 sm:mx-8 md:mx-12 lg:mx-16 xl:mx-20' : 'mx-3 sm:mx-8 md:mx-12 lg:mx-16 xl:mx-20'}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-4 mb-1 sm:mb-2">
                      <div className={`w-8 h-8 sm:w-14 sm:h-14 lg:w-15 xl:w-16 lg:h-15 xl:h-16 bg-primary/10 rounded-full flex items-center justify-center text-popover-foreground ${styles.iconBounce}`}>
                        {service.icon}
                      </div>
                      <h3 className="text-lg sm:text-3xl md:text-3xl lg:text-3xl xl:text-4xl font-bold text-popover-foreground">
                        {service.title}
                      </h3>
                    </div>
                    <p className="text-sm sm:text-xl md:text-xl lg:text-xl xl:text-2xl text-popover-foreground mb-2 sm:mb-6 leading-relaxed">
                      {service.description}
                    </p>
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
