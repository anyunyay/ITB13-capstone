# Comprehensive Notification System Guide

## Overview

The Agricart Admin system now includes a comprehensive notification system that provides real-time updates to all user types based on their roles and activities.

## User Types and Their Notifications

### Admin & Staff
- **New Order Notifications**: Receive alerts when customers place new orders
- **Inventory Update Notifications**: Get notified when stock levels change, products are added/updated/removed
- **Membership Update Notifications**: Receive alerts when member accounts are created, updated, or removed

### Members (Farmers)
- **Product Sale Notifications**: Get notified when their products are sold
- **Earnings Update Notifications**: Receive periodic updates about their earnings
- **Low Stock Alerts**: Get warned when their product stock is running low

### Logistics
- **Delivery Task Notifications**: Receive alerts when new delivery tasks are assigned
- **Order Status Updates**: Get notified about order status changes

### Customers
- **Order Confirmation Notifications**: Receive confirmation when orders are placed
- **Order Status Updates**: Get notified when order status changes (approved/rejected)
- **Delivery Status Updates**: Receive updates about delivery progress

## Notification Types

### 1. NewOrderNotification
- **Triggered**: When a customer places a new order
- **Recipients**: Admin and Staff users
- **Channels**: Database, Email
- **Action URL**: `/admin/orders/{order_id}`

### 2. InventoryUpdateNotification
- **Triggered**: When inventory is added, updated, or removed
- **Recipients**: Admin and Staff users
- **Channels**: Database, Email
- **Action URL**: `/admin/inventory`

### 3. MembershipUpdateNotification
- **Triggered**: When member accounts are created, updated, or removed
- **Recipients**: Admin and Staff users
- **Channels**: Database, Email
- **Action URL**: `/admin/membership`

### 4. ProductSaleNotification
- **Triggered**: When a member's product is sold (order approved)
- **Recipients**: Member (farmer) who owns the product
- **Channels**: Database, Email
- **Action URL**: `/member/sales`

### 5. EarningsUpdateNotification
- **Triggered**: Periodically (monthly) or manually
- **Recipients**: Members
- **Channels**: Database, Email
- **Action URL**: `/member/earnings`

### 6. LowStockAlertNotification
- **Triggered**: When stock quantity falls below threshold (default: 10)
- **Recipients**: Member (farmer) who owns the stock
- **Channels**: Database, Email
- **Action URL**: `/member/inventory`

### 7. DeliveryTaskNotification
- **Triggered**: When a delivery task is assigned to a logistic
- **Recipients**: Assigned logistic user
- **Channels**: Database, Email
- **Action URL**: `/logistic/deliveries/{order_id}`

### 8. OrderConfirmationNotification
- **Triggered**: When a customer places an order
- **Recipients**: Customer who placed the order
- **Channels**: Database, Email
- **Action URL**: `/customer/orders/{order_id}`

### 9. OrderStatusUpdate (Enhanced)
- **Triggered**: When order status changes (approved/rejected)
- **Recipients**: Customer who placed the order
- **Channels**: Database, Email
- **Action URL**: `/customer/orders/{order_id}`

### 10. DeliveryStatusUpdate (Enhanced)
- **Triggered**: When delivery status changes
- **Recipients**: Customer who placed the order
- **Channels**: Database, Email
- **Action URL**: `/customer/orders/{order_id}`

## Frontend Components

### NotificationBell Component
- Universal notification bell that appears in the header for all user types
- Shows unread notification count
- Displays recent notifications in a dropdown
- Provides quick actions to mark notifications as read

### NotificationPage Component
- Comprehensive notification management page
- Shows all notifications with filtering and sorting
- Bulk actions for marking notifications as read
- Detailed notification information with action buttons

## Backend Implementation

### Controllers Updated
- `CartController`: Triggers order confirmation and new order notifications
- `Admin/OrderController`: Triggers product sale and delivery task notifications
- `Admin/InventoryStockController`: Triggers inventory update notifications
- `Admin/MembershipController`: Triggers membership update notifications
- `Logistic/LogisticController`: Already handles delivery status updates

### Notification Controllers
- `Admin/NotificationController`: Manages admin/staff notifications
- `Member/NotificationController`: Manages member notifications
- `Logistic/NotificationController`: Manages logistic notifications
- `Customer/NotificationController`: Enhanced customer notifications

### Console Commands
- `stock:check-low-alerts`: Checks for low stock and sends alerts (scheduled daily)
- `earnings:update`: Updates member earnings and sends notifications (scheduled monthly)

