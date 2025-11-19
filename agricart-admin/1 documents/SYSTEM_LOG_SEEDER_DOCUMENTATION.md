# System Log Seeder Documentation

## Overview
The `SystemLogSeeder` generates realistic sample log entries for the System Logs table, demonstrating various user activities and system events.

---

## Seeder Details

**File**: `database/seeders/SystemLogSeeder.php`

**Total Logs Generated**: 61+ logs (varies based on available users)

---

## Log Categories

### 1. Security Events (17 logs)

#### Password Changes (5 logs)
- **Action**: `password_changed`
- **Event Type**: `security_event`
- **Users**: Admin, Staff, Customer, Member
- **Details**: User changed their password with timestamp and IP

#### Failed Login Attempts (8 logs)
- **Action**: `login_failed`
- **Event Type**: `security_event`
- **Users**: Admin, Staff, Customer, Member
- **Details**: Failed login with attempts remaining count
- **Context**: Includes `attempts_remaining` and `is_locked` status

#### Wrong Portal Access (4 logs)
- **Action**: `login_failed_wrong_portal`
- **Event Type**: `authentication`
- **Users**: Admin, Customer
- **Details**: User tried to access wrong portal
- **Context**: Includes `target_portal` information

---

### 2. Product Management (14 logs)

#### Product Creation (6 logs)
- **Action**: `create`
- **Event Type**: `product_management`
- **Users**: Admin, Staff
- **Products**: Fresh Tomatoes, Organic Carrots, Green Lettuce, Red Onions, Sweet Potatoes, Bell Peppers
- **Details**: User created a product with name and timestamp
- **Context**: Includes `product_id`, `product_name`, `price_kilo`

#### Product Updates (5 logs)
- **Action**: `update`
- **Event Type**: `product_management`
- **Users**: Admin, Staff
- **Details**: User updated a product
- **Context**: Includes `price_changed` flag

#### Product Deletion (3 logs)
- **Action**: `delete`
- **Event Type**: `product_management`
- **Users**: Admin, Staff
- **Details**: User deleted a product
- **Context**: Includes `product_id` and `product_name`

---

### 3. Stock Management (6 logs)

#### Stock Updates
- **Action**: `stock_update`
- **Event Type**: `stock_update`
- **Users**: Member, Admin
- **Details**: Stock quantity changed from old to new value
- **Context**: Includes `old_quantity`, `new_quantity`, `reason` (manual_update)

---

### 4. Order Management (7 logs)

#### Order Status Changes
- **Action**: `order_status_change`
- **Event Type**: `order_status_change`
- **Users**: Admin, Staff
- **Status Transitions**:
  - Pending → Approved
  - Approved → Out for Delivery
  - Out for Delivery → Delivered
- **Details**: Order status changed with order ID
- **Context**: Includes `order_id`, `old_status`, `new_status`

---

### 5. Customer Activities (5 logs)

#### Checkout
- **Action**: `checkout`
- **Event Type**: `checkout`
- **Users**: Customer
- **Details**: Customer completed checkout with order ID and total amount
- **Context**: Includes `order_id`, `total_amount`, `cart_items_count`

---

### 6. Delivery Management (4 logs)

#### Delivery Status Changes
- **Action**: `delivery_status_change`
- **Event Type**: `delivery_status_change`
- **Users**: Logistic, Admin
- **Status Transitions**:
  - Pending → Out for Delivery
  - Out for Delivery → Delivered
- **Details**: Delivery status changed with order ID
- **Context**: Includes `order_id`, `old_status`, `new_status`

---

### 7. User Management (3 logs)

#### Staff Creation
- **Action**: `create_staff`
- **Event Type**: `user_management`
- **Users**: Admin
- **Details**: Admin created a staff user
- **Context**: Includes `target_user_id`, `action`

---

### 8. Data Export (3 logs)

#### Data Exports
- **Action**: `data_export`
- **Event Type**: `data_export`
- **Users**: Admin, Staff
- **Export Types**:
  - System Logs Export
  - Orders Export
  - Products Export
- **Details**: User exported data with record count
- **Context**: Includes `export_type`, `record_count`, `export_format` (csv)

---

### 9. Critical Errors (2 logs)

#### System Errors
- **Action**: `critical_error`
- **Event Type**: `critical_error`
- **Users**: None (system-generated)
- **Error Types**:
  - Database connection timeout
  - Payment gateway error
  - File upload failed
- **Details**: Critical system error description
- **Context**: Includes `error`, `severity` (critical)

---

## Data Structure

Each log entry includes:

