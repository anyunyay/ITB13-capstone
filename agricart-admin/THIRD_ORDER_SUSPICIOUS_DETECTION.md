# Third Order Suspicious Detection - Implementation Guide

## Overview

When a customer creates a third order within 10 minutes of a previously merged & approved suspicious order, the system now automatically marks this new order as a **fresh suspicious order** that can be independently approved or rejected.

## Key Features

✅ **Automatic Detection**: Detects when a new order is placed within 10 minutes of a merged & approved order
✅ **Single Suspicious Order**: Treats the third order as a standalone suspicious order (no merge button)
✅ **Independent Actions**: Only Approve/Reject buttons (no reject-all or merge options)
✅ **Visual Badge**: Displays suspicious badge with link to the merged order
✅ **No Impact on Previous Orders**: Does not affect previously merged orders

## How It Works

### Scenario Example

```
10:00 AM - Order #1 created (not suspicious yet)
10:05 AM - Order #2 created (both #1 and #2 marked as suspicious)
10:07 AM - Admin merges #1 and #2 → Order #1 becomes merged order (approved)
10:12 AM - Order #3 created (within 10 minutes of merged order)
         → Order #3 automatically marked as suspicious
         → Linked to merged Order #1
         → Displayed as single suspicious order
```

### Detection Logic

The system checks for:
1. **Recent Merged Orders**: Orders with status `approved` and admin notes containing "Merged from orders:"
2. **Time Window**: Within 10 minutes of the merged order's creation time
3. **Same Customer**: Orders from the same customer

If all conditions are met, the new order is marked as suspicious with:
- `is_suspicious = true`
- `suspicious_reason = "New order placed X minutes after merged & approved order #Y"`
- `linked_merged_order_id = Y` (reference to the merged order)

## Database Changes

### New Column: `linked_merged_order_id`

Added to `sales_audit` table:

```php
$table->unsignedBigInteger('linked_merged_order_id')->nullable();
$table->foreign('linked_merged_order_id')
      ->references('id')
      ->on('sales_audit')
      ->onDelete('set null');
```

**Purpose**: Links a suspicious order to the previously merged & approved order

**Migration**: `2025_11_27_002630_add_linked_merged_order_id_to_sales_audit_table.php`

## Code Changes

### 1. SuspiciousOrderDetectionService.php

**Updated Method**: `checkForSuspiciousPattern()`

**New Logic**:
```php
// Check for recently merged & approved suspicious orders within 10 minutes
$recentMergedApprovedOrder = SalesAudit::where('customer_id', $customerId)
    ->where('id', '!=', $newOrder->id)
    ->where('status', 'approved')
    ->where('created_at', '>=', $timeWindowStart)
    ->where('created_at', '<=', $orderTime)
    ->where(function($query) {
        $query->where('admin_notes', 'like', '%Merged from orders:%')
              ->orWhere('is_suspicious', false);
    })
    ->orderBy('created_at', 'desc')
    ->first();

if ($recentMergedApprovedOrder) {
    // Mark as single suspicious order
    return [
        'order_ids' => [$newOrder->id],
        'related_orders' => [],
        'reason' => sprintf(
            'New order placed %d minutes after merged & approved order #%d',
            $minutesSinceMerged,
            $recentMergedApprovedOrder->id
        ),
        'total_amount' => $newOrder->total_amount,
        'is_single_suspicious' => true,
        'linked_to_merged_order' => $recentMergedApprovedOrder->id,
    ];
}
```

**Updated Method**: `markAsSuspicious()`

**New Logic**:
```php
$isSingleSuspicious = $suspiciousInfo['is_single_suspicious'] ?? false;
$linkedMergedOrderId = $suspiciousInfo['linked_to_merged_order'] ?? null;

$updateData = [
    'is_suspicious' => true,
    'suspicious_reason' => $reason,
];

if ($isSingleSuspicious && $linkedMergedOrderId) {
    $updateData['linked_merged_order_id'] = $linkedMergedOrderId;
}

SalesAudit::whereIn('id', $orderIds)->update($updateData);
```

### 2. SalesAudit.php (Model)

**Added to `$fillable`**:
```php
'linked_merged_order_id',
```

### 3. OrderController.php

**Updated Queries**: Added `linked_merged_order_id` to select statements in:
- `index()` method
- `suspicious()` method
- `show()` method

**Updated Response Data**: Added `linked_merged_order_id` to transformed order data

## Frontend Integration

The frontend should handle the `linked_merged_order_id` field to:

1. **Display Badge**: Show a badge linking to the merged order
   ```
   "Suspicious - Related to Merged Order #123"
   ```

2. **Hide Merge Button**: Don't show merge button for single suspicious orders
   ```javascript
   const isSingleSuspicious = order.is_suspicious && 
                              order.linked_merged_order_id !== null;
   
   if (!isSingleSuspicious) {
       // Show merge button
   }
   ```

