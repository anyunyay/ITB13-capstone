# AgriCart System - Complete Analysis

## Overview
This folder contains a comprehensive analysis of the AgriCart Admin Panel system, an agricultural marketplace management platform built with Laravel 12 and React 19.

## Document Structure

### 01_SYSTEM_OVERVIEW.md
- Project information and purpose
- System architecture overview
- Key features summary
- Business model explanation
- Target users
- System configuration

### 02_TECHNOLOGIES_USED.md
- Backend technologies (Laravel, PHP, packages)
- Frontend technologies (React, TypeScript, UI libraries)
- Database systems
- Development tools
- Build tools and scripts
- Server requirements

### 03_SECURITY_AUTHENTICATION.md
- Multi-portal authentication system
- Email verification
- Password management
- Brute force protection
- Single session enforcement
- Role-based access control (RBAC)
- Permission system
- OTP verification
- File security
- Middleware protection
- Security best practices

### 04_FEATURES_OVERVIEW.md
- Admin & Staff features
  - Dashboard
  - Inventory management
  - Order management
  - Sales management
  - Membership management
  - Logistics management
  - Staff management
  - Trend analysis
  - System logs
  - Notifications
  - Report generation
- Customer features
  - Shopping experience
  - Order management
  - Profile management
- Logistic features
  - Delivery operations
  - Order tracking
- Member features
  - Stock management
  - Earnings tracking
  - Transaction history
- Additional system features
  - Multi-language support
  - Theme system
  - File management
  - Search functionality
  - Export capabilities

### 05_DATABASE_STRUCTURE.md
- Complete database schema
- Core tables (users, products, stocks, sales, orders)
- Security tables (authentication, OTP, login attempts)
- Notification and logging tables
- File management tables
- Permission tables (Spatie)
- System tables (sessions, cache, jobs)
- Relationships and indexes
- Database relationships summary

### 06_API_ENDPOINTS.md
- Public routes (guest access)
- Authentication routes
- Admin & Staff routes
- Customer routes
- Logistic routes
- Member routes
- API routes (AJAX/Fetch)
- Settings routes
- Route naming conventions
- Middleware stack
- Rate limiting

### 07_FRONTEND_ARCHITECTURE.md
- Technology stack
- Project structure
- Component organization
- Page structure
- Layouts
- State management
- Custom hooks
- Utility functions
- Type definitions
- Styling approach
- Animation & transitions
- Responsive design
- Performance optimization
- Accessibility
- Internationalization
- Testing
- Build & development

### 08_BACKEND_ARCHITECTURE.md
- Framework structure
- Controllers organization
- Models and relationships
- Services (business logic)
- Middleware
- Form requests
- Traits
- Helpers
- Notifications
- Mail
- Providers
- Database (migrations, seeders, factories)
- Configuration
- Routing
- Queue system
- Caching
- Logging
- File storage
- Security
- Performance
- Testing
- Deployment

### 09_INTEGRATIONS.md
- Core integrations
  - Inertia.js
  - Spatie Laravel Permission
  - Ziggy (Route Generation)
  - Laravel DomPDF
  - Maatwebsite Excel
- Email services
- Storage services
- Database services
- Queue services
- Session services
- Cache services
- Frontend integrations
  - Radix UI
  - Tailwind CSS
  - Recharts
  - Framer Motion
- Development tools
- Potential future integrations
- Integration best practices

## Quick Reference

### User Roles
1. **Admin** - Full system access
2. **Staff** - Most admin permissions (limited)
3. **Customer** - Shopping and ordering
4. **Logistic** - Delivery management
5. **Member** - Farmer/producer (stock supplier)

### Key Technologies
- **Backend**: Laravel 12.0, PHP 8.2+
- **Frontend**: React 19.0, TypeScript 5.7.2, Inertia.js 2.0
- **Database**: SQLite (dev), MySQL/PostgreSQL (prod)
- **UI**: Tailwind CSS 4.0, Radix UI
- **Build**: Vite 6.0

### Business Model
- Members receive 100% of product sale price
- Cooperative adds 10% service fee on top
- Example: ₱100 product → Customer pays ₱110

### Security Features
- Multi-portal login system
- Brute force protection (5 attempts, 15-min lockout)
- Single session enforcement
- OTP verification for sensitive operations
- Role-based access control (RBAC)
- Email verification (customers only)
- Password policies

### Core Features
- Inventory management (products, stocks, archive)
- Order processing (complete workflow)
- Sales analytics and reporting
- Member earnings tracking
- Delivery tracking with proof
- Multi-language support (English, Tagalog)
- Theme support (light, dark, system)
- Comprehensive notification system
- System activity logging

## System Requirements

### Development
- PHP 8.2 or higher
- Composer 2.x
- Node.js 18+ and npm
- SQLite (included)

### Production
- PHP 8.2 or higher
- MySQL 5.7+ or PostgreSQL 10+
- Web server (Apache/Nginx)
- SSL certificate (recommended)

## Getting Started

### Installation
```bash
# Clone repository
git clone <repository-url>

# Install PHP dependencies
composer install

# Install Node dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Seed database
php artisan db:seed

# Link storage
php artisan storage:link

# Build frontend
npm run build
```

### Development
```bash
# Start development server
composer dev
# This runs: Laravel server + Queue worker + Vite dev server

# Or run separately:
php artisan serve
php artisan queue:work
npm run dev
```

### Testing
```bash
# Run tests
composer test
# Or: php artisan test

# Type checking
npm run types

# Linting
npm run lint

# Formatting
npm run format
```

## Documentation Notes

### Last Updated
November 20, 2025

### Version
System Version: 1.0.0
Documentation Version: 1.0.0

### Maintenance
This documentation should be updated when:
- New features are added
- System architecture changes
- Dependencies are updated
- Security measures are modified
- API endpoints change

### Contributing
When updating documentation:
1. Keep formatting consistent
2. Update all related sections
3. Include code examples where helpful
4. Document breaking changes
5. Update version numbers

## Support

### Resources
- Laravel Documentation: https://laravel.com/docs
- React Documentation: https://react.dev
- Inertia.js Documentation: https://inertiajs.com
- Tailwind CSS Documentation: https://tailwindcss.com

### Contact
For questions or issues, refer to the project repository or contact the development team.

---

**Note**: This analysis is based on the current state of the system as of November 20, 2025. Some features may be under development or subject to change.