```php
[
    'user_id' => 1,                    // User who performed the action
    'user_email' => 'user@example.com', // User's email
    'user_type' => 'admin',            // User type
    'action' => 'created',             // Action performed
    'event_type' => 'product_management', // Event category
    'details' => 'Human-readable description...', // Full description
    'ip_address' => '192.168.1.100',   // IP address
    'context' => json_encode([...]),   // Additional JSON data
    'performed_at' => Carbon::now(),   // When action occurred
    'created_at' => Carbon::now(),     // Record creation time
    'updated_at' => Carbon::now(),     // Record update time
]
```

---

## Sample IP Addresses

The seeder uses realistic IP addresses:
- `192.168.1.100` - Local network
- `192.168.1.101` - Local network
- `192.168.1.102` - Local network
- `10.0.0.50` - Private network
- `172.16.0.25` - Private network
- `203.0.113.45` - Public IP (documentation range)

---

## Sample Products

The seeder includes common agricultural products:
- Fresh Tomatoes
- Organic Carrots
- Green Lettuce
- Red Onions
- Sweet Potatoes
- Bell Peppers

---

## Time Distribution

Logs are distributed across the last 30 days with random times throughout each day, creating a realistic activity pattern.

---

## Usage

### Run the Seeder

```bash
# Run only the SystemLogSeeder
php artisan db:seed --class=SystemLogSeeder

# Run all seeders (if included in DatabaseSeeder)
php artisan db:seed
```

### Clear and Reseed

```bash
# Clear existing logs and reseed
php artisan tinker --execute="App\Models\SystemLog::truncate();"
php artisan db:seed --class=SystemLogSeeder
```

### Verify Seeded Data

```bash
# Check total logs
php artisan tinker --execute="echo 'Total logs: ' . App\Models\SystemLog::count();"

# Check by event type
php artisan tinker --execute="echo 'Security events: ' . App\Models\SystemLog::where('event_type', 'security_event')->count();"

# View recent logs
php artisan tinker --execute="App\Models\SystemLog::latest('performed_at')->take(5)->get(['action', 'event_type', 'details'])->each(fn(\$log) => print_r(\$log->toArray()));"
```

---

## Integration with DatabaseSeeder

To include in the main database seeder, add to `database/seeders/DatabaseSeeder.php`:

```php
public function run(): void
{
    $this->call([
        // ... other seeders
        SystemLogSeeder::class,
    ]);
}
```

---

## Customization

### Adjust Log Count

Modify the loop counts in the seeder:

```php
// Change from 5 to 10 password change logs
for ($i = 0; $i < 10; $i++) {
    // ... password change logic
}
```

### Add New Event Types

Add new log categories:

```php
// Example: Email change logs
for ($i = 0; $i < 3; $i++) {
    $logs[] = [
        'action' => 'email_changed',
        'event_type' => 'security_event',
        // ... other fields
    ];
}
```

### Modify Time Range

Change the date range:

```php
// Change from 30 days to 7 days
$performedAt = Carbon::now()->subDays(rand(1, 7))->subHours(rand(0, 23));
```

---

## Benefits

### 1. **Testing**
- Test log viewing functionality
- Test filtering and search
- Test pagination
- Test export functionality

### 2. **Development**
- Realistic data for UI development
- Test performance with multiple logs
- Verify log formatting

### 3. **Demonstration**
- Show system capabilities
- Demonstrate security monitoring
- Present audit trail features

### 4. **Training**
- Train staff on log interpretation
- Demonstrate security events
- Show data change tracking

---

## Sample Output

When the seeder runs, you'll see:

```
INFO  Seeding database.

System logs seeded successfully! Total logs: 61
```

---

## Verification Queries

### Count by Event Type
```sql
SELECT event_type, COUNT(*) as count
FROM system_logs
GROUP BY event_type
ORDER BY count DESC;
```

### Recent Security Events
```sql
SELECT user_email, action, details, performed_at
FROM system_logs
WHERE event_type = 'security_event'
ORDER BY performed_at DESC
LIMIT 10;
```

### Failed Login Attempts
```sql
SELECT user_email, ip_address, performed_at
FROM system_logs
WHERE action = 'login_failed'
ORDER BY performed_at DESC;
```

### Product Management Activities
```sql
SELECT user_email, action, details, performed_at
FROM system_logs
WHERE event_type = 'product_management'
ORDER BY performed_at DESC;
```

---

## Summary

The SystemLogSeeder creates **61+ realistic log entries** covering:
- ✅ Security events (password changes, failed logins, unauthorized access)
- ✅ Product management (create, update, delete)
- ✅ Stock management (quantity updates)
- ✅ Order management (status changes)
- ✅ Customer activities (checkout)
- ✅ Delivery management (status changes)
- ✅ User management (staff creation)
- ✅ Data exports
- ✅ Critical system errors

All logs include:
- User information (ID, email, type)
- Action performed
- Date & time (distributed over 30 days)
- Location (IP address)
- Detailed description
- Additional context (JSON)

Perfect for testing, development, demonstration, and training purposes!
