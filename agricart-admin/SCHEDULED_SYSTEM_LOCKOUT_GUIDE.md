# Scheduled System Lockout Implementation Guide

## Overview

This implementation extends the daily system lockout feature to support scheduled lockouts using a `system_tracking` table. The system can now schedule customer lockouts for specific future times, with automatic enforcement once the scheduled time is reached.

## Key Features

- **Scheduled Lockouts**: Schedule system lockouts for any future time
- **Automatic Execution**: Middleware automatically enforces lockouts when scheduled time is reached
- **Database Tracking**: All scheduled lockouts are tracked in `system_tracking` table
- **Integration**: Works seamlessly with existing daily lockout system
- **Command Line Interface**: Easy scheduling via Artisan command

## Database Schema

### system_tracking Table

```sql
CREATE TABLE system_tracking (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    status ENUM('scheduled', 'active', 'completed', 'cancelled') DEFAULT 'scheduled',
    action ENUM('system_down', 'system_up', 'maintenance', 'price_update') DEFAULT 'system_down',
    scheduled_at TIMESTAMP NOT NULL,
    executed_at TIMESTAMP NULL,
    description TEXT NULL,
    metadata JSON NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_status_scheduled (status, scheduled_at),
    INDEX idx_action_status (action, status)
);
```

## Components

### 1. SystemTracking Model (`app/Models/SystemTracking.php`)

Key methods:
- `scheduleLockout($scheduledAt, $description, $metadata)`: Schedule a lockout for specific time
- `scheduleLockoutInOneMinute($description, $metadata)`: Schedule lockout for 1 minute from now
- `getActiveScheduledLockouts()`: Get lockouts that should be executed now
- `hasActiveScheduledLockout()`: Check if there's an active scheduled lockout
- `getNextScheduledLockout()`: Get the next scheduled lockout
- `execute()`: Mark a scheduled lockout as executed
- `complete()`: Mark a lockout as completed
- `cancel()`: Cancel a scheduled lockout
- `shouldExecuteNow()`: Check if lockout should be executed now

### 2. ScheduleSystemLockout Command (`app/Console/Commands/ScheduleSystemLockout.php`)

Artisan command to schedule lockouts:

**Usage:**
```bash
# Schedule lockout for 1 minute from now (default)
php artisan system:schedule-lockout

# Schedule lockout for 5 minutes from now
php artisan system:schedule-lockout --minutes=5

# Schedule with custom description
php artisan system:schedule-lockout --minutes=2 --description="Scheduled maintenance"

# Schedule with admin user ID
php artisan system:schedule-lockout --minutes=3 --admin-id=1 --description="Price update lockout"
```

**Options:**
- `--minutes`: Number of minutes from now to schedule (default: 1)
- `--description`: Custom description for the lockout
- `--admin-id`: Admin user ID who scheduled this lockout

### 3. Enhanced CheckSystemLockout Middleware

The middleware now includes:
- **Scheduled Lockout Execution**: Automatically executes scheduled lockouts when due
- **Dual Lockout Support**: Checks both daily schedule and scheduled tracking
- **Automatic Customer Logout**: Logs out all customer sessions when lockout is executed
- **Lockout Information**: Provides detailed lockout information to frontend

## Workflow

### Scheduling a Lockout

1. **Command Execution**:
   ```bash
   php artisan system:schedule-lockout --minutes=1 --description="Test lockout"
   ```

2. **Database Record Creation**:
   - Creates record in `system_tracking` table
   - Status: `scheduled`
   - Action: `system_down`
   - `scheduled_at`: Current time + specified minutes
   - Stores description and metadata

3. **Confirmation**:
   - Shows scheduled time and details
   - Warns if there's already a scheduled lockout

### Automatic Execution

1. **Middleware Check**: On every request, middleware checks for scheduled lockouts
2. **Time Validation**: Checks if `scheduled_at <= now()`
3. **Execution Process**:
   - Marks tracking record as `active`
   - Sets `executed_at` timestamp
   - Creates/updates `system_schedule` record
   - Initiates daily lockout process
   - Logs out all customer sessions
   - Logs the execution

4. **Customer Access**: Customers are blocked until admin takes action

### Integration with Daily Lockout

The scheduled lockout integrates seamlessly with the existing daily lockout system:

- **Unified Middleware**: Single middleware checks both systems
- **Shared Database**: Uses `system_schedule` table for actual lockout enforcement
- **Consistent UI**: Same lockout page and admin interface
- **Admin Actions**: Same admin decision process (Keep Prices / Apply Price Changes)

## Usage Examples

### Basic Scheduling

