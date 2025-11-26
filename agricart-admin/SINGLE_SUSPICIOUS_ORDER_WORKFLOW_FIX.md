# Single Suspicious Order Workflow Fix

## Problem
When two suspicious orders were approved/rejected/merged within a 10-minute window, any later order from the same customer (still within that 10-minute mark) was incorrectly being grouped with other pending orders for merging. This caused:
- Merge buttons appearing when they shouldn't
- Reject All buttons showing for single orders
- Confusion about which orders should be merged
- Inability to approve single suspicious orders normally

## Requirements
After orders are processed (approved/rejected/merged), any subsequent order within the 10-minute window should:
- ✅ Be treated as a SINGLE suspicious order
- ✅ NOT be grouped with other pending orders
- ✅ NOT show "Merge" button
- ✅ NOT show "Reject All" button
- ✅ Only show normal "Approve" / "Reject" buttons
- ✅ Still be flagged as suspicious (with reason)

## Root Cause
The `groupSuspiciousOrders()` function was grouping ALL pending orders together within a time window, regardless of whether there were already processed (approved/rejected) orders in that window. This meant:

**Scenario:**
```
10:00 AM - Order A (pending)
10:05 AM - Order B (pending)
Admin merges A+B and approves
10:08 AM - Order C (pending)

Old Behavior:
- Order C would be grouped with any other pending orders
- Would show merge/reject all buttons

Desired Behavior:
- Order C should be a SINGLE suspicious order
- Should only show approve/reject buttons
```

## Solution Implemented

### 1. Updated Grouping Logic
**File**: `resources/js/utils/order-grouping.ts`
**Function**: `groupSuspiciousOrders()`

#### Key Changes:

**Step 1: Separate Orders by Status**
```typescript
// Separate orders by status
const pendingOrders = orders.filter(order => 
    order.status === 'pending' || order.status === 'delayed'
);

const processedOrders = orders.filter(order => 
    order.status === 'approved' || order.status === 'rejected'
);
```

**Step 2: Check for Processed Orders in Time Window**
```typescript
// Check if there are any approved/rejected orders from same customer within time window
const hasProcessedOrdersInWindow = processedOrders.some((processedOrder) => {
    // Must be from same customer
    if (order.customer.email !== processedOrder.customer.email) {
        return false;
    }

    // Check time window
    const orderTime = new Date(order.created_at).getTime();
    const processedOrderTime = new Date(processedOrder.created_at).getTime();
    const timeDiffMinutes = Math.abs(orderTime - processedOrderTime) / 60000;

    return timeDiffMinutes <= timeWindowMinutes;
});
```

**Step 3: Treat as Single Suspicious Order**
```typescript
// If there are processed orders in the window, treat this as a SINGLE suspicious order
// Do NOT group with other pending orders (to prevent merge attempts)
if (hasProcessedOrdersInWindow) {
    processedOrderIds.add(order.id);
    
    groups.push({
        type: 'suspicious',
        orders: [order], // Single order only
        isSuspicious: true,
        minutesDiff: 0 // Single order, no time diff
    });
    
    return; // Don't group with other orders
}
```

**Step 4: Group Only When No Processed Orders**
```typescript
// No processed orders in window - check for other pending orders to group
const relatedPendingOrders = sortedPendingOrders.filter((otherOrder) => {
    // ... same customer, within time window
});

// If 2 or more pending orders found (and no processed orders in window), create a group
if (relatedPendingOrders.length >= 2) {
    groups.push({
        type: 'suspicious',
        orders: relatedPendingOrders,
        isSuspicious: true,
        minutesDiff
    });
}
```

### 2. Enhanced Group Show Page
**File**: `resources/js/pages/Admin/Orders/group-show.tsx`

#### Updated Button Logic:
```typescript
// Only allow merge/reject for groups with 2+ orders
// Single suspicious orders should use normal approve/reject workflow
const canMerge = orders.length >= 2 && orders.every(order => ['pending', 'delayed'].includes(order.status));
const canReject = orders.length >= 2 && orders.every(order => ['pending', 'delayed'].includes(order.status));
```

