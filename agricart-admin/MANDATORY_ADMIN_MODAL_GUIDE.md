# Mandatory Admin Modal Implementation Guide

## Overview

This implementation provides a mandatory pop-up modal for admins when the system enters "customer login disabled" mode from `system_tracking`. The modal blocks all other admin actions until the admin selects either "Price Change" or "Stay as Is". If "Stay as Is" is chosen, customer login is re-enabled immediately. If "Price Change" is chosen, the admin must confirm with "Good to Go" or "Cancel" before reactivation.

## Key Features

- **Mandatory Modal**: Blocks all admin actions until decision is made
- **Two-Step Process**: Initial decision → Confirmation (if price change chosen)
- **Automatic Detection**: Middleware automatically detects when admin action is required
- **Integration**: Works with both scheduled and daily lockouts
- **Real-time Updates**: Modal updates based on current system state
- **Audit Trail**: All admin actions are logged with timestamps and user information

## Components

### 1. AdminLockoutModal Component (`resources/js/components/admin-lockout-modal.tsx`)

**Features:**
- Non-dismissible modal (blocks all other actions)
- Two-step decision process
- Real-time status updates
- Loading states and error handling
- Responsive design with clear visual indicators

**Props:**
- `isOpen`: Modal visibility state
- `lockoutInfo`: Current lockout information
- `onStayAsIs`: Handler for "Stay as Is" action
- `onPriceChange`: Handler for "Price Change" action
- `onCancelPriceChange`: Handler for "Cancel" action
- `onApprovePriceChange`: Handler for "Good to Go" action
- `isLoading`: Loading state

**Decision Flow:**
1. **Initial Decision**: Admin chooses "Stay as Is" or "Price Change"
2. **Stay as Is**: Immediately restores customer access
3. **Price Change**: Shows confirmation step with "Cancel" and "Good to Go" buttons
4. **Final Action**: Either cancels changes or approves and applies them

### 2. CheckMandatoryAdminAction Middleware (`app/Http/Middleware/CheckMandatoryAdminAction.php`)

**Purpose:**
- Checks if mandatory admin action is required
- Blocks all admin routes except logout and mandatory action routes
- Redirects to mandatory action page when required
- Returns JSON response for API requests

**Logic:**
1. Only applies to admin/staff users
2. Skips logout and mandatory action routes
3. Checks for scheduled lockouts requiring admin action
4. Checks for daily schedule lockouts requiring admin action
5. Checks for price change confirmation requirements
6. Redirects to mandatory action page or returns JSON response

### 3. MandatoryActionController (`app/Http/Controllers/Admin/MandatoryActionController.php`)

**Endpoints:**
- `GET /admin/mandatory-action`: Display mandatory action page
- `GET /admin/mandatory-action/status`: Get current status (API)
- `POST /admin/mandatory-action/stay-as-is`: Process "Stay as Is" action
- `POST /admin/mandatory-action/price-change`: Process "Price Change" action
- `POST /admin/mandatory-action/cancel-price-change`: Cancel price changes
- `POST /admin/mandatory-action/approve-price-change`: Approve price changes

**Features:**
- Validates admin actions
- Updates system schedule and tracking records
- Logs all actions with admin user information
- Returns appropriate success/error responses
- Handles redirects after completion

### 4. Enhanced SystemTracking Model

**New Methods:**
- `requiresAdminAction()`: Check if admin action is required
- `getAdminModalInfo()`: Get information for admin modal
- `markAdminActionCompleted()`: Mark admin action as completed
- `getLockoutsRequiringAdminAction()`: Get all lockouts requiring action
- `hasLockoutRequiringAdminAction()`: Check if any lockout requires action

### 5. Mandatory Action Page (`resources/js/pages/admin/mandatory-action.tsx`)

**Features:**
- Displays current lockout information
- Shows the mandatory admin modal
- Handles all admin actions
- Auto-redirects when action is completed
- Periodic status checking
- Error handling and user feedback

