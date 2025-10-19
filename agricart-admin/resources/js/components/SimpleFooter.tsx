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
    <footer className={`bg-gray-800 text-white py-4 ${className}`} role="contentinfo">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-sm text-gray-300">
          © {currentYear} {companyName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default SimpleFooter;
