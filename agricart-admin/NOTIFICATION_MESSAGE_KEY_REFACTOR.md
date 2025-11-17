# Notification System Refactor: Message Key Implementation

## Overview

The notification system has been refactored to use `message_key` instead of storing full text messages in the database. This approach provides:

- **Multilingual support**: Notifications automatically resolve to the user's preferred language
- **Easy maintenance**: Adding new notification types only requires adding keys to language files
- **No duplication**: Message strings are not duplicated in the database
- **Dynamic language switching**: Users can switch languages and notifications update accordingly

## Architecture

### 1. Database Schema

**Migration**: `database/migrations/2024_11_18_000001_add_message_key_to_notifications_table.php`

```php
Schema::table('notifications', function (Blueprint $table) {
    $table->string('message_key')->nullable()->after('type');
    $table->json('message_params')->nullable()->after('message_key');
});
```

- `message_key`: The translation key (e.g., 'new_order', 'order_confirmation')
- `message_params`: JSON array of parameters to replace in the message (e.g., order_id, customer_name)

### 2. Language Files

**English**: `resources/lang/en/notifications.php`
**Tagalog**: `resources/lang/tl/notifications.php`

Each language file contains key-value pairs for all notification messages:

```php
return [
    'new_order' => 'New order #:order_id from :customer_name',
    'order_confirmation' => 'Order Confirmed',
    'low_stock_alert' => 'Low :stock_type stock alert: :product_name has only :quantity units left',
    // ... more keys
];
```

### 3. NotificationService

**Location**: `app/Services/NotificationService.php`

The service provides:

- `resolveMessage()`: Resolves a message key to the user's language
- `formatNotification()`: Formats notification data for API responses
- `getNotificationTypesForUser()`: Returns notification types for each user role

## Usage Examples

### Example 1: Creating a Notification with Message Key

```php
// In your notification class (e.g., NewOrderNotification.php)
public function toArray($notifiable)
{
    return [
        'order_id' => $this->order->id,
        'type' => 'new_order',
        'message_key' => 'new_order',
        'message_params' => [
            'order_id' => $this->order->id,
            'customer_name' => $this->order->customer->name,
        ],
        'customer_name' => $this->order->customer->name,
        'total_amount' => $this->order->total_amount,
        'action_url' => '/admin/orders/' . $this->order->id,
    ];
}
```

### Example 2: Fetching Notifications in User's Language

```php
// In your controller
use App\Services\NotificationService;

public function index(Request $request)
{
    $user = $request->user();
    $locale = $user->language ?? app()->getLocale();
    
    $notificationTypes = NotificationService::getNotificationTypesForUser($user->type);
    
    $notifications = $user->notifications()
        ->whereIn('type', $notificationTypes)
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function ($notification) use ($locale) {
            return NotificationService::formatNotification($notification, $locale);
        });

    return response()->json(['notifications' => $notifications]);
}
```

### Example 3: Manually Resolving a Message

```php
use App\Services\NotificationService;

// Resolve to English
$message = NotificationService::resolveMessage('new_order', [
    'order_id' => 123,
    'customer_name' => 'John Doe'
], 'en');
// Result: "New order #123 from John Doe"

// Resolve to Tagalog
$message = NotificationService::resolveMessage('new_order', [
    'order_id' => 123,
    'customer_name' => 'John Doe'
], 'tl');
// Result: "Bagong order #123 mula kay John Doe"
```

## Adding New Notification Types

To add a new notification type:

### Step 1: Add Translation Keys

**English** (`resources/lang/en/notifications.php`):
```php
'stock_replenished' => 'Stock replenished: :product_name now has :quantity units',
```

**Tagalog** (`resources/lang/tl/notifications.php`):
```php
'stock_replenished' => 'Na-replenish ang stock: :product_name ay may :quantity units na',
```

### Step 2: Update Notification Class

```php
public function toArray($notifiable)
{
    return [
        'type' => 'stock_replenished',
        'message_key' => 'stock_replenished',
        'message_params' => [
            'product_name' => $this->stock->product->name,
            'quantity' => $this->stock->quantity,
        ],
        'action_url' => '/member/stocks',
    ];
}
```

### Step 3: Add to NotificationService (Optional)

If this is a new notification type for a user role, add it to `getNotificationTypesForUser()`:

