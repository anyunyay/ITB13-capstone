# Seeder Execution Order - Quick Reference

## Correct Order (MUST Follow)

```php
// database/seeders/DatabaseSeeder.php

$this->call([
    // 1. Foundation Data
    RoleSeeder::class,              // ← Roles first
    UserSeeder::class,              // ← Users need roles
    StaffSeeder::class,             // ← Staff need users
    MemberSeeder::class,            // ← Members need users
    
    // 2. Product & Inventory Data
    ProductSeeder::class,           // ← Products first
    StockSeeder::class,             // ← Stocks need products & members
    PriceTrendSeeder::class,        // ← Price trends need products
    
    // 3. Sales & Orders (CRITICAL)
    ComprehensiveSalesSeeder::class, // ← Creates orders (SalesAudit)
    MemberEarningsSeeder::class,    // ← Earnings need sales
    
    // 4. Notifications (MUST BE LAST)
    NotificationSeeder::class,      // ← Needs ALL above data
]);
```

## Why This Order Matters

### ❌ Wrong Order = Foreign Key Errors
```php
// DON'T DO THIS!
$this->call([
    NotificationSeeder::class,      // ← ERROR! No orders exist yet
    ComprehensiveSalesSeeder::class, // ← Orders created too late
]);
```

### ✅ Correct Order = No Errors
```php
// DO THIS!
$this->call([
    ComprehensiveSalesSeeder::class, // ← Orders created first
    NotificationSeeder::class,      // ← Can reference orders
]);
```

## Data Cleanup Order (CRITICAL)

### ❌ Wrong: Parent Before Child
```php
// DON'T DO THIS! Causes cascade deletes
SalesAudit::query()->delete();  // ← Deletes parent first
DB::table('notifications')->delete(); // ← Child already gone!
```

### ✅ Correct: Child Before Parent
```php
// DO THIS! Clean child tables first
DB::table('notifications')->delete();  // ← 1. Child first
Sales::query()->delete();              // ← 2. Related data
AuditTrail::query()->delete();         // ← 3. Related data
SalesAudit::query()->delete();         // ← 4. Parent last
```

## Dependency Chain

```
Roles
  └─> Users
       ├─> Staff
       ├─> Members
       │    └─> Stocks ──┐
       │                 │
       └─> Customers     │
            │            │
            └─> Orders <─┘ (SalesAudit)
                 │
                 ├─> Sales
                 ├─> AuditTrail
                 └─> Notifications ← MUST BE LAST
```

## Key Rules

1. **Dependencies First**: Always seed parent tables before child tables
2. **Orders Before Notifications**: ComprehensiveSalesSeeder MUST run before NotificationSeeder
3. **Clean Child First**: Delete child records before parent records
4. **Validate Data**: Check records exist before creating relationships
5. **Use Real IDs**: Never use random IDs for foreign keys

## Common Errors & Fixes

### Error: "No orders found"
```bash
❌ No orders found! NotificationSeeder requires ComprehensiveSalesSeeder to run first.
```

**Fix:** Ensure ComprehensiveSalesSeeder runs before NotificationSeeder in DatabaseSeeder.php

### Error: Foreign key constraint violation
```bash
SQLSTATE[23000]: Integrity constraint violation: 1452 Cannot add or update a child row
```

**Fix:** Check seeder order and data cleanup order

### Error: Notifications reference non-existent orders
```bash
Notification order_id: 999 does not exist in sales_audit table
```

**Fix:** Use real order IDs from database, not random values

## Testing Checklist

- [ ] Run `php artisan db:seed` without errors
- [ ] All notifications have valid order references
- [ ] No orphaned notifications
- [ ] No foreign key constraint violations
- [ ] Seeder output shows order count found
- [ ] Can view notifications in application

## Quick Commands

```bash
# Fresh migration and seed
php artisan migrate:fresh --seed

# Seed only (if tables exist)
php artisan db:seed

# Seed specific seeder
php artisan db:seed --class=NotificationSeeder

# Check notification data integrity
php artisan tinker
>>> DB::table('notifications')->count()
>>> SalesAudit::count()
```

## Remember

> **NotificationSeeder is the LAST seeder to run**
> 
> It depends on ALL other data being present:
> - Users (admin, staff, customer, member, logistic)
> - Products & Stocks
> - Orders (SalesAudit)
> - Sales & AuditTrail
> 
> Running it before dependencies = Foreign key errors ❌
> Running it after dependencies = Success ✅
