# Suspicious Order Seeder - Usage Guide

## Overview

The `SuspiciousOrderSeeder` creates test data to simulate suspicious order patterns for testing the suspicious order grouping functionality. It creates multiple orders from the same customers within 10-minute windows.

## What It Creates

### Scenario 1: 3 Orders in 8 Minutes
- **Customer**: First customer in database
- **Time**: 2 hours ago
- **Pattern**: 3 orders placed at 0, 5, and 8 minutes
- **Result**: Will be grouped as SUSPICIOUS

### Scenario 2: 4 Orders in 9 Minutes
- **Customer**: Second customer in database
- **Time**: 5 hours ago
- **Pattern**: 4 orders placed at 0, 3, 6, and 9 minutes
- **Result**: Will be grouped as SUSPICIOUS

### Scenario 3: 2 Orders in 5 Minutes
- **Customer**: Third customer in database
- **Time**: 30 minutes ago
- **Pattern**: 2 orders placed at 0 and 5 minutes
- **Result**: Will be grouped as SUSPICIOUS

### Scenario 4: 2 Orders in 7 Minutes (Different Session)
- **Customer**: First customer again
- **Time**: 1 hour ago
- **Pattern**: 2 orders placed at 0 and 7 minutes
- **Result**: Will be grouped as SUSPICIOUS (separate from Scenario 1)

### Scenario 5: Normal Orders (NOT Suspicious)
- **Customer**: First customer
- **Time**: 3 hours ago
- **Pattern**: 2 orders placed 15 minutes apart
- **Result**: Will NOT be grouped (exceeds 10-minute window)

## Prerequisites

Before running the seeder, ensure you have:

1. ✅ **Customers** - At least 2-3 customers in the database
2. ✅ **Members** - At least 1 member with available stock
3. ✅ **Products** - Products with available stock
4. ✅ **Stocks** - Stock records with quantity > 10
5. ✅ **Admin** - At least 1 admin user
6. ✅ **Addresses** - Customers must have default addresses

## Running the Seeder

### Option 1: Run Standalone
```bash
php artisan db:seed --class=SuspiciousOrderSeeder
```

### Option 2: Add to DatabaseSeeder
Edit `database/seeders/DatabaseSeeder.php`:

```php
public function run(): void
{
    // ... other seeders ...
    
    $this->call([
        // ... existing seeders ...
        SuspiciousOrderSeeder::class,
    ]);
}
```

Then run:
```bash
php artisan db:seed
```

### Option 3: Fresh Migration with Seeder
```bash
php artisan migrate:fresh --seed
```

## Expected Output

```
🚨 Creating suspicious order patterns for testing...

Found:
  - 3 customers
  - 10 products with stock

📍 Scenario 1: Creating suspicious pattern - 3 orders in 8 minutes
    Order #123: First order - ₱450.00 - 10:00:00
    Order #124: Second order (5 min later) - ₱320.00 - 10:05:00
    Order #125: Third order (8 min later) - ₱280.00 - 10:08:00
  ✅ Created 3 orders from John Doe within 8 minutes

📍 Scenario 2: Creating suspicious pattern - 4 orders in 9 minutes
    Order #126: First order - ₱500.00 - 07:00:00
    Order #127: Second order (3 min later) - ₱350.00 - 07:03:00
    Order #128: Third order (6 min later) - ₱420.00 - 07:06:00
    Order #129: Fourth order (9 min later) - ₱380.00 - 07:09:00
  ✅ Created 4 orders from Jane Smith within 9 minutes

📍 Scenario 3: Creating suspicious pattern - 2 orders in 5 minutes
    Order #130: First order - ₱250.00 - 11:30:00
    Order #131: Second order (5 min later) - ₱300.00 - 11:35:00
  ✅ Created 2 orders from Bob Johnson within 5 minutes

📍 Scenario 4: Creating another suspicious pattern - 2 orders in 7 minutes
    Order #132: First order (new session) - ₱400.00 - 11:00:00
    Order #133: Second order (7 min later) - ₱350.00 - 11:07:00
  ✅ Created 2 more orders from John Doe within 7 minutes

📍 Scenario 5: Creating normal orders (NOT suspicious) - 15 minutes apart
    Order #134: Normal order 1 - ₱450.00 - 09:00:00
    Order #135: Normal order 2 (15 min later - NOT grouped) - ₱380.00 - 09:15:00
  ✅ Created 2 normal orders (will NOT be grouped as suspicious)

✅ Suspicious order seeding complete!

Summary:
  - 4 suspicious order groups created
  - 13 total orders created
  - Groups will be detected on frontend (10-minute window)

To view:
  - Main orders page: /admin/orders (will show alert)
  - Suspicious orders page: /admin/orders/suspicious
```

