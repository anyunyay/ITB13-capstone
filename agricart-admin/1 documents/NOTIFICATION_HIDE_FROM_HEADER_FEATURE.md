# Notification Hide from Header Feature

## Overview
Modified the notification system so that "Clear All" and individual "X" buttons in the header dropdown only hide notifications from appearing in the header, without permanently deleting them. Notifications remain visible on the All Notifications page.

## Changes Made

### 1. Database Migration
**File**: `database/migrations/2025_11_09_224401_add_hidden_from_header_to_notifications_table.php`

Added a new column to the `notifications` table:
- `hidden_from_header` (boolean, default: false) - Tracks whether a notification is hidden from the header dropdown

### 2. Backend Controller Updates

#### Customer NotificationController (`app/Http/Controllers/Customer/NotificationController.php`)

**Removed Methods**:
- `destroy()` - Previously deleted notifications permanently
- `clearAll()` - Previously deleted all notifications

**New Methods**:
- `hideFromHeader($id)` - Marks a specific notification as hidden from header
- `hideAllFromHeader()` - Marks ALL visible notifications as hidden from header

#### Admin NotificationController (`app/Http/Controllers/Admin/NotificationController.php`)

**Removed Methods**:
- `destroy()` - Previously deleted notifications permanently
- `clearAll()` - Previously deleted all notifications

**New Methods**:
- `hideFromHeader($id)` - Marks a specific notification as hidden from header
- `hideAllFromHeader()` - Marks ALL visible notifications as hidden from header

### 3. Middleware Update
**File**: `app/Http/Middleware/HandleInertiaRequests.php`

Updated the notification query to exclude notifications where `hidden_from_header = true`:
```php
$shared['notifications'] = $user->notifications()
    ->whereIn('type', $notificationTypes)
    ->where('hidden_from_header', false)  // NEW: Exclude hidden notifications
    ->orderBy('created_at', 'desc')
    ->limit(20)
    ->get()
```

### 4. Route Updates (`routes/web.php`)

#### Customer Routes:
**Removed**:
```php
Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
Route::delete('/notifications/clear-all', [NotificationController::class, 'clearAll']);
```

**Added**:
```php
Route::post('/notifications/{id}/hide-from-header', [NotificationController::class, 'hideFromHeader']);
Route::post('/notifications/hide-all-from-header', [NotificationController::class, 'hideAllFromHeader']);
```

#### Admin Routes:
**Removed**:
```php
Route::delete('/notifications/{id}', [AdminNotificationController::class, 'destroy']);
Route::delete('/notifications/clear-all', [AdminNotificationController::class, 'clearAll']);
```

**Added**:
```php
Route::post('/notifications/{id}/hide-from-header', [AdminNotificationController::class, 'hideFromHeader']);
Route::post('/notifications/hide-all-from-header', [AdminNotificationController::class, 'hideAllFromHeader']);
```

### 5. Frontend Component Updates

#### NotificationBell Component (`resources/js/components/NotificationBell.tsx`)

**Updated Methods**:
- `handleClearAll()` - Now calls `POST /notifications/hide-all-from-header` instead of `DELETE /notifications/clear-all`
- `handleDismissNotification()` - Now calls `POST /notifications/{id}/hide-from-header` instead of `DELETE /notifications/{id}`

**Behavior**:
- "Clear All" button hides ALL notifications from the header (not just the 4 visible ones)
- "X" button on each notification hides that specific notification from the header
- Hidden notifications will no longer appear in the dropdown
- Notifications remain in the database and are visible on the All Notifications page

#### All Notifications Page (`resources/js/pages/Profile/notifications.tsx`)

**Removed Features**:
- "Clear All" button (removed from action buttons)
- Individual "X" dismiss buttons on notification cards

**Remaining Features**:
- "Select All Unread" button
- "Mark Selected" button
- "Mark All Read" button
- Click on notification to mark as read and navigate
- Checkboxes for selecting unread notifications

**Removed Imports**:
- `Trash2` icon (no longer needed)

**Removed Functions**:
- `handleDismissNotification()` - No longer needed
- `handleClearAll()` - No longer needed

## User Experience Flow

### Header Notification Dropdown:
1. User sees notifications in the header dropdown (max 4 most recent displayed)
2. User clicks "Clear All" → ALL notifications are hidden from header (not just the 4 visible ones)
3. User clicks "X" on a notification → That specific notification is hidden from header
4. Hidden notifications no longer appear in the dropdown
5. New notifications will appear as they come in

### All Notifications Page:
1. User clicks "See All" in the header dropdown
2. User sees ALL notifications (including those hidden from header)
3. User can mark notifications as read (individually or in bulk)
4. User cannot delete notifications from this page
5. Notifications remain permanently in the history

## Benefits

1. **Non-Destructive**: Notifications are never permanently deleted
2. **Clean Header**: Users can clear clutter from the header dropdown
3. **Complete History**: All notifications remain accessible on the All Notifications page
4. **User Control**: Users can hide notifications they've seen without losing them
5. **Audit Trail**: Complete notification history is preserved

## Technical Details

### Database Schema:
```sql
ALTER TABLE notifications ADD COLUMN hidden_from_header BOOLEAN DEFAULT FALSE AFTER read_at;
```

### Hide Logic:
- When "Clear All" is clicked, ALL visible notifications are hidden from the header
- When "X" is clicked, only that specific notification is hidden
- Hidden notifications are filtered out in the middleware before being sent to the frontend
- The All Notifications page queries all notifications regardless of `hidden_from_header` status

### API Endpoints:
- `POST /customer/notifications/{id}/hide-from-header` - Hide specific notification
- `POST /customer/notifications/hide-all-from-header` - Hide recent 4 notifications
- `POST /admin/notifications/{id}/hide-from-header` - Hide specific notification (admin)
- `POST /admin/notifications/hide-all-from-header` - Hide recent 4 notifications (admin)

## Migration Instructions

1. Run the migration:
   ```bash
   php artisan migrate
   ```

2. Existing notifications will have `hidden_from_header = false` by default
3. No data loss - all existing notifications remain visible

## Testing Checklist

- [ ] Verify "Clear All" hides notifications from header dropdown
- [ ] Verify "X" button hides individual notifications from header
- [ ] Verify hidden notifications still appear on All Notifications page
- [ ] Verify new notifications appear in header after clearing old ones
- [ ] Verify "See All" button navigates to All Notifications page
- [ ] Verify All Notifications page has no "Clear All" or "X" buttons
- [ ] Verify marking notifications as read works correctly
- [ ] Test with different user types (customer, admin, staff, member, logistic)
- [ ] Verify notifications are user-specific
- [ ] Verify no errors in browser console or Laravel logs
