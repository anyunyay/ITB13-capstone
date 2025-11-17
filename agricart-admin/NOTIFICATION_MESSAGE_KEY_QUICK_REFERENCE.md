# Notification Message Key System - Quick Reference

## Quick Start

### 1. Run Migration
```bash
php artisan migrate
```

### 2. Create a Notification with Message Key

```php
// In your notification class
public function toArray($notifiable)
{
    return [
        'type' => 'new_order',
        'message_key' => 'new_order',
        'message_params' => [
            'order_id' => $this->order->id,
            'customer_name' => $this->order->customer->name,
        ],
        'action_url' => '/admin/orders/' . $this->order->id,
    ];
}
```

### 3. Fetch Notifications in User's Language

```php
use App\Services\NotificationService;

$locale = $user->language ?? app()->getLocale();

$notifications = $user->notifications()
    ->get()
    ->map(function ($notification) use ($locale) {
        return NotificationService::formatNotification($notification, $locale);
    });
```

## Available Message Keys

### Admin/Staff
- `new_order` - New order #:order_id from :customer_name
- `inventory_update_added` - Stock added: :product_name by :member_name
- `inventory_update_updated` - Stock updated: :product_name by :member_name
- `inventory_update_removed` - Stock removed: :product_name by :member_name
- `membership_update_added` - New member added: :member_name
- `membership_update_updated` - Member updated: :member_name
- `membership_update_deactivated` - Member deactivated: :member_name
- `membership_update_reactivated` - Member reactivated: :member_name
- `password_change_request` - Password change request from member :member_identifier

### Customer
- `order_confirmation` - Order Confirmed
- `order_confirmation_sub` - Estimated Approval Time: 24Hrs
- `order_status_approved` - Your order has been approved and is being processed
- `order_status_processing` - Your order is being prepared for delivery
- `order_status_ready_for_pickup` - Order is ready for pickup
- `order_ready_for_pickup` - Your order #:order_id is ready for pickup
- `order_picked_up` - Your order #:order_id has been picked up
- `delivery_status_out_for_delivery` - Your order is out for delivery!
- `delivery_status_delivered` - Your order has been delivered successfully!
- `order_rejection` - Order #:order_id has been rejected
- `order_rejection_reason` - Reason: :reason

### Member
- `product_sale` - Your product :product_name was sold to :customer_name
- `earnings_update` - New :period earnings: ₱:amount
- `low_stock_alert` - Low :stock_type stock alert: :product_name has only :quantity units left
- `stock_added` - Stock added for :product_name by :admin_name

### Logistic
- `delivery_task` - New delivery task for order #:order_id
- `order_status_logistic` - Order #:order_id status: :status

## Common Patterns

### Pattern 1: Simple Message (No Parameters)
```php
'message_key' => 'order_confirmation',
'message_params' => [],
```

### Pattern 2: Message with Parameters
```php
'message_key' => 'new_order',
'message_params' => [
    'order_id' => 123,
    'customer_name' => 'John Doe',
],
```

### Pattern 3: Dynamic Key Based on Action
```php
'message_key' => 'inventory_update_' . $this->action, // added, updated, removed
'message_params' => [
    'product_name' => $this->stock->product->name,
    'member_name' => $this->member->name,
],
```

### Pattern 4: Message with Sub-Message
```php
'message_key' => 'order_confirmation',
'message_params' => [],
'sub_message_key' => 'order_confirmation_sub',
'sub_message_params' => [],
```

## Adding New Translations

### Step 1: Add to English
```php
// resources/lang/en/notifications.php
'your_new_key' => 'Your message with :param1 and :param2',
```

### Step 2: Add to Tagalog
```php
// resources/lang/tl/notifications.php
'your_new_key' => 'Ang iyong mensahe na may :param1 at :param2',
```

### Step 3: Use in Notification
```php
'message_key' => 'your_new_key',
'message_params' => [
    'param1' => 'value1',
    'param2' => 'value2',
],
```

## NotificationService Methods

### resolveMessage()
```php
NotificationService::resolveMessage(
    string $messageKey,
    array $params = [],
    ?string $locale = null
): string
```

### formatNotification()
```php
NotificationService::formatNotification(
    $notification,
    ?string $locale = null
): array
```

### getNotificationTypesForUser()
```php
NotificationService::getNotificationTypesForUser(
    string $userType
): array
```

## Controller Implementation

```php
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

## Testing Commands

```bash
# Run migration
php artisan migrate

# Seed notifications
php artisan db:seed --class=NotificationSeeder

# Test in Tinker
php artisan tinker
> $user = User::first();
> $notification = $user->notifications()->first();
> NotificationService::formatNotification($notification, 'en');
> NotificationService::formatNotification($notification, 'tl');
```

## Troubleshooting

### Issue: Message not resolving
**Check:**
1. Is `message_key` set in notification data?
2. Does the key exist in language files?
3. Are parameters correctly named?

### Issue: Wrong language
**Check:**
1. User's `language` field in database
2. App locale setting
3. Locale parameter passed to `formatNotification()`

### Issue: Missing translation
**Check:**
1. Language file exists: `resources/lang/{locale}/notifications.php`
2. Key exists in the file
3. File is properly formatted PHP array

## File Locations

- **Migration**: `database/migrations/2024_11_18_000001_add_message_key_to_notifications_table.php`
- **Service**: `app/Services/NotificationService.php`
- **English Translations**: `resources/lang/en/notifications.php`
- **Tagalog Translations**: `resources/lang/tl/notifications.php`
- **Controllers**: `app/Http/Controllers/{Role}/NotificationController.php`
- **Documentation**: `NOTIFICATION_MESSAGE_KEY_REFACTOR.md`
- **Examples**: `examples/NotificationMessageKeyExample.php`

## Benefits Summary

✅ **No database duplication** - Messages stored as keys, not full text
✅ **Easy translations** - Add new languages by creating language files
✅ **Dynamic switching** - Users can change language without data migration
✅ **Centralized management** - All messages in one place per language
✅ **Type safety** - Message keys are consistent across the app
✅ **Backward compatible** - Old notifications still work

## Next Steps

1. Run the migration
2. Test with existing notifications
3. Add new language files as needed
4. Update frontend to handle resolved messages
5. Consider adding more languages (Spanish, Chinese, etc.)