## Verification

### 1. Check Main Orders Page
Navigate to: `/admin/orders`

**Expected**:
- Alert banner showing "Suspicious Order Patterns Detected"
- Shows "Found 4 suspicious order group(s) with 11 orders"
- Button to "View Suspicious Orders"
- Main list shows only individual, non-suspicious orders

### 2. Check Suspicious Orders Page
Navigate to: `/admin/orders/suspicious`

**Expected**:
- 4 grouped order cards displayed
- Each card shows:
  - "⚠️ SUSPICIOUS ORDER GROUP" badge
  - Number of orders in group
  - Time span (e.g., "8 minutes")
  - Combined total amount
  - Individual order details when expanded

### 3. Verify Grouping Logic

**Group 1** (John Doe - 2 hours ago):
```
Order #123 (10:00:00)
Order #124 (10:05:00)  } 8 minutes span
Order #125 (10:08:00)
```

**Group 2** (Jane Smith - 5 hours ago):
```
Order #126 (07:00:00)
Order #127 (07:03:00)  } 9 minutes span
Order #128 (07:06:00)
Order #129 (07:09:00)
```

**Group 3** (Bob Johnson - 30 minutes ago):
```
Order #130 (11:30:00)  } 5 minutes span
Order #131 (11:35:00)
```

**Group 4** (John Doe - 1 hour ago):
```
Order #132 (11:00:00)  } 7 minutes span
Order #133 (11:07:00)
```

**NOT Grouped** (John Doe - 3 hours ago):
```
Order #134 (09:00:00)
Order #135 (09:15:00)  } 15 minutes - exceeds threshold
```

## Testing Scenarios

### Test 1: Alert Banner
1. Run seeder
2. Visit `/admin/orders`
3. Verify alert banner appears
4. Check statistics are correct

### Test 2: Suspicious Orders Page
1. Click "View Suspicious Orders" button
2. Verify 4 groups are displayed
3. Expand each group
4. Verify individual orders are shown

### Test 3: Group Verdict
1. On suspicious orders page
2. Click "Approve All" on a group
3. Verify all orders in group are approved
4. Check database updates

### Test 4: Individual Order View
1. Click "View Details" on any order
2. Verify order details page loads
3. Check order information is correct

### Test 5: Filtering
1. On main orders page
2. Filter by status (pending)
3. Verify suspicious groups are still hidden
4. Check alert banner still shows

## Troubleshooting

### Error: "No customer found"
**Solution**: Create customers first
```bash
php artisan db:seed --class=UserSeeder
```

### Error: "No member with available stock found"
**Solution**: Seed products and stocks
```bash
php artisan db:seed --class=ProductSeeder
php artisan db:seed --class=StockSeeder
```

### Error: "Customer has no default address"
**Solution**: Ensure customers have addresses
```bash
# Check in database or create manually
```

### No Groups Showing on Suspicious Page
**Possible causes**:
1. Orders not within 10-minute window
2. Orders from different customers
3. Less than 2 orders per customer
4. Check browser console for errors

## Database Impact

### Tables Modified:
- `sales_audits` - 13 new order records
- `audit_trails` - Multiple audit trail entries
- `stocks` - `pending_order_qty` incremented

### Data Created:
- 13 orders total
- 4 suspicious groups (frontend-only)
- All orders in "pending" status
- Random products per order (1-3 items)
- Realistic timestamps and amounts

## Cleanup

To remove seeded data:
```bash
# Option 1: Fresh migration (removes ALL data)
php artisan migrate:fresh

# Option 2: Manual deletion (orders only)
DELETE FROM audit_trails WHERE sale_id IN (SELECT id FROM sales_audits WHERE created_at > NOW() - INTERVAL 6 HOUR);
DELETE FROM sales_audits WHERE created_at > NOW() - INTERVAL 6 HOUR;
```

## Notes

- Orders are created with `is_suspicious = false` (detection is frontend-only)
- Stock quantities are reserved via `pending_order_qty`
- All orders are in "pending" status for testing approval flow
- Timestamps are relative to current time for realistic testing
- Random products ensure variety in test data

---

**Created**: November 22, 2025
**Status**: ✅ Ready to Use
