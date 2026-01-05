# Frontend Architecture

## Technology Stack

### Core Framework
- **React**: 19.0.0 - UI library
- **Inertia.js**: 2.0.0 - Server-side rendering adapter
- **TypeScript**: 5.7.2 - Type safety
- **Vite**: 6.0 - Build tool and dev server

### UI Framework
- **Tailwind CSS**: 4.0.0 - Utility-first CSS
- **Radix UI**: Component primitives
- **Lucide React**: Icon library
- **Framer Motion**: Animation library

## Project Structure

```
resources/js/
├── __tests__/              # Test files
├── components/             # React components
│   ├── admin/             # Admin-specific components
│   ├── common/            # Shared components
│   ├── customer/          # Customer-specific components
│   ├── inventory/         # Inventory management
│   ├── logistics/         # Logistics components
│   ├── member/            # Member components
│   ├── membership/        # Membership management
│   ├── orders/            # Order management
│   ├── profile/           # Profile components
│   ├── reports/           # Report components
│   ├── sales/             # Sales components
│   ├── shared/            # Shared across roles
│   │   ├── auth/          # Authentication components
│   │   ├── layout/        # Layout components
│   │   ├── notifications/ # Notification components
│   │   └── profile/       # Profile components
│   ├── staff/             # Staff management
│   ├── system-logs/       # System logging
│   └── ui/                # Base UI components
├── config/                # Configuration files
├── contexts/              # React contexts
├── hooks/                 # Custom React hooks
├── layouts/               # Page layouts
├── lib/                   # Utility libraries
├── pages/                 # Page components
│   ├── Admin/             # Admin pages
│   ├── auth/              # Authentication pages
│   ├── Customer/          # Customer pages
│   ├── errors/            # Error pages
│   ├── Logistic/          # Logistic pages
│   ├── Member/            # Member pages
│   └── Profile/           # Profile pages
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
├── app.tsx                # Main app component
└── ssr.tsx                # Server-side rendering entry
```

## Component Organization

### UI Components (`components/ui/`)
Base reusable components built on Radix UI:

- **Form Components**: Input, Select, Checkbox, Switch, Textarea
- **Layout**: Card, Separator, Tabs, Dialog, Sheet
- **Navigation**: Dropdown Menu, Navigation Menu, Breadcrumb
- **Feedback**: Alert, Toast, Progress, Skeleton
- **Data Display**: Table, Avatar, Badge, Tooltip
- **Media**: Carousel, Aspect Ratio
- **Custom**: 
  - `admin-search-bar.tsx` - Admin search functionality
  - `global-search-bar.tsx` - Global search component
  - `password-input.tsx` - Password field with visibility toggle
  - `password-validation.tsx` - Real-time password validation
  - `file-upload.tsx` - File upload component

### Common Components (`components/common/`)
Shared business logic components:

- **base-table.tsx**: Reusable data table with sorting, filtering, pagination
- **pagination.tsx**: Pagination controls
- **heading.tsx**: Page headings
- **icon.tsx**: Icon wrapper
- **permission-gate.tsx**: Permission-based rendering
- **permission-guard.tsx**: Route-level permission checking
- **SecureImage.tsx**: Secure image loading with authentication
- **theme-toggle.tsx**: Theme switcher component
- **text-link.tsx**: Styled link component

#### Forms (`components/common/forms/`)
- Form validation components
- Input wrappers
- Form layouts

#### Modals (`components/common/modals/`)
- Confirmation dialogs
- Form modals
- Alert modals

#### Feedback (`components/common/feedback/`)
- Loading states
- Error messages
- Success notifications

### Shared Components (`components/shared/`)
Components used across multiple user roles:

#### Auth (`components/shared/auth/`)
- Login forms
- Registration forms
- Password reset forms
- Email verification

#### Layout (`components/shared/layout/`)
- **app-header.tsx**: Main header with navigation
- **app-sidebar.tsx**: Sidebar navigation
- **app-footer.tsx**: Footer component
- **customer-header.tsx**: Customer-specific header
- **customer-footer.tsx**: Customer-specific footer

#### Notifications (`components/shared/notifications/`)
- **notification-bell.tsx**: Notification dropdown
- **notification-item.tsx**: Individual notification
- **notification-list.tsx**: Notification list

#### Profile (`components/shared/profile/`)
- Profile information forms
- Avatar upload
- Password change
- Appearance settings

### Role-Specific Components

