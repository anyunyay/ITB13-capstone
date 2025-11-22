# Seeder Quick Start Guide

## TL;DR - Just Run This

```bash
# Fresh database with all seeders
php artisan migrate:fresh --seed

# Verify everything worked
php scripts/verify_notifications.php
```

Expected output:
```
✅ SUCCESS: All notifications have valid order references!
```

## What Happens When You Seed

### Step 1: Foundation (Users & Roles)
```
✓ RoleSeeder - Creates admin, staff, customer, member, logistic roles
✓ UserSeeder - Creates users for each role
✓ StaffSeeder - Creates staff records
✓ MemberSeeder - Creates member (farmer) records
```

### Step 2: Products & Inventory
```
✓ ProductSeeder - Creates 15 products
✓ StockSeeder - Creates stocks for members
✓ PriceTrendSeeder - Creates price history
```

### Step 3: Orders & Sales (CRITICAL)
```
✓ ComprehensiveSalesSeeder - Creates 20 orders
  - 5 completed orders (delivered)
  - 3 ready orders (ready for pickup)
  - 4 pending orders (awaiting approval)
  - 8 historical orders (past deliveries)
```

### Step 4: Notifications (MUST BE LAST)
```
✓ NotificationSeeder - Creates ~87 notifications
  - Admin/Staff: New orders, inventory updates
  - Customers: Order confirmations, delivery updates
  - Members: Product sales, earnings, stock alerts
  - Logistics: Delivery tasks, pickup notifications
```

## Common Issues & Solutions

### Issue: "No orders found"
```
❌ No orders found! NotificationSeeder requires ComprehensiveSalesSeeder to run first.
```

**Solution:** Check DatabaseSeeder.php - ComprehensiveSalesSeeder must run before NotificationSeeder

### Issue: Foreign key constraint violation
```
SQLSTATE[23000]: Integrity constraint violation
```

**Solution:** Run `php artisan migrate:fresh --seed` to start with clean database

### Issue: Notifications reference non-existent orders
```
Notification order_id: 999 does not exist
```

**Solution:** This is now fixed! NotificationSeeder uses real order IDs from database

## Verification Commands

### Check Data Counts
```bash
php artisan tinker --execute="
echo 'Orders: ' . App\Models\SalesAudit::count() . PHP_EOL;
echo 'Notifications: ' . DB::table('notifications')->count() . PHP_EOL;
"
```

Expected:
```
Orders: 20
Notifications: 41+
```

### Run Verification Script
```bash
php scripts/verify_notifications.php
```

Expected:
```
✓ Total Orders (SalesAudit): 20
✓ Total Notifications: 41
✓ Valid order references: 12
✗ Invalid order references: 0
✅ SUCCESS!
```

### Check Specific Order
```bash
php artisan tinker --execute="
\$order = App\Models\SalesAudit::find(32);
echo 'Order #32: ' . \$order->status . ' - ₱' . \$order->total_amount . PHP_EOL;
"
```

## Seeder Order (MUST FOLLOW)

```php
// database/seeders/DatabaseSeeder.php

$this->call([
    // 1. Foundation
    RoleSeeder::class,
    UserSeeder::class,
    StaffSeeder::class,
    MemberSeeder::class,
    
    // 2. Products
    ProductSeeder::class,
    StockSeeder::class,
    PriceTrendSeeder::class,
    
    // 3. Orders (BEFORE notifications!)
    ComprehensiveSalesSeeder::class,
    MemberEarningsSeeder::class,
    
    // 4. Notifications (LAST!)
    NotificationSeeder::class,
]);
```

## What's Fixed

### ✅ Before This Fix
- ❌ Random order IDs
- ❌ Foreign key errors
- ❌ Orphaned notifications
- ❌ Inconsistent data

### ✅ After This Fix
- ✅ Real order IDs from database
- ✅ Zero foreign key errors
- ✅ All notifications preserved
- ✅ 100% valid relationships

## Testing Checklist

- [ ] Run `php artisan migrate:fresh --seed`
- [ ] No errors during seeding
- [ ] Run `php scripts/verify_notifications.php`
- [ ] All order references valid
- [ ] Check notification count (should be 40+)
- [ ] Check order count (should be 20)
- [ ] Login to app and view notifications
- [ ] Test multilingual support

## Quick Commands Reference

```bash
# Fresh start
php artisan migrate:fresh --seed

# Seed only (if tables exist)
php artisan db:seed

# Seed specific seeder
php artisan db:seed --class=NotificationSeeder

# Verify data
php scripts/verify_notifications.php

# Check counts
php artisan tinker --execute="
echo 'Orders: ' . App\Models\SalesAudit::count() . PHP_EOL;
echo 'Notifications: ' . DB::table('notifications')->count() . PHP_EOL;
"

# View sample order
php artisan tinker --execute="
\$order = App\Models\SalesAudit::with('customer')->first();
echo 'Order #' . \$order->id . ': ' . \$order->customer->name . ' - ₱' . \$order->total_amount . PHP_EOL;
"

# View sample notification
php artisan tinker --execute="
\$notif = DB::table('notifications')->first();
\$data = json_decode(\$notif->data, true);
echo 'Notification: ' . (\$data['message_key'] ?? 'N/A') . PHP_EOL;
if (isset(\$data['order_id'])) echo 'Order ID: ' . \$data['order_id'] . PHP_EOL;
"
```

## Need Help?

### Documentation
- `NOTIFICATION_SEEDER_FOREIGN_KEY_FIX.md` - Detailed explanation
- `SEEDER_EXECUTION_ORDER_QUICK_REFERENCE.md` - Order reference
- `SEEDER_FIX_VERIFICATION_RESULTS.md` - Test results

### Key Points to Remember
1. **ComprehensiveSalesSeeder BEFORE NotificationSeeder**
2. **Clear child tables BEFORE parent tables**
3. **Use real IDs from database, not random values**
4. **Validate data exists before creating relationships**

## Success Indicators

When everything works correctly, you'll see:

```
✅ Notification Seeder completed successfully!
📊 Total notifications created: 87
📖 Read notifications: 1
📬 Unread notifications: 86

✅ Found 20 orders to create notifications for
✓ New Order notifications (3) - using real order IDs
✓ Order lifecycle notifications (7) for Order #32
✓ Member notifications created for 12 member(s)
✓ Logistic notifications created for 2 logistic user(s)
```

And verification shows:
```
✅ SUCCESS: All notifications have valid order references!
```

**That's it! Your seeders are now working perfectly.** 🎉
