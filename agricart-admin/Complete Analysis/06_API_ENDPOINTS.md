# API Endpoints and Routes

## Public Routes (Guest Access)

### Home & Product Browsing
```
GET  /                          - Home page with featured products
GET  /search                    - Search products
GET  /customer/produce          - View all products catalog
GET  /customer/about            - About us page
GET  /terms-of-service          - Terms of service page
```

### Authentication Routes
```
GET  /register                  - Customer registration form
POST /register                  - Process customer registration
POST /register/check-duplicate-email - Check email availability

GET  /login                     - Customer login page
POST /login                     - Process customer login

GET  /admin/login               - Admin/Staff login page
POST /admin/login               - Process admin/staff login

GET  /member/login              - Member login page
POST /member/login              - Process member login

GET  /logistic/login            - Logistic login page
POST /logistic/login            - Process logistic login
```

### Password Reset
```
GET  /forgot-password           - Password reset request form
POST /forgot-password           - Send password reset email
GET  /reset-password/{token}    - Password reset form
POST /reset-password            - Process password reset
```

### Member Password Change (Guest)
```
GET  /member/forgot-password                    - Member password change request
POST /member/forgot-password                    - Submit password change request
GET  /member/password-request/{id}/pending      - View request status
POST /member/password-request/{id}/cancel       - Cancel request
GET  /member/password-request/{id}/status       - Check request status (API)
GET  /member/reset-password/{id}                - Password change form (after approval)
POST /member/reset-password/{id}                - Process password change
```

---

## Authenticated Routes (All Users)

### Email Verification
```
GET  /verify-email                      - Email verification notice
GET  /verify-email/{id}/{hash}          - Verify email (signed URL)
POST /email/verification-notification   - Resend verification email
```

### Password Confirmation
```
GET  /confirm-password                  - Password confirmation form
POST /confirm-password                  - Confirm password
```

### Logout
```
POST /logout                            - Logout user
```

### Forced Password Change
```
GET  /password/change                   - Password change form (default password)
POST /password/change                   - Process password change
```

### Credentials Update (Default Accounts)
```
GET  /credentials/update                - Update credentials form
POST /credentials/update                - Process credentials update
```

### Single Session Management
```
GET  /single-session/restricted         - Session conflict page
POST /single-session/logout             - Force logout other sessions
POST /single-session/cancel             - Cancel login attempt
GET  /api/session/check                 - Check session validity (API)
```

---

## Admin & Staff Routes
**Prefix**: `/admin`
**Middleware**: `auth`, `verified`, `password.change.required`, `role:admin|staff`

### Dashboard
```
GET  /admin/dashboard                   - Admin dashboard
```

### Profile Management
```
GET  /admin/profile/info                - Profile information page
GET  /admin/profile/password            - Password management page
GET  /admin/profile/appearance          - Appearance settings page
PATCH /admin/profile/name               - Update name
POST /admin/profile/avatar/upload       - Upload avatar
DELETE /admin/profile/avatar/delete     - Delete avatar
```

### Email Change (OTP)
```
POST /admin/profile/email-change/send-otp           - Send OTP to new email
GET  /admin/profile/email-change/verify/{id}        - OTP verification page
POST /admin/profile/email-change/verify/{id}        - Verify OTP
POST /admin/profile/email-change/resend/{id}        - Resend OTP
POST /admin/profile/email-change/cancel/{id}        - Cancel email change
```

### Phone Change (OTP)
```
POST /admin/profile/phone-change/send-otp           - Send OTP to new phone
GET  /admin/profile/phone-change/verify/{id}        - OTP verification page
POST /admin/profile/phone-change/verify/{id}        - Verify OTP
POST /admin/profile/phone-change/resend/{id}        - Resend OTP
POST /admin/profile/phone-change/cancel/{id}        - Cancel phone change
```

### System Logs
```
GET  /admin/system-logs                 - View system logs
GET  /admin/system-logs/export          - Export system logs
```

### Inventory Management
```
Permission: view inventory
GET  /admin/inventory                   - View inventory list

Permission: create products
GET  /admin/inventory/create            - Create product form
POST /admin/inventory                   - Store new product
POST /admin/inventory/check-duplicate   - Check duplicate product name

Permission: edit products
GET  /admin/inventory/{id}/edit         - Edit product form
PUT  /admin/inventory/{id}              - Update product

Permission: delete products
DELETE /admin/inventory/{id}            - Delete product

Permission: generate inventory report
GET  /admin/inventory/report            - Generate inventory report
```

