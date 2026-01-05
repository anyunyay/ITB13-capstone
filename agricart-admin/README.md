# SMMC System

> Agricultural marketplace ecommerce system built with Laravel and React

[![Laravel](https://img.shields.io/badge/Laravel-12.0-red.svg)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-2.0-purple.svg)](https://inertiajs.com)

## Overview

SMMC System is a comprehensive agricultural marketplace ecommerce system that provides administrators with powerful tools to manage agricultural products, vendors, orders, and marketplace operations. Built with modern web technologies, it offers a seamless single-page application experience with server-side rendering capabilities.

## Features

- **Modern Tech Stack**: Laravel 12 backend with React 19 frontend
- **Single Page Application**: Powered by Inertia.js for seamless navigation
- **Role-Based Access Control**: Comprehensive permission management system
- **PDF Generation**: Built-in PDF export capabilities
- **Excel Integration**: Import/export functionality for data management
- **Real-time Monitoring**: Queue processing and log monitoring
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **Testing Suite**: Comprehensive testing with Pest PHP

## Tech Stack

### Backend
- **PHP 8.2+** - Modern PHP with latest features
- **Laravel 12** - Robust PHP framework
- **MySQL/SQLite** - Flexible database options
- **Inertia.js** - Server-side adapter for SPA functionality

### Frontend
- **React 19** - Latest React with concurrent features
- **TypeScript 5.7** - Type-safe JavaScript
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Vite 6.0** - Fast build tool and dev server

### Key Libraries
- **Spatie Laravel Permission** - Role and permission management
- **Laravel DomPDF** - PDF generation
- **Maatwebsite Excel** - Excel file handling
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization
- **Date-fns** - Date manipulation utilities

## Quick Start

### Prerequisites

Ensure you have the following installed:
- **XAMPP** (Apache, MySQL, PHP 8.2+)
- **Node.js 18+**
- **Composer**
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SMMC
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install Node.js dependencies**
   ```bash
   npm install
   ```

4. **Environment setup**
   ```bash
   # Copy environment file
   cp .env.example .env
   
   # Generate application key
   php artisan key:generate
   
   # Configure your database settings in .env
   ```

5. **Database setup**
   ```bash
   # Run migrations
   php artisan migrate
   
   # Seed database (optional)
   php artisan db:seed
   ```

6. **Start development servers**
   ```bash
   # Start all services (Laravel, Queue, Vite)
   composer run dev
   
   # Or start individually:
   php artisan serve    # Laravel server (port 8000)
   npm run dev         # Vite dev server (port 5173)
   ```

## Development

### Available Scripts

#### Composer Scripts
```bash
composer run dev        # Start all development services
composer run dev:ssr    # Start with SSR support
composer run test       # Run PHP tests
```

#### NPM Scripts
```bash
npm run dev            # Start Vite development server
npm run build          # Build for production
npm run build:ssr      # Build with SSR support
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
npm run types          # Type check TypeScript
```

### Project Structure

```
├── app/                    # Laravel application code
│   ├── Console/           # Artisan commands
│   ├── Http/              # Controllers, middleware, requests
│   ├── Models/            # Eloquent models
│   ├── Services/          # Business logic services
│   └── Providers/         # Service providers
├── resources/
│   ├── js/                # React components and TypeScript
│   ├── css/               # Stylesheets
│   └── views/             # Blade templates
├── routes/                # Route definitions
├── database/              # Migrations, seeders, factories
├── tests/                 # Test files
├── public/                # Public assets
└── storage/               # File storage and logs
```

### Code Quality

The project includes comprehensive tooling for code quality:

- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Laravel Pint** - PHP code style fixing
- **TypeScript** - Static type checking
- **Pest** - PHP testing framework

### Testing

```bash
# Run PHP tests
composer run test
php artisan test

# Run specific test file
php artisan test tests/Feature/ExampleTest.php

# Type checking
npm run types
```

## Deployment

### Production Build

```bash
# Build frontend assets
npm run build

# Optimize Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Server Requirements

- **PHP 8.2+** with required extensions
- **MySQL 5.7+** or **MariaDB 10.6+**
- **Node.js 18+** (for build process)
- **Web server** (Apache/Nginx)

## Configuration

### Environment Variables

Key environment variables to configure:

```env
APP_NAME="SMMC System"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=smmc
DB_USERNAME=your_username
DB_PASSWORD=your_password

MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow PSR-12 coding standards for PHP
- Use TypeScript for all new JavaScript code
- Write tests for new features
- Run linting and formatting before committing
- Follow conventional commit messages

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `/documents` folder
- Review system requirements in `SYSTEM_REQUIREMENTS.md`

## Changelog

### Version 1.0.0
- Initial release
- Laravel 12 and React 19 integration
- Role-based permission system
- PDF and Excel export functionality
- Comprehensive admin dashboard
- Mobile-responsive design

---

**SMMC System** - Empowering agricultural marketplace management with modern web technologies.