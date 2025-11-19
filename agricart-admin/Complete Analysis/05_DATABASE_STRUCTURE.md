# Database Structure

## Core Tables

### users
Primary user table for all user types (polymorphic).

**Fields**:
- `id`: Primary key
- `name`: User full name
- `email`: Email address (unique)
- `password`: Hashed password
- `avatar`: Profile picture path
- `contact_number`: Phone number
- `registration_date`: Registration timestamp
- `member_id`: Unique member identifier (for members)
- `document`: Member document path
- `document_marked_for_deletion`: Boolean flag
- `type`: User type (admin, staff, customer, logistic, member)
- `active`: Account status boolean
- `is_default`: Default password flag
- `current_session_id`: Active session tracking
- `email_verified_at`: Email verification timestamp
- `appearance`: Theme preference (light/dark/system)
- `language`: Language preference (en/tl)
- `can_view_delivery_proofs`: Permission flag
- `remember_token`: Remember me token
- `created_at`, `updated_at`: Timestamps

**Relationships**:
- Has many: sales, salesAudit, stocks, addresses, cart, memberEarnings
- Has many (logistic): assignedOrders
- Has many: emailChangeRequests, notifications

**Indexes**:
- Unique: email, member_id
- Index: type, active, current_session_id

---

### products
Product catalog table.

**Fields**:
- `id`: Primary key
- `name`: Product name
- `price_kilo`: Price per kilogram (decimal)
- `price_pc`: Price per piece (decimal)
- `price_tali`: Price per bundle (decimal)
- `description`: Product description (text)
- `image`: Product image path
- `produce_type`: Category/type of produce
- `archived_at`: Soft delete timestamp
- `created_at`, `updated_at`: Timestamps

**Relationships**:
- Has many: stocks, auditTrails, priceHistories, cartItems

**Indexes**:
- Index: archived_at, produce_type

---

### stocks
Inventory stock tracking table.

**Fields**:
- `id`: Primary key
- `product_id`: Foreign key to products
- `member_id`: Foreign key to users (members)
- `quantity`: Available quantity (decimal)
- `sold_quantity`: Total sold quantity (decimal)
- `pending_order_qty`: Reserved for pending orders (decimal)
- `initial_quantity`: Original quantity (decimal)
- `category`: Unit type (Kilo/Pc/Tali)
- `removed_at`: Soft delete timestamp
- `notes`: Removal notes
- `created_at`, `updated_at`: Timestamps

**Relationships**:
- Belongs to: product, member (user)
- Has many: stockTrails

**Indexes**:
- Foreign keys: product_id, member_id
- Index: quantity, removed_at, category

**Computed Attributes**:
- `is_locked`: Boolean (quantity = 0 and sold_quantity > 0)
- `can_be_edited`: Boolean
- `can_be_removed`: Boolean
- `customer_available_quantity`: quantity - pending_order_qty

---

### sales_audit
Order tracking table (before completion).

**Fields**:
- `id`: Primary key
- `customer_id`: Foreign key to users (customers)
- `total_amount`: Total order amount (decimal)
- `subtotal`: Product subtotal (decimal)
- `coop_share`: Cooperative share 10% (decimal)
- `member_share`: Member earnings (decimal)
- `status`: Order status (pending/approved/rejected)
- `delivery_status`: Delivery status (pending/out_for_delivery/delivered/ready_to_pickup)
- `delivery_proof_image`: Delivery photo path
- `delivery_confirmed`: Boolean
- `delivery_ready_time`: Ready timestamp
- `delivery_packed_time`: Packed timestamp
- `delivered_time`: Delivered timestamp
- `address_id`: Foreign key to user_addresses
- `admin_id`: Foreign key to users (admin)
- `admin_notes`: Admin comments (text)
- `logistic_id`: Foreign key to users (logistic)
- `is_urgent`: Urgent flag boolean
- `created_at`, `updated_at`: Timestamps