### Archive Management
```
Permission: view archive
GET  /admin/inventory/archive           - View archived products

Permission: archive products
POST /admin/inventory/{id}/archive      - Archive product

Permission: unarchive products
POST /admin/inventory/archive/{id}/restore - Restore archived product

Permission: delete archived products
DELETE /admin/inventory/archive/{id}    - Permanently delete archived product
```

### Stock Management
```
Permission: create stocks
GET  /admin/inventory/{id}/add-stock                    - Add stock form
POST /admin/inventory/{id}/add-stock                    - Store new stock
GET  /admin/inventory/{id}/remove-perished-stock        - Remove stock form
POST /admin/inventory/{id}/remove-perished-stock        - Store stock removal

Permission: edit stocks
GET  /admin/inventory/{product}/edit-stock/{stock}      - Edit stock form
PUT  /admin/inventory/{product}/edit-stock/{stock}      - Update stock

Permission: view sold stock
GET  /admin/inventory/sold-stock                        - View sold stocks

Permission: view stock trail
GET  /admin/inventory/removed-stock                     - View removed stocks
POST /admin/inventory/removed-stock/{id}/restore        - Restore removed stock
```

### Order Management
```
Permission: view orders
GET  /admin/orders                      - View orders list
GET  /admin/orders/{id}                 - View order details
GET  /admin/orders/{id}/receipt-preview - View order receipt
GET  /admin/orders/{id}/delivery-proof  - View delivery proof

Permission: manage orders
POST /admin/orders/{id}/approve         - Approve order
POST /admin/orders/{id}/reject          - Reject order
POST /admin/orders/{id}/process         - Process order
POST /admin/orders/{id}/assign-logistic - Assign logistic
POST /admin/orders/{id}/mark-urgent     - Mark order as urgent
POST /admin/orders/{id}/unmark-urgent   - Remove urgent flag

Permission: mark orders ready for pickup
POST /admin/orders/{id}/mark-ready      - Mark order ready
POST /admin/orders/{id}/mark-picked-up  - Mark order picked up

Permission: generate order report
GET  /admin/orders/report               - Generate order report
```

### Sales Management
```
Permission: view sales
GET  /admin/sales                       - View all sales
GET  /admin/sales/member-sales          - View member sales
GET  /admin/sales/audit-trail           - View audit trail

Permission: generate sales report
GET  /admin/sales/report                - Generate sales report
GET  /admin/sales/audit-trail/export    - Export audit trail
```

### Trend Analysis
```
Permission: view price trend
GET  /admin/trends                      - View trend analysis page
GET  /admin/trends/data                 - Get trend data (API)
GET  /admin/trends/latest-data          - Get latest trend data (API)
GET  /admin/trends/price-categories     - Get price categories (API)
```

### Membership Management
```
Permission: view membership
GET  /admin/membership                  - View members list
GET  /admin/membership/deactivated      - View deactivated members

Permission: create members
GET  /admin/membership/add              - Add member form
POST /admin/membership                  - Store new member
POST /admin/membership/check-duplicate-name    - Check duplicate name
POST /admin/membership/check-duplicate-contact - Check duplicate contact

Permission: edit members
GET  /admin/membership/{id}/edit        - Edit member form
PUT  /admin/membership/{id}             - Update member
DELETE /admin/membership/{id}/document  - Delete member document
POST /admin/membership/password-change/{id}/approve - Approve password change
POST /admin/membership/password-change/{id}/reject  - Reject password change

Permission: deactivate members
DELETE /admin/membership/{id}           - Deactivate member

Permission: reactivate members
POST /admin/membership/{id}/reactivate  - Reactivate member

Permission: delete members
DELETE /admin/membership/{id}/hard-delete - Permanently delete member

Permission: generate membership report
GET  /admin/membership/report           - Generate membership report
```

### Logistics Management
```
Permission: view logistics
GET  /admin/logistics                   - View logistics list
GET  /admin/logistics/deactivated       - View deactivated logistics

Permission: create logistics
GET  /admin/logistics/add               - Add logistic form
POST /admin/logistics                   - Store new logistic

Permission: edit logistics
GET  /admin/logistics/{id}/edit         - Edit logistic form
PUT  /admin/logistics/{id}              - Update logistic

Permission: deactivate logistics
DELETE /admin/logistics/{id}            - Deactivate logistic

Permission: reactivate logistics
POST /admin/logistics/{id}/reactivate   - Reactivate logistic

Permission: delete logistics
DELETE /admin/logistics/{id}/hard-delete - Permanently delete logistic

Permission: generate logistics report
GET  /admin/logistics/report            - Generate logistics report
```

