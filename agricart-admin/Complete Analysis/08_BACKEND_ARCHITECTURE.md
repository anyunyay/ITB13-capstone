# Backend Architecture

## Framework & Structure

### Laravel Framework
- **Version**: 12.0
- **PHP Version**: 8.2+
- **Architecture**: MVC (Model-View-Controller)
- **Rendering**: Inertia.js (Server-side with React frontend)

## Directory Structure

```
app/
├── Console/
│   └── Commands/           # Artisan commands
├── Helpers/
│   └── SystemLogger.php    # System logging helper
├── Http/
│   ├── Controllers/        # Request handlers
│   ├── Middleware/         # HTTP middleware
│   └── Requests/           # Form request validation
├── Mail/                   # Mailable classes
├── Models/                 # Eloquent models
├── Notifications/          # Notification classes
├── Observers/              # Model observers
├── Providers/              # Service providers
├── Services/               # Business logic services
└── Traits/                 # Reusable traits
```

## Controllers

### Controller Organization

#### Admin Controllers (`app/Http/Controllers/Admin/`)
```
DashboardController.php         - Admin dashboard
InventoryController.php         - Product management
InventoryArchiveController.php  - Archive management
InventoryStockController.php    - Stock management
SoldStockController.php         - Sold stock view
TrendAnalysisController.php     - Price trend analysis
MembershipController.php        - Member management
LogisticController.php          - Logistic management
OrderController.php             - Order management
SalesController.php             - Sales management
StaffController.php             - Staff management
SystemLogsController.php        - System log viewing
NotificationController.php      - Notification management
```

#### Customer Controllers (`app/Http/Controllers/Customer/`)
```
HomeController.php              - Home page and product browsing
CartController.php              - Shopping cart
OrderController.php             - Order management
ProfileController.php           - Profile management
AddressController.php           - Address management
NotificationController.php      - Notification management
```

#### Logistic Controllers (`app/Http/Controllers/Logistic/`)
```
LogisticController.php          - Logistic dashboard and orders
NotificationController.php      - Notification management
```

#### Member Controllers (`app/Http/Controllers/Member/`)
```
MemberController.php            - Member dashboard and stocks
PasswordChangeController.php    - Password change requests
NotificationController.php      - Notification management
```

#### Auth Controllers (`app/Http/Controllers/Auth/`)
```
AuthenticatedSessionController.php      - Login/logout
RegisteredUserController.php            - Registration
PasswordResetLinkController.php         - Password reset request
NewPasswordController.php               - Password reset
EmailVerificationPromptController.php   - Email verification prompt
EmailVerificationNotificationController.php - Resend verification
VerifyEmailController.php               - Verify email
ConfirmablePasswordController.php       - Password confirmation
```

#### Security Controllers (`app/Http/Controllers/Security/`)
```
BaseOtpController.php                   - Base OTP functionality
EmailChangeController.php               - Email change with OTP
PhoneChangeController.php               - Phone change with OTP
PasswordChangeController.php            - Password change enforcement
CredentialsController.php               - Credential updates
SingleSessionController.php             - Single session management
EmailPreviewController.php              - Email template preview
ComprehensiveEmailPreviewController.php - Comprehensive email preview
DirectEmailTemplateController.php       - Direct email templates
```

#### Settings Controllers (`app/Http/Controllers/Settings/`)
```
ProfileController.php           - Profile settings
PasswordController.php          - Password settings
```

#### API Controllers (`app/Http/Controllers/Api/`)
```
SessionCheckController.php      - Session validation
UserAppearanceController.php    - Theme preference
UserLanguageController.php      - Language preference
FileController.php              - File operations
FileManagementController.php    - File management
LockoutStatusController.php     - Login lockout status
```

#### File Controllers (`app/Http/Controllers/`)
```
DeliveryProofController.php     - Delivery proof access
ProductImageController.php      - Product image access
PrivateFileController.php       - Private file access
```

### Controller Base Class
```php
// app/Http/Controllers/Controller.php
abstract class Controller
{
    // Base controller functionality
    // Shared methods for all controllers
}
```

## Models

### Core Models (`app/Models/`)

