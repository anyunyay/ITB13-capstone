# Testing Stock Removal Notifications

## Quick Test (Using Test Command)

Run the test command to verify notifications are working:

```bash
php artisan test:stock-removal-notification
```

This will:
- Find a stock with a member
- Send a test notification
- Confirm the notification was created
- Show member details

## Manual Testing (Real Scenario)

### Step 1: Login as Admin/Staff
Navigate to: `http://your-domain/admin/inventory`

### Step 2: Remove Stock
1. Find a product with available stock
2. Click "Remove Stock" button
3. Select a stock entry
4. Enter quantity to remove
5. Select a reason:
   - Sold Outside
   - Damaged / Defective
   - Listing Error
6. Click "Remove Stock"

### Step 3: Verify Member Notification
1. Note which member's stock was removed
2. Login as that member
3. Navigate to: `http://your-domain/member/notifications`
4. You should see a new "Stock Removed" notification with:
   - Orange warning icon
   - Product name
   - Quantity removed
   - Category (Kilo/Pc/Tali)
   - Reason for removal
   - Timestamp

### Step 4: Check Notification Details
Click on the notification to:
- Mark it as read
- Navigate to the stock page
- See the highlighted product (if highlighting is implemented)

## Verify Database

Check notifications in database:

```bash
php artisan tinker
```

Then run:

```php
// Count stock removal notifications
DB::table('notifications')
    ->where('type', 'App\\Notifications\\StockRemovedNotification')
    ->count();

// Get latest notification
$notification = DB::table('notifications')
    ->where('type', 'App\\Notifications\\StockRemovedNotification')
    ->latest()
    ->first();

// View notification data
json_decode($notification->data);
```

## Check Logs

View Laravel logs for notification activity:

```bash
# Windows PowerShell
Get-Content storage/logs/laravel.log -Tail 50 | Select-String "Stock removal notification"

# Linux/Mac
tail -f storage/logs/laravel.log | grep "Stock removal notification"
```

## Expected Log Entries

When stock is removed, you should see:

```
[timestamp] local.INFO: Stock removal notification sent
{
    "member_id": 53,
    "member_name": "Member Name",
    "product_name": "Product Name",
    "quantity_removed": 5,
    "reason": "Listing Error"
}
```

## Troubleshooting

### Notification Not Appearing

1. **Check if notification was created:**
   ```bash
   php artisan test:stock-removal-notification
   ```

2. **Verify member has notifications:**
   ```php
   $member = User::find(MEMBER_ID);
   $member->notifications()->count();
   ```

3. **Check for errors in logs:**
   ```bash
   Get-Content storage/logs/laravel.log -Tail 100
   ```

### Member Not Found Error

If you see "Stock has no associated member":
- Verify the stock has a valid `member_id`
- Check that the member user exists and is active
- Ensure member type is 'member'

### Notification Data Missing

If notification appears but data is incomplete:
- Check the `toArray()` method in `StockRemovedNotification.php`
- Verify all required fields are present
- Check language files for translation keys

## Success Criteria

✅ Notification appears in member's notification list
✅ Contains product name, quantity, category, and reason
✅ Shows correct timestamp
✅ Clickable and navigates to stock page
✅ Can be marked as read
✅ Logs show successful notification send

## Notes

- Notifications are now **synchronous** (immediate)
- No queue worker required
- Members need to refresh page to see new notifications
- Email notifications are also sent (check member's email)