### Staff Management (Admin Only)
```
Permission: view staffs
GET  /admin/staff                       - View staff list

Permission: create staffs
GET  /admin/staff/add                   - Add staff form
POST /admin/staff                       - Store new staff
POST /admin/staff/check-duplicate-email    - Check duplicate email
POST /admin/staff/check-duplicate-contact  - Check duplicate contact

Permission: edit staffs
GET  /admin/staff/{id}/edit             - Edit staff form
PUT  /admin/staff/{id}                  - Update staff

Permission: deactivate staffs
POST /admin/staff/{id}/deactivate       - Deactivate staff

Permission: reactivate staffs
POST /admin/staff/{id}/reactivate       - Reactivate staff

Permission: delete staffs
DELETE /admin/staff/{id}                - Delete staff

Permission: generate staff report
GET  /admin/staff/report                - Generate staff report
```

### Notifications
```
GET  /admin/notifications               - View notifications page
POST /admin/notifications/mark-read     - Mark notification as read
POST /admin/notifications/mark-all-read - Mark all as read
POST /admin/notifications/{id}/hide-from-header - Hide from header
POST /admin/notifications/hide-all-from-header  - Hide all from header
GET  /admin/profile/notifications       - Profile notifications page
```

---

## Customer Routes
**Prefix**: `/customer`
**Middleware**: `auth`, `verified`, `password.change.required`, `role:customer`

### Shopping Cart
```
GET  /customer/cart                     - View shopping cart
POST /customer/cart/store               - Add item to cart
PUT  /customer/cart/update/{id}         - Update cart item
POST /customer/cart/checkout            - Checkout cart
DELETE /customer/cart/remove/{id}       - Remove cart item
```

### Order Management
```
GET  /customer/orders/history           - View order history
GET  /customer/orders/report            - Generate order report
POST /customer/orders/{id}/cancel       - Cancel order
POST /customer/orders/{id}/confirm-received - Confirm order received
```

### Profile Management
```
GET  /customer/profile/info             - Profile information page
GET  /customer/profile/password         - Password management page
GET  /customer/profile/appearance       - Appearance settings page
GET  /customer/profile/help             - Help page
PUT  /customer/profile                  - Update profile
PATCH /customer/profile                 - Update profile (alternative)
PATCH /customer/profile/name            - Update name
POST /customer/profile/change-password  - Change password
POST /customer/profile/avatar/upload    - Upload avatar
DELETE /customer/profile/avatar/delete  - Delete avatar
POST /customer/profile/logout           - Logout
```

### Address Management
```
GET  /customer/profile/addresses        - View addresses
POST /customer/profile/addresses        - Create address
GET  /customer/profile/addresses/{id}   - View address
PUT  /customer/profile/addresses/{id}   - Update address
DELETE /customer/profile/addresses/{id} - Delete address
POST /customer/profile/addresses/{id}/set-default  - Set default address
POST /customer/profile/addresses/{id}/set-active   - Set active address
POST /customer/profile/addresses/{id}/update-main  - Update main address
PUT  /customer/profile/main-address     - Update main address fields
GET  /customer/profile/current-address  - Get current address (API)
```

### Email Change (OTP)
```
POST /customer/profile/email-change/send-otp        - Send OTP
GET  /customer/profile/email-change/verify/{id}     - Verification page
POST /customer/profile/email-change/verify/{id}     - Verify OTP
POST /customer/profile/email-change/resend/{id}     - Resend OTP
POST /customer/profile/email-change/cancel/{id}     - Cancel change
```

### Phone Change (OTP)
```
POST /customer/profile/phone-change/send-otp        - Send OTP
GET  /customer/profile/phone-change/verify/{id}     - Verification page
POST /customer/profile/phone-change/verify/{id}     - Verify OTP
POST /customer/profile/phone-change/resend/{id}     - Resend OTP
POST /customer/profile/phone-change/cancel/{id}     - Cancel change
```

### Notifications
```
GET  /customer/notifications            - View notifications page
POST /customer/notifications/mark-read  - Mark as read
POST /customer/notifications/mark-all-read - Mark all as read
POST /customer/notifications/{id}/hide-from-header - Hide from header
POST /customer/notifications/hide-all-from-header  - Hide all from header
GET  /customer/profile/notifications    - Profile notifications page
```

---

## Logistic Routes
**Prefix**: `/logistic`
**Middleware**: `auth`, `verified`, `password.change.required`, `role:logistic`

### Dashboard & Orders
```
GET  /logistic/dashboard                - Logistic dashboard
GET  /logistic/orders                   - View assigned orders
GET  /logistic/orders/{id}              - View order details
PUT  /logistic/orders/{id}/delivery-status - Update delivery status
POST /logistic/orders/{id}/mark-delivered  - Mark order as delivered
GET  /logistic/report                   - Generate delivery report
```

