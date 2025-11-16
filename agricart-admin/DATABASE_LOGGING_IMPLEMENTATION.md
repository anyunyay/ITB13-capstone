# Database Logging Implementation

## Overview
The system logging has been updated to store all logs in a **database** with a structured format for better querying, filtering, and analysis.

---

## Database Structure

### Table: `system_logs`

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint (PK) | Unique log entry ID |
| `user_id` | bigint (nullable) | ID of the user who performed the action |
| `user_email` | string (nullable) | Email of the user |
| `user_type` | string (nullable) | Type of user (admin, staff, member, customer, logistic) |
| `action` | string | Action performed (e.g., 'created', 'updated', 'deleted') |
| `event_type` | string | Category of event (e.g., 'product_management', 'security_event') |
| `details` | text (nullable) | Human-readable description of the action |
| `ip_address` | string (nullable) | IP address where the action originated |
| `context` | json (nullable) | Additional structured data |
| `performed_at` | timestamp | When the action occurred |
| `created_at` | timestamp | When the log was created |
| `updated_at` | timestamp | When the log was last updated |

### Indexes
- `user_id` - For filtering by user
- `user_type` - For filtering by user type
- `action` - For filtering by action
- `event_type` - For filtering by event type
- `performed_at` - For date range queries

---

## Log Format

Each log entry follows this structured format:

```php
[
    'user' => 'user@example.com',
    'action' => 'created',
    'date_time' => '2025-11-16 14:30:00',
    'location' => '192.168.1.100',
    'details' => 'Admin admin@example.com created product: Fresh Tomatoes on November 16, 2025 at 2:30 PM from IP address 192.168.1.100',
    'event_type' => 'product_management'
]
```

---

## What Gets Logged

### ✅ Critical Activities (Logged to Database)

1. **Security Events**
   - Password changes
   - Email changes
   - Phone number changes
   - Failed login attempts
   - Wrong portal access attempts

2. **Data Changes**
   - Product: create, update, delete
   - Stock: add, update, remove, restore
   - User/Staff: create, update, delete
   - Permissions: role changes

3. **Business Transactions**
   - Customer checkout (order placement)
   - Order status changes
   - Delivery status changes
   - Sales record creation

4. **Data Access**
   - Data exports (CSV, PDF, etc.)
   - System maintenance activities
   - Critical system errors

### ❌ Routine Activities (NOT Logged)
- Dashboard access
- Page views
- Successful logins
- Logouts
- Report generation
- Cart operations

---

## Usage Examples

### Querying Logs

```php
// Get all logs for a specific user
$logs = SystemLog::where('user_id', $userId)->get();

// Get security events
$securityLogs = SystemLog::eventType('security_event')->get();

// Get logs from today
$todayLogs = SystemLog::whereDate('performed_at', today())->get();

// Search logs
$searchResults = SystemLog::search('password')->get();

// Get logs with date range
$logs = SystemLog::dateRange('2025-11-01', '2025-11-30')->get();

// Get logs by user type
$adminLogs = SystemLog::userType('admin')->get();
```

### Creating Logs

Logs are automatically created when using the SystemLogger helper methods:

```php
// Log a security event
SystemLogger::logSecurityEvent(
    'password_changed',
    $userId,
    $ipAddress,
    ['user_email' => $userEmail]
);

// Log a product creation
SystemLogger::logProductManagement(
    'create',
    $productId,
    $userId,
    'admin',
    ['product_name' => 'Fresh Tomatoes']
);

// Log an order status change
SystemLogger::logOrderStatusChange(
    $orderId,
    'pending',
    'approved',
    $userId,
    'admin',
    ['ip_address' => $ipAddress]
);
```

---

## Benefits of Database Logging

### 1. **Better Performance**
- Fast queries with indexed columns
- Efficient filtering and searching
- Pagination support

### 2. **Advanced Filtering**
- Filter by user, event type, date range
- Search across multiple fields
- Complex queries with relationships

### 3. **Data Integrity**
- Foreign key constraints
- Structured data validation
- Consistent format

### 4. **Easier Analysis**
- Generate reports from database
- Export to various formats
- Integrate with analytics tools

### 5. **Scalability**
- Handle large volumes of logs
- Archive old logs easily
- Optimize with database tools

---

## Viewing Logs

### Admin Panel
Navigate to `/profile/system-logs` to view logs with:
- Filtering by event type, user type, date range
- Search functionality
- Pagination
- Export to CSV

### Database Query
```sql
SELECT 
    user_email AS 'User',
    action AS 'Action',
    performed_at AS 'Date & Time',
    ip_address AS 'Location (IP Address)',
    details AS 'Details'
FROM system_logs
ORDER BY performed_at DESC
LIMIT 100;
```

---

## Export Format

When exporting logs to CSV, the following columns are included:

| Column | Description |
|--------|-------------|
| ID | Unique log entry ID |
| User | User email or ID |
| Action | Action performed |
| Date & Time | When the action occurred |
| Location (IP Address) | IP address |
| Details | Human-readable description |
| Event Type | Category of event |

---

## Migration

The database table was created with this migration:

```bash
php artisan migrate
```

Migration file: `database/migrations/2025_11_16_190109_create_system_logs_table.php`

---

## Model

The `SystemLog` model provides:
- Relationships with User model
- Scopes for filtering (eventType, userType, dateRange, search)
- Automatic JSON casting for context field
- Timestamp handling

---

## Backup Strategy

### File Backup
Logs are still written to `storage/logs/system.log` as a backup in case database logging fails.

### Database Backup
Include the `system_logs` table in your regular database backups.

### Archiving
Consider archiving old logs (e.g., older than 1 year) to a separate table or file for performance.

---

## Maintenance

### Cleaning Old Logs
```php
// Delete logs older than 1 year
SystemLog::where('performed_at', '<', now()->subYear())->delete();
```

### Monitoring
- Monitor database size
- Check for failed log entries in `storage/logs/system.log`
- Review security events regularly

---

## Security Considerations

1. **Access Control**: Only admin and staff can view system logs
2. **Data Retention**: Implement a retention policy for old logs
3. **Sensitive Data**: Context field may contain sensitive information - handle carefully
4. **Audit Trail**: Logs themselves are not editable (no update functionality)
5. **IP Tracking**: All actions include IP address for security monitoring

---

## Summary

The database logging system provides:
- ✅ Structured storage with indexed columns
- ✅ Fast querying and filtering
- ✅ Human-readable details
- ✅ Complete audit trail
- ✅ Export capabilities
- ✅ Scalable architecture
- ✅ Backup to file system

All critical user activities are now stored in the database with the format:
**User | Action | Date & Time | Location (IP Address) | Details**
