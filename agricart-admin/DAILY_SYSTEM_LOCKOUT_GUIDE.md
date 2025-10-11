# Daily System Lockout Implementation Guide

## Overview

This implementation provides a daily system lockout feature for customers where, once per day, all customers are automatically logged out and cannot log in until an admin decides via a pop-up modal whether to apply a price change or keep prices as is.

## Features

- **Daily Automatic Lockout**: Runs at 6:00 AM daily via Laravel scheduler
- **Customer Session Management**: Automatically logs out all customer sessions
- **Admin Decision Modal**: Pop-up interface for admin price change decisions
- **Two-Step Process**: 
  1. Admin decides "Keep Prices" or "Apply Price Changes"
  2. If price changes are chosen, admin must click "Cancel" or "Good to go"
- **Database Tracking**: Dedicated `system_schedule` table tracks all actions and timestamps
- **Middleware Protection**: Blocks customer access during lockout periods

## Database Schema

### system_schedule Table

```sql
CREATE TABLE system_schedule (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    system_date DATE UNIQUE NOT NULL,
    is_locked BOOLEAN DEFAULT FALSE,
    admin_action ENUM('pending', 'keep_prices', 'price_change') DEFAULT 'pending',
    price_change_status ENUM('pending', 'cancelled', 'approved') NULL,
    lockout_time TIMESTAMP NULL,
    admin_action_time TIMESTAMP NULL,
    price_change_action_time TIMESTAMP NULL,
    admin_user_id BIGINT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

## Components

### 1. SystemSchedule Model (`app/Models/SystemSchedule.php`)

Key methods:
- `getTodayRecord()`: Get today's schedule record
- `getOrCreateTodayRecord()`: Create or get today's record
- `isCustomerLockoutActive()`: Check if customers are locked out
- `initiateLockout()`: Start daily lockout
- `keepPricesAsIs($adminUserId)`: Admin keeps current prices
- `applyPriceChanges($adminUserId)`: Admin applies price changes
- `cancelPriceChanges($adminUserId)`: Admin cancels price changes
- `approvePriceChanges($adminUserId)`: Admin approves price changes

### 2. DailySystemLockout Command (`app/Console/Commands/DailySystemLockout.php`)

Artisan command that:
- Creates today's schedule record
- Initiates system lockout
- Logs out all customer sessions
- Logs the process

**Usage:**
```bash
php artisan system:daily-lockout
```

**Scheduled:** Daily at 6:00 AM via Laravel scheduler

### 3. CheckSystemLockout Middleware (`app/Http/Middleware/CheckSystemLockout.php`)

Middleware that:
- Checks if system is locked out
- Blocks customer access during lockout
- Shows lockout page to customers
- Allows admin/staff access

### 4. SystemLockoutController (`app/Http/Controllers/Admin/SystemLockoutController.php`)

Admin controller with endpoints:
- `GET /admin/system-lockout`: Show management page
- `GET /admin/system-lockout/status`: Get current status (API)
- `POST /admin/system-lockout/keep-prices`: Keep prices as is
- `POST /admin/system-lockout/apply-price-changes`: Apply price changes
- `POST /admin/system-lockout/cancel-price-changes`: Cancel price changes
- `POST /admin/system-lockout/approve-price-changes`: Approve price changes

### 5. React Components

#### SystemLockoutModal (`resources/js/components/system-lockout-modal.tsx`)
- Admin decision modal
- Handles all admin actions
- Confirmation dialogs
- Real-time status updates

#### System Lockout Page (`resources/js/pages/system-lockout.tsx`)
- Customer-facing lockout page
- Shows lockout status and message
- Professional maintenance page

#### Admin Management Page (`resources/js/pages/admin/system-lockout/index.tsx`)
- Admin dashboard for lockout management
- Real-time status monitoring
- Action buttons and history

## Workflow

### Daily Lockout Process

1. **6:00 AM**: Laravel scheduler runs `system:daily-lockout` command
2. **Command Execution**:
   - Creates today's `system_schedule` record
   - Sets `is_locked = true`
   - Logs out all customer sessions
   - Sets `admin_action = 'pending'`

3. **Customer Access**: 
   - Middleware blocks all customer routes
   - Shows lockout page with maintenance message
   - Admin/staff routes remain accessible

4. **Admin Decision**:
   - Admin accesses `/admin/system-lockout`
   - Modal appears with two options:
     - **"Keep Prices As Is"**: Immediately restores customer access
     - **"Apply Price Changes"**: Requires second confirmation

5. **Price Change Process** (if chosen):
   - Admin clicks "Apply Price Changes"
   - System sets `price_change_status = 'pending'`
   - Admin must click either:
     - **"Cancel"**: Cancels changes, restores access
     - **"Good to Go"**: Approves changes, restores access

### State Transitions

```
Initial State: is_locked = false, admin_action = 'pending'