#### User Model
```php
User.php
- Polymorphic user model (admin, staff, customer, logistic, member)
- Traits: HasFactory, Notifiable, HasRoles, HasFileUploads
- Relationships: sales, stocks, addresses, cart, memberEarnings
- Methods: generateMemberId(), ensurePermissions(), invalidateOtherSessions()
```

#### Product Model
```php
Product.php
- Product catalog
- Traits: HasFactory, HasFileUploads
- Relationships: stocks, auditTrails, priceHistories, cartItems
- Methods: hasAvailableStock(), canBeDeleted(), getDeletionRestrictionReason()
```

#### Stock Model
```php
Stock.php
- Inventory tracking
- Traits: HasFactory
- Relationships: product, member, stockTrails
- Scopes: sold(), available(), removed()
- Methods: isLocked(), canBeEdited(), processPendingOrderApproval()
```

#### Sales Model
```php
Sales.php
- Completed sales
- Traits: HasFactory
- Relationships: customer, admin, logistic, auditTrail, orderItems, salesAudit
- Methods: calculateCoopShare(), updateShares(), markAsReceived()
```

#### SalesAudit Model
```php
SalesAudit.php
- Order tracking (before completion)
- Traits: HasFactory
- Relationships: customer, admin, logistic, address, auditTrail, orderItems
- Scopes: pending(), approved(), rejected()
- Methods: getAggregatedAuditTrail(), hasSufficientStock(), updateDeliveryStatus()
```

#### AuditTrail Model
```php
AuditTrail.php
- Transaction tracking
- Relationships: salesAudit, product, member, stock, performedBy
```

#### Cart & CartItem Models
```php
Cart.php
- Shopping cart
- Relationships: user, cartItems

CartItem.php
- Cart line items
- Relationships: cart, product
```

#### Address Model
```php
UserAddress.php
- Customer delivery addresses
- Relationships: user, salesAudit
```

#### Stock Trail Model
```php
StockTrail.php
- Stock history tracking
- Relationships: stock, performedBy
```

#### Member Earnings Model
```php
MemberEarnings.php
- Member revenue tracking
- Relationships: member
```

#### Price Models
```php
ProductPriceHistory.php
- Price change history
- Relationships: product

PriceTrend.php
- Aggregated price trends
- Relationships: product
```

#### Security Models
```php
EmailChangeRequest.php
- Email change OTP tracking
- Extends: BaseOtpRequest

PhoneChangeRequest.php
- Phone change OTP tracking
- Extends: BaseOtpRequest

PasswordChangeRequest.php
- Member password change requests
- Relationships: user, approvedBy

LoginAttempt.php
- Brute force protection
```

#### File Models
```php
FileUpload.php
- File upload tracking
- Polymorphic relationships

DeliveryProof.php
- Delivery proof images
- Relationships: sales, uploadedBy
```

#### System Models
```php
SystemLog.php
- System activity logging
- Relationships: user

SystemSetting.php
- Application configuration
```

## Services

### Business Logic Services (`app/Services/`)

#### AuditTrailService
```php
AuditTrailService.php
- Create audit trails
- Track product sales
- Link sales to members and stocks
```

#### FileUploadService
```php
FileUploadService.php
- Handle file uploads
- Manage file storage
- Track file metadata
- Clean up unused files
```

#### LoginLockoutService
```php
LoginLockoutService.php
- Track login attempts
- Implement lockout logic
- Check lockout status
- Reset attempts on success
```

#### NotificationService
```php
NotificationService.php
- Format notifications
- Resolve translation keys
- Handle notification data
- Multi-language support
```

#### TranslationService
```php
TranslationService.php
- Load translations
- Get all translations for locale
- Translate keys
- Cache translations
```

## Middleware

### HTTP Middleware (`app/Http/Middleware/`)

#### HandleInertiaRequests
```php
HandleInertiaRequests.php
- Share data with Inertia.js
- Provide auth user
- Share permissions
- Share notifications
- Share translations
- Share flash messages
```

#### SingleSessionMiddleware
```php
SingleSessionMiddleware.php
- Enforce single session per user
- Validate current session
- Redirect to conflict page
```

### Laravel Built-in Middleware
```
auth                    - Authenticate users
verified                - Ensure email verification
guest                   - Redirect authenticated users
throttle                - Rate limiting
role:{role}             - Spatie role check
can:{permission}        - Spatie permission check
```