**Relationships**:
- Belongs to: customer, admin, logistic, address
- Has many: auditTrail, orderItems, sales

**Indexes**:
- Foreign keys: customer_id, admin_id, logistic_id, address_id
- Index: status, delivery_status, is_urgent

---

### sales
Completed sales table.

**Fields**:
- `id`: Primary key
- `customer_id`: Foreign key to users
- `total_amount`: Total amount (decimal)
- `subtotal`: Product subtotal (decimal)
- `coop_share`: Cooperative share (decimal)
- `member_share`: Member earnings (decimal)
- `delivery_address`: Delivery address (text) - DEPRECATED
- `admin_id`: Foreign key to users (admin)
- `admin_notes`: Admin comments (text)
- `logistic_id`: Foreign key to users (logistic)
- `sales_audit_id`: Foreign key to sales_audit
- `delivered_at`: Delivery timestamp
- `customer_received`: Confirmation boolean
- `customer_rate`: Rating (1-5)
- `customer_feedback`: Feedback text
- `customer_confirmed_at`: Confirmation timestamp
- `created_at`, `updated_at`: Timestamps

**Relationships**:
- Belongs to: customer, admin, logistic, salesAudit
- Has many: auditTrail, orderItems
- Has one: deliveryProof

**Indexes**:
- Foreign keys: customer_id, admin_id, logistic_id, sales_audit_id
- Index: delivered_at, customer_received

---

### audit_trails
Product-level transaction tracking.

**Fields**:
- `id`: Primary key
- `sale_id`: Foreign key to sales_audit
- `product_id`: Foreign key to products
- `quantity`: Quantity sold (decimal)
- `category`: Unit type (Kilo/Pc/Tali)
- `price_kilo`: Price at sale time (decimal)
- `price_pc`: Price at sale time (decimal)
- `price_tali`: Price at sale time (decimal)
- `member_id`: Foreign key to users (member)
- `stock_id`: Foreign key to stocks
- `performed_by_id`: Foreign key to users (admin/staff)
- `performed_by_type`: User type who performed action
- `created_at`, `updated_at`: Timestamps

**Relationships**:
- Belongs to: salesAudit (sale), product, member, stock, performedBy (user)

**Indexes**:
- Foreign keys: sale_id, product_id, member_id, stock_id, performed_by_id
- Index: category, created_at

---

### user_addresses
Customer delivery addresses.

**Fields**:
- `id`: Primary key
- `user_id`: Foreign key to users
- `street`: Street address
- `barangay`: Barangay/district
- `city`: City
- `province`: Province
- `is_active`: Active address boolean
- `created_at`, `updated_at`: Timestamps

**Relationships**:
- Belongs to: user
- Has many: salesAudit

**Indexes**:
- Foreign key: user_id
- Index: is_active

---

### carts
Shopping cart table.

**Fields**:
- `id`: Primary key
- `user_id`: Foreign key to users (unique)
- `created_at`, `updated_at`: Timestamps

**Relationships**:
- Belongs to: user
- Has many: cartItems

**Indexes**:
- Unique: user_id

---

### cart_items
Shopping cart items.

**Fields**:
- `id`: Primary key
- `cart_id`: Foreign key to carts
- `product_id`: Foreign key to products
- `quantity`: Item quantity (decimal)
- `category`: Unit type (Kilo/Pc/Tali)
- `created_at`, `updated_at`: Timestamps

**Relationships**:
- Belongs to: cart, product

**Indexes**:
- Foreign keys: cart_id, product_id
- Unique: cart_id + product_id + category

---

### order_items
Order line items (replaces audit_trails for order items).

**Fields**:
- `id`: Primary key
- `order_id`: Foreign key to sales_audit
- `product_id`: Foreign key to products
- `quantity`: Quantity ordered (decimal)
- `category`: Unit type (Kilo/Pc/Tali)
- `unit_price`: Price per unit (decimal)
- `subtotal`: Line item subtotal (decimal)
- `created_at`, `updated_at`: Timestamps

