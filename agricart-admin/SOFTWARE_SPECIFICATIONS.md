# Software Specifications

## Project Information

- **Project Name:** SMMC System
- **Version:** 1.0.0
- **Description:** Agricultural marketplace ecommerce system

## Operating System

### Development Environment
- **Platform:** Windows (win32)

## Runtime Environment

### PHP
- **Version:** 8.2 or higher
- **Required Extensions:**
  - OpenSSL
  - PDO
  - Mbstring
  - Tokenizer
  - XML
  - Ctype
  - JSON
  - BCMath
  - Fileinfo

### Node.js
- **Module System:** ES Modules (type: "module")
- **Package Manager:** npm

## Backend Framework and Dependencies

### Core Framework
- **Laravel Framework:** 12.0
- **Composer Version:** 2.x (JSON schema compliant)

### Laravel Packages
- **inertiajs/inertia-laravel:** 2.0 - Server-side Inertia.js adapter
- **tightenco/ziggy:** 2.4 - JavaScript route helper
- **spatie/laravel-permission:** 6.20 - Role and permission management
- **barryvdh/laravel-dompdf:** 3.1 - PDF generation
- **maatwebsite/excel:** 1.1 - Excel import/export
- **laravel/tinker:** 2.10.1 - REPL for Laravel

### Development Dependencies
- **pestphp/pest:** 3.8 - Testing framework
- **pestphp/pest-plugin-laravel:** 3.2 - Laravel integration for Pest
- **laravel/pint:** 1.18 - PHP code style fixer
- **laravel/sail:** 1.41 - Docker development environment
- **laravel/pail:** 1.2.2 - Log viewer
- **fakerphp/faker:** 1.23 - Fake data generator
- **mockery/mockery:** 1.6 - Mocking framework
- **nunomaduro/collision:** 8.6 - Error handler

## Frontend Framework and Dependencies

### Core Libraries
- **React:** 19.0.0
- **React DOM:** 19.0.0
- **@inertiajs/react:** 2.0.0 - Client-side Inertia.js adapter
- **TypeScript:** 5.7.2

### Build Tools
- **Vite:** 6.0
- **@vitejs/plugin-react:** 4.3.4
- **laravel-vite-plugin:** 1.0
- **@tailwindcss/vite:** 4.0.6

### UI Framework and Components
- **Tailwind CSS:** 4.0.0
- **tailwindcss-animate:** 1.0.7
- **tailwind-merge:** 3.0.1
- **class-variance-authority:** 0.7.1
- **clsx:** 2.1.1

### Radix UI Components
- @radix-ui/react-aspect-ratio: 1.1.7
- @radix-ui/react-avatar: 1.1.3
- @radix-ui/react-checkbox: 1.1.4
- @radix-ui/react-collapsible: 1.1.3
- @radix-ui/react-dialog: 1.1.6
- @radix-ui/react-dropdown-menu: 2.1.6
- @radix-ui/react-label: 2.1.2
- @radix-ui/react-navigation-menu: 1.2.5
- @radix-ui/react-popover: 1.1.14
- @radix-ui/react-progress: 1.1.7
- @radix-ui/react-select: 2.2.5
- @radix-ui/react-separator: 1.1.2
- @radix-ui/react-slot: 1.2.3
- @radix-ui/react-switch: 1.2.6
- @radix-ui/react-tabs: 1.1.12
- @radix-ui/react-toggle: 1.1.2
- @radix-ui/react-toggle-group: 1.1.2
- @radix-ui/react-tooltip: 1.1.8

### Additional UI Libraries
- **@headlessui/react:** 2.2.0 - Unstyled accessible components
- **lucide-react:** 0.475.0 - Icon library
- **framer-motion:** 12.23.24 - Animation library
- **recharts:** 3.2.1 - Charting library
- **embla-carousel-react:** 8.6.0 - Carousel component
- **embla-carousel-autoplay:** 8.6.0 - Carousel autoplay plugin

### Date and Time Utilities
- **date-fns:** 4.1.0 - Date utility library
- **date-fns-tz:** 3.2.0 - Timezone support
- **dayjs:** 1.11.18 - Date manipulation library
- **react-day-picker:** 9.7.0 - Date picker component

## Database

### Primary Database
- **MySQL:** 8.0+ (configured via environment)
- **Character Set:** UTF-8

### Alternative Database Support
- **SQLite:** File-based database (database/database.sqlite)
- MariaDB 10.6+ (configured via environment)

## Configuration

### Application Settings
- **Environment:** Local development (configurable)
- **Debug Mode:** Enabled in development
- **Locale:** English (en)
- **Fallback Locale:** English (en)
- **Faker Locale:** en_US
- **PHP CLI Workers:** 4
- **Bcrypt Rounds:** 12

### Session Management
- **Driver:** Database
- **Lifetime:** 120 minutes

### Cache and Queue
- **Cache Store:** Database
- **Queue Connection:** Database
- **Broadcast Connection:** Log

### File Storage
- **Filesystem Disk:** Local

### Logging
- **Channel:** Stack
- **Stack:** Single
- **Level:** Debug
- **Deprecations Channel:** Null

### Mail Configuration
- **Mailer:** Log (development)
- **Host:** 127.0.0.1
- **Port:** 2525
- **From Address:** hello@example.com

## Build Configuration

### Vite Configuration
- **Entry Points:** 
  - resources/css/app.css
  - resources/js/app.tsx
- **SSR Entry:** resources/js/ssr.tsx
- **Hot Module Replacement:** Enabled
- **Plugins:** Laravel, React, Tailwind CSS
- **JSX:** Automatic runtime
- **Path Aliases:** 
  - @/* → resources/js/*
  - ziggy-js → vendor/tightenco/ziggy

### TypeScript Configuration
- **Target:** ESNext
- **Module:** ESNext
- **Module Resolution:** Bundler
- **JSX:** react-jsx
- **Strict Mode:** Enabled
- **No Implicit Any:** Enabled
- **Allow JS:** Enabled
- **No Emit:** Enabled (Vite handles compilation)
- **Isolated Modules:** Enabled
- **ES Module Interop:** Enabled
- **Force Consistent Casing:** Enabled
- **Skip Lib Check:** Enabled

## Browser Compatibility

### Target Browsers
- Modern browsers with ES6+ support
- React 19 compatible browsers
- CSS Grid and Flexbox support required
