import React from 'react';
import { Link } from '@inertiajs/react';
import { Facebook, Mail, MapPin, Leaf } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

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
  const t = useTranslation();
  return (
    <footer className={`bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-foreground mt-auto relative z-20 overflow-hidden ${className}`} role="contentinfo">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-secondary rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-primary rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Top Section - Brand and Contact */}
        <div className="py-10 sm:py-12 md:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              
              {/* Left Column - Brand Section */}
              <div className="lg:col-span-5 space-y-6">
                {/* Logo and Company Name */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center shadow-lg">
                    <Leaf className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-foreground">{companyName}</h3>
                    <p className="text-sm text-secondary font-medium">{t('customer.fresh_from_farm')}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md">
                  {t('customer.footer_description')}
                </p>

                {/* Quick Stats or Badge */}
                <div className="flex flex-wrap gap-3">
                  <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-xs text-secondary font-semibold">{t('customer.percent_fresh')}</p>
                  </div>
                  <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-xs text-secondary font-semibold">{t('customer.locally_sourced')}</p>
                  </div>
                  <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-xs text-secondary font-semibold">{t('customer.sustainable')}</p>
                  </div>
                </div>
              </div>

              {/* Right Column - Contact Information */}
              <div className="lg:col-span-7">
                <h4 className="text-lg sm:text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full"></span>
                  {t('customer.get_in_touch')}
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {/* Facebook Card */}
                  <a 
                    href={facebookUrl} 
                    className="group relative bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm p-5 rounded-2xl border border-border/50 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 text-inherit no-underline overflow-hidden"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visit our Facebook page"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-300"></div>
                    <div className="relative flex items-start gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-xl shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <Facebook className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1 font-medium">{t('customer.follow_us_on')}</p>
                        <p className="text-base font-bold text-foreground group-hover:text-secondary transition-colors duration-300">{t('customer.facebook')}</p>
                      </div>
                    </div>
                  </a>

                  {/* Email Card */}
                  <a 
                    href={`mailto:${emailAddress}`}
                    className="group relative bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm p-5 rounded-2xl border border-border/50 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 text-inherit no-underline overflow-hidden"
                    aria-label="Send us an email"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-300"></div>
                    <div className="relative flex items-start gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-xl shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <Mail className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1 font-medium">{t('customer.email_us_at')}</p>
                        <p className="text-sm sm:text-base font-bold text-foreground group-hover:text-secondary transition-colors duration-300 truncate">{emailAddress}</p>
                      </div>
                    </div>
                  </a>

                  {/* Address Card - Spans 2 columns on larger screens */}
                  <div className="sm:col-span-2 group relative bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm p-5 rounded-2xl border border-border/50 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-300"></div>
                    <div className="relative flex items-start gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-xl shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <MapPin className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1 font-medium">{t('customer.visit_us_at')}</p>
                        <p className="text-base font-bold text-foreground group-hover:text-secondary transition-colors duration-300">{physicalAddress}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
        </div>

        {/* Bottom Section - Copyright and Navigation */}
        <div className="py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Copyright */}
              <div className="order-2 md:order-1">
                <p className="text-xs sm:text-sm text-muted-foreground m-0 text-center md:text-left">
                  © {currentYear} {companyName}. {t('customer.all_rights_reserved')}
                </p>
              </div>

              {/* Navigation Links */}
              <nav className="order-1 md:order-2" aria-label="Footer navigation">
                <ul className="flex flex-wrap justify-center md:justify-end gap-2 sm:gap-3 list-none m-0 p-0">
                  {navigationLinks.map((link, index) => (
                    <li key={index} className="m-0">
                      <Link 
                        href={link.href}
                        className="text-xs sm:text-sm text-muted-foreground no-underline font-medium transition-all duration-200 px-3 py-2 rounded-lg hover:text-secondary hover:bg-primary/10 whitespace-nowrap"
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
      </div>
    </footer>
  );
};

export default Footer;