**Benefits:**
- Merge button only shows for 2+ orders
- Reject All button only shows for 2+ orders
- Single orders redirect to normal order view or show only approve/reject

## How It Works Now

### Scenario 1: Initial Multiple Orders
```
10:00 AM - Customer places Order A (pending)
10:05 AM - Customer places Order B (pending)

Frontend Grouping:
- No processed orders in window
- Groups A + B together
- Shows: "2 orders in 5 minutes"
- Buttons: Merge, Reject All

Admin Action: Merge A+B and approve
Result: Merged order (approved)
```

### Scenario 2: Subsequent Order After Processing
```
10:08 AM - Customer places Order C (pending)

Backend Detection:
- Checks for orders within 10 minutes
- Finds approved merged order at 10:05 AM
- Marks Order C as suspicious
- Reason: "Multiple orders detected: 2 orders within 8 minutes"

Frontend Grouping:
- Finds approved order in time window (10:05 AM)
- Treats Order C as SINGLE suspicious order
- Does NOT group with other pending orders
- Shows: "Flagged as suspicious"
- Buttons: Approve, Reject (normal workflow)
```

### Scenario 3: Multiple Pending Orders (No Processed)
```
10:00 AM - Customer places Order A (pending)
10:05 AM - Customer places Order B (pending)
10:08 AM - Customer places Order C (pending)

Frontend Grouping:
- No processed orders in window
- Groups A + B + C together
- Shows: "3 orders in 8 minutes"
- Buttons: Merge, Reject All
```

### Scenario 4: Multiple Pending After Processing
```
10:00 AM - Order A (approved)
10:05 AM - Customer places Order B (pending)
10:08 AM - Customer places Order C (pending)

Frontend Grouping:
- Finds approved Order A in window
- Treats Order B as SINGLE suspicious (no merge)
- Treats Order C as SINGLE suspicious (no merge)
- Each shows individually with approve/reject buttons
```

## Visual Flow

### Before Fix:
```
Timeline: [Order A (approved)] → [Order B (pending)] → [Order C (pending)]
          10:00 AM              10:05 AM              10:08 AM

Grouping: Order B + Order C grouped together ❌
Display: "2 orders in 3 minutes" with Merge/Reject All buttons ❌
```

### After Fix:
```
Timeline: [Order A (approved)] → [Order B (pending)] → [Order C (pending)]
          10:00 AM              10:05 AM              10:08 AM

Grouping: Order B (single) ✅, Order C (single) ✅
Display: Each shows "Flagged as suspicious" with Approve/Reject buttons ✅
```

## UI Changes

### Suspicious Orders Page

**For Grouped Orders (2+ pending, no processed in window):**
```
┌─────────────────────────────────────────┐
│ ⚠️ Suspicious Group                     │
│ 3 Orders from Same Customer             │
│                                          │
│ ⚠️ 3 orders placed within 8 minutes     │
│                                          │
│ [View Group Details]                    │
└─────────────────────────────────────────┘
```

**For Single Suspicious Order (processed orders in window):**
```
┌─────────────────────────────────────────┐
│ ⚠️ Suspicious                           │
│ Order #123                              │
│                                          │
│ ⚠️ Multiple orders detected: 2 orders   │
│    within 8 minutes                     │
│                                          │
│ [View Details]                          │
└─────────────────────────────────────────┘
```

### Group Details Page

**For Multiple Orders:**
```
Buttons: [Merge Orders] [Reject All] [Back]
```

**For Single Order:**
```
Buttons: [Back] (redirects to normal order view)
OR
No merge/reject buttons shown
```

## Testing Scenarios

### Test 1: Basic Single Suspicious Order
```bash
1. Customer places Order A at 10:00 AM
2. Admin approves Order A
3. Customer places Order B at 10:05 AM
   Expected: Order B shows as single suspicious
   Expected: No merge/reject all buttons
   Expected: Can approve/reject normally
```

