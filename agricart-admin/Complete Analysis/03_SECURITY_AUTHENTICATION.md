# Security Measures and Authentication/Authorization

## Authentication System

### Multi-Portal Login System
The system implements separate login portals for different user types:

1. **Customer Login** (`/login`)
   - Default login page
   - Email and password authentication
   - Email verification required
   - Terms of Service acceptance

2. **Admin/Staff Login** (`/admin/login`)
   - Separate portal for administrative users
   - Role-based access after login
   - No email verification required

3. **Member Login** (`/member/login`)
   - Dedicated portal for farmers/producers
   - Contact number and password authentication
   - No email verification required
   - Password change request system

4. **Logistic Login** (`/logistic/login`)
   - Delivery personnel portal
   - Email and password authentication
   - No email verification required

### Authentication Features

#### Email Verification
- **Customers Only**: Email verification required for customer accounts
- **Verification Flow**: 
  - Email sent upon registration
  - Signed URL with expiration
  - Resend verification option
  - Throttled to 6 attempts per minute

#### Password Management
1. **Password Reset**:
   - Token-based reset system
   - Email delivery of reset links
   - 60-minute token expiration
   - Throttled requests (60 seconds)

2. **Member Password Change**:
   - Request-based system (requires admin approval)
   - Pending request tracking
   - Admin approval/rejection workflow
   - Notification system for status updates

3. **Default Password Enforcement**:
   - New users created with default passwords
   - Forced password change on first login
   - Credential update page for default accounts

#### Brute Force Protection
```php
// Login Lockout System
- Maximum 5 failed attempts
- 15-minute lockout period
- IP-based tracking
- Visual lockout countdown
- Automatic unlock after timeout
```

**Implementation**:
- `LoginAttempt` model tracks attempts
- `LoginLockoutService` manages lockout logic
- Real-time lockout status API endpoint
- Frontend countdown timer display

#### Single Session Enforcement
- **One Device Policy**: Users can only be logged in on one device
- **Session Management**:
  - Current session ID stored in user record
  - Automatic logout of other sessions
  - Session validation on each request
  - Force logout option for new login

**Flow**:
1. User logs in on Device A
2. Session ID stored in database
3. User attempts login on Device B
4. System detects existing session
5. Options: Force logout Device A or cancel

## Authorization System

### Role-Based Access Control (RBAC)
Powered by **Spatie Laravel Permission** package.

#### Roles
1. **Admin**
   - Full system access
   - All permissions except role-specific ones
   - Staff management capabilities
   - System configuration access

2. **Staff**
   - Most admin permissions
   - Cannot manage other staff
   - Limited deletion capabilities
   - Requires admin approval for critical actions

3. **Customer**
   - Shopping and ordering
   - Profile management
   - Order history access
   - Cart management

4. **Logistic**
   - View assigned orders
   - Update delivery status
   - Upload delivery proofs
   - Generate delivery reports

5. **Member**
   - View stock inventory
   - Track earnings
   - View transaction history
   - Request password changes

### Permission Categories

#### Inventory Permissions
```
- view inventory
- create products
- edit products
- delete products
- archive products
- unarchive products
- delete archived products
- view stocks
- create stocks
- edit stocks
- delete stocks
- view sold stock
- view stock trail
- generate inventory report
```

#### Order Permissions
```
- view orders
- manage orders
- approve orders
- reject orders
- process orders
- assign logistics
- mark orders urgent
- unmark orders urgent
- mark orders ready for pickup
- view order receipts
- generate order report
```

#### Sales Permissions
```
- view sales
- view member sales
- generate sales report
- export sales data
```

#### User Management Permissions
```
Admin Only:
- view staffs
- create staffs
- edit staffs
- delete staffs
- generate staff report
- view membership
- create members
- edit members
- deactivate members
- reactivate members
- delete members
- generate membership report

Admin & Staff:
- view logistics
- create logistics
- edit logistics
- deactivate logistics
- reactivate logistics
- delete logistics
- generate logistics report
```

#### Trend Analysis Permissions
```
- view price trend
- view trend analysis
- generate trend report
```

#### Role-Specific Permissions
```
Customer:
- access customer features
- view order history
- generate customer order report

Logistic:
- access logistic features
- view assigned orders
- update delivery status
- generate logistic report

Member:
- access member features
- view member earnings
- generate revenue report
```

## Security Features

### OTP Verification System
Generalized OTP system for sensitive operations:

1. **Email Change**:
   - 6-digit OTP sent to new email
   - 10-minute expiration
   - Maximum 3 verification attempts
   - Resend capability (1-minute throttle)

2. **Phone Change**:
   - 6-digit OTP sent to new phone
   - 10-minute expiration
   - Maximum 3 verification attempts
   - Resend capability (1-minute throttle)

**Base OTP Controller Features**:
- Automatic expiration handling
- Attempt tracking
- Rate limiting
- Secure token generation

### File Security

#### Private File Management
- **Document Storage**: Member documents, avatars
- **Access Control**: Route-based authentication
- **File Validation**: Type and size restrictions
- **Secure URLs**: Temporary signed URLs

#### File Upload Trait
```php
HasFileUploads Trait:
- Automatic file cleanup
- Category-based organization
- Duplicate prevention
- Secure path handling
```

### Middleware Protection

#### Authentication Middleware
- `auth`: Verify authenticated user
- `verified`: Ensure email verification (customers only)
- `password.change.required`: Force password change for default accounts

#### Authorization Middleware
- `role:admin|staff`: Role-based route protection
- `can:permission`: Permission-based access control

#### Custom Middleware
- `SingleSessionMiddleware`: Enforce single session per user
- `HandleInertiaRequests`: Share auth data with frontend

### CSRF Protection
- Laravel's built-in CSRF protection
- Token validation on all POST/PUT/DELETE requests
- Automatic token refresh

### Password Security
- **Hashing**: Bcrypt algorithm
- **Minimum Requirements**: 
  - 8 characters minimum
  - Complexity validation on frontend
- **Password Confirmation**: Required for sensitive operations
- **Timeout**: 3-hour password confirmation timeout

### Session Security
- **Driver**: Database-based sessions
- **Lifetime**: Configurable (default: 120 minutes)
- **Secure Cookies**: HTTPS enforcement in production
- **HTTP Only**: Prevent JavaScript access
- **Same Site**: CSRF protection

### API Security
- **Rate Limiting**: Throttled endpoints
- **Signed Routes**: Email verification links
- **CORS Configuration**: Controlled cross-origin requests

### Data Validation
- **Request Validation**: Laravel Form Requests
- **Input Sanitization**: Automatic XSS protection
- **Type Casting**: Model attribute casting
- **SQL Injection Prevention**: Eloquent ORM parameterized queries

### Audit Trail
- **System Logging**: Comprehensive activity tracking
- **User Actions**: All CRUD operations logged
- **IP Tracking**: Request origin logging
- **Timestamp**: Precise action timing

## Security Best Practices Implemented

1. **Principle of Least Privilege**: Users only get necessary permissions
2. **Defense in Depth**: Multiple security layers
3. **Secure by Default**: Safe default configurations
4. **Input Validation**: All user input validated
5. **Output Encoding**: XSS prevention
6. **Error Handling**: No sensitive data in error messages
7. **Logging**: Comprehensive audit trails
8. **Session Management**: Secure session handling
9. **Password Policies**: Strong password requirements
10. **Access Control**: Granular permission system