## Workflow

### 1. System Enters Lockout Mode

**Scheduled Lockout:**
1. `system:schedule-lockout` command creates tracking record
2. Middleware executes lockout at scheduled time
3. System schedule is updated with lockout status
4. Customer sessions are logged out

**Daily Lockout:**
1. Daily scheduler runs `system:daily-lockout` command
2. System schedule is updated with lockout status
3. Customer sessions are logged out

### 2. Admin Access Attempt

1. **Middleware Check**: `CheckMandatoryAdminAction` middleware runs
2. **Detection**: Checks if admin action is required
3. **Blocking**: Blocks all admin routes except mandatory action routes
4. **Redirect**: Redirects to `/admin/mandatory-action` page

### 3. Mandatory Action Page

1. **Page Load**: Displays current lockout information
2. **Modal Display**: Shows mandatory admin modal
3. **Decision Required**: Admin must make a decision to proceed

### 4. Admin Decision Process

**Option A: Stay as Is**
1. Admin clicks "Stay as Is"
2. System schedule updated: `is_locked = false`, `admin_action = 'keep_prices'`
3. Tracking record marked as completed
4. Customer access restored
5. Admin redirected to original destination

**Option B: Price Change**
1. Admin clicks "Price Change"
2. System schedule updated: `admin_action = 'price_change'`, `price_change_status = 'pending'`
3. Tracking record marked as completed
4. Modal shows confirmation step

**Option C: Cancel Price Change**
1. Admin clicks "Cancel"
2. System schedule updated: `is_locked = false`, `price_change_status = 'cancelled'`
3. Customer access restored
4. Admin redirected to original destination

**Option D: Approve Price Change**
1. Admin clicks "Good to Go"
2. System schedule updated: `is_locked = false`, `price_change_status = 'approved'`
3. Customer access restored
4. Admin redirected to original destination

## Database Schema

### system_tracking Table (Enhanced)

```sql
-- Existing fields
id, status, action, scheduled_at, executed_at, description, metadata

-- New metadata fields for admin actions
metadata: {
    "admin_action": "stay_as_is|price_change",
    "admin_action_completed_at": "2025-10-11T18:40:48Z",
    "admin_user_id": 1
}
```

### system_schedule Table (Existing)

```sql
-- Fields used for mandatory admin action
is_locked: BOOLEAN
admin_action: ENUM('pending', 'keep_prices', 'price_change')
price_change_status: ENUM('pending', 'cancelled', 'approved')
admin_action_time: TIMESTAMP
price_change_action_time: TIMESTAMP
admin_user_id: BIGINT
```

## Configuration

### Middleware Registration

Add to `bootstrap/app.php`:
```php
$middleware->web(append: [
    // ... other middleware
    CheckMandatoryAdminAction::class,
]);
```

### Routes

```php
// Mandatory Admin Action routes
Route::middleware(['can:manage system'])->group(function () {
    Route::get('/mandatory-action', [MandatoryActionController::class, 'index']);
    Route::get('/mandatory-action/status', [MandatoryActionController::class, 'status']);
    Route::post('/mandatory-action/stay-as-is', [MandatoryActionController::class, 'stayAsIs']);
    Route::post('/mandatory-action/price-change', [MandatoryActionController::class, 'priceChange']);
    Route::post('/mandatory-action/cancel-price-change', [MandatoryActionController::class, 'cancelPriceChange']);
    Route::post('/mandatory-action/approve-price-change', [MandatoryActionController::class, 'approvePriceChange']);
});
```

## Usage Examples

### Scheduling a Lockout

```bash
# Schedule lockout for 1 minute from now
php artisan system:schedule-lockout --minutes=1 --description="Mandatory admin action test"

# Schedule for 5 minutes with admin tracking
php artisan system:schedule-lockout --minutes=5 --admin-id=1 --description="Scheduled maintenance"
```

### Admin Experience

