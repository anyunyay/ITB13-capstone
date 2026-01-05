# System Requirements and Installation Prerequisites

## Required Software to Run the System

### Core Development Environment
- **XAMPP** - Local development server environment
  - Includes Apache web server
  - MySQL database server
  - PHP 8.2 or higher
- **MySQL Workbench** (preferably) - Database management and administration tool
- **Node.js** (version 18 or higher) - JavaScript runtime for frontend development
- **Composer** - PHP dependency manager
- **Git** - Version control system

### Additional Tools
- **Web Browser** - Modern browser (Chrome, Opera, Firefox, Safari, Edge)
- **Code Editor** - VS Code

## System Dependencies

### Backend Dependencies (PHP/Laravel)

#### Core Framework Requirements
- **PHP**: ^8.2
- **Laravel Framework**: ^12.0
- **Inertia.js Laravel**: ^2.0 (for SPA functionality)

#### Production Dependencies
- `barryvdh/laravel-dompdf`: ^3.1 - PDF generation
- `laravel/tinker`: ^2.10.1 - Interactive shell
- `maatwebsite/excel`: ^1.1 - Excel file handling
- `spatie/laravel-permission`: ^6.20 - Role and permission management
- `tightenco/ziggy`: ^2.4 - Route generation for JavaScript

#### Development Dependencies
- `fakerphp/faker`: ^1.23 - Test data generation
- `laravel/pail`: ^1.2.2 - Log monitoring
- `laravel/pint`: ^1.18 - Code formatting
- `laravel/sail`: ^1.41 - Docker development environment
- `mockery/mockery`: ^1.6 - Mocking framework
- `nunomaduro/collision`: ^8.6 - Error handling
- `pestphp/pest`: ^3.8 - Testing framework
- `pestphp/pest-plugin-laravel`: ^3.2 - Laravel testing integration

### Frontend Dependencies (Node.js/React)

#### Core Framework
- **React**: ^19.0.0
- **React DOM**: ^19.0.0
- **TypeScript**: ^5.7.2
- **Vite**: ^6.0 - Build tool and development server

#### UI Components and Styling
- `@headlessui/react`: ^2.2.0 - Accessible UI components
- `@radix-ui/*`: Multiple packages for UI primitives
- `tailwindcss`: ^4.0.0 - CSS framework
- `tailwindcss-animate`: ^1.0.7 - Animation utilities
- `framer-motion`: ^12.23.24 - Animation library
- `lucide-react`: ^0.475.0 - Icon library

#### Utilities and Tools
- `@inertiajs/react`: ^2.0.0 - SPA adapter
- `class-variance-authority`: ^0.7.1 - CSS class management
- `clsx`: ^2.1.1 - Conditional class names
- `date-fns`: ^4.1.0 - Date manipulation
- `dayjs`: ^1.11.18 - Date library
- `recharts`: ^3.2.1 - Chart components

#### Development Tools
- `@eslint/js`: ^9.19.0 - JavaScript linting
- `eslint`: ^9.17.0 - Code linting
- `prettier`: ^3.4.2 - Code formatting
- `typescript-eslint`: ^8.23.0 - TypeScript linting

## Installation Instructions

### 1. Install Required Software
- Download and install **XAMPP** from [https://www.apachefriends.org/](https://www.apachefriends.org/)
- Download and install **MySQL Workbench** from [https://dev.mysql.com/downloads/workbench/](https://dev.mysql.com/downloads/workbench/)
- Install **Node.js** from [https://nodejs.org/](https://nodejs.org/) (LTS version recommended)
- Install **Composer** from [https://getcomposer.org/](https://getcomposer.org/)

### 2. Install Backend Dependencies
```bash
# Install PHP dependencies using Composer
composer install
```

### 3. Install Frontend Dependencies
```bash
# Install Node.js packages and dependencies
npm install
```

### 4. Environment Setup
- Copy `env.txt` to `.env` (contains configuration for both production and deployment modes)
- Configure database settings in `.env` file
- Generate application key (add to .env file): `php artisan key:generate`
- Run database migrations: `php artisan migrate`

### 5. Development Server
```bash
# Start the development environment (runs Laravel server, queue worker, and Vite)
composer run dev

# Alternative: Start individual services
php artisan serve          # Laravel development server
npm run dev               # Vite development server
php artisan queue:work    # Queue worker (if needed)
```

## System Requirements Summary

### Minimum Hardware Requirements
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space for project and dependencies
- **Processor**: Modern multi-core processor

### Software Versions
- **PHP**: 8.2 or higher
- **Node.js**: 18.0 or higher
- **MySQL**: 5.7 or higher (included with XAMPP)
- **Apache**: 2.4 or higher (included with XAMPP)

### Browser Compatibility
- Chrome 90+
- Opera 76+
- Firefox 88+
- Safari 14+
- Edge 90+
