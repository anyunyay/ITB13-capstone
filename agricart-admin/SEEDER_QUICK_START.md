# System Log Seeder - Quick Start Guide

## Run the Seeder

```bash
php artisan db:seed --class=SystemLogSeeder
```

**Output**: Creates 61+ realistic log entries

---

## What Gets Created

| Category | Count | Examples |
|----------|-------|----------|
| **Security Events** | 17 | Password changes, failed logins, wrong portal access |
| **Product Management** | 14 | Create, update, delete products |
| **Stock Updates** | 6 | Quantity changes |
| **Order Management** | 7 | Status changes (pending→approved→delivered) |
| **Customer Checkout** | 5 | Order placements |
| **Delivery Updates** | 4 | Delivery status changes |
| **User Management** | 3 | Staff creation |
| **Data Exports** | 3 | CSV exports |
| **Critical Errors** | 2 | System errors |

---

## Verify Data

```bash
# Check total logs
php artisan tinker --execute="echo App\Models\SystemLog::count();"

# Check security events
php artisan tinker --execute="echo App\Models\SystemLog::where('event_type', 'security_event')->count();"
```

---

## Clear and Reseed

```bash
# Clear all logs
php artisan tinker --execute="App\Models\SystemLog::truncate();"

# Reseed
php artisan db:seed --class=SystemLogSeeder
```

---

## View in Admin Panel

1. Navigate to `/profile/system-logs`
2. See all seeded logs with filtering
3. Test search, export, and pagination

---

## Sample Log Structure

```
User: admin@example.com
Action: created
Date & Time: 2025-11-15 14:30:00
Location (IP): 192.168.1.100
Details: admin@example.com created product: Fresh Tomatoes on November 15, 2025 at 2:30 PM from IP address 192.168.1.100
```

---

## Log Types Included

✅ **Add** - Product creation, stock addition, user creation
✅ **Update** - Product updates, stock updates, order status changes
✅ **Delete** - Product deletion
✅ **Unauthorized Access** - Wrong portal attempts, failed logins
✅ **Security Events** - Password changes, account lockouts
✅ **Business Transactions** - Checkout, deliveries, exports

---

## Requirements

- Users must exist in the database (admin, staff, member, customer, logistic)
- Run user seeders first if needed
- Database connection must be active

---

## Troubleshooting

**No logs created?**
- Check if users exist: `php artisan tinker --execute="echo User::count();"`
- Run user seeder first: `php artisan db:seed --class=UserSeeder`

**Want more logs?**
- Edit `database/seeders/SystemLogSeeder.php`
- Increase loop counts (e.g., change `for ($i = 0; $i < 5; $i++)` to `for ($i = 0; $i < 10; $i++)`)
- Run seeder again

---

## Summary

✅ **61+ realistic logs** covering all major activities
✅ **Distributed over 30 days** for realistic timeline
✅ **Multiple user types** (admin, staff, member, customer, logistic)
✅ **Varied IP addresses** for location tracking
✅ **Complete context** with JSON data
✅ **Ready to use** for testing and demonstration
