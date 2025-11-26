# Suspicious Order Auto-Clear Implementation

## Overview
This document describes the automatic clearing of suspicious order flags when the last pending suspicious order in a 10-minute window is approved or rejected.

## Feature Description

When an admin approves or rejects a suspicious order, the system automatically checks if there are any remaining pending suspicious orders from the same customer within the same 10-minute time window. If no pending suspicious orders remain, all orders in that window are automatically cleared from suspicious status.

## Implementation Details

### 1. Auto-Clear Logic (`autoClearSuspiciousOrders` method)

**Location:** `app/Http/Controllers/Admin/OrderController.php`

**Purpose:** Automatically clear the `is_suspicious` flag for all orders in the same 10-minute window when the last pending suspicious order is processed.

**Algorithm:**

```
1. Define 10-minute window around the processed order
   - Window Start: order.created_at - 10 minutes
   - Window End: order.created_at + 10 minutes

2. Find all related orders:
   - Same customer (customer_id)
   - Within time window (created_at between window_start and window_end)
   - Any status (pending, delayed, approved, rejected)

3. Check for remaining pending suspicious orders:
   - Exclude the current order being processed
   - Filter for pending/delayed status only
   - Filter for is_suspicious = true

4. If no remaining pending suspicious orders:
   - Clear is_suspicious flag for ALL orders in the window
   - Set is_suspicious = false
   - Set suspicious_reason = null
   - Log each cleared order

5. If pending suspicious orders remain:
   - Skip auto-clear
   - Log that auto-clear was skipped
```

### 2. Integration Points

#### A. Order Approval (`approve` method)

**When:** After order status is updated to 'approved'

**Code Location:** After `$order->update($updateData)`

```php
// Auto-clear suspicious flag for related orders in the same 10-minute window
$clearedCount = $this->autoClearSuspiciousOrders($order);

if ($clearedCount > 0) {
    Log::info('Auto-cleared suspicious orders after approval', [
        'order_id' => $order->id,
        'cleared_count' => $clearedCount,
    ]);
}
```

#### B. Order Rejection (`reject` method)

**When:** After order status is updated to 'rejected'

**Code Location:** After `$order->update([...])`

```php
// Auto-clear suspicious flag for related orders in the same 10-minute window
$clearedCount = $this->autoClearSuspiciousOrders($order);

if ($clearedCount > 0) {
    Log::info('Auto-cleared suspicious orders after rejection', [
        'order_id' => $order->id,
        'cleared_count' => $clearedCount,
    ]);
}
```

#### C. Group Rejection (`rejectGroup` method)

**Note:** Group rejection already clears the suspicious flag for each order individually within the transaction. Auto-clear is not needed here as all orders in the group are being processed simultaneously.

#### D. Group Merge (`mergeGroup` method)

**Note:** Group merge already clears the suspicious flag for all merged orders. The primary order is set to `is_suspicious = false` and remains pending for approval, which will trigger auto-clear when approved.

## Scenarios & Examples

### Scenario 1: Last Pending Order Approved

**Setup:**
- Order #101 (Pending, is_suspicious = true) - 10:00 AM
- Order #102 (Pending, is_suspicious = true) - 10:05 AM
- Order #103 (Pending, is_suspicious = true) - 10:08 AM

**Action:** Admin approves Order #101

**Result:**
1. Order #101 status → 'approved', is_suspicious → false
2. Auto-clear checks remaining pending suspicious orders
3. Orders #102 and #103 are still pending and suspicious
4. Auto-clear skipped (pending suspicious orders remain)

**Action:** Admin approves Order #102

**Result:**
1. Order #102 status → 'approved', is_suspicious → false
2. Auto-clear checks remaining pending suspicious orders
3. Order #103 is still pending and suspicious
4. Auto-clear skipped (pending suspicious orders remain)

**Action:** Admin approves Order #103