**Relationships**:
- Belongs to: salesAudit (order), product

**Indexes**:
- Foreign keys: order_id, product_id
- Index: category

---

### stock_trails
Stock history tracking.

**Fields**:
- `id`: Primary key
- `stock_id`: Foreign key to stocks
- `action`: Action type (added/sold/removed/restored/edited)
- `quantity_before`: Quantity before action (decimal)
- `quantity_after`: Quantity after action (decimal)
- `quantity_changed`: Change amount (decimal)
- `performed_by_id`: Foreign key to users
- `performed_by_type`: User type
- `notes`: Action notes (text)
- `created_at`, `updated_at`: Timestamps

**Relationships**:
- Belongs to: stock, performedBy (user)

**Indexes**:
- Foreign keys: stock_id, performed_by_id
- Index: action, created_at

---

### member_earnings
Member revenue tracking.

**Fields**:
- `id`: Primary key
- `member_id`: Foreign key to users (unique)
- `total_earnings`: Cumulative earnings (decimal)
- `last_updated`: Last update timestamp
- `created_at`, `updated_at`: Timestamps

**Relationships**:
- Belongs to: member (user)

**Indexes**:
- Unique: member_id
- Index: total_earnings

---

### product_price_histories
Price change tracking.

**Fields**:
- `id`: Primary key
- `product_id`: Foreign key to products
- `price_kilo`: Historical price (decimal)
- `price_pc`: Historical price (decimal)
- `price_tali`: Historical price (decimal)
- `recorded_at`: Price record timestamp
- `created_at`, `updated_at`: Timestamps

**Relationships**:
- Belongs to: product

**Indexes**:
- Foreign key: product_id
- Index: recorded_at

---

### price_trends
Aggregated price trend data.

**Fields**:
- `id`: Primary key
- `product_id`: Foreign key to products
- `category`: Unit type (Kilo/Pc/Tali)
- `average_price`: Average price (decimal)
- `min_price`: Minimum price (decimal)
- `max_price`: Maximum price (decimal)
- `trend_direction`: Trend (up/down/stable)
- `period_start`: Period start date
- `period_end`: Period end date
- `created_at`, `updated_at`: Timestamps

**Relationships**:
- Belongs to: product

**Indexes**:
- Foreign key: product_id
- Index: category, period_start, period_end

---

## Security & Authentication Tables

### password_reset_tokens
Password reset token storage.

**Fields**:
- `email`: Email address (primary key)
- `token`: Reset token (hashed)
- `created_at`: Token creation timestamp

**Indexes**:
- Primary key: email
- Index: token

---

### email_change_requests
Email change OTP verification.

**Fields**:
- `id`: Primary key
- `user_id`: Foreign key to users
- `new_email`: Requested new email
- `otp`: One-time password (hashed)
- `expires_at`: OTP expiration timestamp
- `verified_at`: Verification timestamp
- `attempts`: Verification attempt count
- `created_at`, `updated_at`: Timestamps

**Relationships**:
- Belongs to: user

**Indexes**:
- Foreign key: user_id
- Index: expires_at, verified_at

---

### phone_change_requests
Phone change OTP verification.

**Fields**:
- `id`: Primary key
- `user_id`: Foreign key to users
- `new_phone`: Requested new phone
- `otp`: One-time password (hashed)
- `expires_at`: OTP expiration timestamp
- `verified_at`: Verification timestamp
- `attempts`: Verification attempt count
- `created_at`, `updated_at`: Timestamps

**Relationships**:
- Belongs to: user

**Indexes**:
- Foreign key: user_id
- Index: expires_at, verified_at

---

### password_change_requests
Member password change requests.