```php
'member' => [
    'App\\Notifications\\ProductSaleNotification',
    'App\\Notifications\\StockReplenishedNotification', // New
    // ... other types
],
```

That's it! No database changes needed.

## Updated Notification Classes

All notification classes have been updated to use `message_key`:

### Admin/Staff Notifications
- `NewOrderNotification` - `new_order`
- `InventoryUpdateNotification` - `inventory_update_{action}`
- `MembershipUpdateNotification` - `membership_update_{action}`
- `PasswordChangeRequestNotification` - `password_change_request`

### Customer Notifications
- `OrderConfirmationNotification` - `order_confirmation`
- `OrderStatusUpdate` - `order_status_{status}`
- `DeliveryStatusUpdate` - `delivery_status_{status}`
- `OrderRejectionNotification` - `order_rejection`
- `OrderReadyForPickupNotification` - `order_ready_for_pickup`
- `OrderPickedUpNotification` - `order_picked_up`

### Member Notifications
- `ProductSaleNotification` - `product_sale`
- `EarningsUpdateNotification` - `earnings_update`
- `LowStockAlertNotification` - `low_stock_alert`
- `StockAddedNotification` - `stock_added`

### Logistic Notifications
- `DeliveryTaskNotification` - `delivery_task`
- `OrderStatusUpdate` - `order_status_logistic`

## Updated Controllers

All notification controllers have been updated to use `NotificationService`:

- `app/Http/Controllers/Admin/NotificationController.php`
- `app/Http/Controllers/Customer/NotificationController.php`
- `app/Http/Controllers/Member/NotificationController.php`
- `app/Http/Controllers/Logistic/NotificationController.php`

## Migration Instructions

### 1. Run the Migration

```bash
php artisan migrate
```

This adds `message_key` and `message_params` columns to the notifications table.

### 2. Clear Existing Notifications (Optional)

If you want to start fresh:

```bash
php artisan db:seed --class=NotificationSeeder
```

Or manually:

```php
DB::table('notifications')->delete();
```

### 3. Test Language Switching

1. Create a test notification
2. Switch user language in the database or UI
3. Fetch notifications - they should appear in the new language

## Benefits

### Before (Old System)
```php
// Notification stored in database
{
    "message": "New order #123 from John Doe",
    "type": "new_order"
}
```

**Problems:**
- Message is hardcoded in English
- Changing language requires database updates
- Adding translations requires migrating all existing notifications

### After (New System)
```php
// Notification stored in database
{
    "message_key": "new_order",
    "message_params": {"order_id": 123, "customer_name": "John Doe"},
    "type": "new_order"
}
```

**Benefits:**
- Message resolves dynamically based on user language
- No database updates needed for language changes
- Adding new languages only requires new language files
- Consistent messaging across the application

## Testing

### Test Notification Creation

```php
// Create a test notification
$user->notify(new NewOrderNotification($order));

// Verify in database
$notification = $user->notifications()->first();
echo $notification->message_key; // "new_order"
echo json_encode($notification->message_params); // {"order_id":123,"customer_name":"John Doe"}
```

### Test Language Resolution

```php
// Fetch as English
$formatted = NotificationService::formatNotification($notification, 'en');
echo $formatted['message']; // "New order #123 from John Doe"

// Fetch as Tagalog
$formatted = NotificationService::formatNotification($notification, 'tl');
echo $formatted['message']; // "Bagong order #123 mula kay John Doe"
```

## Backward Compatibility

The system maintains backward compatibility:

- Old notifications without `message_key` will fall back to the `message` field in the data array
- The `formatNotification()` method handles both old and new notification formats

```php
// In NotificationService::formatNotification()
$resolvedMessage = $messageKey 
    ? self::resolveMessage($messageKey, $messageParams, $locale)
    : ($data['message'] ?? ''); // Fallback for old notifications
```

## Future Enhancements

1. **Admin UI for Translations**: Create an admin interface to manage translations
2. **Notification Templates**: Support for rich HTML templates with placeholders
3. **Real-time Language Switching**: Update notifications in real-time when user changes language
4. **Notification Preferences**: Allow users to customize which notifications they receive
5. **Push Notifications**: Extend to support push notifications with translated messages

## Conclusion

This refactor provides a scalable, maintainable notification system that supports multiple languages without database duplication. Adding new notification types or languages is now as simple as adding entries to language files.
