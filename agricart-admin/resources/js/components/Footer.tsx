import React from 'react';
import { Link } from '@inertiajs/react';
import { Facebook, Mail, MapPin } from 'lucide-react';

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
    <footer className={`bg-gradient-to-br from-gray-800 to-gray-700 text-gray-50 mt-auto relative z-20 ${className}`} role="contentinfo">
      {/* Top Section - Contact Information */}
      <div className="py-12 md:py-16 lg:py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 text-white">Get In Touch</h3>
            <p className="text-base md:text-lg lg:text-xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Connect with us for fresh produce, questions, or to learn more about our cooperative.
            </p>
            
            {/* Contact Links Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 w-full max-w-5xl mx-auto">
              {/* Facebook Link */}
              <a 
                href={facebookUrl} 
                className="flex items-center gap-4 p-4 md:p-6 lg:p-8 bg-white/5 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 hover:shadow-lg text-inherit no-underline"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit our Facebook page"
              >
                <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-green-600/10 rounded-lg flex-shrink-0">
                  <Facebook className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-green-500" />
                </div>
                <div className="flex flex-col text-left flex-1">
                  <div className="text-sm md:text-base text-gray-400 mb-1 font-medium">Follow Us</div>
                  <div className="text-base md:text-lg lg:text-xl text-white font-semibold break-words">Facebook</div>
                </div>
              </a>

              {/* Email Link */}
              <a 
                href={`mailto:${emailAddress}`}
                className="flex items-center gap-4 p-4 md:p-6 lg:p-8 bg-white/5 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 hover:shadow-lg text-inherit no-underline"
                aria-label="Send us an email"
              >
                <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-green-600/10 rounded-lg flex-shrink-0">
                  <Mail className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-green-500" />
                </div>
                <div className="flex flex-col text-left flex-1">
                  <div className="text-sm md:text-base text-gray-400 mb-1 font-medium">Email Us</div>
                  <div className="text-base md:text-lg lg:text-xl text-white font-semibold break-words">{emailAddress}</div>
                </div>
              </a>

              {/* Address */}
              <div className="flex items-center gap-4 p-4 md:p-6 lg:p-8 bg-white/5 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-green-600/10 rounded-lg flex-shrink-0">
                  <MapPin className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-green-500" />
                </div>
                <div className="flex flex-col text-left flex-1">
                  <div className="text-sm md:text-base text-gray-400 mb-1 font-medium">Visit Us</div>
                  <div className="text-base md:text-lg lg:text-xl text-white font-semibold break-words">{physicalAddress}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Copyright and Navigation */}
      <div className="py-6 md:py-8 lg:py-10 bg-black/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            {/* Copyright */}
            <div className="order-2 md:order-1">
              <p className="text-sm text-gray-400 m-0">
                © {currentYear} {companyName}. All rights reserved.
              </p>
            </div>

            {/* Navigation Links */}
            <nav className="order-1 md:order-2 md:ml-auto" aria-label="Footer navigation">
              <ul className="flex flex-wrap justify-center md:justify-end gap-6 lg:gap-8 list-none m-0 p-0">
                {navigationLinks.map((link, index) => (
                  <li key={index} className="m-0">
                    <Link 
                      href={link.href}
                      className="text-sm md:text-base text-gray-300 no-underline font-medium transition-colors duration-200 py-1 border-b border-transparent hover:text-green-500 hover:border-green-500"
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
