# Suspicious Order 10-Minute Reset - Quick Summary

## What Changed

Suspicious orders now automatically "reset" every 10 minutes. After 10 minutes from the first order, any new order from the same customer starts a fresh window and is not grouped with previous orders.

## Key Changes

### 1. Detection Service (`SuspiciousOrderDetectionService.php`)

**Before**: Looked for orders within a 10-minute window (both forward and backward)

**After**: 
- Only looks back 10 minutes from the new order
- Checks if last suspicious order is > 10 minutes old
- If yes → new order starts fresh window (not flagged)
- If no → checks for pattern within 10-minute lookback

### 2. Scheduled Task (`ClearExpiredSuspiciousOrders.php`)

**Before**: Cleared individual orders older than 10 minutes

**After**:
- Groups orders by customer
- Clears entire 10-minute windows at once
- Ensures all orders in same window are cleared together

## Examples

### Example 1: Fresh Start After 10 Minutes
```
10:00 AM - Order #1 (not suspicious yet)
10:05 AM - Order #2 (both #1 and #2 now suspicious)
10:15 AM - Order #3 (NOT suspicious - fresh window)
```

### Example 2: Automatic Clearing
```
10:00 AM - Order #1 (suspicious)
10:05 AM - Order #2 (suspicious)
10:12 AM - Scheduled task runs → both cleared
```

### Example 3: Multiple Windows
```
10:00 AM - Order #1 (not suspicious)
10:05 AM - Order #2 (both suspicious - Window 1)
10:15 AM - Order #3 (not suspicious - fresh start)
10:18 AM - Order #4 (both suspicious - Window 2)

Result: Two separate suspicious groups
```

## How to Test

### Quick Test
```bash
# 1. Create 2 orders within 5 minutes
# 2. Verify both are suspicious
# 3. Wait 11 minutes
# 4. Run scheduled task
php artisan orders:clear-expired-suspicious

# 5. Verify orders cleared (is_suspicious = false)
```

### Database Check
```sql
SELECT id, customer_id, is_suspicious, created_at,
       TIMESTAMPDIFF(MINUTE, created_at, NOW()) as age_minutes
FROM sales_audit
WHERE customer_id = [CUSTOMER_ID]
  AND is_suspicious = true;
```

## Configuration

**Time Window**: 10 minutes (configurable in `SuspiciousOrderDetectionService.php`)

**Scheduled Task**: Should run every 1-5 minutes

```php
// In app/Console/Kernel.php
$schedule->command('orders:clear-expired-suspicious')
    ->everyMinute();
```

## Benefits

✅ Customers get a fresh start after 10 minutes
✅ No permanent flagging for past behavior
✅ Automatic cleanup - no manual intervention
✅ Clear time boundaries for debugging
✅ Prevents false positives from old orders

## Files Modified

1. `app/Services/SuspiciousOrderDetectionService.php` - Detection logic
2. `app/Console/Commands/ClearExpiredSuspiciousOrders.php` - Scheduled clearing
3. `SUSPICIOUS_ORDER_10_MINUTE_RESET.md` - Full documentation

## No Frontend Changes Required

The frontend automatically respects the `is_suspicious` flag from the backend. When orders are cleared, they automatically disappear from the Suspicious Orders page.