**Result:**
1. Order #103 status → 'approved', is_suspicious → false
2. Auto-clear checks remaining pending suspicious orders
3. No pending suspicious orders remain
4. **Auto-clear triggered:** All orders (#101, #102, #103) set to is_suspicious = false
5. Orders removed from Suspicious Orders page

### Scenario 2: Mixed Approval and Rejection

**Setup:**
- Order #201 (Pending, is_suspicious = true) - 10:00 AM
- Order #202 (Pending, is_suspicious = true) - 10:05 AM
- Order #203 (Pending, is_suspicious = true) - 10:08 AM

**Action:** Admin rejects Order #201

**Result:**
1. Order #201 status → 'rejected', is_suspicious → false
2. Auto-clear checks remaining pending suspicious orders
3. Orders #202 and #203 are still pending and suspicious
4. Auto-clear skipped (pending suspicious orders remain)

**Action:** Admin approves Order #202

**Result:**
1. Order #202 status → 'approved', is_suspicious → false
2. Auto-clear checks remaining pending suspicious orders
3. Order #203 is still pending and suspicious
4. Auto-clear skipped (pending suspicious orders remain)

**Action:** Admin rejects Order #203

**Result:**
1. Order #203 status → 'rejected', is_suspicious → false
2. Auto-clear checks remaining pending suspicious orders
3. No pending suspicious orders remain
4. **Auto-clear triggered:** All orders (#201, #202, #203) set to is_suspicious = false
5. Orders removed from Suspicious Orders page

### Scenario 3: Group Rejection

**Setup:**
- Order #301 (Pending, is_suspicious = true) - 10:00 AM
- Order #302 (Pending, is_suspicious = true) - 10:05 AM
- Order #303 (Pending, is_suspicious = true) - 10:08 AM

**Action:** Admin rejects all orders as a group

**Result:**
1. All orders status → 'rejected', is_suspicious → false (in transaction)
2. No auto-clear needed (all orders already cleared)
3. Orders removed from Suspicious Orders page

### Scenario 4: Group Merge then Approve

**Setup:**
- Order #401 (Pending, is_suspicious = true) - 10:00 AM
- Order #402 (Pending, is_suspicious = true) - 10:05 AM
- Order #403 (Pending, is_suspicious = true) - 10:08 AM

**Action:** Admin merges all orders into Order #401

**Result:**
1. Order #401 becomes primary order (Pending, is_suspicious = false)
2. Orders #402 and #403 status → 'merged', is_suspicious → false
3. Orders removed from Suspicious Orders page
4. Order #401 ready for approval

**Action:** Admin approves merged Order #401

**Result:**
1. Order #401 status → 'approved', is_suspicious → false
2. Auto-clear checks remaining pending suspicious orders
3. No pending suspicious orders remain (merged orders already cleared)
4. Auto-clear completes (no additional orders to clear)

### Scenario 5: Partial Processing

**Setup:**
- Order #501 (Pending, is_suspicious = true) - 10:00 AM
- Order #502 (Pending, is_suspicious = true) - 10:05 AM
- Order #503 (Pending, is_suspicious = true) - 10:08 AM
- Order #504 (Pending, is_suspicious = true) - 10:09 AM

**Action:** Admin approves Order #501

**Result:**
1. Order #501 status → 'approved', is_suspicious → false
2. Auto-clear checks remaining pending suspicious orders
3. Orders #502, #503, #504 are still pending and suspicious
4. Auto-clear skipped (pending suspicious orders remain)

**Action:** Admin manually clears Order #502 (sets is_suspicious = false via database)

**Result:**
1. Order #502 is_suspicious → false (manual action)
2. Orders #503 and #504 still pending and suspicious
3. Frontend filters out Order #502 from suspicious list

**Action:** Admin approves Order #503

**Result:**
1. Order #503 status → 'approved', is_suspicious → false
2. Auto-clear checks remaining pending suspicious orders
3. Order #504 is still pending and suspicious
4. Auto-clear skipped (pending suspicious orders remain)

**Action:** Admin approves Order #504

**Result:**
1. Order #504 status → 'approved', is_suspicious → false
2. Auto-clear checks remaining pending suspicious orders
3. No pending suspicious orders remain
4. **Auto-clear triggered:** All orders (#501, #502, #503, #504) set to is_suspicious = false
5. All orders removed from Suspicious Orders page

## Frontend Integration

The frontend already respects the `is_suspicious` flag:

1. **Pattern Detection:** `groupSuspiciousOrders()` function filters out orders with `is_suspicious === false`
2. **Suspicious Orders Page:** Only displays orders with `is_suspicious === true` or pattern-detected groups
3. **Auto-Refresh:** When orders are updated, the frontend receives new data with updated flags

**No frontend changes required** - the existing logic automatically handles the auto-cleared orders.

## Database Schema

**Table:** `sales_audit`

**Relevant Columns:**
- `is_suspicious` (boolean, nullable) - Flag indicating if order is suspicious
- `suspicious_reason` (string, nullable) - Reason for suspicious flag
- `customer_id` (integer) - Customer who placed the order
- `created_at` (timestamp) - Order creation time
- `status` (string) - Order status (pending, delayed, approved, rejected, merged)

## Logging

The auto-clear logic includes comprehensive logging:

### Log Entry: Finding Related Orders
```php
Log::info('Auto-clear suspicious orders: Finding related orders', [
    'order_id' => $order->id,
    'customer_id' => $order->customer_id,
    'order_time' => $orderTime->toISOString(),
    'window_start' => $windowStart->toISOString(),
    'window_end' => $windowEnd->toISOString(),
]);
```

### Log Entry: Related Orders Found
```php
Log::info('Auto-clear suspicious orders: Related orders found', [
    'order_id' => $order->id,
    'total_related_orders' => $relatedOrders->count(),
    'related_order_ids' => $relatedOrders->pluck('id')->toArray(),
]);
```

### Log Entry: Checking Remaining Orders
```php
Log::info('Auto-clear suspicious orders: Checking remaining pending suspicious orders', [
    'order_id' => $order->id,
    'remaining_pending_suspicious_count' => $remainingPendingSuspicious->count(),
    'remaining_pending_suspicious_ids' => $remainingPendingSuspicious->pluck('id')->toArray(),
]);
```

### Log Entry: Order Cleared
```php
Log::info('Auto-clear suspicious orders: Cleared order', [
    'cleared_order_id' => $relatedOrder->id,
    'cleared_order_status' => $relatedOrder->status,
    'triggered_by_order_id' => $order->id,
]);
```

### Log Entry: Completed
```php
Log::info('Auto-clear suspicious orders: Completed', [
    'order_id' => $order->id,
    'total_cleared' => $clearedCount,
    'cleared_order_ids' => $relatedOrders->where('is_suspicious', false)->pluck('id')->toArray(),
]);
```

### Log Entry: Skipped
```php
Log::info('Auto-clear suspicious orders: Skipped (pending suspicious orders remain)', [
    'order_id' => $order->id,
    'remaining_count' => $remainingPendingSuspicious->count(),
]);
```

## Testing Checklist

### Manual Testing

- [ ] Create 3 orders from same customer within 10 minutes
- [ ] Verify all 3 orders appear in Suspicious Orders page
- [ ] Approve first order → Verify other 2 still show as suspicious
- [ ] Approve second order → Verify last order still shows as suspicious
- [ ] Approve third order → Verify all orders cleared from Suspicious Orders page
- [ ] Check database: All 3 orders should have `is_suspicious = false`

### Edge Cases

- [ ] Test with orders exactly 10 minutes apart
- [ ] Test with orders from different customers (should not auto-clear)
- [ ] Test with mixed statuses (some approved, some pending)
- [ ] Test with manually cleared orders (is_suspicious = false)
- [ ] Test group rejection (all orders cleared at once)
- [ ] Test group merge then approve (merged orders already cleared)

### Database Verification

```sql
-- Check orders in 10-minute window
SELECT id, customer_id, status, is_suspicious, suspicious_reason, created_at
FROM sales_audit
WHERE customer_id = [CUSTOMER_ID]
  AND created_at BETWEEN '[START_TIME]' AND '[END_TIME]'
ORDER BY created_at;

-- Verify auto-clear results
SELECT id, status, is_suspicious, suspicious_reason
FROM sales_audit
WHERE id IN ([ORDER_IDS]);
```

### Log Verification

```bash
# Check Laravel logs for auto-clear activity
tail -f storage/logs/laravel.log | grep "Auto-clear suspicious orders"
```

## Benefits

1. **Automatic Cleanup:** No manual intervention needed to clear suspicious flags
2. **Consistent Behavior:** All orders in the same window are treated uniformly
3. **Reduced Admin Workload:** Admins don't need to manually clear each order
4. **Better UX:** Suspicious Orders page automatically updates as orders are processed
5. **Audit Trail:** Comprehensive logging for debugging and compliance

## Limitations

1. **10-Minute Window:** Fixed at 10 minutes (matches frontend detection)
2. **Customer-Specific:** Only clears orders from the same customer
3. **Status-Dependent:** Only considers pending/delayed orders for remaining check
4. **No Retroactive Clearing:** Only triggers when an order is approved/rejected

## Future Enhancements

1. **Configurable Time Window:** Allow admins to adjust the 10-minute window
2. **Bulk Auto-Clear:** Add admin action to manually trigger auto-clear for all customers
3. **Notification:** Notify customer when all suspicious orders are cleared
4. **Analytics:** Track auto-clear statistics for reporting

## Summary

The auto-clear feature provides intelligent, automatic management of suspicious order flags. When the last pending suspicious order in a 10-minute window is processed (approved or rejected), all orders in that window are automatically cleared from suspicious status. This reduces admin workload and ensures consistent handling of suspicious order groups.
