# Technologies Used

## Backend Technologies

### Core Framework
- **Laravel Framework**: 12.0
- **PHP Version**: 8.2+
- **Laravel Tinker**: 2.10.1 (REPL for Laravel)

### Key Laravel Packages
1. **Inertia.js Laravel**: 2.0 - Server-side adapter for Inertia.js
2. **Spatie Laravel Permission**: 6.20 - Role and permission management
3. **Tightenco Ziggy**: 2.4 - Laravel route generation for JavaScript
4. **Barryvdh Laravel DomPDF**: 3.1 - PDF generation
5. **Maatwebsite Excel**: 1.1 - Excel import/export functionality

### Development Tools
- **Laravel Pail**: 1.2.2 - Log viewer
- **Laravel Sail**: 1.41 - Docker development environment
- **Laravel Pint**: 1.18 - Code style fixer
- **Pest PHP**: 3.8 - Testing framework
- **Faker PHP**: 1.23 - Fake data generation
- **Mockery**: 1.6 - Mocking framework

## Frontend Technologies

### Core Libraries
- **React**: 19.0.0
- **React DOM**: 19.0.0
- **Inertia.js React**: 2.0.0
- **TypeScript**: 5.7.2

### UI Framework & Components
1. **Tailwind CSS**: 4.0.0
2. **Tailwind CSS Animate**: 1.0.7
3. **@tailwindcss/vite**: 4.0.6
4. **Radix UI Components**:
   - Aspect Ratio, Avatar, Checkbox, Collapsible
   - Dialog, Dropdown Menu, Label, Navigation Menu
   - Popover, Progress, Select, Separator
   - Slot, Switch, Tabs, Toggle, Tooltip

### Utility Libraries
- **Class Variance Authority**: 0.7.1 - Component variant management
- **clsx**: 2.1.1 - Conditional className utility
- **Tailwind Merge**: 3.0.1 - Merge Tailwind classes
- **Lucide React**: 0.475.0 - Icon library
- **Framer Motion**: 12.23.24 - Animation library

### Data Visualization
- **Recharts**: 3.2.1 - Chart library for React

### Date Handling
- **date-fns**: 4.1.0 - Date utility library
- **date-fns-tz**: 3.2.0 - Timezone support
- **dayjs**: 1.11.18 - Alternative date library
- **React Day Picker**: 9.7.0 - Date picker component

### Carousel
- **Embla Carousel React**: 8.6.0
- **Embla Carousel Autoplay**: 8.6.0

### Build Tools
- **Vite**: 6.0 - Build tool and dev server
- **@vitejs/plugin-react**: 4.3.4 - React plugin for Vite
- **Laravel Vite Plugin**: 1.0 - Laravel integration

### Code Quality Tools
- **ESLint**: 9.17.0
- **@eslint/js**: 9.19.0
- **TypeScript ESLint**: 8.23.0
- **ESLint Plugin React**: 7.37.3
- **ESLint Plugin React Hooks**: 5.1.0
- **ESLint Config Prettier**: 10.0.1
- **Prettier**: 3.4.2
- **Prettier Plugin Organize Imports**: 4.1.0
- **Prettier Plugin Tailwind CSS**: 0.6.11

### Development Utilities
- **Concurrently**: 9.0.1 - Run multiple commands
- **Globals**: 15.14.0 - Global variables for ESLint

## Database
- **SQLite**: Development database (included)
- **MySQL/PostgreSQL**: Production-ready (configurable)

## File Storage
- **Local Storage**: Private file management
- **Public Storage**: Product images and avatars

## Email
- **Laravel Mail**: Built-in mail system
- **Mailtrap/SMTP**: Configurable mail drivers

## Queue System
- **Laravel Queue**: Background job processing
- **Database Driver**: Default queue driver

## Session Management
- **Database Sessions**: Session storage in database
- **Cookie-based**: Session ID management

## Authentication & Authorization
- **Laravel Authentication**: Built-in auth system
- **Spatie Permission**: Role-based access control (RBAC)
- **Email Verification**: Laravel's email verification
- **Password Reset**: Token-based password reset

## API & Routing
- **Ziggy**: JavaScript route generation
- **Inertia.js**: SPA-like experience without API

## Development Scripts
```json
{
  "dev": "Concurrent Laravel server, queue, and Vite",
  "dev:ssr": "Server-side rendering mode",
  "build": "Production build",
  "build:ssr": "SSR production build",
  "test": "Run Pest tests",
  "format": "Prettier code formatting",
  "lint": "ESLint code linting",
  "types": "TypeScript type checking"
}
```

## Browser Support
- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge (latest versions)

## Server Requirements
- PHP 8.2 or higher
- Composer 2.x
- Node.js 18+ and npm/yarn
- SQLite/MySQL/PostgreSQL
- Web server (Apache/Nginx)
