import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
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
  const valuesRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);

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

    return () => observer.disconnect();
  }, []);

  // Values data
  const values = [
    {
      icon: <Leaf className="w-8 h-8" />,
      title: "Sustainability",
      description: "We prioritize eco-friendly farming practices that protect our environment for future generations while maintaining soil health and biodiversity."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community",
      description: "Building strong relationships with local farmers and customers, fostering a supportive network that benefits everyone in our community."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Quality",
      description: "Committed to delivering the highest quality produce through careful selection, proper handling, and maintaining freshness from farm to table."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Local Focus",
      description: "Supporting local farmers and reducing our carbon footprint by sourcing produce from nearby farms and minimizing transportation distances."
    }
  ];

  // What we do data
  const services = [
    {
      icon: <Truck className="w-12 h-12" />,
      title: "Fresh Produce Sourcing",
      description: "We work directly with local farmers to source the freshest, highest-quality produce. Our network includes certified organic farms and traditional family farms that share our commitment to sustainable agriculture.",
      features: ["Direct farmer partnerships", "Quality assurance", "Seasonal variety", "Fair trade practices"]
    },
    {
      icon: <Heart className="w-12 h-12" />,
      title: "Cooperative Support",
      description: "We provide comprehensive support to our farming cooperatives, including training, resources, and market access. Our goal is to strengthen the agricultural community and ensure fair compensation for farmers.",
      features: ["Farmer training programs", "Market access", "Financial support", "Community development"]
    },
    {
      icon: <Leaf className="w-12 h-12" />,
      title: "Sustainable Delivery",
      description: "Our delivery system is designed to minimize environmental impact while ensuring your produce arrives fresh and on time. We use eco-friendly packaging and optimize routes for efficiency.",
      features: ["Eco-friendly packaging", "Optimized delivery routes", "Freshness guarantee", "Carbon footprint reduction"]
    }
  ];

  return (
    <AppHeaderLayout>
      <Head title="About Us - SMMC Cooperative" />

      {/* Hero Section with Farm Image */}
      <section className="sticky top-0 z-0 w-full isolation-isolate">
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
              {/* Text overlay - positioned above gradient */}
              <div className="absolute inset-0 flex items-center justify-center text-white z-30 px-4">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-center max-w-6xl mx-auto"
                >
                  <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
                    About
                    <span className="block text-primary">SMMC Cooperative</span>
                  </h1>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light mb-8 max-w-4xl mx-auto leading-relaxed">
                    Empowering local communities through sustainable agriculture, 
                    fair trade, and fresh produce delivery.
                  </p>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                  >
                    <Button 
                      size="lg" 
                      className={`${styles.buttonGradient} text-primary-foreground px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300`}
                      onClick={() => document.getElementById('who-we-are')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      Learn More About Us
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </AspectRatio>
      </section>

      {/* Who We Are Section */}
      <section id="who-we-are" className={`py-20 bg-white ${styles.sectionDivider}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
                Who We Are
              </h2>
              <div className="space-y-4 sm:space-y-6 text-base sm:text-lg text-gray-700 leading-relaxed">
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
                <p>
                  Today, we're proud to support over 50 local farmers across the region, providing them with 
                  training, resources, and market access while delivering the freshest produce directly to 
                  your doorstep.
                </p>
              </div>
            </motion.div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="relative"
            >
              <AspectRatio ratio={4 / 3} className="rounded-2xl overflow-hidden shadow-2xl">
                <div className="w-full h-full bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center">
                  <div className="text-white text-center p-8">
                    <div className="text-3xl font-bold mb-4">SMMC Cooperative</div>
                    <div className="text-lg">Local Farmers Working Together</div>
                  </div>
                </div>
              </AspectRatio>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision & Values Section */}
      <section ref={valuesRef} className={`py-20 ${styles.sectionGradient}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4 sm:mb-6">
              Our Vision & Values
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              We believe in creating a sustainable future where local agriculture thrives, 
              communities are strengthened, and everyone has access to fresh, nutritious food.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
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
                    <CardTitle className="text-xl font-bold text-primary">
                      {value.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section ref={missionRef} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4 sm:mb-6">
              What We Do
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Our comprehensive approach to sustainable agriculture and community support 
              ensures fresh produce reaches your table while supporting local farmers.
            </p>
          </motion.div>

          <div className="space-y-12 sm:space-y-16">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                viewport={{ once: true }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                  index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}
              >
                {/* Content */}
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary ${styles.iconBounce}`}>
                      {service.icon}
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-primary">
                      {service.title}
                    </h3>
                  </div>
                  <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3 text-gray-700">
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Image/Visual */}
                <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                  <AspectRatio ratio={4 / 3} className="rounded-2xl overflow-hidden shadow-lg">
                    <div className="w-full h-full bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center">
                      <div className="text-white text-center p-8">
                        <div className="text-2xl font-bold mb-2">{service.title}</div>
                        <div className="text-sm opacity-90">Illustration Placeholder</div>
                      </div>
                    </div>
                  </AspectRatio>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className={`py-20 bg-gradient-to-br from-primary to-primary/80 text-white ${styles.heroGradient}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Join Our Community
            </h2>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 leading-relaxed px-4">
              Whether you're a farmer looking to join our cooperative or a customer 
              seeking fresh, local produce, we'd love to connect with you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              >
                Become a Member
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg font-semibold"
              >
                Shop Fresh Produce
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
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
    </AppHeaderLayout>
  );
}
