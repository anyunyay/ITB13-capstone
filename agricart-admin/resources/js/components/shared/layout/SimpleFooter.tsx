import React from 'react';
import { Link } from '@inertiajs/react';

interface SimpleFooterProps {
  companyName?: string;
  currentYear?: number;
  className?: string;
}

const SimpleFooter: React.FC<SimpleFooterProps> = ({
  companyName = "AgriCart",
  currentYear = new Date().getFullYear(),
  className = ""
}) => {
  return (
    <footer className={`bg-gray-800 text-white py-3 sm:py-4 md:py-5 ${className}`} role="contentinfo">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
        <p className="text-xs sm:text-sm md:text-base text-gray-300 m-0">
          © {currentYear} {companyName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default SimpleFooter;