Daily Lockout:
is_locked = true, admin_action = 'pending'

Keep Prices:
is_locked = false, admin_action = 'keep_prices'

Apply Price Changes:
is_locked = true, admin_action = 'price_change', price_change_status = 'pending'

Cancel Price Changes:
is_locked = false, admin_action = 'price_change', price_change_status = 'cancelled'

Approve Price Changes:
is_locked = false, admin_action = 'price_change', price_change_status = 'approved'
```

## Configuration

### Laravel Scheduler

Add to `routes/console.php`:
```php
// Schedule the daily system lockout to run daily at 6 AM
Schedule::command('system:daily-lockout')->dailyAt('06:00');
```

### Middleware Registration

Add to `bootstrap/app.php`:
```php
$middleware->web(append: [
    // ... other middleware
    CheckSystemLockout::class,
]);
```

### Routes

Admin routes (protected by `can:manage system` permission):
```php
Route::middleware(['can:manage system'])->group(function () {
    Route::get('/system-lockout', [SystemLockoutController::class, 'index']);
    Route::get('/system-lockout/status', [SystemLockoutController::class, 'status']);
    Route::post('/system-lockout/keep-prices', [SystemLockoutController::class, 'keepPrices']);
    Route::post('/system-lockout/apply-price-changes', [SystemLockoutController::class, 'applyPriceChanges']);
    Route::post('/system-lockout/cancel-price-changes', [SystemLockoutController::class, 'cancelPriceChanges']);
    Route::post('/system-lockout/approve-price-changes', [SystemLockoutController::class, 'approvePriceChanges']);
});
```

## Testing

### Manual Testing

1. **Test Daily Lockout**:
   ```bash
   php artisan system:daily-lockout
   ```

2. **Test Admin Actions**:
   - Access `/admin/system-lockout`
   - Test "Keep Prices" action
   - Test "Apply Price Changes" → "Cancel"
   - Test "Apply Price Changes" → "Good to Go"

3. **Test Customer Access**:
   - Try accessing customer routes during lockout
   - Verify lockout page is shown
   - Verify admin routes remain accessible

### Database Verification

Check `system_schedule` table:
```sql
SELECT * FROM system_schedule WHERE system_date = CURDATE();
```

## Permissions

The system requires the `manage system` permission for admin access. Ensure this permission is assigned to admin/staff users.

## Logging

All actions are logged with:
- Admin user ID and name
- Action taken
- Timestamps
- System date

Check logs in `storage/logs/laravel.log`.

## Troubleshooting

### Common Issues

1. **Table not found**: Ensure migration ran successfully
2. **Permission denied**: Check `manage system` permission
3. **Scheduler not running**: Verify cron job is set up
4. **Middleware not working**: Check middleware registration

### Debug Commands

```bash
# Check migration status
php artisan migrate:status

# Test the command manually
php artisan system:daily-lockout

# Check scheduler
php artisan schedule:list

# Clear cache if needed
php artisan cache:clear
php artisan config:clear
```

## Security Considerations

- Admin actions require authentication
- All actions are logged with admin user information
- CSRF protection on all POST requests
- Permission-based access control
- Session management for customer logouts

## Future Enhancements

- Email notifications for admins when lockout is initiated
- Configurable lockout times
- Bulk price change management
- Lockout history and analytics
- Integration with price change workflows
