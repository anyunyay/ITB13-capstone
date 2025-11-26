# Suspicious Orders Detection Logic - Complete Explanation

## Overview
The system uses a **hybrid approach** combining backend database flags and frontend pattern detection to identify suspicious orders.

## How It Works

### 1. Backend Detection (Database Flag)
Orders can be manually flagged as suspicious in the database:
- `is_suspicious = true` → Order is suspicious
- `is_suspicious = false` → Order was cleared (don't re-detect)
- `is_suspicious = null` → Not yet evaluated (allow pattern detection)

### 2. Frontend Pattern Detection
The `groupSuspiciousOrders()` function detects suspicious patterns:
- Multiple orders from same customer within time window (default: 10 minutes)
- Only considers pending/delayed orders
- Respects backend flags (doesn't re-detect cleared orders)

### 3. Hybrid Logic Flow

```
┌─────────────────────────────────────────────────────────┐
│ Step 1: Filter Active Orders                            │
│ - Exclude: merged, approved, rejected                   │
│ - Include: pending, delayed                             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Step 2: Group by Customer & Time                        │
│ - Same customer email                                   │
│ - Within time window (10 minutes)                       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Step 3: Filter Cleared Orders                           │
│ - Remove orders with is_suspicious === false            │
│ - Keep orders with is_suspicious === true/null          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Step 4: Create Groups                                   │
│ - 2+ orders → Suspicious group                          │
│ - 1 order → Single order (check is_suspicious flag)     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Step 5: Display in Suspicious Orders Page               │
│ - Pattern-detected groups (2+ orders)                   │
│ - Individually marked orders (is_suspicious = true)     │
└─────────────────────────────────────────────────────────┘
```

## Scenarios Explained

### Scenario 1: New Suspicious Pattern
**Setup:**
- Order #123 (Pending, is_suspicious = null)
- Order #124 (Pending, is_suspicious = null)
- Both from same customer, 5 minutes apart

**Result:**
- Pattern detected → Both orders grouped as suspicious
- Displayed in Suspicious Orders page
- Backend can optionally set `is_suspicious = true` for persistence

### Scenario 2: Cleared Orders (Auto-Clear)
**Setup:**
- Order #125 (Pending, is_suspicious = false) ← Cleared by backend
- Order #126 (Pending, is_suspicious = false) ← Cleared by backend
- Both from same customer, 5 minutes apart

**Result:**
- Pattern detected BUT orders filtered out (is_suspicious === false)
- NOT displayed in Suspicious Orders page
- Backend decision respected

### Scenario 3: Mixed Group (Some Cleared)
**Setup:**
- Order #127 (Pending, is_suspicious = null)
- Order #128 (Pending, is_suspicious = false) ← Cleared
- Order #129 (Pending, is_suspicious = null)
- All from same customer, 5 minutes apart

**Result:**
- Pattern detected for all 3
- Order #128 filtered out (is_suspicious === false)
- Orders #127 and #129 grouped as suspicious (2 orders remain)
- Displayed in Suspicious Orders page

### Scenario 4: Single Order After Clearing
**Setup:**
- Order #130 (Pending, is_suspicious = null)
- Order #131 (Pending, is_suspicious = false) ← Cleared
- Both from same customer, 5 minutes apart

**Result:**
- Pattern detected for both
- Order #131 filtered out (is_suspicious === false)
- Order #130 becomes single order (< 2 orders remain)
- NOT displayed in Suspicious Orders page (not a group)

### Scenario 5: Manually Flagged Order
**Setup:**
- Order #132 (Pending, is_suspicious = true) ← Manually flagged
- No other orders from same customer

**Result:**
- No pattern detected (single order)
- BUT is_suspicious === true
- Displayed in Suspicious Orders page as single-order group
- Shows suspicious reason from database

## Code Implementation

### groupSuspiciousOrders() Function

```typescript
// Step 1: Filter active orders
const activeOrders = orders.filter(order => 
    order.status !== 'merged' && 
    order.status !== 'approved' && 
    order.status !== 'rejected'
);

// Step 2: Group by customer & time
const relatedOrders = sortedOrders.filter((otherOrder) => {
    // Same customer
    if (order.customer.email !== otherOrder.customer.email) {
        return false;
    }
    
    // Within time window
    const timeDiffMinutes = Math.abs(orderTime - otherOrderTime) / 60000;
    return timeDiffMinutes <= timeWindowMinutes;
});

// Step 3: Filter cleared orders
const suspiciousOrders = relatedOrders.filter(o => o.is_suspicious !== false);

// Step 4: Create groups
if (suspiciousOrders.length >= 2) {
    // Suspicious group
    groups.push({
        type: 'suspicious',
        orders: suspiciousOrders,
        isSuspicious: true,
        minutesDiff
    });
} else {
    // Single order
    groups.push({
        type: 'single',
        orders: [order],
        isSuspicious: order.is_suspicious === true
    });
}
```

### Suspicious Orders Page Logic

```typescript
// Pattern-detected groups (2+ orders)
const patternSuspiciousGroups = orderGroups.filter(g => 
    g.isSuspicious && g.orders.length >= 2
);

// Individually marked orders (is_suspicious = true)
const markedSuspiciousOrders = orders.filter(order => 
    order.is_suspicious && 
    (order.status === 'pending' || order.status === 'delayed')
);

// Combine both
const allSuspiciousGroups = [
    ...patternSuspiciousGroups,
    ...markedSuspiciousOrders.filter(order => 
        !patternSuspiciousGroups.some(g => g.orders.some(o => o.id === order.id))
    ).map(order => ({
        type: 'suspicious',
        orders: [order],
        isSuspicious: true,
        minutesDiff: 0
    }))
];
```

## Auto-Clear Feature Integration

When an order is approved/rejected:

1. **Backend** sets `is_suspicious = false` for the order
2. **Backend** finds connected orders and sets their `is_suspicious = false`
3. **Frontend** receives updated data with `is_suspicious = false`
4. **Frontend** filters out these orders during pattern detection
5. **Result**: Orders no longer appear in Suspicious Orders page

## Key Points

### ✅ What Works:
- Pattern detection for new suspicious orders
- Respecting backend cleared flags
- Combining pattern detection with manual flags
- Auto-clear removes orders from suspicious list
- Single orders with `is_suspicious = true` still show

### ✅ What's Protected:
- Cleared orders (`is_suspicious = false`) won't be re-detected
- Backend decisions override frontend pattern detection
- Manual flags persist even without pattern match

### ✅ What's Flexible:
- Time window configurable (default: 10 minutes)
- Can manually flag any order as suspicious
- Can manually clear any order from suspicious status

## Testing Matrix

| Order State | Pattern Match | is_suspicious | Result |
|-------------|---------------|---------------|---------|
| Pending | Yes (2+ orders) | null | ✅ Show as suspicious group |
| Pending | Yes (2+ orders) | true | ✅ Show as suspicious group |
| Pending | Yes (2+ orders) | false | ❌ Don't show (cleared) |
| Pending | No (single) | null | ❌ Don't show (not suspicious) |
| Pending | No (single) | true | ✅ Show as single suspicious |
| Pending | No (single) | false | ❌ Don't show (cleared) |
| Approved | Yes (2+ orders) | true | ❌ Don't show (approved) |
| Rejected | Yes (2+ orders) | true | ❌ Don't show (rejected) |
| Merged | Yes (2+ orders) | true | ❌ Don't show (merged) |

## Debugging Tips

### Check if order should be suspicious:
```typescript
// In browser console
const order = orders.find(o => o.id === 123);
console.log({
    id: order.id,
    status: order.status,
    is_suspicious: order.is_suspicious,
    created_at: order.created_at,
    customer_email: order.customer.email
});
```

### Check grouping results:
```typescript
// In browser console
const groups = groupSuspiciousOrders(orders, 10);
console.log('Total groups:', groups.length);
console.log('Suspicious groups:', groups.filter(g => g.isSuspicious).length);
console.log('Groups:', groups);
```

### Check database values:
```sql
SELECT id, status, is_suspicious, suspicious_reason, created_at, customer_id
FROM sales_audit 
WHERE id IN (123, 124, 125);
```

## Common Issues & Solutions

### Issue: Orders not showing in suspicious page
**Possible Causes:**
1. `is_suspicious = false` (cleared by backend)
2. Status is approved/rejected/merged
3. Less than 2 orders in group after filtering
4. Time window too small

**Solution:**
- Check database: `is_suspicious` value
- Check order status
- Check if other orders in group were cleared
- Increase time window if needed

### Issue: Cleared orders still showing
**Possible Causes:**
1. Frontend not rebuilt after code changes
2. Browser cache showing old data
3. Database not updated correctly

**Solution:**
- Rebuild frontend: `npm run build`
- Clear browser cache
- Check database values
- Verify backend auto-clear logic ran

### Issue: Single order not showing
**Possible Causes:**
1. `is_suspicious` not set to `true` in database
2. Order status is not pending/delayed

**Solution:**
- Set `is_suspicious = true` in database
- Ensure order status is pending or delayed
- Check suspicious orders page filters

## Summary

The system intelligently combines:
- **Pattern Detection**: Automatic detection of suspicious time-based patterns
- **Manual Flags**: Ability to manually mark orders as suspicious
- **Auto-Clear**: Automatic clearing of connected orders when one is processed
- **Backend Override**: Backend decisions (cleared flags) override frontend detection

This hybrid approach provides flexibility while respecting administrative decisions and maintaining data integrity.
