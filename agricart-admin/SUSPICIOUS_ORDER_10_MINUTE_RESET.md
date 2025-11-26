# Suspicious Order 10-Minute Reset Window

## Overview
This feature ensures that suspicious orders for a customer automatically "reset" every 10 minutes. After 10 minutes from the first order in a time frame, any new order from the same customer is treated as a fresh suspicious order, and previous orders no longer affect it.

## How It Works

### Time-Based Window Reset

The system now implements a **sliding 10-minute window** that automatically expires:

```
Timeline Example:
─────────────────────────────────────────────────────────────────
10:00 AM          10:05 AM          10:10 AM          10:15 AM
   │                 │                 │                 │
Order #1          Order #2          [Window Expires]  Order #3
(Suspicious)      (Suspicious)                        (Fresh Start)
   │                 │                                    │
   └─────────────────┘                                    │
   Grouped as suspicious                          Not grouped with #1, #2
```

### Key Principles

1. **10-Minute Lookback**: When a new order is placed, the system only looks back 10 minutes for related orders
2. **Automatic Expiration**: Orders older than 10 minutes from the newest order are not considered in the suspicious pattern
3. **Fresh Start**: After 10 minutes of inactivity, the next order starts a new window
4. **Window-Based Clearing**: The scheduled task clears entire 10-minute windows, not individual orders

## Implementation Details

### 1. Detection Service Update

**File**: `app/Services/SuspiciousOrderDetectionService.php`

**Changes**:
- Added check for most recent suspicious order
- If last suspicious order is > 10 minutes old, new order starts fresh window
- Changed time window to look back only (not forward and backward)
- Only considers pending/delayed orders in the window

**Logic Flow**:
```php
1. Check if customer has recent suspicious orders
2. If yes, calculate time since last suspicious order
3. If > 10 minutes → Return null (fresh start, not suspicious yet)
4. If ≤ 10 minutes → Look for orders in the 10-minute window
5. If 2+ orders found → Mark as suspicious
6. If < 2 orders → Not suspicious yet
```

### 2. Scheduled Task Update

**File**: `app/Console/Commands/ClearExpiredSuspiciousOrders.php`

**Changes**:
- Groups expired orders by customer
- Clears entire 10-minute windows at once
- Ensures all orders in the same window are cleared together

**Logic Flow**:
```php
1. Find all suspicious orders older than 10 minutes
2. Group by customer_id
3. For each customer:
   a. Find oldest expired order
   b. Calculate 10-minute window from that order
   c. Clear ALL orders in that window
4. Log all cleared orders
```

## Scenarios & Examples

### Scenario 1: Orders Within 10-Minute Window

**Timeline**:
- 10:00 AM - Customer places Order #101
- 10:05 AM - Customer places Order #102
- 10:08 AM - Customer places Order #103

**Result**:
- All 3 orders flagged as suspicious (within 10-minute window)
- Grouped together in Suspicious Orders page
- Reason: "3 orders placed within 10 minutes"

### Scenario 2: Order After 10-Minute Window

**Timeline**:
- 10:00 AM - Customer places Order #101
- 10:05 AM - Customer places Order #102 (both flagged as suspicious)
- 10:15 AM - Customer places Order #103 (11 minutes after Order #101)

**Result**:
- Orders #101 and #102: Remain suspicious (grouped together)
- Order #103: **NOT flagged as suspicious** (fresh window)
- Order #103 treated as first order in new window
- If customer places another order within 10 minutes of #103, both will be flagged

### Scenario 3: Automatic Expiration via Scheduled Task

**Timeline**:
- 10:00 AM - Customer places Order #201 (suspicious)
- 10:05 AM - Customer places Order #202 (suspicious)
- 10:12 AM - Scheduled task runs (orders are now 12 and 7 minutes old)

**Result**:
- Both orders cleared automatically (window expired)
- `is_suspicious` set to `false` for both
- `suspicious_reason` set to `null` for both
- Orders removed from Suspicious Orders page
- Next order from customer starts fresh window

### Scenario 4: Multiple Windows for Same Customer

**Timeline**:
- 10:00 AM - Order #301 (suspicious)
- 10:05 AM - Order #302 (suspicious, grouped with #301)
- 10:15 AM - Order #303 (fresh window, not suspicious yet)
- 10:18 AM - Order #304 (suspicious, grouped with #303)