## Form Requests

### Request Validation (`app/Http/Requests/`)
```php
StoreProductRequest.php
UpdateProductRequest.php
StoreStockRequest.php
UpdateStockRequest.php
StoreMemberRequest.php
UpdateMemberRequest.php
StoreLogisticRequest.php
UpdateLogisticRequest.php
StoreStaffRequest.php
UpdateStaffRequest.php
// ... and more
```

### Request Features
- Validation rules
- Authorization checks
- Custom error messages
- Data preparation

## Traits

### Reusable Traits (`app/Traits/`)

#### HasFileUploads
```php
HasFileUploads.php
- File upload handling
- File deletion
- File path normalization
- Automatic cleanup on model deletion
```

## Helpers

### System Helpers (`app/Helpers/`)

#### SystemLogger
```php
SystemLogger.php
- Log user actions
- Log system events
- Track IP and user agent
- Store in system_logs table
```

## Notifications

### Notification Classes (`app/Notifications/`)

#### Order Notifications
```
NewOrderNotification.php                - New order placed
OrderConfirmationNotification.php      - Order confirmed
OrderStatusUpdate.php                   - Order status changed
OrderRejectionNotification.php         - Order rejected
OrderReadyForPickupNotification.php    - Ready for pickup
OrderPickedUpNotification.php          - Order picked up
OrderDelayedNotification.php           - Order delayed
```

#### Delivery Notifications
```
DeliveryTaskNotification.php           - Delivery assigned
DeliveryStatusUpdate.php               - Delivery status changed
LogisticOrderReadyNotification.php     - Order ready for logistic
LogisticOrderPickedUpNotification.php  - Order picked up by logistic
```

#### Member Notifications
```
ProductSaleNotification.php            - Product sold
StockAddedNotification.php             - Stock added
EarningsUpdateNotification.php         - Earnings updated
LowStockAlertNotification.php          - Low stock warning
```

#### Inventory Notifications
```
InventoryUpdateNotification.php        - Inventory changed
```

#### Membership Notifications
```
MembershipUpdateNotification.php       - Membership changed
PasswordChangeRequestNotification.php  - Password change requested
```

#### Security Notifications
```
VerifyEmailNotification.php            - Email verification
EmailChangeOtpNotification.php         - Email change OTP
PhoneChangeOtpNotification.php         - Phone change OTP
```

#### Order Receipt
```
OrderReceipt.php                       - Order receipt email
```

### Notification Channels
- Database (in-app notifications)
- Mail (email notifications)
- Custom channels (extensible)

## Mail

### Mailable Classes (`app/Mail/`)

```php
OrderNotificationPreview.php           - Order email preview
```

### Mail Configuration
- SMTP driver
- Mailtrap for development
- Queue support for async sending

## Providers

### Service Providers (`app/Providers/`)

#### AppServiceProvider
```php
AppServiceProvider.php
- Register services
- Boot application services
- Configure pagination
- Set up observers
```

### Laravel Default Providers
- AuthServiceProvider
- BroadcastServiceProvider
- EventServiceProvider
- RouteServiceProvider

## Database

### Migrations (`database/migrations/`)
- Schema definitions
- Table creation
- Column modifications
- Foreign key constraints
- Indexes

### Seeders (`database/seeders/`)
```
DatabaseSeeder.php              - Main seeder
RoleSeeder.php                  - Roles and permissions
UserSeeder.php                  - Sample users
ProductSeeder.php               - Sample products
StockSeeder.php                 - Sample stocks
ComprehensiveSalesSeeder.php    - Sample sales
MemberEarningsSeeder.php        - Sample earnings
PriceTrendSeeder.php            - Sample price trends
NotificationSeeder.php          - Sample notifications
SystemLogSeeder.php             - Sample system logs
UrgentOrderTestSeeder.php       - Urgent order testing
```

### Factories (`database/factories/`)
```
UserFactory.php
ProductFactory.php
StockFactory.php
SalesFactory.php
SalesAuditFactory.php
AuditTrailFactory.php
CartFactory.php
CartItemFactory.php
UserAddressFactory.php
DeliveredSalesFactory.php
```