#### Admin (`components/admin/`)
- **trends/**: Trend analysis components
  - Chart components
  - Data visualization
  - Trend filters

#### Customer (`components/customer/`)
- **cart/**: Shopping cart components
- **marketing/**: Marketing components
- **orders/**: Order history components
- **products/**: Product browsing components

#### Inventory (`components/inventory/`)
- Product management tables
- Stock management forms
- Archive management
- Report generation

#### Orders (`components/orders/`)
- Order management tables
- Order detail views
- Status update forms
- Receipt generation

#### Sales (`components/sales/`)
- Sales tables
- Audit trail views
- Member sales reports

#### Membership (`components/membership/`)
- Member management tables
- Member forms
- Password request handling

#### Logistics (`components/logistics/`)
- Logistic management tables
- Delivery assignment
- Status tracking

#### Staff (`components/staff/`)
- Staff management tables
- Staff forms
- Permission assignment

#### Member (`components/member/`)
- Stock overview
- Transaction history
- Earnings display

#### System Logs (`components/system-logs/`)
- Log table
- Log filters
- Log details modal
- Summary cards

## Page Structure

### Authentication Pages (`pages/auth/`)
```
login.tsx                   - Customer login
admin-login.tsx             - Admin/Staff login
member-login.tsx            - Member login
logistic-login.tsx          - Logistic login
register.tsx                - Customer registration
forgot-password.tsx         - Password reset request
reset-password.tsx          - Password reset form
verify-email.tsx            - Email verification
update-credentials.tsx      - Credential update for default accounts
single-session-restricted.tsx - Session conflict page
member-forgot-password.tsx  - Member password change request
member-request-pending.tsx  - Member request status
```

### Admin Pages (`pages/Admin/`)
```
dashboard.tsx               - Admin dashboard
notifications.tsx           - Notification center

Inventory/
  index.tsx                 - Product list
  create.tsx                - Add product
  edit.tsx                  - Edit product
  archive.tsx               - Archived products
  report.tsx                - Inventory report
  sold-stock.tsx            - Sold stock view
  removed-stock.tsx         - Removed stock view

Orders/
  index.tsx                 - Order list
  show.tsx                  - Order details
  report.tsx                - Order report

Sales/
  index.tsx                 - Sales overview
  member-sales.tsx          - Member sales
  audit-trail.tsx           - Audit trail
  report.tsx                - Sales report

Membership/
  index.tsx                 - Member list
  add.tsx                   - Add member
  edit.tsx                  - Edit member
  deactivated.tsx           - Deactivated members
  report.tsx                - Membership report

Logistics/
  index.tsx                 - Logistic list
  add.tsx                   - Add logistic
  edit.tsx                  - Edit logistic
  deactivated.tsx           - Deactivated logistics
  report.tsx                - Logistics report

Staff/
  index.tsx                 - Staff list
  add.tsx                   - Add staff
  edit.tsx                  - Edit staff
  report.tsx                - Staff report

Trends/
  index.tsx                 - Trend analysis

settings/
  system-logs.tsx           - System logs
```

### Customer Pages (`pages/Customer/`)
```
Home/
  index.tsx                 - Home page
  about.tsx                 - About page

Products/
  index.tsx                 - Product catalog
  show.tsx                  - Product details

Cart/
  index.tsx                 - Shopping cart
  checkout.tsx              - Checkout page

OrderHistory/
  index.tsx                 - Order history
  show.tsx                  - Order details

notifications.tsx           - Notification center
```

### Logistic Pages (`pages/Logistic/`)
```
dashboard.tsx               - Logistic dashboard
assignedOrders.tsx          - Assigned orders list
showOrder.tsx               - Order details
report.tsx                  - Delivery report
notifications.tsx           - Notification center
```

### Member Pages (`pages/Member/`)
```
dashboard.tsx               - Member dashboard
allStocks.tsx               - All stocks view
change-password.tsx         - Password change request
notifications.tsx           - Notification center
```

### Profile Pages (`pages/Profile/`)
```
profile.tsx                 - Profile information
password.tsx                - Password management
address.tsx                 - Address management
appearance.tsx              - Appearance settings
help.tsx                    - Help page
all-notifications.tsx       - All notifications
system-logs.tsx             - System logs (admin/staff)
```

### Error Pages (`pages/errors/`)
```
unauthorized.tsx            - 403 Unauthorized
```

## Layouts

### Main Layouts (`layouts/`)
```
AuthenticatedLayout.tsx     - Layout for authenticated users
GuestLayout.tsx             - Layout for guest users
AdminLayout.tsx             - Layout for admin/staff
CustomerLayout.tsx          - Layout for customers
LogisticLayout.tsx          - Layout for logistics
MemberLayout.tsx            - Layout for members
```

## State Management

### React Context (`contexts/`)
- **AuthContext**: User authentication state
- **ThemeContext**: Theme preferences
- **LanguageContext**: Language preferences
- **NotificationContext**: Notification state

### Inertia.js Shared Data
Automatically shared from backend:
```typescript
{
  auth: {
    user: User | null
  },
  permissions: Record<string, boolean>,
  notifications: Notification[],
  urgentOrders: Order[],
  translations: Record<string, string>,
  locale: string,
  userTheme: 'light' | 'dark' | 'system',
  userLanguage: 'en' | 'tl',
  flash: {
    success?: string,
    error?: string,
    message?: string
  }
}
```

## Custom Hooks (`hooks/`)

### Common Hooks
```typescript
useAuth()               - Authentication state and methods
usePermission()         - Permission checking
useTheme()              - Theme management
useLanguage()           - Language management
useNotifications()      - Notification management
useDebounce()           - Debounced values
useLocalStorage()       - Local storage management
useMediaQuery()         - Responsive breakpoints
```

### Form Hooks
```typescript
useForm()               - Inertia form helper
useFormValidation()     - Form validation
useFileUpload()         - File upload handling
```

### Data Hooks
```typescript
usePagination()         - Pagination state
useSearch()             - Search functionality
useFilter()             - Filtering logic
useSort()               - Sorting logic
```

## Utility Functions (`utils/`)

### Common Utilities
```typescript
cn()                    - Class name merger (clsx + tailwind-merge)
formatDate()            - Date formatting
formatCurrency()        - Currency formatting
formatNumber()          - Number formatting
truncate()              - String truncation
```

### Validation
```typescript
validateEmail()         - Email validation
validatePhone()         - Phone validation
validatePassword()      - Password validation
```

### API Helpers
```typescript
route()                 - Ziggy route helper
csrf()                  - CSRF token
```

## Type Definitions (`types/`)

### Core Types
```typescript
User                    - User model
Product                 - Product model
Stock                   - Stock model
Order                   - Order model (SalesAudit)
Sale                    - Sale model
AuditTrail              - Audit trail model
Notification            - Notification model
```

### Component Props
```typescript
PageProps               - Page component props
LayoutProps             - Layout component props
TableProps              - Table component props
FormProps               - Form component props
```

### API Types
```typescript
PaginatedResponse<T>    - Paginated API response
ApiResponse<T>          - Standard API response
ValidationErrors        - Form validation errors
```

## Styling Approach

### Tailwind CSS Configuration
```javascript
// tailwind.config.js
{
  theme: {
    extend: {
      colors: {
        // Custom color palette
        primary: {...},
        secondary: {...},
        accent: {...}
      },
      spacing: {...},
      borderRadius: {...}
    }
  },
  plugins: [
    require('tailwindcss-animate')
  ]
}
```

### CSS Variables
```css
/* theme-utilities.css */
:root {
  --primary: ...;
  --secondary: ...;
  --accent: ...;
  --background: ...;
  --foreground: ...;
}