1. **Admin tries to access any admin page**
2. **Middleware detects mandatory action required**
3. **Admin is redirected to mandatory action page**
4. **Modal appears with lockout information**
5. **Admin must make a decision to proceed**
6. **System processes the decision**
7. **Admin is redirected to original destination**

### API Integration

```javascript
// Check if mandatory action is required
const response = await fetch('/admin/mandatory-action/status');
const data = await response.json();

if (data.mandatory_action_required) {
    // Redirect to mandatory action page
    window.location.href = '/admin/mandatory-action';
}

// Process admin action
const actionResponse = await fetch('/admin/mandatory-action/stay-as-is', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
    },
    body: JSON.stringify({ confirm: true })
});
```

## Testing

### Manual Testing

1. **Schedule a Lockout**:
   ```bash
   php artisan system:schedule-lockout --minutes=1 --description="Test mandatory modal"
   ```

2. **Wait for Execution**: Wait for the scheduled time

3. **Test Admin Access**: Try accessing any admin page
   - Should be redirected to mandatory action page
   - Modal should appear
   - Other actions should be blocked

4. **Test Admin Actions**:
   - Test "Stay as Is" action
   - Test "Price Change" → "Cancel"
   - Test "Price Change" → "Good to Go"

### Automated Testing

```php
// Test mandatory action detection
$lockout = SystemTracking::scheduleLockoutInOneMinute('Test');
$this->assertTrue($lockout->requiresAdminAction());

// Test admin action processing
$schedule = SystemSchedule::getTodayRecord();
$schedule->keepPricesAsIs(1);
$this->assertFalse($schedule->is_locked);
$this->assertEquals('keep_prices', $schedule->admin_action);
```

## Security Considerations

- **Authentication Required**: All actions require admin authentication
- **Permission Checks**: Actions require `manage system` permission
- **CSRF Protection**: All POST requests are protected
- **Audit Trail**: All actions are logged with admin user information
- **Session Management**: Proper session handling for admin actions
- **Input Validation**: All inputs are validated before processing

## Troubleshooting

### Common Issues

1. **Modal Not Appearing**:
   - Check middleware registration
   - Verify route configuration
   - Check browser console for errors

2. **Actions Not Processing**:
   - Check CSRF token
   - Verify admin permissions
   - Check server logs for errors

3. **Redirect Issues**:
   - Verify redirect URL handling
   - Check route configuration
   - Ensure proper response format

### Debug Commands

```bash
# Check middleware registration
php artisan route:list --middleware=CheckMandatoryAdminAction

# Test mandatory action detection
php artisan tinker
>>> App\Models\SystemTracking::hasLockoutRequiringAdminAction()

# Check system status
php artisan tinker
>>> App\Models\SystemSchedule::getTodayRecord()
```

## Integration Points

### With Existing Systems

- **Daily Lockout**: Integrates with existing daily lockout system
- **Scheduled Lockout**: Works with scheduled lockout functionality
- **Admin Interface**: Uses existing admin interface patterns
- **Logging**: Integrates with existing logging system
- **Permissions**: Uses existing permission system

### Future Enhancements

- **Email Notifications**: Notify admins of mandatory actions
- **Mobile Support**: Optimize for mobile devices
- **Bulk Actions**: Support for multiple lockout management
- **Analytics**: Track admin action patterns
- **Customization**: Allow custom modal messages and actions

## Performance Considerations

- **Middleware Efficiency**: Minimal database queries in middleware
- **Caching**: Consider caching lockout status
- **Real-time Updates**: Efficient status checking
- **Database Optimization**: Proper indexing on tracking table
- **Memory Usage**: Efficient modal component rendering

## Monitoring and Logging

### Log Entries

All admin actions are logged with:
- Admin user ID and name
- Action taken
- Timestamps
- System state before/after
- Tracking record information

### Monitoring

- Track mandatory action frequency
- Monitor admin response times
- Alert on system lockouts
- Dashboard for lockout status
- Analytics for admin behavior patterns