## Configuration

### Config Files (`config/`)
```
app.php                 - Application config
auth.php                - Authentication config
cache.php               - Cache config
database.php            - Database config
filesystems.php         - File storage config
inertia.php             - Inertia.js config
logging.php             - Logging config
mail.php                - Mail config
permission.php          - Spatie permission config
queue.php               - Queue config
services.php            - Third-party services
session.php             - Session config
```

## Routing

### Route Files (`routes/`)
```
web.php                 - Web routes (main)
auth.php                - Authentication routes
settings.php            - Settings routes
console.php             - Artisan commands
```

### Route Organization
- Grouped by role (admin, customer, logistic, member)
- Middleware applied per group
- Permission-based route protection
- Named routes for easy reference

## Queue System

### Queue Configuration
- Driver: Database (default)
- Jobs table for queue storage
- Failed jobs tracking
- Retry mechanism

### Queue Usage
- Email sending
- Notification delivery
- Report generation
- File processing

## Caching

### Cache Configuration
- Driver: File/Database/Redis (configurable)
- Permission caching (Spatie)
- Route caching
- Config caching
- View caching

### Cache Usage
```php
Cache::remember('key', $ttl, function() {
    return expensive_operation();
});
```

## Logging

### Log Channels
- Single: Single file
- Daily: Daily rotating files
- Stack: Multiple channels
- Syslog: System log
- Errorlog: PHP error log

### System Logging
```php
SystemLogger::log($action, $description, $modelType, $modelId);
```

### Log Storage
- `storage/logs/laravel.log`
- `system_logs` database table

## File Storage

### Storage Configuration
```
storage/
├── app/
│   ├── private/
│   │   ├── avatars/        - User avatars
│   │   └── documents/      - Member documents
│   └── public/
│       ├── products/       - Product images
│       └── delivery_proofs/ - Delivery proofs
├── framework/
└── logs/
```

### File Access
- Public files: Direct URL access
- Private files: Controller-based access with authentication
- Signed URLs for temporary access

## Security

### CSRF Protection
- Automatic token generation
- Token validation on state-changing requests
- Token refresh on page load

### SQL Injection Prevention
- Eloquent ORM parameterized queries
- Query builder parameter binding
- Input validation

### XSS Prevention
- Blade template escaping
- React automatic escaping
- Content Security Policy headers

### Authentication
- Session-based authentication
- Password hashing (Bcrypt)
- Remember me functionality
- Email verification

### Authorization
- Role-based access control (RBAC)
- Permission-based access
- Policy classes
- Gate definitions

## Performance

### Optimization Techniques
- Eager loading relationships
- Query optimization
- Database indexing
- Caching strategies
- Asset compilation
- Lazy loading

### Database Optimization
- Proper indexing
- Query optimization
- Connection pooling
- Read/write splitting (optional)

## Testing

### Test Structure
```
tests/
├── Feature/            - Feature tests
├── Unit/               - Unit tests
└── TestCase.php        - Base test case
```

### Testing Tools
- Pest PHP
- Laravel testing helpers
- Database factories
- Faker for test data

## Deployment

### Production Checklist
```bash
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force
php artisan storage:link
npm run build
```

### Environment Configuration
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com
DB_CONNECTION=mysql
QUEUE_CONNECTION=database
MAIL_MAILER=smtp
```

## API Documentation

### RESTful Conventions
- GET: Retrieve resources
- POST: Create resources
- PUT/PATCH: Update resources
- DELETE: Delete resources

### Response Format
```json
{
  "success": true,
  "data": {...},
  "message": "Success message"
}
```

### Error Handling
```json
{
  "success": false,
  "message": "Error message",
  "errors": {...}
}
```

## Maintenance

### Artisan Commands
```bash
php artisan migrate         - Run migrations
php artisan db:seed         - Run seeders
php artisan queue:work      - Process queue jobs
php artisan cache:clear     - Clear cache
php artisan config:clear    - Clear config cache
php artisan route:clear     - Clear route cache
php artisan view:clear      - Clear view cache
php artisan storage:link    - Create storage symlink
```

### Scheduled Tasks
```php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule)
{
    // Define scheduled tasks
    $schedule->command('inspire')->hourly();
}
```