3. **Show Only Approve/Reject**: Display only individual action buttons
   ```javascript
   if (isSingleSuspicious) {
       // Show: Approve | Reject
   } else {
       // Show: Merge | Reject All | Approve | Reject
   }
   ```

4. **Link to Merged Order**: Make the badge clickable
   ```javascript
   <a href={`/admin/orders/${order.linked_merged_order_id}`}>
       View Merged Order #{order.linked_merged_order_id}
   </a>
   ```

## Testing

### Test Case 1: Third Order Detection

```bash
# 1. Create two orders within 5 minutes
# 2. Merge and approve them
# 3. Create a third order within 10 minutes
# 4. Verify third order is marked as suspicious
# 5. Verify linked_merged_order_id is set
```

**Expected Result**:
- Third order has `is_suspicious = true`
- Third order has `linked_merged_order_id = [merged_order_id]`
- Suspicious reason mentions the merged order

### Test Case 2: No Detection After 10 Minutes

```bash
# 1. Create two orders and merge them
# 2. Wait 11 minutes
# 3. Create a third order
# 4. Verify third order is NOT marked as suspicious
```

**Expected Result**:
- Third order has `is_suspicious = false`
- Third order has `linked_merged_order_id = null`

### Test Case 3: Independent Approval

```bash
# 1. Create a third suspicious order (linked to merged order)
# 2. Approve the third order
# 3. Verify merged order is not affected
```

**Expected Result**:
- Third order status changes to `approved`
- Merged order remains `approved`
- No changes to merged order's data

### Database Verification

```sql
-- Check third order detection
SELECT 
    id,
    customer_id,
    is_suspicious,
    suspicious_reason,
    linked_merged_order_id,
    status,
    created_at
FROM sales_audit
WHERE customer_id = [CUSTOMER_ID]
ORDER BY created_at DESC
LIMIT 5;

-- Verify linked order exists
SELECT 
    id,
    status,
    admin_notes,
    is_suspicious,
    created_at
FROM sales_audit
WHERE id = [LINKED_MERGED_ORDER_ID];
```

## Benefits

1. **Better Fraud Detection**: Catches customers who continue placing orders after their suspicious orders are merged
2. **Independent Handling**: Each suspicious order can be handled separately
3. **Clear Audit Trail**: Links between orders are tracked in the database
4. **No False Positives**: Only triggers when there's a clear pattern
5. **Automatic Cleanup**: Suspicious flags still auto-clear after 10 minutes

## Configuration

**Time Window**: 10 minutes (configurable in `SuspiciousOrderDetectionService.php`)

```php
const TIME_WINDOW_MINUTES = 10;
```

## Files Modified

1. ✅ `app/Services/SuspiciousOrderDetectionService.php` - Detection logic
2. ✅ `app/Models/SalesAudit.php` - Added fillable field
3. ✅ `app/Http/Controllers/Admin/OrderController.php` - Updated queries and responses
4. ✅ `database/migrations/2025_11_27_002630_add_linked_merged_order_id_to_sales_audit_table.php` - New migration

## Next Steps

### Frontend Implementation Required

The frontend needs to be updated to:

1. **Display the linked order badge** on suspicious order cards
2. **Hide merge button** for single suspicious orders
3. **Show only Approve/Reject buttons** for single suspicious orders
4. **Make the badge clickable** to navigate to the merged order

### Example Frontend Code (React/Vue)

```javascript
// In OrderCard component
const isSingleSuspicious = order.is_suspicious && order.linked_merged_order_id;

return (
  <div className="order-card">
    {isSingleSuspicious && (
      <Badge variant="warning">
        Suspicious - Related to{' '}
        <Link to={`/admin/orders/${order.linked_merged_order_id}`}>
          Merged Order #{order.linked_merged_order_id}
        </Link>
      </Badge>
    )}
    
    <div className="actions">
      {!isSingleSuspicious && (
        <Button onClick={handleMerge}>Merge Orders</Button>
      )}
      <Button onClick={handleApprove}>Approve</Button>
      <Button onClick={handleReject}>Reject</Button>
    </div>
  </div>
);
```

## Troubleshooting

### Issue: Third order not marked as suspicious

**Check**:
1. Is the merged order status `approved`?
2. Is the time difference less than 10 minutes?
3. Are both orders from the same customer?
4. Does the merged order have "Merged from orders:" in admin_notes?

**Debug**:
```php
Log::info('Third order detection debug', [
    'new_order_id' => $newOrder->id,
    'customer_id' => $newOrder->customer_id,
    'order_time' => $newOrder->created_at,
    'recent_merged_order' => $recentMergedApprovedOrder,
]);
```

### Issue: linked_merged_order_id is null

**Check**:
1. Did the migration run successfully?
2. Is the `markAsSuspicious` method receiving the correct data?

**Verify**:
```sql
DESCRIBE sales_audit;
-- Should show linked_merged_order_id column
```

## Summary

The system now intelligently detects when a customer places a third order within 10 minutes of a merged & approved suspicious order. This order is automatically marked as suspicious and linked to the merged order, allowing admins to handle it independently without affecting the previously merged orders.