```bash
# Schedule lockout for 1 minute from now
php artisan system:schedule-lockout

# Schedule for 5 minutes
php artisan system:schedule-lockout --minutes=5

# Schedule for 30 minutes with description
php artisan system:schedule-lockout --minutes=30 --description="Scheduled maintenance window"
```

### Advanced Scheduling

```bash
# Schedule with admin tracking
php artisan system:schedule-lockout --minutes=10 --admin-id=1 --description="Price update lockout"

# Schedule multiple lockouts (with confirmation)
php artisan system:schedule-lockout --minutes=2 --description="First lockout"
php artisan system:schedule-lockout --minutes=5 --description="Second lockout"
```

### Programmatic Scheduling

```php
use App\Models\SystemTracking;
use Carbon\Carbon;

// Schedule for specific time
$lockout = SystemTracking::scheduleLockout(
    Carbon::now()->addMinutes(5),
    'Programmatic lockout',
    ['admin_user_id' => 1]
);

// Schedule for 1 minute from now
$lockout = SystemTracking::scheduleLockoutInOneMinute(
    'Quick lockout test',
    ['source' => 'api']
);
```

## Status Management

### Tracking Record Statuses

- **scheduled**: Lockout is scheduled but not yet executed
- **active**: Lockout has been executed and is currently active
- **completed**: Lockout has been completed (admin action taken)
- **cancelled**: Scheduled lockout was cancelled before execution

### Status Transitions

```
scheduled → active (when executed by middleware)
active → completed (when admin completes action)
scheduled → cancelled (when manually cancelled)
```

## Monitoring and Management

### Check Scheduled Lockouts

```php
// Get next scheduled lockout
$nextLockout = SystemTracking::getNextScheduledLockout();

// Get all active scheduled lockouts
$activeLockouts = SystemTracking::getActiveScheduledLockouts();

// Check if system has active scheduled lockout
$hasActive = SystemTracking::hasActiveScheduledLockout();

// Get lockout history
$history = SystemTracking::getLockoutHistory(10);
```

### Admin Interface

The existing admin interface at `/admin/system-lockout` automatically shows:
- Current lockout status (daily or scheduled)
- Lockout details and timestamps
- Admin action buttons
- Real-time status updates

## Testing

### Manual Testing

1. **Schedule a Test Lockout**:
   ```bash
   php artisan system:schedule-lockout --minutes=1 --description="Test lockout"
   ```

2. **Wait for Execution**:
   - Wait for the scheduled time
   - Check that customers are blocked
   - Verify admin can still access

3. **Test Admin Actions**:
   - Access `/admin/system-lockout`
   - Test "Keep Prices" action
   - Verify customer access is restored

### Automated Testing

```php
// Test scheduling
$lockout = SystemTracking::scheduleLockoutInOneMinute('Test');
$this->assertEquals('scheduled', $lockout->status);

// Test execution
$lockout->execute();
$this->assertEquals('active', $lockout->status);

// Test completion
$lockout->complete();
$this->assertEquals('completed', $lockout->status);
```

## Security Considerations

- **Admin Authentication**: All scheduling requires admin access
- **Audit Trail**: All actions are logged with timestamps and admin IDs
- **CSRF Protection**: All POST requests are protected
- **Permission Checks**: Admin actions require proper permissions
- **Session Management**: Automatic customer session cleanup

## Troubleshooting

### Common Issues

1. **Lockout Not Executing**:
   - Check if `scheduled_at` time has passed
   - Verify middleware is registered
   - Check database for tracking record

2. **Multiple Lockouts**:
   - System warns about existing scheduled lockouts
   - Only one active lockout at a time
   - Use `--force` flag to override

3. **Database Issues**:
   - Ensure `system_tracking` table exists
   - Check table name configuration in model
   - Verify migration was run

### Debug Commands

```bash
# Check migration status
php artisan migrate:status

# Test the command
php artisan system:schedule-lockout --minutes=1

# Check database
php artisan tinker
>>> App\Models\SystemTracking::all()
```

## Integration Points

### With Daily Lockout System

- **Shared Middleware**: `CheckSystemLockout` handles both systems
- **Shared Database**: Uses `system_schedule` for actual enforcement
- **Shared UI**: Same admin interface and customer lockout page
- **Shared Logic**: Same admin decision process

### With Existing Features

- **User Management**: Integrates with user session management
- **Logging**: Uses existing logging system
- **Permissions**: Respects existing permission system
- **Notifications**: Can be extended with notification system

## Future Enhancements

- **Recurring Schedules**: Support for recurring lockouts
- **Email Notifications**: Notify admins of scheduled lockouts
- **Web Interface**: Admin UI for scheduling lockouts
- **API Endpoints**: REST API for scheduling
- **Integration**: Connect with price change workflows
- **Analytics**: Lockout history and analytics dashboard
