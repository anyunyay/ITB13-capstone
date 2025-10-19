import React from 'react';
import { Link } from '@inertiajs/react';
import { Facebook, Mail, MapPin } from 'lucide-react';
import styles from './Footer.module.css';

/**
 * Footer Component Props Interface
 * 
 * @interface FooterProps
 * @property {string} companyName - The name of the company (default: "AgriCart")
 * @property {number} currentYear - The current year for copyright (default: current year)
 * @property {string} facebookUrl - Facebook page URL (default: "#")
 * @property {string} emailAddress - Contact email address (default: "contact@agricart.com")
 * @property {string} physicalAddress - Physical address (default: "123 Farm Street, Agriculture City")
 * @property {Array<{title: string, href: string}>} navigationLinks - Array of navigation links for footer
 * @property {string} className - Additional CSS classes for customization
 */
interface FooterProps {
  companyName?: string;
  currentYear?: number;
  facebookUrl?: string;
  emailAddress?: string;
  physicalAddress?: string;
  navigationLinks?: Array<{
    title: string;
    href: string;
  }>;
  className?: string;
}

/**
 * Footer Component
 * 
 * A clean, responsive, reusable React footer component featuring:
 * - Top section with social media, email, and address contact information
 * - Bottom section with copyright and navigation links
 * - Mobile-first responsive design
 * - Semantic HTML structure
 * - Accessibility features
 * 
 * @param {FooterProps} props - Component props
 * @returns {JSX.Element} Footer component
 * 
 * @example
 * // Basic usage
 * <Footer />
 * 
 * @example
 * // Custom configuration
 * <Footer 
 *   companyName="My Company"
 *   facebookUrl="https://facebook.com/mycompany"
 *   emailAddress="hello@mycompany.com"
 *   physicalAddress="456 Business Ave, City, State 12345"
 *   navigationLinks={[
 *     { title: "About", href: "/about" },
 *     { title: "Contact", href: "/contact" },
 *     { title: "Privacy", href: "/privacy" }
 *   ]}
 * />
 */
const Footer: React.FC<FooterProps> = ({
  companyName = "AgriCart",
  currentYear = new Date().getFullYear(),
  facebookUrl = "#",
  emailAddress = "contact@agricart.com",
  physicalAddress = "123 Farm Street, Agriculture City",
  navigationLinks = [
    { title: "About Us", href: "/about" },
    { title: "Contact", href: "/contact" },
    { title: "Privacy Policy", href: "/privacy" },
    { title: "Terms of Service", href: "/terms" }
  ],
  className = ""
}) => {
  return (
    <footer className={`${styles.footer} ${className}`} role="contentinfo">
      {/* Top Section - Contact Information */}
      <div className={styles.footerTop}>
        <div className={styles.footerContainer}>
          <div className={styles.contactSection}>
            <h3 className={styles.contactTitle}>Get In Touch</h3>
            <p className={styles.contactDescription}>
              Connect with us for fresh produce, questions, or to learn more about our cooperative.
            </p>
            
            {/* Contact Links Grid */}
            <div className={styles.contactLinks}>
              {/* Facebook Link */}
              <a 
                href={facebookUrl} 
                className={styles.contactLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit our Facebook page"
              >
                <div className={styles.contactIcon}>
                  <Facebook className={styles.icon} />
                </div>
                <div className={styles.contactInfo}>
                  <div className={styles.contactLabel}>Follow Us</div>
                  <div className={styles.contactValue}>Facebook</div>
                </div>
              </a>

              {/* Email Link */}
              <a 
                href={`mailto:${emailAddress}`}
                className={styles.contactLink}
                aria-label="Send us an email"
              >
                <div className={styles.contactIcon}>
                  <Mail className={styles.icon} />
                </div>
                <div className={styles.contactInfo}>
                  <div className={styles.contactLabel}>Email Us</div>
                  <div className={styles.contactValue}>{emailAddress}</div>
                </div>
              </a>

              {/* Address */}
              <div className={styles.contactLink}>
                <div className={styles.contactIcon}>
                  <MapPin className={styles.icon} />
                </div>
                <div className={styles.contactInfo}>
                  <div className={styles.contactLabel}>Visit Us</div>
                  <div className={styles.contactValue}>{physicalAddress}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Copyright and Navigation */}
      <div className={styles.footerBottom}>
        <div className={styles.footerContainer}>
          <div className={styles.footerBottomContent}>
            {/* Copyright */}
            <div className={styles.copyright}>
              <p className={styles.copyrightText}>
                © {currentYear} {companyName}. All rights reserved.
              </p>
            </div>

            {/* Navigation Links */}
            <nav className={styles.footerNavigation} aria-label="Footer navigation">
              <ul className={styles.navList}>
                {navigationLinks.map((link, index) => (
                  <li key={index} className={styles.navItem}>
                    <Link 
                      href={link.href}
                      className={styles.navLink}
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
