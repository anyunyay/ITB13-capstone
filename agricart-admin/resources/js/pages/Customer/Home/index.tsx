import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
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
import styles from './index.module.css';

interface PageProps {
  flash: {
    message?: string;
  };
  [key: string]: unknown;
}

export default function CustomerHome() {
  const [showLoginConfirm, setShowLoginConfirm] = useState(false);

  const handleRequireLogin = () => setShowLoginConfirm(true);

  return (
    <AppHeaderLayout>
      <Head title="Home - Cooperatives of Farmers" />
      <SystemLockOverlay />

      {/* Hero Section with Farm Image Placeholder */}
      <section className={styles.heroSection}>
        <AspectRatio ratio={19/9}>
          <div className={styles.heroImage}>
            {/* Placeholder for cooperative/farm image */}
            <div className="w-full h-full bg-gradient-to-b from-green-400 via-oklch-500 to-oklch-600 flex align-items-left relative">
              <div className="text-white text-left text-end place-self-end pl-30 pb-50 relative z-20">
                <h2 className="text-6xl font-light">Grown Here,</h2>
                <h1 className="text-9xl font-bold">For You.</h1>
              </div>
              <div className="absolute left-10 right-10 bottom-10 flex gap-8 z-20">
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
              onClick={() => router.visit('/products')}
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
              <h2 className={styles.splitTitle}>
                Cooperatives of Farmers
              </h2>
              <p className={styles.splitSubtitle}>
                Empowering Local Communities Through Sustainable Agriculture
              </p>
              <p className={styles.splitDescription}>
                Our network of farmer cooperatives represents the heart of sustainable agriculture in our region.
                We bring together dedicated farmers who share a commitment to quality, environmental stewardship,
                and community development. Through collective effort, we ensure that fresh, nutritious produce
                reaches your table while supporting the livelihoods of local farming families.
              </p>
              <p className={styles.splitDescription}>
                Each cooperative operates with transparency, fair trade practices, and a deep respect for the land.
                Our farmers use traditional methods combined with modern sustainable techniques to grow produce
                that's not only delicious but also environmentally responsible.
              </p>

              {/* Stats */}
              <div className={styles.splitStats}>
                <div className={styles.splitStat}>
                  <div className={styles.splitStatNumber}>25+</div>
                  <div className={styles.splitStatLabel}>Years Experience</div>
                </div>
                <div className={styles.splitStat}>
                  <div className={styles.splitStatNumber}>500+</div>
                  <div className={styles.splitStatLabel}>Active Farmers</div>
                </div>
                <div className={styles.splitStat}>
                  <div className={styles.splitStatNumber}>50+</div>
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
                    <div className={styles.splitImageIcon}>🚜</div>
                    <div className={styles.splitImageTitle}>Cooperative Farm Image</div>
                    <div className={styles.splitImageSubtitle}>Replace with actual stock image of farmers/cooperative</div>
                </div>
                </div>
                <div className={styles.splitImageOverlay}></div>
              </AspectRatio>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section - Inspired by the provided design */}
      <section id="produce" className={styles.featureSection}>
        <div className={styles.featureContainer}>
          <div className={styles.featureGrid}>
            {/* 100% Natural Card */}
            <div className={styles.featureCard}>
              <div className={styles.featureCardContent}>
                <div className={styles.featureIconContainer}>
                  <div className={styles.featureIcon}>
                    <span className={styles.featureIconText}>🌿</span>
                  </div>
                </div>
                <div className={styles.featureText}>
                  <h3 className={styles.featureTitle}>
                    <span className={styles.featureTitleItalic}>100%</span><br />
                    <span className={styles.featureTitleItalic}>Natural</span>
                  </h3>
                  <p className={styles.featureDescription}>
                    Our produce is grown using only natural methods, free from harmful chemicals and pesticides.
                    Every fruit and vegetable is carefully cultivated to maintain its natural flavor and nutritional value.
                  </p>
                </div>
              </div>
            </div>

            {/* Freshly Picked Card */}
            <div className={styles.featureCard}>
              <div className={styles.featureCardContent}>
                <div className={styles.featureIconContainer}>
                  <div className={styles.featureIcon}>
                    <span className={styles.featureIconText}>🛍️</span>
                  </div>
                </div>
                <div className={styles.featureText}>
                  <h3 className={styles.featureTitle}>
                    <span className={styles.featureTitleItalic}>Freshly</span><br />
                    <span className={styles.featureTitleItalic}>Picked</span>
                  </h3>
                  <p className={styles.featureDescription}>
                    Harvested at peak ripeness and delivered fresh to your doorstep. Our farmers pick produce
                    daily to ensure maximum freshness and optimal taste for your family.
                  </p>
                </div>
              </div>
            </div>

            {/* Cabuyao Grown Card */}
            <div className={styles.featureCard}>
              <div className={styles.featureCardContent}>
                <div className={styles.featureIconContainer}>
                  <div className={styles.featureIcon}>
                    <span className={styles.featureIconText}>🌱</span>
                  </div>
                </div>
                <div className={styles.featureText}>
                  <h3 className={styles.featureTitle}>
                    <span className={styles.featureTitleItalic}>Cabuyao</span><br />
                    <span className={styles.featureTitleItalic}>Grown</span>
                  </h3>
                  <p className={styles.featureDescription}>
                    Proudly grown in Cabuyao by local farmers who understand the land and climate.
                    Supporting our community while bringing you the finest locally-sourced produce.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* About Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>About Our Cooperatives</h2>
          <p className={styles.sectionSubtitle}>
            We are a network of dedicated farmer cooperatives working together to bring you the freshest,
            highest-quality produce while supporting sustainable farming practices and local communities.
          </p>

          <div className={styles.aboutGrid}>
            <div className={styles.aboutCard}>
              <div className={styles.aboutIcon}>
                <span className={styles.aboutIconText}>🌱</span>
              </div>
              <h3 className={styles.aboutTitle}>Sustainable Farming</h3>
              <p className={styles.aboutDescription}>
                Our cooperatives follow eco-friendly practices that protect the environment
                while ensuring the highest quality produce.
              </p>
            </div>

            <div className={styles.aboutCard}>
              <div className={styles.aboutIcon}>
                <span className={styles.aboutIconText}>🤝</span>
              </div>
              <h3 className={styles.aboutTitle}>Community Support</h3>
              <p className={styles.aboutDescription}>
                By purchasing from our cooperatives, you directly support local farmers
                and strengthen rural communities.
              </p>
            </div>

            <div className={styles.aboutCard}>
              <div className={styles.aboutIcon}>
                <span className={styles.aboutIconText}>🚚</span>
              </div>
              <h3 className={styles.aboutTitle}>Fresh Delivery</h3>
              <p className={styles.aboutDescription}>
                From farm to your table in the shortest time possible, ensuring maximum
                freshness and nutritional value.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className={styles.statsSection}>
          <h2 className={styles.statsTitle}>Our Impact</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>500+</div>
              <div className={styles.statLabel}>Active Farmers</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>50+</div>
              <div className={styles.statLabel}>Cooperatives</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>1000+</div>
              <div className={styles.statLabel}>Happy Customers</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>25+</div>
              <div className={styles.statLabel}>Product Varieties</div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>Ready to Support Local Farmers?</h2>
          <p className={styles.ctaDescription}>
            Join thousands of customers who choose fresh, local produce while making a positive impact
            on farming communities.
          </p>
          <div className={styles.ctaButtons}>
            <button
              className={styles.primaryButton}
              onClick={() => router.visit('/products')}
            >
              Shop Fresh Produce
            </button>
            <button
              className={styles.secondaryButton}
              onClick={() => router.visit('/about')}
            >
              Learn More About Us
            </button>
          </div>
        </section>
      </main>

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
    </AppHeaderLayout>
  );
}