### Test 2: Multiple Pending After Approval
```bash
1. Customer places Order A at 10:00 AM
2. Customer places Order B at 10:03 AM
3. Admin merges A+B and approves
4. Customer places Order C at 10:06 AM
5. Customer places Order D at 10:09 AM
   Expected: Order C shows as single suspicious
   Expected: Order D shows as single suspicious
   Expected: C and D are NOT grouped together
   Expected: Each has only approve/reject buttons
```

### Test 3: Multiple Pending Before Any Processing
```bash
1. Customer places Order A at 10:00 AM
2. Customer places Order B at 10:03 AM
3. Customer places Order C at 10:06 AM
   Expected: All 3 grouped together
   Expected: Shows merge/reject all buttons
   Expected: Can merge all 3 orders
```

### Test 4: Mixed Scenario
```bash
1. Customer A places Order 1 at 10:00 AM
2. Customer A places Order 2 at 10:03 AM
3. Admin merges 1+2 and approves
4. Customer A places Order 3 at 10:06 AM
5. Customer B places Order 4 at 10:07 AM
6. Customer B places Order 5 at 10:09 AM
   Expected: Order 3 (Customer A) - single suspicious
   Expected: Order 4+5 (Customer B) - grouped together
```

## Benefits

1. **Clear Workflow**: Single suspicious orders use normal approval process
2. **No Confusion**: Merge buttons only appear when appropriate
3. **Better UX**: Admins know exactly what action to take
4. **Prevents Errors**: Can't try to merge already-processed orders
5. **Flexible**: Handles all scenarios correctly

## Edge Cases Handled

### Case 1: Single Order After Merge
- Treated as single suspicious
- No grouping with other pending orders
- Normal approve/reject workflow

### Case 2: Multiple Pending After Rejection
- Each treated as single suspicious
- No grouping together
- Can approve/reject individually

### Case 3: Time Window Expiry
- Orders outside 10-minute window not affected
- Only checks within the time window
- Expired orders not considered

### Case 4: Different Customers
- Orders from different customers never grouped
- Each customer's orders handled independently
- No cross-customer grouping

## Configuration

### Time Window
Currently set to 10 minutes. Can be adjusted:

```typescript
// In suspicious orders page
const orderGroups = useMemo(() => {
    return groupSuspiciousOrders(orders, 10); // Change to desired minutes
}, [orders]);
```

### Grouping Threshold
Currently requires 2+ orders to group. Can be adjusted:

```typescript
// In groupSuspiciousOrders function
if (relatedPendingOrders.length >= 2) { // Change threshold here
    // Create group
}
```

## Files Modified

1. **resources/js/utils/order-grouping.ts**
   - Complete rewrite of `groupSuspiciousOrders()` function
   - Added logic to check for processed orders in time window
   - Treats orders as single suspicious when processed orders exist
   - Only groups pending orders when no processed orders in window

2. **resources/js/pages/Admin/Orders/group-show.tsx**
   - Updated `canMerge` and `canReject` to require 2+ orders
   - Prevents merge/reject all buttons for single orders
   - Ensures proper workflow for single suspicious orders

## Related Documentation

- See `SUSPICIOUS_ORDER_MERGE_DETECTION_FIX.md` for backend detection
- See `MERGED_ORDER_APPROVAL_FIX.md` for approval logic
- See `SUSPICIOUS_ORDER_FIX_SUMMARY.md` for stock linking
- See `REAL_CUSTOMER_ORDER_APPROVAL_FIX.md` for approval fixes

## Future Enhancements

1. **Auto-Redirect**: Automatically redirect single orders to normal order view
2. **Visual Indicators**: Different badges for grouped vs single suspicious orders
3. **Bulk Actions**: Allow selecting multiple single suspicious orders for batch processing
4. **Time Window Display**: Show which processed order triggered the suspicious flag
5. **Customer History**: Show customer's full order history in suspicious view
