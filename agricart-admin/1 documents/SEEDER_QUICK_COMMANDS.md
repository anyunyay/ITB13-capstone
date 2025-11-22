# Suspicious Order Seeder - Quick Commands

## Run the Seeder

```bash
# Run suspicious order seeder only
php artisan db:seed --class=SuspiciousOrderSeeder
```

## Prerequisites Check

```bash
# Check if you have customers
php artisan tinker
>>> User::where('type', 'customer')->count()

# Check if you have members with stock
>>> User::where('type', 'member')->whereHas('stocks')->count()

# Check if you have products
>>> Product::count()

# Exit tinker
>>> exit
```

## Full Setup (If Starting Fresh)

```bash
# 1. Fresh migration
php artisan migrate:fresh

# 2. Seed basic data
php artisan db:seed --class=RoleSeeder
php artisan db:seed --class=UserSeeder
php artisan db:seed --class=ProductSeeder
php artisan db:seed --class=StockSeeder

# 3. Seed suspicious orders
php artisan db:seed --class=SuspiciousOrderSeeder
```

## View Results

```bash
# Start development server
php artisan serve

# Then visit in browser:
# Main orders: http://localhost:8000/admin/orders
# Suspicious: http://localhost:8000/admin/orders/suspicious
```

## Quick Test

```bash
# Run seeder
php artisan db:seed --class=SuspiciousOrderSeeder

# Check created orders
php artisan tinker
>>> SalesAudit::latest()->take(13)->get(['id', 'customer_id', 'total_amount', 'created_at'])
>>> exit
```

## Cleanup

```bash
# Remove recent orders (last 6 hours)
php artisan tinker
>>> SalesAudit::where('created_at', '>', now()->subHours(6))->delete()
>>> exit
```

---

**That's it!** Run the seeder and check `/admin/orders/suspicious` to see the grouped suspicious orders.
