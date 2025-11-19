# System Logging Guide

## Overview
The AgriCart Admin system now includes comprehensive system logging to track essential activities and critical processes from **ALL user types** (admin, staff, customer, member, and logistic). All system logs are stored in `storage/logs/system.log` and follow a structured JSON format for easy parsing and analysis.

## User Type Coverage
The system logging comprehensively covers activities from all user types:

- **Admin Users**: Order management, staff management, system configuration, dashboard access
- **Staff Users**: Inventory management, stock operations, report generation, order processing
- **Customer Users**: Cart operations, checkout processes, product interactions, authentication
- **Member Users**: Dashboard access, revenue reporting, stock monitoring, sales tracking
- **Logistic Users**: Delivery status updates, order assignments, dashboard access, delivery completion

This ensures complete audit trails for all business processes and user interactions across the entire application.

## Log Configuration
The system uses a dedicated `system` log channel configured in `config/logging.php`:
- **File**: `storage/logs/system.log`
- **Level**: `info` (configurable via `LOG_LEVEL` environment variable)
- **Format**: Structured JSON with timestamps

## Logged Events

### 1. Customer Activities
**Location**: `app/Http/Controllers/Customer/CartController.php`, `app/Http/Controllers/Auth/AuthenticatedSessionController.php`

**Events Logged**:
- Cart item additions, updates, and removals
- Checkout processes (success/failure)
- Login/logout events
- Product interactions

**Log Structure**:
```json
{
  "customer_id": 123,
  "user_type": "customer",
  "event_type": "customer_activity",
  "action": "cart_item_added|checkout_success|login_success",
  "timestamp": "2025-10-04T13:24:54.618294Z",
  "product_id": 456,
  "quantity": 2.5,
  "ip_address": "192.168.1.100"
}
```

### 2. Admin Activities
**Location**: `app/Http/Controllers/Admin/OrderController.php`, `app/Http/Controllers/Admin/StaffController.php`

**Events Logged**:
- Order management (approval, rejection, assignment)
- Staff management (create, update, delete)
- System configuration changes
- Dashboard access

**Log Structure**:
```json
{
  "admin_id": 789,
  "user_type": "admin",
  "event_type": "admin_activity",
  "action": "order_approved|staff_created|dashboard_access",
  "timestamp": "2025-10-04T13:24:54.618294Z",
  "order_id": 456,
  "total_amount": 150.50,
  "customer_id": 123
}
```

### 3. Staff Activities
**Location**: `app/Http/Controllers/Admin/InventoryStockController.php`

**Events Logged**:
- Inventory management (create, update, remove, restore stocks)
- Product management
- Report generation
- Order processing

**Log Structure**:
```json
{
  "staff_id": 456,
  "user_type": "staff",
  "event_type": "staff_activity",
  "action": "stock_created|inventory_audit|report_generated",
  "timestamp": "2025-10-04T13:24:54.618294Z",
  "product_id": 101,
  "quantity_change": 25.5
}
```

### 4. Member Activities
**Location**: `app/Http/Controllers/Member/MemberController.php`

**Events Logged**:
- Dashboard access
- Revenue report generation
- Stock monitoring
- Sales tracking

**Log Structure**:
```json
{
  "member_id": 789,
  "user_type": "member",
  "event_type": "member_activity",
  "action": "dashboard_access|revenue_report_generated|stock_monitored",
  "timestamp": "2025-10-04T13:24:54.618294Z",
  "report_type": "csv",
  "date_range": "2025-01-01 to 2025-01-31"
}
```

### 5. Logistic Activities
**Location**: `app/Http/Controllers/Logistic/LogisticController.php`

**Events Logged**:
- Delivery status updates
- Order assignments
- Dashboard access
- Delivery completion

**Log Structure**:
```json
{
  "logistic_id": 321,
  "user_type": "logistic",
  "event_type": "logistic_activity",
  "action": "delivery_status_updated|order_assigned|delivery_completed",
  "timestamp": "2025-10-04T13:24:54.618294Z",
  "order_id": 456,
  "old_status": "pending",
  "new_status": "out_for_delivery"
}
```

### 6. Order Management Events
**Location**: `app/Http/Controllers/Admin/OrderController.php`

**Events Logged**:
- Order approval
- Order rejection
- Logistic assignment
- Order status changes

**Log Structure**:
```json
{
  "order_id": 456,
  "old_status": "pending",
  "new_status": "approved",
  "user_id": 789,
  "user_type": "admin|staff",
  "event_type": "order_status_change",
  "timestamp": "2025-10-04T13:24:54.618294Z",
  "admin_notes": "Order looks good",
  "total_amount": 150.50,
  "customer_id": 123
}
```

### 7. Stock Management Events
**Location**: `app/Http/Controllers/Admin/InventoryStockController.php` and `app/Models/Stock.php`

**Events Logged**:
- Stock creation, updates, removal, and restoration
- Stock status changes (partial/sold)
- Inventory audits

**Log Structure**:
```json
{
  "stock_id": 789,
  "product_id": 101,
  "old_quantity": 10.5,
  "new_quantity": 8.0,
  "quantity_change": -2.5,
  "user_id": 456,
  "user_type": "admin|staff",
  "reason": "stock_updated|stock_created|stock_removed|stock_restored",
  "event_type": "stock_update",
  "timestamp": "2025-10-04T13:24:54.618294Z",
  "product_name": "Fresh Tomatoes"
}
```

### 8. Delivery Status Changes
**Location**: `app/Http/Controllers/Logistic/LogisticController.php`