**Result**:
- Window 1 (10:00-10:10): Orders #301, #302 (suspicious)
- Window 2 (10:15-10:25): Orders #303, #304 (suspicious)
- Two separate suspicious groups
- Each window expires independently

### Scenario 5: Admin Processes Orders Before Expiration

**Timeline**:
- 10:00 AM - Order #401 (suspicious)
- 10:05 AM - Order #402 (suspicious)
- 10:08 AM - Admin approves Order #401
- 10:09 AM - Admin approves Order #402

**Result**:
- Both orders processed before 10-minute expiration
- Auto-clear logic clears suspicious flags
- Window doesn't need to expire (already processed)
- Next order from customer starts fresh window

## Configuration

### Time Window Setting

**Location**: `app/Services/SuspiciousOrderDetectionService.php`

```php
const TIME_WINDOW_MINUTES = 10;
```

**To Change**:
1. Update the constant value
2. Rebuild application if needed
3. Restart scheduled tasks

### Scheduled Task Frequency

**Location**: `app/Console/Kernel.php`

**Recommended**: Run every 1-5 minutes

```php
$schedule->command('orders:clear-expired-suspicious')
    ->everyMinute(); // or ->everyFiveMinutes()
```

## Database Schema

**Table**: `sales_audit`

**Relevant Columns**:
- `is_suspicious` (boolean, nullable)
- `suspicious_reason` (string, nullable)
- `customer_id` (integer)
- `created_at` (timestamp)
- `status` (enum: pending, delayed, approved, rejected, merged)

## Logging

### Detection Service Logs

**Fresh Window Detected**:
```json
{
  "message": "Suspicious order window expired - starting fresh window",
  "customer_id": 123,
  "new_order_id": 456,
  "last_suspicious_order_id": 455,
  "minutes_since_last": 11,
  "window_minutes": 10
}
```

**Pattern Detected**:
```json
{
  "message": "Suspicious order pattern detected",
  "customer_id": 123,
  "order_ids": [456, 457],
  "time_window": 10,
  "total_amount": 1500.00
}
```

### Scheduled Task Logs

**Window Cleared**:
```json
{
  "message": "Scheduled task: Cleared expired suspicious order",
  "order_id": 456,
  "customer_id": 123,
  "order_age_minutes": 12,
  "created_at": "2024-01-15T10:00:00Z",
  "window_start": "2024-01-15T10:00:00Z",
  "window_end": "2024-01-15T10:10:00Z"
}
```

**Summary**:
```json
{
  "message": "Scheduled task: Expired suspicious orders cleared",
  "total_cleared": 5,
  "customers_affected": 2
}
```

## Testing

### Manual Testing Steps

#### Test 1: Fresh Window After 10 Minutes

1. Place Order #1 from Customer A at 10:00 AM
2. Place Order #2 from Customer A at 10:05 AM
3. Verify both orders are suspicious
4. Wait until 10:11 AM (or manually set time)
5. Place Order #3 from Customer A
6. **Expected**: Order #3 is NOT suspicious (fresh window)

#### Test 2: Scheduled Task Clearing

1. Place 2 orders from Customer B within 5 minutes
2. Verify both are suspicious
3. Wait 11 minutes
4. Run: `php artisan orders:clear-expired-suspicious`
5. **Expected**: Both orders cleared, `is_suspicious = false`

#### Test 3: Multiple Windows

1. Place Order #1 at 10:00 AM (not suspicious yet)
2. Place Order #2 at 10:05 AM (both suspicious)
3. Wait until 10:15 AM
4. Place Order #3 at 10:15 AM (not suspicious yet)
5. Place Order #4 at 10:18 AM (both #3 and #4 suspicious)
6. **Expected**: Two separate suspicious groups

### Database Verification

```sql
-- Check suspicious orders for a customer
SELECT 
    id, 
    customer_id, 
    status, 
    is_suspicious, 
    suspicious_reason, 
    created_at,
    TIMESTAMPDIFF(MINUTE, created_at, NOW()) as age_minutes
FROM sales_audit
WHERE customer_id = [CUSTOMER_ID]
  AND is_suspicious = true
ORDER BY created_at DESC;

-- Check if window expired
SELECT 
    id,
    created_at,
    TIMESTAMPDIFF(MINUTE, created_at, NOW()) as age_minutes,
    CASE 
        WHEN TIMESTAMPDIFF(MINUTE, created_at, NOW()) > 10 THEN 'EXPIRED'
        ELSE 'ACTIVE'
    END as window_status
FROM sales_audit
WHERE customer_id = [CUSTOMER_ID]
  AND is_suspicious = true;
```