### Profile Management
```
GET  /logistic/profile/info             - Profile information page
GET  /logistic/profile/password         - Password management page
GET  /logistic/profile/appearance       - Appearance settings page
PATCH /logistic/profile/name            - Update name
POST /logistic/profile/avatar/upload    - Upload avatar
DELETE /logistic/profile/avatar/delete  - Delete avatar
```

### Email Change (OTP)
```
POST /logistic/profile/email-change/send-otp        - Send OTP
GET  /logistic/profile/email-change/verify/{id}     - Verification page
POST /logistic/profile/email-change/verify/{id}     - Verify OTP
POST /logistic/profile/email-change/resend/{id}     - Resend OTP
POST /logistic/profile/email-change/cancel/{id}     - Cancel change
```

### Phone Change (OTP)
```
POST /logistic/profile/phone-change/send-otp        - Send OTP
GET  /logistic/profile/phone-change/verify/{id}     - Verification page
POST /logistic/profile/phone-change/verify/{id}     - Verify OTP
POST /logistic/profile/phone-change/resend/{id}     - Resend OTP
POST /logistic/profile/phone-change/cancel/{id}     - Cancel change
```

### Notifications
```
GET  /logistic/notifications            - View notifications page
POST /logistic/notifications/mark-read  - Mark as read
POST /logistic/notifications/mark-all-read - Mark all as read
POST /logistic/notifications/{id}/hide-from-header - Hide from header
POST /logistic/notifications/hide-all-from-header  - Hide all from header
GET  /logistic/profile/notifications    - Profile notifications page
```

---

## Member Routes
**Prefix**: `/member`
**Middleware**: `auth`, `password.change.required`, `role:member`

### Dashboard & Stocks
```
GET  /member/dashboard                  - Member dashboard
GET  /member/allStocks                  - View all stocks
```

### Password Management
```
GET  /member/change-password            - Password change page
```

### Notifications
```
GET  /member/notifications              - View notifications page
POST /member/notifications/mark-read    - Mark as read
POST /member/notifications/mark-all-read - Mark all as read
POST /member/notifications/{id}/hide-from-header - Hide from header
POST /member/notifications/hide-all-from-header  - Hide all from header
```

---

## API Routes (AJAX/Fetch)

### User Preferences
```
POST /api/user/appearance               - Update theme preference
POST /api/user/language                 - Update language preference
```

### File Management
```
POST /api/files/upload                  - Upload file
DELETE /api/files/{id}                  - Delete file
GET  /api/files/{id}                    - Get file info
```

### Lockout Status
```
GET  /api/lockout-status                - Check login lockout status
```

### Private Files
```
GET  /private-file/{category}/{filename} - Access private files
```

### Product Images
```
GET  /product-image/{filename}          - Access product images
```

### Delivery Proofs
```
GET  /delivery-proof/{id}               - Access delivery proof images
```

---

## Settings Routes
**Prefix**: `/settings`
**Middleware**: `auth`, `password.change.required`

```
GET  /settings                          - Redirect to profile
GET  /settings/profile                  - Profile settings
PATCH /settings/profile                 - Update profile
DELETE /settings/profile                - Delete account
GET  /settings/password                 - Password settings
PUT  /settings/password                 - Update password
GET  /settings/appearance               - Appearance settings
```

---

## Route Naming Convention

### Pattern
```
{role}.{resource}.{action}
```

### Examples
```
admin.dashboard                         - Admin dashboard
admin.orders.index                      - Admin orders list
admin.orders.show                       - Admin order details
customer.profile.info                   - Customer profile page
logistic.orders.index                   - Logistic orders list
member.dashboard                        - Member dashboard
```

---

## Middleware Stack

### Common Middleware
- `web`: Web middleware group (sessions, CSRF, cookies)
- `auth`: Require authentication
- `verified`: Require email verification (customers only)
- `password.change.required`: Force password change for default accounts
- `role:{role}`: Require specific role
- `can:{permission}`: Require specific permission
- `throttle:{attempts},{minutes}`: Rate limiting

### Custom Middleware
- `SingleSessionMiddleware`: Enforce single session per user
- `HandleInertiaRequests`: Share data with Inertia.js frontend

---

## Rate Limiting

### Email Verification
- 6 attempts per minute

### Password Reset
- 60 seconds throttle

### OTP Verification
- 3 attempts per request
- 1 minute resend throttle

### API Endpoints
- Configurable per endpoint
- Default: 60 requests per minute