## Routes Added

### Admin Routes
```php
Route::get('/admin/notifications', [AdminNotificationController::class, 'index']);
Route::post('/admin/notifications/mark-read', [AdminNotificationController::class, 'markRead']);
Route::post('/admin/notifications/mark-all-read', [AdminNotificationController::class, 'markAllRead']);
```

### Member Routes
```php
Route::get('/member/notifications', [MemberNotificationController::class, 'index']);
Route::post('/member/notifications/mark-read', [MemberNotificationController::class, 'markRead']);
Route::post('/member/notifications/mark-all-read', [MemberNotificationController::class, 'markAllRead']);
```

### Logistic Routes
```php
Route::get('/logistic/notifications', [LogisticNotificationController::class, 'index']);
Route::post('/logistic/notifications/mark-read', [LogisticNotificationController::class, 'markRead']);
Route::post('/logistic/notifications/mark-all-read', [LogisticNotificationController::class, 'markAllRead']);
```

### Customer Routes (Enhanced)
```php
Route::get('/customer/notifications', [CustomerNotificationController::class, 'index']);
Route::post('/customer/notifications/mark-read', [CustomerNotificationController::class, 'markRead']);
Route::post('/customer/notifications/mark-all-read', [CustomerNotificationController::class, 'markAllRead']);
```

## Middleware Integration

The `HandleInertiaRequests` middleware has been updated to share notifications with the frontend based on user type:

- **Customers**: Order confirmations, status updates, delivery updates
- **Admin/Staff**: New orders, inventory updates, membership updates
- **Members**: Product sales, earnings updates, low stock alerts
- **Logistics**: Delivery tasks, order status updates

## Scheduled Tasks

### Low Stock Alerts
- **Schedule**: Daily at 9:00 AM
- **Command**: `stock:check-low-alerts`
- **Purpose**: Check all active stocks and alert members when quantity falls below threshold

### Earnings Updates
- **Schedule**: Monthly on the 1st at 10:00 AM
- **Command**: `earnings:update --period=monthly`
- **Purpose**: Calculate and notify members about their monthly earnings

## Testing

A comprehensive test suite has been created in `tests/Feature/NotificationSystemTest.php` that covers:
- Admin receiving new order notifications
- Members receiving product sale notifications
- Low stock alert functionality
- Notification data structure validation

## Usage Examples

### Manual Notification Triggering
```php
// Send low stock alert
$member->notify(new LowStockAlertNotification($stock, 10));

// Send earnings update
$member->notify(new EarningsUpdateNotification(1500.00, 'monthly'));

// Send new order notification to all admins
$adminUsers = User::whereIn('type', ['admin', 'staff'])->get();
foreach ($adminUsers as $admin) {
    $admin->notify(new NewOrderNotification($order));
}
```

### Running Console Commands
```bash
# Check low stock alerts manually
php artisan stock:check-low-alerts

# Update member earnings manually
php artisan earnings:update --period=monthly

# Run scheduled tasks
php artisan schedule:run
```

## Configuration

### Email Configuration
Ensure your `.env` file has proper mail configuration:
```env
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@agricart.com
MAIL_FROM_NAME="Agricart Admin"
```

### Queue Configuration
For better performance, configure queue workers to handle email notifications:
```env
QUEUE_CONNECTION=database
```

Then run queue workers:
```bash
php artisan queue:work
```

## Future Enhancements

1. **Real-time Notifications**: Implement WebSocket or Server-Sent Events for real-time updates
2. **Push Notifications**: Add mobile push notification support
3. **Notification Preferences**: Allow users to customize which notifications they receive
4. **Notification Templates**: Create customizable email templates
5. **Analytics**: Track notification engagement and effectiveness
6. **Bulk Operations**: Add bulk notification management features

## Troubleshooting

### Common Issues

1. **Notifications not appearing**: Check if the user type is correctly set and middleware is sharing notifications
2. **Emails not sending**: Verify mail configuration and queue workers
3. **Scheduled tasks not running**: Ensure the scheduler is running with `php artisan schedule:work`
4. **Low stock alerts not triggering**: Check if the command is scheduled and stocks meet the threshold criteria

### Debug Commands
```bash
# Check notification queue
php artisan queue:work --verbose

# Test email sending
php artisan tinker
>>> Mail::raw('Test email', function($msg) { $msg->to('test@example.com')->subject('Test'); });

# Check scheduled tasks
php artisan schedule:list
```

This comprehensive notification system ensures all users stay informed about relevant activities and updates in the Agricart platform.
