# Database Logging - Frontend Compatibility Fix

## Issue
The frontend was expecting logs in a specific format with `level`, `message`, and `context` properties, but the database model was returning different field names, causing a `TypeError: Cannot read properties of undefined`.

## Solution
Updated the `SystemLogsController` to format database logs to match the frontend's expected structure.

---

## Changes Made

### 1. Updated `getLogsFromDatabase()` Method

**File**: `app/Http/Controllers/Admin/SystemLogsController.php`

**Changes**:
- Maps database logs to frontend-compatible format
- Determines `level` based on `event_type`:
  - `security_event` → `warning`
  - `critical_error` → `error`
  - Everything else → `info`
- Merges database fields into `context` object
- Formats timestamps as ISO strings

**Before**:
```php
return [
    'data' => $logs->items(), // Raw database models
    ...
];
```

**After**:
```php
$formattedLogs = $logs->map(function ($log) {
    $level = 'info';
    if ($log->event_type === 'security_event') {
        $level = 'warning';
    } elseif ($log->event_type === 'critical_error') {
        $level = 'error';
    }
    
    $context = $log->context ?? [];
    $context['timestamp'] = $log->performed_at->toISOString();
    $context['user_id'] = $log->user_id;
    $context['user_email'] = $log->user_email;
    $context['user_type'] = $log->user_type;
    $context['action'] = $log->action;
    $context['event_type'] = $log->event_type;
    $context['ip_address'] = $log->ip_address;
    
    return [
        'id' => $log->id,
        'level' => $level,
        'message' => $log->details,
        'context' => $context,
        'created_at' => $log->performed_at->toISOString(),
    ];
});

return [
    'data' => $formattedLogs->toArray(),
    ...
];
```

### 2. Updated `calculateSummary()` Method

**Changes**:
- Added `error_count` field (required by frontend)
- Added `warning_count` field
- Added `info_count` field
- Combined security events and critical errors for `error_count`

**Before**:
```php
return [
    'total_logs' => $totalLogs,
    'security_events' => $securityEventCount,
    'critical_errors' => $criticalErrorCount,
    'today_logs' => $todayLogs,
    'unique_users' => $uniqueUsers
];
```

**After**:
```php
$errorCount = $securityEventCount + $criticalErrorCount;

return [
    'total_logs' => $totalLogs,
    'error_count' => $errorCount, // Required by frontend
    'warning_count' => $securityEventCount,
    'info_count' => $totalLogs - $errorCount,
    'today_logs' => $todayLogs,
    'unique_users' => $uniqueUsers
];
```

---

## Frontend Expected Structure

The frontend (`system-logs.tsx`) expects logs in this format:

```typescript
{
    id: number,
    level: 'info' | 'warning' | 'error',
    message: string,
    context: {
        timestamp: string,
        user_id: number,
        user_email: string,
        user_type: string,
        action: string,
        event_type: string,
        ip_address: string,
        // ... additional context fields
    },
    created_at: string
}
```

And summary in this format:

```typescript
{
    total_logs: number,
    error_count: number,
    warning_count: number,
    info_count: number,
    today_logs: number,
    unique_users: number
}
```

---

## Database to Frontend Mapping

| Database Field | Frontend Field | Notes |
|----------------|----------------|-------|
| `id` | `id` | Direct mapping |
| `event_type` | `level` | Converted: security_event→warning, critical_error→error, else→info |
| `details` | `message` | Direct mapping |
| `performed_at` | `context.timestamp` | Converted to ISO string |
| `user_id` | `context.user_id` | Moved to context |
| `user_email` | `context.user_email` | Moved to context |
| `user_type` | `context.user_type` | Moved to context |
| `action` | `context.action` | Moved to context |
| `event_type` | `context.event_type` | Also in context |
| `ip_address` | `context.ip_address` | Moved to context |
| `context` (JSON) | `context.*` | Merged with other fields |
| `performed_at` | `created_at` | Converted to ISO string |

---

## Testing

### Verify Logging Works
```bash
php artisan tinker --execute="App\Helpers\SystemLogger::logSecurityEvent('password_changed', 1, '192.168.1.100', ['user_email' => 'test@example.com']); echo 'Log created';"
```

### Check Log Count
```bash
php artisan tinker --execute="echo 'Total logs: ' . App\Models\SystemLog::count();"
```

### View Log Details
```bash
php artisan tinker --execute="echo App\Models\SystemLog::first()->details;"
```

### Test Frontend
1. Navigate to `/profile/system-logs` in the admin panel
2. Verify logs are displayed correctly
3. Check that summary statistics show without errors
4. Test filtering and search functionality
5. Test export to CSV

---

## Status

✅ **Fixed**: Frontend compatibility issue resolved
✅ **Tested**: Logging works correctly
✅ **Verified**: Database structure is correct
✅ **Ready**: System is ready for use

---

## Summary

The database logging system now correctly formats logs for frontend compatibility:
- Logs have `level`, `message`, and `context` properties
- Summary includes `error_count`, `warning_count`, and `info_count`
- All database fields are properly mapped to frontend structure
- Timestamps are formatted as ISO strings
- Context object includes all relevant information

The system is now fully functional and ready for production use.