### Log Verification

```bash
# Watch for fresh window detection
tail -f storage/logs/laravel.log | grep "window expired"

# Watch for scheduled task clearing
tail -f storage/logs/laravel.log | grep "Cleared expired suspicious order"

# Watch for pattern detection
tail -f storage/logs/laravel.log | grep "Suspicious order pattern detected"
```

## Frontend Integration

The frontend automatically respects the backend flags:

1. **Pattern Detection**: `groupSuspiciousOrders()` filters orders with `is_suspicious === false`
2. **Suspicious Orders Page**: Only shows orders with `is_suspicious === true`
3. **Auto-Refresh**: Receives updated data after scheduled task runs

**No frontend changes required** - the existing logic handles the reset automatically.

## Benefits

1. **Automatic Reset**: No manual intervention needed to clear old suspicious flags
2. **Fair to Customers**: Customers aren't permanently flagged for past behavior
3. **Reduced Admin Workload**: Less manual clearing of expired suspicious orders
4. **Clear Time Boundaries**: 10-minute windows are easy to understand and debug
5. **Prevents False Positives**: Orders placed after 10 minutes aren't incorrectly grouped

## Edge Cases

### Edge Case 1: Order Placed Exactly at 10 Minutes

**Scenario**: Order #1 at 10:00:00, Order #2 at 10:10:00

**Result**: Order #2 is NOT flagged (> 10 minutes)

**Reason**: Uses `>` comparison, not `>=`

### Edge Case 2: Multiple Customers

**Scenario**: Customer A and Customer B both place orders at same time

**Result**: Each customer's windows are independent

**Reason**: Windows are grouped by `customer_id`

### Edge Case 3: Approved Order in Window

**Scenario**: 
- Order #1 (pending, suspicious)
- Order #2 (approved, was suspicious)
- Order #3 (pending, within 10 minutes of #1)

**Result**: Only pending/delayed orders are considered

**Reason**: Detection only checks `status IN ('pending', 'delayed')`

### Edge Case 4: Scheduled Task Runs During Window

**Scenario**: Orders placed at 10:00 and 10:05, task runs at 10:08

**Result**: Orders NOT cleared (still within 10-minute window)

**Reason**: Task only clears orders older than 10 minutes

## Troubleshooting

### Issue: Orders Not Clearing After 10 Minutes

**Possible Causes**:
1. Scheduled task not running
2. Task frequency too low
3. Orders have status other than pending/delayed

**Solutions**:
- Check cron job: `crontab -l`
- Run manually: `php artisan orders:clear-expired-suspicious`
- Verify order status in database
- Check Laravel scheduler: `php artisan schedule:list`

### Issue: New Orders Still Flagged After 10 Minutes

**Possible Causes**:
1. Detection service not updated
2. Cache not cleared
3. Old code still running

**Solutions**:
- Clear cache: `php artisan cache:clear`
- Restart queue workers: `php artisan queue:restart`
- Verify code changes deployed
- Check logs for "window expired" message

### Issue: Orders Cleared Too Early

**Possible Causes**:
1. Server time incorrect
2. Timezone mismatch
3. Task running too frequently

**Solutions**:
- Check server time: `date`
- Verify timezone in `.env`: `APP_TIMEZONE`
- Check task schedule in `Kernel.php`

## Comparison: Before vs After

### Before (Old Behavior)

- Orders flagged as suspicious remained suspicious indefinitely
- Required manual clearing or admin processing
- Old orders could affect new orders placed hours later
- No automatic expiration

### After (New Behavior)

- Orders automatically expire after 10 minutes
- Fresh window starts after 10-minute gap
- Old orders don't affect new orders
- Automatic cleanup via scheduled task

## Summary

The 10-minute reset window provides a fair, automatic system for managing suspicious orders:

- **Detection**: Only looks back 10 minutes for related orders
- **Expiration**: Orders older than 10 minutes don't affect new orders
- **Clearing**: Scheduled task automatically clears expired windows
- **Fresh Start**: Each 10-minute period is independent

This ensures customers aren't permanently flagged while still catching rapid successive orders that may indicate suspicious behavior.