**Fields**:
- `id`: Primary key
- `user_id`: Foreign key to users
- `status`: Request status (pending/approved/rejected)
- `admin_notes`: Admin comments (text)
- `approved_by`: Foreign key to users (admin)
- `approved_at`: Approval timestamp
- `created_at`, `updated_at`: Timestamps

**Relationships**:
- Belongs to: user, approvedBy (user)

**Indexes**:
- Foreign key: user_id, approved_by
- Index: status

---

### login_attempts
Brute force protection tracking.

**Fields**:
- `id`: Primary key
- `email`: Login email
- `ip_address`: Request IP
- `attempts`: Failed attempt count
- `locked_until`: Lockout expiration timestamp
- `created_at`, `updated_at`: Timestamps

**Indexes**:
- Index: email, ip_address, locked_until

---

## Notification & Logging Tables

### notifications
Laravel notification table.

**Fields**:
- `id`: UUID primary key
- `type`: Notification class
- `notifiable_type`: Polymorphic type
- `notifiable_id`: Polymorphic ID
- `data`: Notification data (JSON)
- `read_at`: Read timestamp
- `hidden_from_header`: Hide from bell boolean
- `message_key`: Translation key
- `created_at`, `updated_at`: Timestamps

**Indexes**:
- Index: notifiable_type + notifiable_id
- Index: read_at, hidden_from_header

---

### system_logs
System activity logging.

**Fields**:
- `id`: Primary key
- `user_id`: Foreign key to users (nullable)
- `action`: Action type
- `description`: Action description (text)
- `model_type`: Affected model type
- `model_id`: Affected model ID
- `ip_address`: Request IP
- `user_agent`: Browser user agent
- `created_at`, `updated_at`: Timestamps

**Relationships**:
- Belongs to: user

**Indexes**:
- Foreign key: user_id
- Index: action, model_type, created_at

---

### system_settings
Application configuration.

**Fields**:
- `id`: Primary key
- `key`: Setting key (unique)
- `value`: Setting value (text)
- `type`: Value type (string/integer/boolean/json)
- `description`: Setting description (text)
- `created_at`, `updated_at`: Timestamps

**Indexes**:
- Unique: key

---

## File Management Tables

### file_uploads
File upload tracking.

**Fields**:
- `id`: Primary key
- `model_type`: Polymorphic type
- `model_id`: Polymorphic ID
- `field_name`: Model field name
- `file_path`: Storage path
- `file_name`: Original filename
- `file_size`: File size in bytes
- `mime_type`: File MIME type
- `category`: File category (avatars/documents/products/delivery_proofs)
- `created_at`, `updated_at`: Timestamps

**Relationships**:
- Polymorphic: model

**Indexes**:
- Index: model_type + model_id
- Index: category, field_name

---

### delivery_proofs
Delivery proof images.

**Fields**:
- `id`: Primary key
- `sales_id`: Foreign key to sales
- `image_path`: Image storage path
- `uploaded_by`: Foreign key to users (logistic)
- `uploaded_at`: Upload timestamp
- `created_at`, `updated_at`: Timestamps

**Relationships**:
- Belongs to: sales, uploadedBy (user)

**Indexes**:
- Foreign keys: sales_id, uploaded_by
- Index: uploaded_at

---

## Permission Tables (Spatie)

### roles
User roles.

**Fields**:
- `id`: Primary key
- `name`: Role name (unique)
- `guard_name`: Guard name
- `created_at`, `updated_at`: Timestamps

**Indexes**:
- Unique: name + guard_name

---

### permissions
System permissions.

**Fields**:
- `id`: Primary key
- `name`: Permission name (unique)
- `guard_name`: Guard name
- `created_at`, `updated_at`: Timestamps

**Indexes**:
- Unique: name + guard_name

---

### model_has_permissions
User-permission pivot.

**Fields**:
- `permission_id`: Foreign key to permissions
- `model_type`: Polymorphic type
- `model_id`: Polymorphic ID

**Indexes**:
- Primary: permission_id + model_type + model_id
- Foreign key: permission_id