**Events Logged**:
- Delivery status updates (pending → out_for_delivery → delivered)

**Log Structure**:
```json
{
  "order_id": 101,
  "old_delivery_status": "pending",
  "new_delivery_status": "out_for_delivery",
  "logistic_id": 202,
  "event_type": "delivery_status_change",
  "timestamp": "2025-10-04T13:24:54.618294Z",
  "customer_id": 303,
  "order_status": "approved",
  "total_amount": 150.50
}
```

### 9. Authentication Events
**Location**: `app/Http/Controllers/Auth/AuthenticatedSessionController.php`

**Events Logged**:
- Login success/failure
- Logout events
- Wrong portal access attempts
- Session management

**Log Structure**:
```json
{
  "event": "login_success|login_failed|logout|wrong_portal_access",
  "user_id": 123,
  "user_type": "customer|admin|staff|member|logistic",
  "event_type": "authentication",
  "timestamp": "2025-10-04T13:24:54.618294Z",
  "ip_address": "192.168.1.100"
}
```

### 10. Report Generation Events
**Available via SystemLogger**:
- Sales reports
- Inventory reports
- Order reports
- Member revenue reports

### 11. Data Export Events
**Available via SystemLogger**:
- CSV exports
- PDF exports
- Data downloads

### 12. User Management Events
**Available via SystemLogger**:
- Staff creation, updates, deletion
- Permission changes
- Role assignments

### 13. Security Events
**Available via SystemLogger**:
- Unauthorized access attempts
- Login failures
- Suspicious activities

### 14. Critical System Errors
**Available via SystemLogger**:
- Database connection failures
- Critical application errors
- System maintenance events

## SystemLogger Helper Class

The `App\Helpers\SystemLogger` class provides standardized logging methods:

### Available Methods:

#### User-Specific Activity Logging:
- `logAdminActivity($action, $adminId, $details)` - Log admin activities
- `logStaffActivity($action, $staffId, $userType, $details)` - Log staff activities
- `logCustomerActivity($action, $customerId, $details)` - Log customer activities
- `logMemberActivity($action, $memberId, $details)` - Log member activities
- `logLogisticActivity($action, $logisticId, $details)` - Log logistic activities

#### Business Process Logging:
- `logCheckout($userId, $orderId, $totalAmount, $status, $details)` - Log checkout events
- `logOrderStatusChange($orderId, $oldStatus, $newStatus, $userId, $userType, $details)` - Log order changes
- `logStockUpdate($stockId, $productId, $oldQuantity, $newQuantity, $userId, $userType, $reason, $details)` - Log stock changes
- `logDeliveryStatusChange($orderId, $oldStatus, $newStatus, $logisticId, $details)` - Log delivery updates

#### System Events:
- `logAuthentication($event, $userId, $userType, $details)` - Log auth events
- `logUserManagement($action, $targetUserId, $performedByUserId, $userType, $details)` - Log user management
- `logProductManagement($action, $productId, $userId, $userType, $details)` - Log product management
- `logReportGeneration($reportType, $userId, $userType, $details)` - Log report generation
- `logDataExport($exportType, $userId, $userType, $details)` - Log data exports

#### Security & Maintenance:
- `logSecurityEvent($event, $userId, $ipAddress, $details)` - Log security events
- `logCriticalError($error, $context)` - Log critical errors
- `logMaintenance($action, $userId, $details)` - Log maintenance activities

## Log Analysis

### Viewing Logs
```bash
# View recent system logs
tail -f storage/logs/system.log

# Search for specific events
grep "checkout" storage/logs/system.log

# Count events by type
grep -o '"event_type":"[^"]*"' storage/logs/system.log | sort | uniq -c
```

### Log Rotation
The system uses Laravel's built-in log rotation. Configure in `config/logging.php`:
- Daily rotation (default)
- Configurable retention period
- Automatic cleanup of old logs

## Monitoring and Alerts

### Recommended Monitoring:
1. **Checkout Failures**: Monitor for high failure rates
2. **Order Rejections**: Track rejection patterns and reasons
3. **Stock Issues**: Monitor stock quantity changes and status updates
4. **Delivery Delays**: Track delivery status change patterns
5. **Security Events**: Immediate alerting for security incidents

### Log Parsing Examples:
```bash
# Count successful checkouts today
grep "$(date +%Y-%m-%d)" storage/logs/system.log | grep '"event_type":"checkout"' | grep '"status":"success"' | wc -l

# Find all order rejections with admin notes
grep '"new_status":"rejected"' storage/logs/system.log | jq '.admin_notes'

# Monitor stock updates by product
grep '"event_type":"stock_update"' storage/logs/system.log | jq '.product_name' | sort | uniq -c
```

## Testing

The system includes comprehensive tests in `tests/Feature/SystemLoggingTest.php`:
- Tests all SystemLogger methods
- Verifies log file creation
- Validates log content structure
- Ensures proper channel usage

Run tests with:
```bash
php artisan test tests/Feature/SystemLoggingTest.php
```

## Best Practices

1. **Always include relevant context** in log details
2. **Use consistent event types** for easy filtering
3. **Include user information** for audit trails
4. **Log both successes and failures** for complete tracking
5. **Monitor log file size** and implement rotation
6. **Use structured logging** for better analysis
7. **Include timestamps** for chronological analysis

## Security Considerations

- Logs may contain sensitive information (user IDs, order details)
- Ensure proper file permissions on log files
- Consider log encryption for production environments
- Implement log access controls
- Regular log review for security incidents