[data-theme="dark"] {
  /* Dark theme variables */
}
```

### Component Styling
- Utility-first approach with Tailwind
- Component variants with `class-variance-authority`
- Consistent spacing and sizing
- Responsive design with mobile-first approach

## Animation & Transitions

### Framer Motion
Used for:
- Page transitions
- Modal animations
- List animations
- Hover effects
- Loading states

### CSS Animations
- Tailwind animate plugin
- Custom keyframe animations
- Transition utilities

## Responsive Design

### Breakpoints
```typescript
{
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
}
```

### Mobile-First Approach
- Base styles for mobile
- Progressive enhancement for larger screens
- Touch-friendly interactions
- Responsive navigation

## Performance Optimization

### Code Splitting
- Route-based code splitting with Inertia.js
- Dynamic imports for heavy components
- Lazy loading for images

### Caching
- Browser caching for static assets
- Service worker for offline support (optional)
- Memoization with React.memo and useMemo

### Bundle Optimization
- Tree shaking
- Minification
- Compression (gzip/brotli)
- Asset optimization

## Accessibility

### ARIA Attributes
- Proper semantic HTML
- ARIA labels and descriptions
- Keyboard navigation support
- Focus management

### Screen Reader Support
- Alt text for images
- Descriptive link text
- Form labels
- Error announcements

### Keyboard Navigation
- Tab order
- Keyboard shortcuts
- Focus indicators
- Skip links

## Internationalization (i18n)

### Translation System
```typescript
// Translation service
TranslationService.getAllTranslations(locale)
TranslationService.translate(key, locale)
```

### Supported Languages
- English (en)
- Tagalog (tl)

### Translation Keys
Organized by feature:
```
admin.{key}
customer.{key}
member.{key}
logistic.{key}
common.{key}
validation.{key}
```

## Testing

### Test Structure
```
__tests__/
├── components/         # Component tests
├── hooks/              # Hook tests
├── utils/              # Utility tests
└── integration/        # Integration tests
```

### Testing Tools
- Pest PHP (backend)
- Jest (frontend - optional)
- React Testing Library (optional)

## Build & Development

### Development Server
```bash
npm run dev              # Start Vite dev server
composer dev             # Start Laravel + Vite + Queue
```

### Production Build
```bash
npm run build            # Build for production
npm run build:ssr        # Build with SSR support
```

### Type Checking
```bash
npm run types            # TypeScript type checking
```

### Linting & Formatting
```bash
npm run lint             # ESLint
npm run format           # Prettier
npm run format:check     # Check formatting
```

## Environment Variables

### Frontend Variables
```env
VITE_APP_NAME=AgriCart
VITE_APP_URL=http://localhost
```

### Build Configuration
```typescript
// vite.config.ts
{
  plugins: [
    laravel({
      input: ['resources/css/app.css', 'resources/js/app.tsx'],
      ssr: 'resources/js/ssr.tsx',
      refresh: true
    }),
    react()
  ]
}
```