---

### model_has_roles
User-role pivot.

**Fields**:
- `role_id`: Foreign key to roles
- `model_type`: Polymorphic type
- `model_id`: Polymorphic ID

**Indexes**:
- Primary: role_id + model_type + model_id
- Foreign key: role_id

---

### role_has_permissions
Role-permission pivot.

**Fields**:
- `permission_id`: Foreign key to permissions
- `role_id`: Foreign key to roles

**Indexes**:
- Primary: permission_id + role_id
- Foreign keys: permission_id, role_id

---

## System Tables

### sessions
Session storage.

**Fields**:
- `id`: Session ID (primary key)
- `user_id`: Foreign key to users (nullable)
- `ip_address`: Client IP
- `user_agent`: Browser user agent (text)
- `payload`: Session data (long text)
- `last_activity`: Last activity timestamp

**Indexes**:
- Primary key: id
- Index: user_id, last_activity

---

### cache
Cache storage.

**Fields**:
- `key`: Cache key (primary key)
- `value`: Cached value (medium text)
- `expiration`: Expiration timestamp

**Indexes**:
- Primary key: key
- Index: expiration

---

### cache_locks
Cache lock management.

**Fields**:
- `key`: Lock key (primary key)
- `owner`: Lock owner
- `expiration`: Lock expiration timestamp

**Indexes**:
- Primary key: key

---

### jobs
Queue jobs.

**Fields**:
- `id`: Primary key
- `queue`: Queue name
- `payload`: Job data (long text)
- `attempts`: Attempt count
- `reserved_at`: Reserved timestamp
- `available_at`: Available timestamp
- `created_at`: Creation timestamp

**Indexes**:
- Index: queue

---

### job_batches
Batch job tracking.

**Fields**:
- `id`: Batch ID (primary key)
- `name`: Batch name
- `total_jobs`: Total job count
- `pending_jobs`: Pending job count
- `failed_jobs`: Failed job count
- `failed_job_ids`: Failed job IDs (long text)
- `options`: Batch options (medium text)
- `cancelled_at`: Cancellation timestamp
- `created_at`: Creation timestamp
- `finished_at`: Completion timestamp

**Indexes**:
- Primary key: id

---

### failed_jobs
Failed queue jobs.

**Fields**:
- `id`: Primary key
- `uuid`: Job UUID (unique)
- `connection`: Queue connection (text)
- `queue`: Queue name (text)
- `payload`: Job data (long text)
- `exception`: Exception details (long text)
- `failed_at`: Failure timestamp

**Indexes**:
- Primary key: id
- Unique: uuid

---

## Database Relationships Summary

### One-to-Many Relationships
- User → Sales (customer_id)
- User → SalesAudit (customer_id)
- User → Stocks (member_id)
- User → Addresses (user_id)
- User → EmailChangeRequests (user_id)
- User → PhoneChangeRequests (user_id)
- User → PasswordChangeRequests (user_id)
- User → LoginAttempts (email)
- User → SystemLogs (user_id)
- Product → Stocks (product_id)
- Product → AuditTrails (product_id)
- Product → PriceHistories (product_id)
- Product → CartItems (product_id)
- SalesAudit → AuditTrails (sale_id)
- SalesAudit → OrderItems (order_id)
- Stock → StockTrails (stock_id)
- Cart → CartItems (cart_id)

### One-to-One Relationships
- User → Cart (user_id)
- User → MemberEarnings (member_id)
- Sales → DeliveryProof (sales_id)

### Polymorphic Relationships
- FileUpload → Model (model_type, model_id)
- Notification → Notifiable (notifiable_type, notifiable_id)
- Permission → Model (model_type, model_id)
- Role → Model (model_type, model_id)

### Many-to-Many Relationships
- Role ↔ Permission (role_has_permissions)
- User ↔ Role (model_has_roles)
- User ↔ Permission (model_has_permissions)
