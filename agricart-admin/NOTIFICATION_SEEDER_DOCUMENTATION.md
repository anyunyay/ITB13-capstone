# Notification Seeder Documentation

## Overview
The NotificationSeeder creates comprehensive sample notifications for all user types in the AgriCart system, matching the real application flow during deployment.

## Seeding Sequence

The NotificationSeeder runs **LAST** in the seeding sequence to ensure all dependencies are met:

```
1. RoleSeeder              → Creates user roles and permissions
2. UserSeeder              → Creates admin, staff, customer, member, logistic users
3. ProductSeeder           → Creates product catalog
4. StockSeeder             → Creates member inventory stocks
5. PriceTrendSeeder        → Creates historical pricing data
6. ComprehensiveSalesSeeder → Creates orders and sales transactions
7. MemberEarningsSeeder    → Calculates member earnings from sales
8. NotificationSeeder      → Creates notifications for all events ✓
```

## Why This Order Matters

The NotificationSeeder depends on:
- **Users**: Admin, staff, customer, member, and logistic users must exist
- **Products**: Product catalog must be available
- **Stocks**: Member stocks must be created
- **Orders**: Sales/orders must exist to create order-related notifications
- **Relationships**: All foreign key relationships must be established

This matches the **real application flow** where notifications are created **after** events occur (orders placed, stocks added, etc.).

## Notifications Created

### Admin/Staff Notifications (11 total)
- **New Order Notifications** (3-4): Created when customers place orders
- **Inventory Update Notifications** (3): Stock added/updated/removed events
- **Membership Update Notifications** (4): Member added/updated/deactivated/reactivated
- **Password Change Request** (1): Member requests password change

### Customer Notifications (8 total)
- **Order Confirmation** (1): Order successfully placed
- **Order Status Updates** (2): Approved, processing
- **Order Ready for Pickup** (1): Order ready at warehouse
- **Order Picked Up** (1): Logistic picked up order
- **Delivery Status Updates** (2): Out for delivery, delivered
- **Order Rejection** (1): Order declined

### Member Notifications (12 total, 4 per member)
- **Product Sale** (3): When their products are sold
- **Earnings Update** (3): Monthly earnings summary
- **Low Stock Alert** (3): Stock running low
- **Stock Added** (3): Admin added new stock

### Logistic Notifications (8 total, 4 per logistic)
- **Delivery Task** (4): New delivery assignment
- **Order Status Update** (4): Order ready for pickup

## Total Notifications
- **Created**: ~38 notifications
- **Read**: ~40% marked as read (simulating user activity)
- **Unread**: ~60% remain unread

## Features

### 1. Realistic Data Distribution
- Multiple notifications per user type
- Varied timestamps (1-72 hours ago for read notifications)
- Different orders/stocks used for variety

### 2. Proper Relationships
- Uses actual seeded orders, stocks, and users
- Maintains foreign key integrity
- Matches real notification data structure

### 3. User Activity Simulation
- 40% of notifications marked as read
- Random read timestamps (1-72 hours ago)
- Simulates realistic user engagement

### 4. Comprehensive Coverage
All notification types from the application:
- Order lifecycle (confirmation → delivery)
- Inventory management
- Member operations
- Logistic assignments
- Administrative tasks

## Running the Seeder

### Full Database Reset
```bash
php artisan migrate:fresh --seed
```

### Notification Seeder Only
```bash
php artisan db:seed --class=NotificationSeeder
```

**Note**: Running NotificationSeeder alone requires existing data (users, products, stocks, orders).

## Verification

After seeding, verify notifications by:

1. **Login as different users**:
   - Admin: `admin@admin.com` / `12345678`
   - Customer: Check UserSeeder for customer credentials
   - Member: Use member_id `2411000` / `12345678`
   - Logistic: Check UserSeeder for logistic credentials

2. **Check notification bell** in the header
3. **Visit notifications page**: `/[user-type]/profile/notifications`

## Notification Navigation

All notifications include proper action URLs:

### Member Notifications
- **Product Sale**: `/member/all-stocks?view=transactions`
- **Low Stock Alert**: `/member/all-stocks?view=stocks`
- **Earnings Update**: `/member/dashboard`
- **Stock Added**: `/member/all-stocks?view=stocks`

### Customer Notifications
- **Order Related**: `/customer/orders/history#order-{id}`

### Admin/Staff Notifications
- **New Order**: `/admin/orders?highlight_order={id}&status=pending`
- **Inventory Update**: `/admin/inventory`
- **Membership Update**: `/admin/membership`

### Logistic Notifications
- **Delivery Task**: `/logistic/orders`
- **Order Status**: `/logistic/orders`

## Highlighting Feature

Notifications include highlight parameters for better UX:
- `highlight_notification={id}` - Highlights the notification card
- `highlight_transaction={id}` - Highlights specific transaction
- `highlight_stock={id}` - Highlights specific stock
- `highlight_order={id}` - Highlights specific order

## Database Structure

Notifications are stored in the `notifications` table:
```sql
- id (UUID)
- type (string) - Notification class name
- notifiable_type (string) - User model
- notifiable_id (int) - User ID
- data (JSON) - Notification data
- read_at (timestamp) - When notification was read
- created_at (timestamp)
- updated_at (timestamp)
```

## Maintenance

### Adding New Notification Types

1. Create notification class in `app/Notifications/`
2. Add to NotificationSeeder with proper data
3. Update navigation in `all-notifications.tsx`
4. Update notification bell components

### Updating Notification URLs

If routes change, update:
- `app/Notifications/[NotificationClass].php` - `toArray()` method
- `resources/js/pages/Profile/all-notifications.tsx` - `handleNotificationClick()`
- `resources/js/components/shared/notifications/notification-bell.tsx`

## Troubleshooting

### No Notifications Created
**Cause**: Missing dependencies (users, orders, stocks)
**Solution**: Run full seeding sequence: `php artisan migrate:fresh --seed`

### Wrong Action URLs
**Cause**: Old notifications in database
**Solution**: Re-run NotificationSeeder: `php artisan db:seed --class=NotificationSeeder`

### 404 Errors on Click
**Cause**: Routes don't exist or changed
**Solution**: Update notification action URLs in notification classes

## Best Practices

1. **Always run in sequence**: Don't run NotificationSeeder before other seeders
2. **Clear old data**: NotificationSeeder clears existing notifications automatically
3. **Test all user types**: Verify notifications for admin, customer, member, logistic
4. **Check navigation**: Ensure all notification links work correctly
5. **Verify highlighting**: Test that highlighted items scroll into view

## Related Files

- `database/seeders/NotificationSeeder.php` - Main seeder
- `database/seeders/DatabaseSeeder.php` - Seeding sequence
- `app/Notifications/*.php` - Notification classes
- `resources/js/pages/Profile/all-notifications.tsx` - Notification UI
- `resources/js/components/shared/notifications/notification-bell.tsx` - Bell component

## Summary

The NotificationSeeder provides a complete, realistic notification dataset that:
- ✅ Matches real application behavior
- ✅ Maintains proper relationships
- ✅ Covers all notification types
- ✅ Simulates user activity
- ✅ Enables thorough testing
- ✅ Works seamlessly with other seeders

This ensures the notification system can be fully tested and demonstrated without requiring manual data creation.
